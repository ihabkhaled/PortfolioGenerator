import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { parseContactSubmission } from '@/modules/contact';
import { ContactFormContainer } from '@/modules/contact/contact-ui';
import { sendContactMessage, type ContactDependencies } from '@/modules/contact/server';

const validSubmission = {
  name: '  Ada Lovelace  ',
  email: '  ada@example.com  ',
  subject: '  Portfolio enquiry  ',
  message: '  I would like to discuss a project.  ',
  website: '',
};

function dependencies(overrides: Partial<ContactDependencies> = {}): ContactDependencies {
  return {
    deliver: vi.fn().mockResolvedValue(undefined),
    consumeRateLimit: vi.fn().mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 3,
      resetsAt: new Date('2026-08-09T13:00:00.000Z'),
    }),
    log: vi.fn(),
    ...overrides,
  };
}

describe('contact submission validation', () => {
  it('normalizes valid fields before delivery', () => {
    expect(parseContactSubmission(validSubmission)).toEqual({
      ok: true,
      value: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'Portfolio enquiry',
        message: 'I would like to discuss a project.',
        website: '',
      },
    });
  });

  it.each(['name', 'email', 'subject'] as const)(
    'rejects newline injection in the %s header field',
    (field) => {
      const result = parseContactSubmission({
        ...validSubmission,
        [field]: `${validSubmission[field]}\r\nBcc: attacker@example.com`,
      });

      expect(result.ok).toBe(false);
    },
  );

  it('rejects malformed and oversized input', () => {
    expect(parseContactSubmission({ ...validSubmission, email: 'not-an-email' }).ok).toBe(false);
    expect(parseContactSubmission({ ...validSubmission, message: 'x'.repeat(5001) }).ok).toBe(
      false,
    );
  });
});

describe('ContactFormContainer', () => {
  it('renders the public contact fields and submit control', () => {
    render(createElement(ContactFormContainer));

    expect(screen.getByRole('heading', { name: 'Contact us' })).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });

  it.each([
    [400, 'Check the fields and try again.'],
    [429, 'Too many messages were sent from this connection. Try again later.'],
    [503, 'We could not send the message just now. Try again shortly.'],
  ])('announces the public error for an HTTP %s response', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
    render(createElement(ContactFormContainer));

    await userEvent.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Subject'), 'Portfolio enquiry');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('submits JSON, clears accepted input and announces success', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    render(createElement(ContactFormContainer));
    const name = screen.getByLabelText('Name');

    await userEvent.type(name, 'Ada Lovelace');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Subject'), 'Portfolio enquiry');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('status')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0];
    expect(request?.[0]).toBe('/api/contact');
    expect(request?.[1]).toMatchObject({ method: 'POST' });
    expect(request?.[1]?.body).toEqual(expect.stringContaining('Ada Lovelace'));
    await waitFor(() => expect(name).toHaveValue(''));
  });

  it('reports a network failure without exposing the exception', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('provider secret')));
    render(createElement(ContactFormContainer));

    await userEvent.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Subject'), 'Portfolio enquiry');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('alert')).not.toHaveTextContent('provider secret');
  });
});

describe('sendContactMessage', () => {
  it('silently accepts a filled honeypot without spending quota or sending mail', async () => {
    const deps = dependencies();

    const result = await sendContactMessage(
      { ...validSubmission, website: 'https://spam.example' },
      { address: '203.0.113.4', now: new Date('2026-08-09T12:00:00.000Z') },
      deps,
    );

    expect(result).toEqual({ status: 'accepted' });
    expect(deps.consumeRateLimit).not.toHaveBeenCalled();
    expect(deps.deliver).not.toHaveBeenCalled();
  });

  it('allows three messages per address in an hour and rejects the fourth', async () => {
    const consumeRateLimit = vi
      .fn()
      .mockResolvedValueOnce({ allowed: true, used: 1, limit: 3, resetsAt: new Date() })
      .mockResolvedValueOnce({ allowed: true, used: 2, limit: 3, resetsAt: new Date() })
      .mockResolvedValueOnce({ allowed: true, used: 3, limit: 3, resetsAt: new Date() })
      .mockResolvedValueOnce({ allowed: false, used: 4, limit: 3, resetsAt: new Date() });
    const deps = dependencies({ consumeRateLimit });
    const context = { address: '203.0.113.4', now: new Date('2026-08-09T12:00:00.000Z') };

    expect((await sendContactMessage(validSubmission, context, deps)).status).toBe('accepted');
    expect((await sendContactMessage(validSubmission, context, deps)).status).toBe('accepted');
    expect((await sendContactMessage(validSubmission, context, deps)).status).toBe('accepted');
    expect((await sendContactMessage(validSubmission, context, deps)).status).toBe('rate-limited');
    expect(deps.deliver).toHaveBeenCalledTimes(3);
  });

  it('returns a retryable result and logs no submission or provider details on failure', async () => {
    const log = vi.fn();
    const deps = dependencies({
      deliver: vi.fn().mockRejectedValue(new Error('smtp password super-secret failed')),
      log,
    });

    const result = await sendContactMessage(
      validSubmission,
      { address: '203.0.113.4', now: new Date('2026-08-09T12:00:00.000Z') },
      deps,
    );

    expect(result).toEqual({ status: 'unavailable' });
    expect(log).toHaveBeenCalledWith('contact.delivery_failed', { provider: 'smtp' });
    expect(JSON.stringify(log.mock.calls)).not.toContain('super-secret');
    expect(JSON.stringify(log.mock.calls)).not.toContain('ada@example.com');
  });

  it('passes configured quota values to the durable limiter', async () => {
    const consumeRateLimit = vi.fn().mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 5,
      resetsAt: new Date(),
    });

    await sendContactMessage(
      validSubmission,
      { address: '203.0.113.4', now: new Date('2026-08-09T12:00:00.000Z') },
      dependencies({
        consumeRateLimit,
        rateLimitMax: 5,
        rateLimitWindowMs: 1_800_000,
      }),
    );

    expect(consumeRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, windowSeconds: 1800 }),
    );
  });

  it('rejects invalid input before quota or delivery', async () => {
    const deps = dependencies();

    expect(
      await sendContactMessage(
        { ...validSubmission, subject: 'Hello\nCc: victim@example.com' },
        { address: '203.0.113.4', now: new Date() },
        deps,
      ),
    ).toEqual({ status: 'invalid' });
    expect(deps.consumeRateLimit).not.toHaveBeenCalled();
    expect(deps.deliver).not.toHaveBeenCalled();
  });
});
