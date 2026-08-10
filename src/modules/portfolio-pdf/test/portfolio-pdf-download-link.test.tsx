import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PortfolioPdfDownloadLink } from '../components/portfolio-pdf-download-link.component';

describe('PortfolioPdfDownloadLink', () => {
  it('links to the given href, never a URL the caller did not construct', () => {
    render(
      <PortfolioPdfDownloadLink
        href="/api/portfolio-pdf/download/abc123"
        label="Download PDF"
        downloadFilename="amina-rahman.pdf"
      />,
    );

    const link = screen.getByRole('link', { name: 'Download PDF' });

    expect(link).toHaveAttribute('href', '/api/portfolio-pdf/download/abc123');
  });

  it('suggests a filename for the browser download prompt', () => {
    render(
      <PortfolioPdfDownloadLink
        href="/api/portfolio-pdf/download/abc123"
        label="Download PDF"
        downloadFilename="amina-rahman.pdf"
      />,
    );

    expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'download',
      'amina-rahman.pdf',
    );
  });

  it('renders the caller-supplied label as the link text, ready for translation', () => {
    render(
      <PortfolioPdfDownloadLink
        href="/api/portfolio-pdf/download/abc123"
        label="Télécharger le PDF"
        downloadFilename="amina-rahman.pdf"
      />,
    );

    expect(screen.getByText('Télécharger le PDF')).toBeInTheDocument();
  });
});
