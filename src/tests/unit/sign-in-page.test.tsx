import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

interface SignInFormProps {
  readonly initialNoticeMessage: string | null;
}

interface PageProps {
  readonly children: ReactNode;
}

function isSignInFormElement(value: unknown): value is ReactElement<SignInFormProps> {
  if (value === null || typeof value !== 'object' || !('props' in value)) {
    return false;
  }
  const props = value.props;
  return (
    props !== null &&
    typeof props === 'object' &&
    'initialNoticeMessage' in props &&
    (typeof props.initialNoticeMessage === 'string' || props.initialNoticeMessage === null)
  );
}

function readFormProps(page: ReactElement<PageProps>): SignInFormProps {
  const children: unknown = page.props.children;
  if (!Array.isArray(children) || children.length !== 2) {
    throw new Error('Expected the sign-in page fragment to contain two children.');
  }
  const form = (children as readonly unknown[])[1];
  if (!isSignInFormElement(form)) {
    throw new Error('Expected the second sign-in page child to be the form.');
  }
  return form.props;
}

const mocks = vi.hoisted(() => ({
  redirectIfAuthenticated: vi.fn().mockResolvedValue(undefined),
  translate: vi.fn((key: string) => `translated:${key}`),
  form: vi.fn((props: { initialNoticeMessage: string | null }) => (
    <div data-testid="sign-in-form">{props.initialNoticeMessage}</div>
  )),
}));

vi.mock('@/modules/auth', () => ({
  AUTH_NOTICE_KEYS: { verificationEmailSent: 'notices.verificationEmailSent' },
  SignInFormContainer: mocks.form,
  authClasses: { header: 'header', title: 'title', lead: 'lead' },
}));
vi.mock('@/modules/auth/server', () => ({
  redirectIfAuthenticated: mocks.redirectIfAuthenticated,
}));
vi.mock('@/packages/i18n/server', () => ({
  getServerTranslations: vi.fn().mockResolvedValue(mocks.translate),
}));

describe('sign-in page notice routing', () => {
  it('passes the verification notice from the redirect query', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page');
    const page = (await SignInPage({
      searchParams: Promise.resolve({ notice: 'verification-email-sent' }),
    })) as ReactElement<PageProps>;
    expect(readFormProps(page)).toEqual({
      initialNoticeMessage: 'translated:notices.verificationEmailSent',
    });
  });

  it('does not surface unknown notice query values', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page');
    const page = (await SignInPage({
      searchParams: Promise.resolve({ notice: 'unexpected' }),
    })) as ReactElement<PageProps>;
    expect(readFormProps(page)).toEqual({ initialNoticeMessage: null });
  });
});
