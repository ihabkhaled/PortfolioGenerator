'use client';
// client-boundary-reason: the public form submits without navigating away and
// announces the generic server outcome to assistive technology.

import { useState, type ReactElement, type SyntheticEvent } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label, Textarea } from '@/packages/ui-primitives';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { contactFormClasses } from '../constants/contact-style.constants';
import { CONTACT_ERROR_STATUSES } from '../constants/contact.constants';
import type { ContactFormContainerProps, ContactSubmissionStatus } from '../types/contact.types';

export function ContactFormContainer(props: Readonly<ContactFormContainerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.contact);
  const [status, setStatus] = useState<ContactSubmissionStatus>('idle');

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<void> {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus('pending');
    const form = new FormData(formElement);
    const requestBody = Object.fromEntries(form);
    let response: Response;
    try {
      response = await fetch(ROUTE_PATHS.apiContact, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
        redirect: 'error',
      });
    } catch {
      setStatus('unavailable');
      return;
    }

    switch (response.status) {
      case 202: {
        setStatus('accepted');
        formElement.reset();
        break;
      }
      case 400: {
        setStatus('invalid');
        break;
      }
      case 429: {
        setStatus('rate-limited');
        break;
      }
      default: {
        setStatus('unavailable');
      }
    }
  }

  return (
    <section className={contactFormClasses.section} aria-labelledby="contact-form-title">
      {props.eyebrow ? <p className={contactFormClasses.eyebrow}>{props.eyebrow}</p> : null}
      <h2 id="contact-form-title" className={contactFormClasses.heading}>
        {t('title')}
      </h2>
      <p className={contactFormClasses.lead}>{t('lead')}</p>
      <form
        className={contactFormClasses.form}
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <div className={contactFormClasses.field}>
          <Label htmlFor="contact-name">{t('name')}</Label>
          <Input id="contact-name" name="name" autoComplete="name" required maxLength={120} />
        </div>
        <div className={contactFormClasses.field}>
          <Label htmlFor="contact-email">{t('email')}</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
          />
        </div>
        <div className={contactFormClasses.field}>
          <Label htmlFor="contact-subject">{t('subject')}</Label>
          <Input id="contact-subject" name="subject" required maxLength={160} />
        </div>
        <div className={contactFormClasses.field}>
          <Label htmlFor="contact-message">{t('message')}</Label>
          <Textarea id="contact-message" name="message" required maxLength={5000} rows={8} />
        </div>
        <div className={contactFormClasses.hidden} aria-hidden="true">
          <Label htmlFor="contact-website">{t('website')}</Label>
          <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className={contactFormClasses.actions}>
          <Button type="submit" disabled={status === 'pending'}>
            {t(status === 'pending' ? 'sending' : 'send')}
          </Button>
          {status === 'accepted' ? (
            <p className={contactFormClasses.success} role="status">
              {t('accepted')}
            </p>
          ) : null}
          {(CONTACT_ERROR_STATUSES as readonly ContactSubmissionStatus[]).includes(status) ? (
            <p className={contactFormClasses.error} role="alert">
              {t(`errors.${status}`)}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
