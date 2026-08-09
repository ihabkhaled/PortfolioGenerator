# EXC-0007 — The support scripts are command-line programs

**Rules:** `no-console`, `unicorn/no-process-exit`
**Scope:** `support/**/*.{mjs,mts}`

## Why the rules fire

These scripts print to stdout and exit with a status.

## Why they do not apply

`no-console` exists so that application code goes through
`src/packages/logger` — one owner of console output, one place to change the
sink. `unicorn/no-process-exit` exists so that a request handler cannot take the
whole process down.

Neither concern reaches a script whose entire interface _is_ stdout and an exit
status. `install-git-hooks.mjs` in particular exists to exit zero without doing
anything when it finds itself on a build machine, and it has to say so — a
silent skip is how a developer ends up without hooks and never finds out.

## What would make this exception wrong

Anything under `support/` that is imported by application code. These files are
entry points; the moment one is a library, it belongs in `src/packages/`.
