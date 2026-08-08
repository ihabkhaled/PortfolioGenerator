/**
 * The repository runs `eslint --max-warnings=0`, which makes a warning-level
 * rule a rule that silently never fires. This guard fails the lint script if
 * any enabled rule resolves to `warn` for a representative file from each
 * config layer, so an upstream preset introducing a warning cannot quietly
 * weaken the gate.
 */

import { ESLint } from 'eslint';

const SAMPLE_FILES = [
  'src/app/layout.tsx',
  'src/modules/publishing/policies/slug.policy.ts',
  'src/tests/unit/slug-policy.test.ts',
  'next.config.ts',
];

function isWarning(setting) {
  const severity = Array.isArray(setting) ? setting[0] : setting;

  return severity === 1 || severity === 'warn';
}

const eslint = new ESLint();
const warnings = [];

for (const filePath of SAMPLE_FILES) {
  const resolved = await eslint.calculateConfigForFile(filePath);
  const rules = Object.entries(resolved?.rules ?? {});

  for (const [ruleId, setting] of rules) {
    if (isWarning(setting)) {
      warnings.push(`${filePath}: ${ruleId}`);
    }
  }
}

if (warnings.length > 0) {
  throw new Error(`Every enabled ESLint rule must be an error:\n${warnings.join('\n')}`);
}
