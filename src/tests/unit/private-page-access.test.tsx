import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  buildPrivatePageCookie,
  buildPrivatePageHeaders,
  createPrivatePageGrant,
  hashPrivatePagePassword,
  parsePrivatePageUnlockSubmission,
  parsePrivatePageOwnerInput,
  canSetDocumentPageAccess,
  redactPrivatePagePasswords,
  restoreServerPageAccess,
  setDocumentPageAccess,
  readPrivatePageGrantPayload,
  signPrivatePageGrant,
  unlockPrivatePage,
  verifyPrivatePageGrant,
  verifyPrivatePagePassword,
} from '@/modules/private-page-access';
import { PrivatePageChallenge } from '@/modules/private-page-access/private-page-access-ui';
import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

const secret = 'a-test-secret-that-is-long-enough-to-sign-private-page-grants';
const scope = {
  portfolioSlug: 'amina-rahman',
  pageId: 'page-projects',
  pageSlug: 'projects',
  locale: 'en' as const,
};
const now = new Date('2026-08-09T12:00:00.000Z');

describe('private page password hashing', () => {
  it('stores a salted hash rather than the owner-defined password', async () => {
    const hash = await hashPrivatePagePassword('correct horse battery staple');

    expect(hash).not.toContain('correct horse battery staple');
    await expect(verifyPrivatePagePassword('correct horse battery staple', hash)).resolves.toBe(
      true,
    );
    await expect(verifyPrivatePagePassword('wrong password', hash)).resolves.toBe(false);
  });

  it('rejects malformed stored hashes without throwing', async () => {
    await expect(verifyPrivatePagePassword('anything', 'not-a-password-hash')).resolves.toBe(false);
    await expect(
      verifyPrivatePagePassword('anything', `scrypt-v1$${Buffer.alloc(1).toString('base64url')}$x`),
    ).resolves.toBe(false);
    await expect(
      verifyPrivatePagePassword(
        'anything',
        `scrypt-v1$${Buffer.alloc(16).toString('base64url')}$${Buffer.alloc(1).toString('base64url')}`,
      ),
    ).resolves.toBe(false);
  });
});

describe('private page unlock', () => {
  it('issues a grant only after the submitted password matches', async () => {
    const passwordHash = await hashPrivatePagePassword('share this page');

    await expect(
      unlockPrivatePage({ password: 'wrong', passwordHash, scope, secret, now }),
    ).resolves.toBeNull();
    await expect(
      unlockPrivatePage({ password: 'share this page', passwordHash, scope, secret, now }),
    ).resolves.toEqual(expect.any(String));
  });

  it('rejects malformed public form fields at the request boundary', () => {
    expect(
      parsePrivatePageUnlockSubmission({
        portfolioSlug: '../admin',
        pageSlug: 'projects',
        password: 'secret',
        locale: 'en',
      }),
    ).toEqual({ ok: false });
    expect(
      parsePrivatePageUnlockSubmission({
        portfolioSlug: 'amina-rahman',
        pageSlug: 'projects',
        password: 'secret',
        locale: 'en',
      }),
    ).toEqual({
      ok: true,
      value: {
        portfolioSlug: 'amina-rahman',
        pageSlug: 'projects',
        password: 'secret',
        locale: 'en',
      },
    });
  });
});

describe('private page grants', () => {
  it('authorizes only the portfolio page for which the grant was issued', () => {
    const grant = createPrivatePageGrant({ scope, secret, now });

    expect(verifyPrivatePageGrant({ grant, scope, secret, now })).toBe(true);
    expect(
      verifyPrivatePageGrant({
        grant,
        scope: { ...scope, pageId: 'page-resume' },
        secret,
        now,
      }),
    ).toBe(false);
  });

  it('rejects tampered and expired grants', () => {
    const grant = createPrivatePageGrant({ scope, secret, now, maxAgeSeconds: 60 });
    const [payload, signature] = grant.split('.', 2);
    const sameLengthTamper = `${payload}.${signature?.startsWith('a') ? 'b' : 'a'}${signature?.slice(1)}`;

    expect(verifyPrivatePageGrant({ grant: `${grant}x`, scope, secret, now })).toBe(false);
    expect(verifyPrivatePageGrant({ grant: sameLengthTamper, scope, secret, now })).toBe(false);
    expect(
      verifyPrivatePageGrant({
        grant,
        scope,
        secret,
        now: new Date('2026-08-09T12:01:01.000Z'),
      }),
    ).toBe(false);
    expect(verifyPrivatePageGrant({ grant: '', scope, secret, now })).toBe(false);
    expect(
      verifyPrivatePageGrant({
        grant: createPrivatePageGrant({ scope, secret }),
        scope,
        secret,
      }),
    ).toBe(true);
  });

  it('rejects signed grants whose payload shape is invalid', () => {
    const invalidPayload = Buffer.from(JSON.stringify({ portfolioSlug: 7 })).toString('base64url');
    const grant = `${invalidPayload}.${signPrivatePageGrant(invalidPayload, secret)}`;

    expect(verifyPrivatePageGrant({ grant, scope, secret, now })).toBe(false);
    expect(readPrivatePageGrantPayload('%')).toBeNull();
    expect(
      readPrivatePageGrantPayload(
        Buffer.from(JSON.stringify({ ...scope, expiresAt: 123 })).toString('base64url'),
      ),
    ).toEqual({ ...scope, expiresAt: 123 });
  });
});

describe('private page response policy', () => {
  it('sets a page-scoped http-only cookie with production transport security', () => {
    const cookie = buildPrivatePageCookie({
      grant: 'signed-grant',
      scope,
      secure: true,
      maxAgeSeconds: 900,
    });

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=900');
    expect(cookie).toContain('Path=/amina-rahman/projects');
  });

  it('prevents caches and crawlers from retaining a private response', () => {
    expect(buildPrivatePageHeaders()).toEqual({
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    });
  });

  it('allows local HTTP while retaining every non-transport cookie protection', () => {
    const cookie = buildPrivatePageCookie({ grant: 'grant', scope, secure: false });

    expect(cookie).not.toContain('Secure');
    expect(cookie).toContain('Max-Age=3600');
  });

  it('scopes localized grants and cookies to the localized page address', () => {
    const localizedScope = { ...scope, locale: 'ar' as const };
    const grant = createPrivatePageGrant({ scope: localizedScope, secret, now });

    expect(verifyPrivatePageGrant({ grant, scope: localizedScope, secret, now })).toBe(true);
    expect(
      verifyPrivatePageGrant({
        grant,
        scope: { ...localizedScope, locale: 'en' },
        secret,
        now,
      }),
    ).toBe(false);
    expect(buildPrivatePageCookie({ grant, scope: localizedScope, secure: true })).toContain(
      'Path=/ar/amina-rahman/projects',
    );
  });
});

describe('private page challenge', () => {
  it('posts the password and exact page identity without requiring JavaScript', () => {
    render(
      <PrivatePageChallenge
        portfolioSlug="amina-rahman"
        pageSlug="projects"
        locale="en"
        denied
        labels={{
          title: 'Private page',
          description: 'Enter the shared password.',
          password: 'Password',
          submit: 'Open page',
          denied: 'That password did not match.',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Private page' })).toBeVisible();
    expect(screen.getByLabelText('Password')).toHaveAttribute('name', 'password');
    expect(screen.getByDisplayValue('amina-rahman')).toHaveAttribute('name', 'portfolioSlug');
    expect(screen.getByDisplayValue('projects')).toHaveAttribute('name', 'pageSlug');
    expect(screen.getByRole('alert')).toHaveTextContent('That password did not match.');
    expect(screen.getByRole('button', { name: 'Open page' })).toHaveAttribute('type', 'submit');
  });

  it('does not announce an error before a password has been attempted', () => {
    render(
      <PrivatePageChallenge
        portfolioSlug="amina-rahman"
        pageSlug="projects"
        locale="en"
        denied={false}
        labels={{
          title: 'Private page',
          description: 'Enter the shared password.',
          password: 'Password',
          submit: 'Open page',
          denied: 'That password did not match.',
        }}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('owner-controlled page access', () => {
  it('allows a subpage to become private but never the home page', () => {
    const document = buildFullPortfolioDocument();

    expect(canSetDocumentPageAccess(document, 'page-projects', 'private')).toBe(true);
    expect(canSetDocumentPageAccess(document, 'page-home', 'private')).toBe(false);
    expect(canSetDocumentPageAccess(document, 'missing', 'public')).toBe(false);
  });

  it('sets and clears only the selected page credential', () => {
    const document = buildFullPortfolioDocument();
    const privateDocument = setDocumentPageAccess(document, 'page-projects', 'private', 'hash');

    expect(privateDocument?.pages.find((page) => page.id === 'page-projects')).toMatchObject({
      visibility: 'private',
      passwordHash: 'hash',
    });
    expect(setDocumentPageAccess(document, 'page-home', 'private', 'hash')).toBeNull();
    expect(
      privateDocument === null
        ? null
        : setDocumentPageAccess(privateDocument, 'page-projects', 'public', 'ignored')?.pages.find(
            (page) => page.id === 'page-projects',
          ),
    ).toMatchObject({ visibility: 'public', passwordHash: null });
  });

  it('redacts private hashes and clears credentials from public pages', () => {
    const document = buildFullPortfolioDocument();
    const pages = document.pages.map((page) =>
      page.id === 'page-projects'
        ? { ...page, visibility: 'private' as const, passwordHash: 'server-hash' }
        : { ...page, passwordHash: 'unexpected' },
    );
    const redacted = redactPrivatePagePasswords({ ...document, pages });

    expect(redacted.pages.find((page) => page.id === 'page-projects')?.passwordHash).not.toBe(
      'server-hash',
    );
    expect(redacted.pages.find((page) => page.id === 'page-home')?.passwordHash).toBeNull();
  });

  it('restores stored access and defaults newly injected pages to public', () => {
    const current = buildFullPortfolioDocument();
    const stored = {
      ...current,
      pages: current.pages.map((page) =>
        page.id === 'page-projects'
          ? { ...page, visibility: 'private' as const, passwordHash: 'server-hash' }
          : page,
      ),
    };
    const sourcePage = current.pages[1];
    if (sourcePage === undefined) throw new Error('The full fixture must contain a subpage');
    const extra = { ...sourcePage, id: 'client-only', visibility: 'private' as const };
    const restored = restoreServerPageAccess(
      { ...current, pages: [...current.pages, extra] },
      stored,
    );

    expect(restored.pages.find((page) => page.id === 'page-projects')).toMatchObject({
      visibility: 'private',
      passwordHash: 'server-hash',
    });
    expect(restored.pages.find((page) => page.id === 'client-only')).toMatchObject({
      visibility: 'public',
      passwordHash: null,
    });
  });

  it('validates owner input and requires a sufficiently long private password', () => {
    expect(
      parsePrivatePageOwnerInput({
        portfolioId: 'portfolio-1',
        pageId: 'page-projects',
        expectedVersion: '2',
        visibility: 'private',
        password: 'a secure password',
      }),
    ).toMatchObject({ ok: true, value: { expectedVersion: 2 } });
    expect(
      parsePrivatePageOwnerInput({
        portfolioId: 'portfolio-1',
        pageId: 'page-projects',
        expectedVersion: 2,
        visibility: 'private',
        password: 'short',
      }),
    ).toEqual({ ok: false });
    expect(parsePrivatePageOwnerInput(null)).toEqual({ ok: false });
  });
});
