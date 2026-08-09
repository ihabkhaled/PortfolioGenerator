import 'server-only';

/**
 * Server-only surface of the auth module, kept separate from `index.ts` so a
 * client component that imports the module barrel does not pull the session
 * services (and through them the database client) into its bundle.
 */

export { getCurrentUser, requireOwner } from './services/require-owner.service';
export { getOptionalUser, signOutCurrentSession } from './services/session.service';
export {
  consumePasswordRecovery,
  requestPasswordRecovery,
} from './services/password-recovery.service';
