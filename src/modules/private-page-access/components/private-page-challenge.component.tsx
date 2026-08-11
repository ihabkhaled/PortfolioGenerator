import type { ReactElement } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/packages/ui-primitives';

import {
  PRIVATE_PAGE_ACCESS_ENDPOINT,
  PRIVATE_PAGE_FIELD_NAMES,
  privatePageChallengeClasses,
} from '../constants/private-page-challenge.constants';
import type { PrivatePageChallengeProps } from '../types/private-page-challenge.types';

export function PrivatePageChallenge(props: PrivatePageChallengeProps): ReactElement {
  return (
    <main className={privatePageChallengeClasses.page}>
      <Card className={privatePageChallengeClasses.card}>
        <CardHeader>
          <CardTitle>{props.labels.title}</CardTitle>
          <CardDescription>{props.labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={PRIVATE_PAGE_ACCESS_ENDPOINT}
            method="post"
            className={privatePageChallengeClasses.form}
            onSubmit={props.onSubmit}
            aria-busy={props.pending}
          >
            <input
              type="hidden"
              name={PRIVATE_PAGE_FIELD_NAMES.portfolioSlug}
              value={props.portfolioSlug}
            />
            <input type="hidden" name={PRIVATE_PAGE_FIELD_NAMES.pageSlug} value={props.pageSlug} />
            <input type="hidden" name={PRIVATE_PAGE_FIELD_NAMES.locale} value={props.locale} />
            {props.denied ? (
              <p className={privatePageChallengeClasses.error} role="alert">
                {props.labels.denied}
              </p>
            ) : null}
            <div className={privatePageChallengeClasses.field}>
              <Label htmlFor={PRIVATE_PAGE_FIELD_NAMES.password}>{props.labels.password}</Label>
              <Input
                id={PRIVATE_PAGE_FIELD_NAMES.password}
                name={PRIVATE_PAGE_FIELD_NAMES.password}
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              className={privatePageChallengeClasses.submit}
              disabled={props.pending}
            >
              {props.labels.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
