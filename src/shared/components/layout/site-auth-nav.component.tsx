import type { ReactElement } from 'react';

import { SignInIcon, SignUpIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';

import type { SiteAuthNavProps } from '../types/shared-component.types';

import { siteShellClasses } from './site-shell.variants';

/**
 * The nav slot's auth-aware half.
 *
 * A signed-in visitor on a public page gets one link back to their dashboard;
 * a signed-out visitor gets both credential actions, each carrying an icon so
 * the pair reads as a decision (join vs. return) rather than two identical
 * text links. Shared by the home page and the marketing layout so a visitor
 * sees the same state everywhere instead of a sign-up prompt that ignores
 * whether they are already signed in.
 */
export function SiteAuthNav(props: Readonly<SiteAuthNavProps>): ReactElement {
  if (props.isSignedIn) {
    return (
      <AppLink href={props.dashboardHref} className={siteShellClasses.navLink}>
        {props.dashboardLabel}
      </AppLink>
    );
  }

  return (
    <>
      <AppLink href={props.signInHref} className={siteShellClasses.navLink}>
        <SignInIcon aria-hidden size={16} />
        {props.signInLabel}
      </AppLink>
      <AppLink href={props.signUpHref} className={siteShellClasses.navPrimaryAction}>
        <SignUpIcon aria-hidden size={16} />
        {props.signUpLabel}
      </AppLink>
    </>
  );
}
