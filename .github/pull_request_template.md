## What and why

<!-- One paragraph: the behavior change and the reason for it. -->

## Architecture invariants

- [ ] Public portfolio pages still read `published_document` only.
- [ ] No AI, PDF, storage or editor import reached the public render path.
- [ ] Every new repository call is owner-scoped.
- [ ] No raw HTML, no `dangerouslySetInnerHTML`, no user-supplied CSS/JS.
- [ ] `PortfolioDocument` changes came with a schema version and a migration step.
- [ ] Third-party SDK usage stayed inside its `src/packages/<vendor>` wrapper.

## Verification

<!-- Paste the commands you ran and their result. Not "should pass" — what happened. -->

```
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

## Security and privacy

- [ ] No secret, token or raw CV text added to code, logs or fixtures.
- [ ] New user input is validated at the boundary and length-bounded.
- [ ] New URLs are validated against the safe-URL policy before render.
- [ ] Test fixtures are synthetic — no real person's CV.

## Screenshots

<!-- For UI changes: desktop and mobile, light and dark. -->
