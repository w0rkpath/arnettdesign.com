# Changes

Log of edits made in the design project. Newest first. Each entry lists the files to copy into `deploy/`; Claude Code reads this plus the git diff, commits, and pushes to Vercel.

Convention: when `css/site.css` or `js/site.js` changes, bump the `?v=YYYY-MM-DD` query on both references in `index.html` so browsers drop the cached copy.

---

## 2026-10-08

**Fixes (round 3)**
- Mobile menu (<720px): numbers now sit in column 1 and links span columns 2–6. Link size is capped at 11.5vw so "Working together" and "Selected work" fit on small Android screens instead of clipping.
- Masthead scrim: a `.masthead::before` layer blurs the content behind the logo and menu button (12px backdrop blur plus a page-colour tint) and fades to transparent through an alpha mask. There is no divider line. It hides on the Blade contact section.
- Cache: the asset query changed to `?v=2026-10-08d`.
- Files: `index.html`, `css/site.css`.

**Fix (later same day)**
- Contact headline: a `<br>` now separates the two questions, so "Building something new?" and "Rethinking what’s next?" each start on their own line.
- `js/site.js` `splitHeadings`: now treats `<br>` elements as hard line breaks (walks child nodes, not regex) and measures lines with plain `text-wrap: wrap`, so `pretty` can no longer create orphans like "Building" / "something new?". Applies to all scroll-split headings.
- Cache: the asset query changed to `?v=2026-10-08c`.
- Files: `index.html`, `js/site.js`.

**Files changed**
- `index.html`
- `css/site.css`
- `CHANGES.md` (new)

**Selected work**
- Case studies restructured: the two-paragraph body is replaced with a three-column Problem / Solution / Outcome row (same pattern as "Working together": hairline above each, label, short body; outcome in medium weight). Stacks on mobile.
- Copy rewritten for all case studies as one-line statements.
- Instacart: new title "From “what can I eat?” to a cart you can trust."; tag now "Health & meals" (AI removed).
- New case study: Eli Lilly (`#w05`), placed second, after Instacart. No work imagery: the image well shows the Lilly logo (`assets/clients/lilly.svg`, already deployed) in white on Lilly red #d52b1e, set at 125% width and cropped at the bottom and right. Uses the standard scroll reveal.

**Outside the brief**
- Added heading "Every new wave of technology, I make something with it." and a new intro framing the generative work as continuous curiosity across technology waves.

**CSS**
- Removed `.case-ps`, `.outcome-label`; added `.case-pso`, `.reveal-logo`.

**Cache**
- Added `?v=2026-10-08` to the `site.css` and `site.js` references in `index.html`.

**For Claude Code**
- Commit message suggestion: "Case studies: problem/solution/outcome layout, add Eli Lilly, update personal section intro".
- No new assets, routes, or sitemap changes. `og-image.png` unchanged.
