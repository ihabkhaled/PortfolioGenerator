# rules/

The reasoning behind the machine-enforced rules.

`eslint/` is the enforcement; this directory is the argument. When a rule
blocks you, read the file that explains it before deciding it is wrong — most of
them exist because the alternative shipped a bug once.

| File                                                                             | Enforced by                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------- |
| [01-next-app-router-architecture.md](./01-next-app-router-architecture.md)       | `eslint/architecture.config.mjs`                  |
| [02-typescript-and-types.md](./02-typescript-and-types.md)                       | `tsconfig.*.json`, `eslint/typescript.config.mjs` |
| [03-testing-and-quality.md](./03-testing-and-quality.md)                         | `vitest.config.mts`, `playwright.config.ts`       |
| [04-security-and-tenancy.md](./04-security-and-tenancy.md)                       | `eslint/security.config.mjs`, architecture plugin |
| [05-ai-and-untrusted-input.md](./05-ai-and-untrusted-input.md)                   | schemas, mappers, E2E                             |
| [06-design-system-and-accessibility.md](./06-design-system-and-accessibility.md) | architecture plugin, axe suite                    |
| [07-git-and-quality-gates.md](./07-git-and-quality-gates.md)                     | husky, commitlint, CI                             |
| [08-communication-style.md](./08-communication-style.md)                         | review                                            |
