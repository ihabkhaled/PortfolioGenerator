import { register } from 'node:module';

/**
 * Entry point for `node --import ./support/register-aliases.mjs`. Installs the
 * `@/` resolve hook so build and maintenance scripts can import application
 * code the same way the application does.
 */
register('./alias-resolver.mjs', import.meta.url);
