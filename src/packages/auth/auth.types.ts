/**
 * The identity the application works with.
 *
 * Deliberately narrower than the library's session object: everything below the
 * action layer takes an `ownerId`, never a session, so a repository can never be
 * tempted to re-derive authorization from request state.
 */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
}
