module.exports = {
  '*.{ts,tsx,mjs,cjs,mts}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};
