import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GalleryLightboxContainer, PortfolioNavMenuContainer } from '@/modules/portfolio-renderer';

describe('portfolio renderer interactions', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      fireEvent(this, new Event('close'));
    });
  });

  it('opens, navigates, and closes the mobile portfolio menu', async () => {
    const user = userEvent.setup();
    render(
      <PortfolioNavMenuContainer
        navigationLabel="Portfolio pages"
        toggleLabel="Toggle pages"
        actions={<button type="button">Reader settings</button>}
        items={[
          {
            pageId: 'home',
            slug: 'home',
            label: 'Overview',
            href: '#overview',
            isCurrent: true,
            isHome: true,
          },
          {
            pageId: 'projects',
            slug: 'projects',
            label: 'Projects',
            href: '#projects',
            isCurrent: false,
            isHome: false,
          },
        ]}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Toggle pages' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Portfolio pages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reader settings' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Projects' }));
    expect(screen.queryByRole('navigation', { name: 'Portfolio pages' })).not.toBeInTheDocument();

    await user.click(toggle);
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens gallery images and closes from the control or backdrop', async () => {
    const user = userEvent.setup();
    render(
      <GalleryLightboxContainer
        closeLabel="Close image"
        items={[
          { id: 'one', src: '/one.jpg', alt: 'First work', caption: 'A caption' },
          { id: 'two', src: '/two.jpg', alt: 'Second work', caption: null },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'First work' }));
    expect(screen.getByRole('button', { name: 'Close image' })).toBeInTheDocument();
    expect(screen.getAllByText('A caption')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Close image' }));
    expect(screen.queryByRole('button', { name: 'Close image' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Second work' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('img', { name: 'Second work' }));
    expect(screen.getByRole('button', { name: 'Close image' })).toBeInTheDocument();
    await user.click(dialog);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
