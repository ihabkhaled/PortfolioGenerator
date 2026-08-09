# Manual test plan

What automation cannot check. Run this before a release that changes the
renderer, the editor, or anything a user reads.

Each item names what you are looking for, not just what to click — "it renders"
is not an observation.

## 1. The first five minutes

Fresh browser, no account.

1. Land on `/`. **Is it obvious what this does and what it costs you?**
2. Create an account. **Did anything ask for information it does not need?**
3. Create a portfolio. **Did the product tell you what happens next?**
4. Import a CV you wrote yourself. **How long did it take, and did the screen
   say what it was doing?**
5. Read the review screen. **Would you trust it? Is anything wrong that it did
   not warn you about?**

That last question is the product's whole thesis. If the extractor got something
wrong _and did not flag it_, that is a bug worth a ticket even though nothing
crashed.

## 2. The renderer

Publish a portfolio and look at it on:

- [ ] A phone, portrait. Text is readable without zooming; nothing scrolls
      sideways.
- [ ] A laptop.
- [ ] A wide monitor. Line lengths are still comfortable; the layout has not
      simply stretched.
- [ ] Dark mode. Contrast holds, and the accent is still legible.
- [ ] Browser zoom at 200%. Nothing is clipped or overlapping.

Then, with the long-content fixture:

- [ ] A 90-character job title wraps rather than truncating mid-word.
- [ ] An Arabic name renders right-to-left correctly within a left-to-right
      layout.
- [ ] A summary with several paragraphs keeps its paragraph breaks.

Repeat the responsive pass at 320, 360, 375, 390 and 768 CSS pixels, plus a phone in landscape.
On each profile, verify the main landmark remains singular, controls remain reachable, and the
locale/install/update surfaces stay inside the safe area without covering each other. Repeat one
dense guide and one published portfolio in Arabic and Persian, in both light and dark themes.

With reduced motion enabled at operating-system level, navigate, change locale and change theme.
Transitions should resolve immediately and no looping animation should remain. Install the app,
launch it standalone, update it after a new worker is deployed, and take the network offline. Public
shell pages may fall back to the offline screen; dashboard, API, media, authentication and private
page responses must be unavailable and absent from Cache Storage.

## 3. The editor

- [ ] Type in every field. The preview updates and matches.
- [ ] Reorder sections. The preview order matches, and after publishing, the
      public page matches too.
- [ ] Hide a section. It disappears from the preview and from the public page.
- [ ] Open the same portfolio in two tabs, edit both, save both. **The second
      save is refused with a message that explains what to do.**
- [ ] Turn off "allow search engines" and publish. The page's meta robots tag is
      `noindex`, and the sitemap does not list it.

## 4. Contact and links

- [ ] A hidden email does not appear anywhere in the page source — not in the
      body, not in JSON-LD, not in the OG card.
- [ ] A link marked hidden does not render.
- [ ] Paste a `javascript:` URL into a link field and publish. **No anchor is
      rendered at all.**

## 5. Publishing

- [ ] Claim an address, publish, open it in a private window.
- [ ] Change the address. The old one 404s immediately.
- [ ] Unpublish. The page 404s and the draft is intact.
- [ ] Republish. It is live again with the current draft.

## 6. Deletion

- [ ] Delete a portfolio. The public address stops serving, and the CV file is
      gone from the bucket. **Check the bucket, not just the UI.**
- [ ] Delete an account. Confirm the user, portfolios, uploads and AI runs are
      gone from the database, and that the audit rows remain with a NULL owner.

## 7. Sharing

- [ ] Paste a published URL into a chat app and a social platform. The share
      card renders, and the name is legible at the size it is displayed.
- [ ] Check the title and description in the browser tab and in search-result
      preview tools. **The platform's name is not in them** — a published
      portfolio is the tenant's artifact.

## 8. Screen reader

Pick one — VoiceOver, NVDA or Narrator — and, on a published portfolio:

- [ ] Navigate by heading. The order tells the story.
- [ ] Navigate by landmark. Header, navigation, main and footer are all there.
- [ ] The skip link works and lands on the content.
- [ ] Every link's announced name says where it goes. "Read more" three times is
      a failure even though axe will not flag it.
