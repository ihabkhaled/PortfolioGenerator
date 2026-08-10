# EXC-0008 — `CREATE DATABASE` with an escaped identifier

**Rule:** `sonarjs/sql-queries`
**Scope:** `support/ensure-database.mjs`

## Why the rule fires

The database name is interpolated into a SQL string built at runtime, the
general shape of a SQL-injection sink.

## Why it does not apply

Postgres has no bind-parameter syntax for `CREATE DATABASE`'s identifier —
DDL identifiers cannot be placeholders the way `SELECT ... WHERE x = $1`
values can. The name is escaped with `pg`'s own `Client#escapeIdentifier`,
the library's supported mechanism for exactly this case, before it reaches
the query string. This is the same shape as EXC-0001: a value from outside
the request path (here, `DATABASE_URL`, which is developer-supplied local
configuration, never user input) made safe by an escaping call the rule
cannot see.

## What would make this exception wrong

The database name ever coming from request input, or the `escapeIdentifier`
call being removed or replaced with plain interpolation. If either happens,
the exception must go and the query must be rebuilt to satisfy the rule.
