import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NavDisclosure } from '@/shared/components/layout/nav-disclosure.container';

const route = vi.hoisted(() => ({ pathname: '/guides/features' }));

vi.mock('@/packages/navigation/client', () => ({
  usePathname: () => route.pathname,
}));

beforeEach(() => {
  route.pathname = '/guides/features';
});

/**
 * The one behavior native `<details>` cannot provide on its own: this layout
 * persists across a same-layout client-side navigation, so without this
 * effect a menu opened before tapping a link would still cover the next
 * page. `usePathname` is mocked because the App Router context it depends on
 * does not exist in this render environment — the routing itself is a Next
 * concern the E2E suite exercises against a real navigation.
 */
describe('NavDisclosure', () => {
  it('renders a closed toggle labelled for the reader', () => {
    render(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );

    expect(screen.getByRole('group')).not.toHaveAttribute('open');
    expect(screen.getByLabelText('Menu')).toBeInTheDocument();
  });

  it('keeps its panel content in the document for assistive tech to find', () => {
    render(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('closes itself when the route changes underneath it', () => {
    const { rerender } = render(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );
    const details = screen.getByRole<HTMLDetailsElement>('group');
    details.open = true;

    route.pathname = '/guides/security';
    rerender(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );

    expect(details.open).toBe(false);
  });

  it('does not reopen or close a second time when the route stays the same', () => {
    const { rerender } = render(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );
    const details = screen.getByRole<HTMLDetailsElement>('group');
    details.open = true;

    rerender(
      <NavDisclosure label="Menu">
        <a href="#sign-in">Sign in</a>
      </NavDisclosure>,
    );

    expect(details.open).toBe(true);
  });
});
