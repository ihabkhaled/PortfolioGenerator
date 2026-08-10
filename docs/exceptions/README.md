# Lint exceptions

`eslint-disable` comments are banned by policy: they hide in a diff and outlive
the reason they were added. Every exception this repository has lives in
`eslint/exceptions.config.mjs`, file-scoped, next to its rationale — and gets a
document here.

| Id                                                       | Scope                                | Rules                                                     |
| -------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| [EXC-0001](./EXC-0001-filesystem-with-computed-names.md) | Local storage adapter, build scripts | `security/detect-non-literal-fs-filename`                 |
| [EXC-0002](./EXC-0002-control-character-class.md)        | `shared/constants/text.constants.ts` | `no-control-regex` and friends                            |
| [EXC-0003](./EXC-0003-logger-owns-console.md)            | `packages/logger`                    | `no-console`                                              |
| [EXC-0004](./EXC-0004-branded-route-assertion.md)        | `packages/link`                      | `@typescript-eslint/no-unnecessary-type-assertion`        |
| [EXC-0005](./EXC-0005-cleartext-url-autofix.md)          | The URL policy and its test          | `sonarjs/no-clear-text-protocols`, `unicorn/prefer-https` |
| [EXC-0006](./EXC-0006-script-body-assertion.md)          | The renderer fixture matrix          | `testing-library/no-container`, `no-node-access`          |
| [EXC-0007](./EXC-0007-support-scripts-are-cli-programs.md) | `support/**/*.{mjs,mts}`           | `no-console`, `unicorn/no-process-exit`                    |
| [EXC-0008](./EXC-0008-create-database-identifier.md)     | `support/ensure-database.mjs`        | `sonarjs/sql-queries`                                      |

## Adding one

1. Convince yourself the rule does not apply. Most of the time it does, and the
   rule is telling you the design is wrong.
2. Add a file-scoped entry to `eslint/exceptions.config.mjs` with a comment
   naming the `EXC-` id and the reason.
3. Add a document here.
4. Note it in the PR description. An exception is a decision, not a formality.
