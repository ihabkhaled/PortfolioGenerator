import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrivatePageChallengeContainer } from '@/modules/private-page-access/private-page-access-ui';

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@/packages/browser', () => ({ navigateBrowser: mocks.navigate }));

const props = {
  portfolioSlug: 'owner-portfolio',
  pageSlug: 'notes',
  locale: 'en' as const,
  denied: false,
  labels: {
    title: 'This page is private',
    description: 'Enter the shared password.',
    password: 'Shared password',
    submit: 'Open private page',
    denied: 'That password did not work.',
  },
};

function renderChallenge(): void {
  render(<PrivatePageChallengeContainer {...props} />);
}

beforeEach(() => {
  mocks.navigate.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PrivatePageChallengeContainer', () => {
  it('waits for the grant response before navigating to a safe portfolio path', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ target: '/portfolios/owner-portfolio/notes' }, { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    renderChallenge();

    await userEvent.type(screen.getByLabelText('Shared password'), 'correct password');
    await userEvent.click(screen.getByRole('button', { name: 'Open private page' }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/portfolios/owner-portfolio/notes');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/private-page-access',
      expect.objectContaining({ method: 'POST', redirect: 'error' }),
    );
  });

  it.each([
    ['a rejected password', () => new Response(null, { status: 401 })],
    ['a malformed response', () => Response.json({ target: 42 })],
    ['an unsafe redirect', () => Response.json({ target: '//attacker.example' })],
  ])('keeps the challenge visible for %s', async (_case, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));
    renderChallenge();

    await userEvent.type(screen.getByLabelText('Shared password'), 'not accepted');
    await userEvent.click(screen.getByRole('button', { name: 'Open private page' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('That password did not work.');
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Open private page' })).toBeEnabled();
  });

  it('keeps the form usable when the request is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderChallenge();

    await userEvent.type(screen.getByLabelText('Shared password'), 'try again later');
    await userEvent.click(screen.getByRole('button', { name: 'Open private page' }));

    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open private page' })).toBeEnabled();
  });
});
