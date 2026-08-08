/**
 * Declare the public environment variables as real properties.
 *
 * Without this they come from `ProcessEnv`'s index signature, and
 * `noPropertyAccessFromIndexSignature` forces bracket access — which Next.js
 * does not always inline at build time. Declaring them keeps the literal
 * `process.env.NEXT_PUBLIC_X` form that the compiler rewrites, and documents
 * the complete public surface in one place.
 *
 * Server-only variables are deliberately absent: they are read once, through
 * the validated `getServerEnv()` facade, never by name from application code.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;
    /**
     * Not `readonly`: the test setup pins these so a developer's local `.env`
     * cannot change an assertion, and marking them immutable would be a claim
     * about `process.env` that is not true of any Node process.
     */
    NEXT_PUBLIC_APP_ENV?: 'local' | 'staging' | 'production';
  }
}
