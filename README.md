# arnettdesign.com

Static single-page site. No build step, no dependencies.

```
index.html        the page
404.html          not-found page
css/site.css      design tokens (Arnett Design System) + page styles
js/site.js        menu, motion, scroll reveal, gallery, email copy
assets/           mark, client logos, work and generative imagery
fonts/            Geist variable (OFL)
favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png, og-image.png
vercel.json       caching + clean URLs
robots.txt, sitemap.xml
```

## Deploy (for Claude Code)
1. Create a GitHub repo (e.g. `arnettdesign.com`) and push the contents of this folder to its root on `main`.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Other**. Build command: none. Output directory: `./` (root).
3. Deploy. Every push to `main` redeploys.
4. **Domain:** Vercel → Project → Settings → Domains → add `arnettdesign.com` and `www.arnettdesign.com`. Set `www` as primary (the canonical and share-image URLs point to `https://www.arnettdesign.com/`). Then at the domain registrar (currently pointing at Squarespace), replace the DNS records with the ones Vercel shows.
5. **Analytics:** Vercel → Project → Analytics → Enable. The tracking script is already in `index.html` (`/_vercel/insights/script.js`); it only reports once Analytics is enabled. Cookie-free, no consent banner needed.

## Local preview
`npx serve .` — or open `index.html` directly.

## Editing
- Copy lives in `index.html`.
- Add a case study: duplicate an `<article class="case">` block in `#work`, change the id (`w05`), text and image (`assets/work/*.webp`, 16:9, ~2400px wide).
- Colours, type and spacing are tokens at the top of `css/site.css` — change them in the design system first, then copy across.
