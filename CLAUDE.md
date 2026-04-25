# Abide — Project Notes

A static React site for a weekly Bible study group. Runs entirely from `project/` — no build step, no package.json. React + Babel are loaded via CDN in `index.html`.

## Structure

```
Abide/
├── CLAUDE.md                  ← this file
├── README.md
├── .claude/launch.json        ← preview server config (port 8090)
└── project/                   ← site root (everything shipped to Netlify)
    ├── index.html             ← entry point, references data.js + app.jsx with ?v= cache-buster
    ├── app.jsx                ← React components (hash-routed, no build step)
    ├── data.js                ← window.ABIDE_ARTICLES[] — the content model
    ├── styles.css
    └── uploads/               ← week hero images (wk1.png, wk2.png, ...) + logo variants (abide-logo*.png) + book covers
```

## Running locally

```
python3 -m http.server 8090 --directory project
```

Or use the `abide` preview server defined in `.claude/launch.json`.

## Routes

- `/` — Home (hero + Reflections grid + Oath card + marquee + footer)
- `/article/:id` — polished article page (study guide)
- `/raw` — Raw index (grid of weeks with raw notes)
- `/raw/:id` — Raw page (Granola output, structured markup supported)
- `/books` — Books page (the book the group is reading + companion study guide, with Amazon links)
- `/promise` — Our Oath page (transparency / AI usage promise)

Routing is hash-based (`#/article/...`), handled by the `useRoute` hook in `app.jsx`.

The nav has four items: **Home · Reflect · Raw · Our Oath**. The "Jesus *the* King" wordmark in the top-left is the entry point to `/books` — there is intentionally no separate "Books" link in the nav. See "Brand wordmark routes to /books" below.

---

## Design system

### Color tokens (`:root` in styles.css)

| Token         | Value                      | Role                                              |
|---------------|----------------------------|---------------------------------------------------|
| `--bg`        | `#0a0a0a`                  | Page background (near-black)                      |
| `--bg-2`      | `#131211`                  | Card/surface background                           |
| `--fg`        | `#f5f1ea`                  | Primary text (cream)                              |
| `--fg-dim`    | `#8a857d`                  | Secondary text, kicker labels                     |
| `--fg-mute`   | `#4a4742`                  | Tertiary (captions, credits)                      |
| `--rule`      | `#1f1d1b`                  | Dividers, borders                                 |
| `--accent`    | `oklch(0.6 0.22 25)`       | Rich red ("blood of Jesus") — hover, highlights, accents, site-wide |

The accent is red everywhere (site-wide standard). Earlier iterations had sage green as default and red scoped only to Raw; that split was collapsed. Always use `var(--accent)` rather than hardcoding the color so any future re-theme is a one-line change.

Cream and white remain primary everywhere. The accent is accent only — never body text, never large surface fills.

### Type tokens

| Token       | Font family                             | When to use                                              |
|-------------|-----------------------------------------|----------------------------------------------------------|
| `--display` | `Anton, 'Arial Narrow', sans-serif`     | Big uppercase headlines — hero titles, h2 section breaks |
| `--serif`   | `Instrument Serif, Georgia, serif`      | Italic taglines, pullquotes, editorial asides            |
| `--sans`    | `Inter, system-ui`                      | Body copy, card titles                                   |
| `--mono`    | `JetBrains Mono, monospace`             | Kickers, pill labels, meta rows                          |

### Hero image conventions

- Dimensions: 1792×1024 landscape, 16:10 or 3:2.
- Style: dark, cinematic, symbolic. Natural / cosmic subjects. No people, no faces, no literal religious iconography.
- Reference image: `project/uploads/wk1.png` (moonlit tree reflected in still cosmic water).
- Generate via ChatGPT using the image prompt the `article-writer` skill produces.

### Brand mark / Logo

A chrome-finished hexagon with an "A" arrowhead inside, on pure black. Lives in `project/uploads/`:

| File                          | Size       | Used for                                           |
|-------------------------------|------------|----------------------------------------------------|
| `abide-logo-source.png`       | 2048×2048  | Master from Midjourney — preserve, don't overwrite |
| `abide-logo.png`              | 1500×1500  | Working file (center-cropped from source so the hexagon fills ~75% of canvas) |
| `abide-logo-512.png`          | 512×512    | PWA icon + Oath-card hero                          |
| `abide-logo-192.png`          | 192×192    | PWA / Android home screen                          |
| `abide-logo-180.png`          | 180×180    | iOS apple-touch-icon                               |
| `abide-logo-32.png`           | 32×32      | Browser-tab favicon                                |

**Reading**: A = Alpha. "I am the Alpha and the Omega" (Rev 22:13). Christ as the A at the center; the hexagonal frame is what's around Him; we abide *inside* that. Maps directly to John 15:4, the site's central verse.

**Where it shows up**: as the iOS home-screen icon, the browser-tab favicon, the PWA icon, and the hero image of the "Our Oath" card on the home grid (replacing the earlier styled "How We Use AI." text). Not in the nav — the wordmark "Jesus *the* King" handles that.

The Oath card's `card-image` background is set to pure `#000` to match the logo's baked-in black, so the rectangle edge disappears. If you ever need to place the logo on a non-black surface, generate a transparent-background variant first — the current PNGs all have `#000` baked in.

When iOS home-screen users have the app saved already, they need to remove and re-add it to see a new icon — iOS caches aggressively.

### Shimmer text pattern

A slow gradient sweep on small flagship strings — pure CSS, no motion library (the site has no build step). Used in two places:

- `.footer-credit` ("Powered by Martocci Media") — cream highlight on muted base, 4.5s
- `.article-to-raw a` and `.raw-footer-link a` (the article ↔ raw cross-links) — red accent highlight on muted base, 6s; speeds to 2.5s on hover

Implementation: a `linear-gradient(110deg, base 35%, highlight 50%, base 75%)` clipped to text via `background-clip: text` + `-webkit-text-fill-color: transparent`, animated by sliding `background-position` from `200% 0` to `-200% 0`. Always include a `prefers-reduced-motion` fallback that swaps to a flat color.

Don't add this to body text or large headlines — only small strings where the slow shimmer reads as quiet polish, not flicker.

### Global UI conventions

A handful of site-wide rules that establish the "premium feel". Preserve these — they're cheap, invisible until they matter, and removing them would be a regression.

- **Focus rings**: `:focus-visible` only (not `:focus`) — keyboard navigation gets a 2px red outline with 3px offset; mouse clicks don't.
- **Selection color**: red highlight on cream text instead of browser-default blue. Defined on both `::selection` and `::-moz-selection`.
- **Scrollbar**: thin dark scrollbar (`--rule` thumb on `--bg` track) for both Firefox and WebKit.
- **Reduced motion**: a single `@media (prefers-reduced-motion: reduce)` block near the top of the stylesheet kills the marquee, the book float, the `.fade-in` mount animation, and card hover lifts. The shimmer rules have their own narrower fallbacks. When you add new animation, add it to the global block.
- **Viewport units**: hero/page heights use `100dvh`, not `100vh`, so iOS Safari chrome doesn't crop the giant Anton headline.
- **Press feedback**: `:active` on cards triggers a subtle `scale(0.985)` for tactile feel on touch devices.
- **Image loading**: the first article hero loads eager; everything below the fold is `loading="lazy" decoding="async"`.
- **Google Fonts**: a `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com` is in `<head>` to shave first-paint latency.

---

## Content model

Each gathering is **one object** in `window.ABIDE_ARTICLES` (in `data.js`). One object powers both views (article + raw):

```js
{
  id: "kebab-case",                 // slug, used in URL
  number: "01",                     // zero-padded string
  category: "Intimacy",             // one word
  title: "He Must Become Greater",
  subtitle: "...",
  verse: "John 3:30",               // primary verse — ESV
  author: "Bible Study Group",
  date: "April 21, 2026",           // Tuesday (group meets Tue 7pm)
  readTime: "9 min",                // manual for article body; raw read time auto-calculates
  hero: "./uploads/wk1.png",        // matches the week number
  excerpt: "...",                   // 1-2 sentences
  body: [                           // renders on /article/:id
    { type: "lede", text: "..." },
    { type: "p", text: "..." },
    { type: "h", text: "..." },
    { type: "pullquote", text: "..." },
  ],
  raw: `Granola output goes here.

  Paragraphs separated by blank lines render as separate <p> blocks.`,   // optional, renders on /raw/:id
}
```

- `body` is required and drives `/article/:id`.
- `raw` is optional; when present, the week shows up in the Raw index at `/raw` and the polished article gets a "↳ Read the raw notes from this week" link at the bottom.
- If `raw` is absent, the week has no entry in the Raw index. No error.

### Raw body markup

The `raw` field supports a small markup system so long-form notes get visual rhythm, and so scripture can sit alongside rough statements without rewriting them:

| Markup                      | Renders as                                                            |
|-----------------------------|-----------------------------------------------------------------------|
| `### Some Heading`          | Anton display-caps section heading with a red rule above + red period |
| `---` (on its own line)     | Centered red ✦ ornament break                                         |
| Blank line between          | Paragraph break (normal `<p>`)                                        |
| First paragraph             | Automatically gets `.raw-lede` (larger type + red drop cap)           |
| `{{ref: Hebrews 11:1}}` inline | Small red mono scripture reference pill, placed next to a claim    |

Use `###` headings sparingly — only at real topic transitions in the conversation. The goal is 3-5 headings for a 2,500-3,000 word Granola output, placed where the conversation genuinely pivoted to a new subject. Headings should summarize what's about to be discussed (e.g., `### Crystal, and the Question Under It`, `### Identity and the Spirit`).

### Raw scripture cross-references

Raw preserves the room as-is — no rewriting the prose. But when a claim in the transcript doesn't line up with scripture, add an inline `{{ref: Book C:V}}` **right next to the claim** (same sentence, before the closing punctuation). The reference renders as a small red mono pill. The surrounding paragraph stays word-for-word as Granola produced it.

Threshold for adding a reference: the claim should be a clear, specific point that a specific verse addresses directly. Don't annotate every verse mentioned in passing, and don't annotate vague or interpretive statements. The goal is "here's the Word next to the room" — not a fact-check on every sentence.

Example: if the transcript says "faith is mostly about what we feel", render as:

> "faith is mostly about what we feel {{ref: Hebrews 11:1}}"

The site displays a "A heads up." notice next to every Raw hero explaining this to readers, so they know the red reference pills are cross-references, not corrections.

### Raw pronoun clarity

Granola's summary can come back with pronoun chains that are hard to parse ("they … he … them … his … them"). This is a grammar issue, not a content issue — you may disambiguate pronouns by replacing ambiguous "they/he/them" with a relational descriptor ("the group", "his wife", "her son", "a loved one") or with "one of us" / "he" when the singular speaker is clear. **Never use a real name to disambiguate.** Every factual and spoken element stays the same. Only the pronouns change.

This is the one editorial latitude in Raw — if a sentence is confusing because of pronoun soup, clean it. Do not rephrase sentences for flow, do not merge or split paragraphs, do not alter theological content.

---

## Adding a new week

1. **Append a new article object** to the end of `ABIDE_ARTICLES` in `data.js`. The skill `article-writer` handles this from a transcript.
2. **Save the hero image** to `project/uploads/wk{N}.png` (Week 2 → `wk2.png`, Week 10 → `wk10.png`, etc.).
3. **Bump the cache-buster** in `project/index.html`: find `?v=NN` and increment. Both `styles.css?v=` and `data.js?v=` and `app.jsx?v=` share one number — bump with `replace_all: true`.
4. **Raw notes (optional)**: paste the Granola output verbatim as a template-literal string into the `raw` field of the same article object. Insert `### ` headings at real topic shifts. The skill `article-writer` handles this too.

---

## Important behaviors to preserve

### Article ordering

`ABIDE_ARTICLES` is ordered **oldest first → newest last**. Week 1 is the first element, the current week is the last. The Home grid and Reflections list render in that order.

### Next Entry block (at bottom of `/article/:id`)

- When there's a next article in the array: links to it as "Next Entry — {number} / {category}".
- When there's no next article (current is last): falls back to the Our Oath page with "Next Up — Our Oath".

This is intentional. Means the bottom of any article always has a destination. When a new week is added, the previous week's "Next Up — Our Oath" automatically becomes "Next Entry — 02 / {category}" pointing to the new week, and the new week inherits the Oath fallback. No manual wiring needed.

### Cache-buster

The site serves `?v=NN` on `styles.css`, `data.js`, and `app.jsx` to force browsers to refetch after edits. **Always bump this version** when editing any of those files. Otherwise browsers serve stale content.

### Raw read time

Auto-calculated from word count at 220 wpm — no need to set manually. `readTime` on the article object governs the article body only.

### Brand wordmark routes to /books

The "Jesus *the* King" wordmark in the top-left of the nav is the entry point to `/books`. There is intentionally no separate "Books" link — that would be redundant and crowd the nav pill at iPhone widths. If you redesign the nav, preserve this routing. The aria-label on the brand says "Jesus the King — Books" so screen readers announce the destination.

### Accessible card buttons

Several elements on the site are clickable `<div>`s for layout reasons (article cards, the Oath card, the next-entry tile, raw cards, the books card). They use the `clickable(handler, ariaLabel)` helper from `app.jsx` to add `role="button"`, `tabIndex={0}`, an `aria-label`, and Enter/Space keyboard activation. When you add a new clickable container that isn't a real `<a>` or `<button>`, use that helper — don't reach for a bare `onClick`.

For navigation that **is** a link (back links, article→raw, raw→article), use a real `<a>` with both an `href` value (so right-click / new tab works, screen readers see it as a link) and an `onClick` that calls `e.preventDefault()` then `navigate()`. The href is the source of truth for assistive tech; the onClick keeps the SPA navigation smooth.

---

## Voice guardrails (for anyone writing content here)

- First-person plural ("we", not "the group"), present/past reflective tone.
- **No real personal names. Ever.** This applies site-wide — articles and raw. Replace any person's first or last name with a relational or role descriptor ("a cousin", "his wife", "her son", "a loved one", "a friend in the group") when the relationship is clear from context, or with neutral terms ("someone", "one of us", "one person") when it isn't. **Places, things, and institutions are fine to name** — specific churches, cities, brands, hobbies (D&D), travel destinations, books, etc. The only rule is: don't identify individual people.
- Keep tension — don't sanitize unresolved questions.
- Scripture from **ESV**. The group is **non-denominational**.
- When the transcript contains a question scripture answers directly, surface the verse. When scripture doesn't address it, leave it unanswered. Do not invent spiritual direction.
- Do not sound AI-written. Plain English. No "delve", "tapestry", "at its core", etc.
- Raw pages are **verbatim Granola output** — the voice guardrails above apply to articles only, not to Raw.

See `~/.claude/skills/article-writer/SKILL.md` for the full workflow details (transcript → article, Granola → raw, image prompt generation).

---

## Deployment

Static site — drag `project/` contents to Netlify Drop, or connect the repo for continuous deploys. Images at `project/uploads/` ship with the site; no external image host needed.
