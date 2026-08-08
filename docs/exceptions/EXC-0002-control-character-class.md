# EXC-0002 — The control-character class

**Rules:** `no-control-regex`, `regexp/control-character-escape`,
`unicorn/prefer-unicode-code-point-escapes`
**Scope:** `src/shared/constants/text.constants.ts`

## Why the rules fire

The file contains a character class matching control characters. That is
unusual, and normally a mistake.

## Why they do not apply

This file exists to match control characters. They are stripped from stored text
because they carry no meaning in a CV and are the raw material for
bidirectional-override and zero-width tricks that make a rendered name read as
something other than what is stored.

`control-character-escape` would rewrite parts of the class as `\v`/`\f`, and
`prefer-unicode-code-point-escapes` would rewrite it as `\u{...}`. Both make
the range boundaries harder to verify by eye, which is the only property that
matters in a security-relevant character class.
