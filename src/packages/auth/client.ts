'use client';
// client-boundary-reason: the auth client stores session state in the browser
// and issues fetches to the same-origin auth routes.

import { createAuthClient } from 'better-auth/react';

import { AUTH_API_BASE_PATH } from './auth.constants';

/**
 * Owner of `better-auth/react`. Same-origin only — the client never learns a
 * provider URL, and there is no token for a script to read: the session lives
 * in an httpOnly cookie.
 */
export const authClient = createAuthClient({ basePath: AUTH_API_BASE_PATH });

export const { signIn, signOut, signUp, useSession } = authClient;
