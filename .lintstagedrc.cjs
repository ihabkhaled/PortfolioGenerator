// eslint has to run through the same TypeScript-7 compatibility shim as
// `npm run lint` (see support/register-typescript-compat.cjs) — without it,
// typescript-eslint crashes outright because it doesn't understand the TS 7
// compiler API yet.
module.exports = {
  '*.{ts,tsx,mjs,cjs,mts}': [
    'node --require ./support/register-typescript-compat.cjs ./node_modules/eslint/bin/eslint.js --fix --max-warnings=0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};
