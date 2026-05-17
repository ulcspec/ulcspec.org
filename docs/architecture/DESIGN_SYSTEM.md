# Design System

**Last Updated**: 2026-05-16
**Status**: v1 tokens locked; concrete implementation lives in `src/styles/global.css`
**Strategic source**: `.harness/design-artifacts/design-system-v1.md` (private; reasoning + competitor analysis)

> Public, technical design system reference. Captures the concrete tokens, typography stack, color palette, motifs, and component conventions implementations consume. For *why* these decisions were made (competitive landscape, lighting-industry register, dark-mode rationale, alternatives killed), read the strategic-intent doc in `.harness/`.

## Theme model

Dark is the default. Light is the toggle.

- Page boots in dark via `data-theme="dark"` on `<html>` and an inline `<head>` script that flips to `light` if the user has stored that preference in `localStorage` (`ulc-theme`), or if no stored preference and the OS reports `prefers-color-scheme: light`. The inline script runs before paint so there is no flash of unstyled content.
- Toggle component (`src/components/ThemeToggle.astro`) writes the new value to `localStorage` and updates `data-theme`. No page reload.
- All theme-sensitive surfaces consume CSS variables (`--bg`, `--text`, `--accent-warm`, etc.). Components MUST NOT hardcode hex values for theme-aware properties.

## Typography

Two families. Variable axis where supported.

| Role | Family | Weights loaded | Notes |
|---|---|---|---|
| Display + sans body | **Inter** | 400, 500, 600, 700 | Single family covers both display and body. Variable-axis ready. Loaded via Google Fonts with `display=swap`. |
| Mono | **JetBrains Mono** | 400, 500 | Prompts, JSON, schema references. |

Earlier consideration of a serif (Newsreader) was rejected; Inter at display scale (≥48px, 600+ weight) carries the editorial register without serifs.

**Type scale (modular ratio 1.25):**

| Token | Size | Use |
|---|---|---|
| `text-7xl` (`72-80px`) | Hero display, desktop ≥1024px |
| `text-6xl` (`56-60px`) | Hero display, ≥768px |
| `text-5xl` (`44-48px`) | Hero display, ≥640px; section H2 desktop |
| `text-4xl` (`36px`) | Section H2 |
| `text-3xl` (`28-30px`) | Section H2 mobile |
| `text-xl` (`20px`) | Sub-H1 desktop |
| `text-lg` (`18px`) | Lead paragraph, callout |
| `text-base` (`16px`) | Body |
| `text-sm` (`14px`) | Captions, link rows, meta |
| `text-xs` (`12px`) | Small-caps strips |

**Loading discipline:** preload Inter regular + 600/700 only via the `<link>` element; mono and remaining weights load lazy. `font-display: swap` to avoid FOIT.

## Color palette

Brand amber sampled from the logo glow (warmer than pure orange). Sky-blue accent reserved for "machine-readable / AI consumption" moments; never deploy both accents inside a single component.

### Dark (default)

```css
--bg              #0A0A0A   /* near-black; pure #000 hurts the eyes */
--bg-elevated     #161616   /* cards, code blocks, lifted surfaces */
--bg-overlay      #1F1F1F   /* modal / popover surfaces */
--text            #FAFAFA   /* near-white; warmer than pure white */
--text-muted      #A1A1A1   /* zinc-400; secondary body */
--text-subtle     #6B7280   /* zinc-500; tertiary / captions */
--border          #262626   /* zinc-800; visible without shouting */
--accent-glow     #FCD34D   /* amber-300; brightest highlight */
--accent-warm     #FBBF24   /* amber-400; THE brand signature, primary CTAs */
--accent-warm-deep #F59E0B  /* amber-500; pressed / active */
--accent-cool     #38BDF8   /* sky-400; sparingly, AI / machine framing */
--code-bg         #161616
--code-text       #FAFAFA
```

### Light (toggle)

```css
--bg              #FAFAF7   /* warm paper-white */
--bg-elevated     #FFFFFF
--bg-overlay      #FFFFFF
--text            #1A1A1A
--text-muted      #525252
--text-subtle     #737373
--border          #E5E5E0
--accent-glow     #FBBF24
--accent-warm     #D97706   /* amber-600; darker for AA contrast on light */
--accent-warm-deep #B45309  /* amber-700 */
--accent-cool     #0284C7   /* sky-600 */
--code-bg         #F5F5F0
--code-text       #1A1A1A
```

**Contrast targets:** body text and links MUST clear WCAG 2.2 AA (4.5:1 normal text, 3:1 large text + UI components). The amber-600 light-theme accent is chosen specifically to hold contrast on `--bg #FAFAF7`. Run `npx @adamcoster/wcag-contrast-checker` or equivalent on each token pair before adding new color combinations.

## Visual motifs

Three first-class motifs. Use sparingly.

### 1. Perforated dot-grid

The hero band carries a faint amber dot pattern (dark theme) / dark dot pattern (light theme), fading to transparent at the edges via radial mask. Echoes lighting hardware (perforated baffles, honeycomb louvers). Implemented as the `.dot-grid` utility in `global.css` using a CSS radial gradient + background-size; no SVG file required. Total cost: ~6 CSS rules, zero network bytes.

Also intended for: validator drop-zone empty state, footer divider treatment, section transition markers. Density and opacity stay restrained; the motif is texture, not pattern.

### 2. Warm-glow text effect on hero H1

Applied via `.hero-display` class. Subtle text-shadow nodding to the logo's neon-tube glow. Dark theme only; light theme suppresses (would muddy the type). Disabled automatically under `prefers-reduced-motion: reduce`.

```css
.hero-display {
  text-shadow:
    0 0 32px rgba(252, 211, 77, 0.18),
    0 0 8px rgba(251, 191, 36, 0.10);
}
```

Used at most ONCE per page (the largest display headline).

### 3. Custom lighting-domain SVG iconography (deferred to v1.1)

Hand-authored set: polar plot, luminance distribution, photometric axes, CCT spectrum, optic-accessory variants, hash-verified record. Outline style at 1.5–2px stroke weight matching Lucide regular. Will land in `src/icons/` as Astro components or pure SVGs. **Status: not built at v1.** Workhorse iconography uses inline SVG for nav arrows and copy-button glyph; Lucide can be added when more icons are needed.

## Layout + spacing

| Surface type | Padding rhythm |
|---|---|
| Marketing band | `py-20 md:py-28 lg:py-32` (generous, Linear-tier) |
| Hero band | `pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36 lg:pb-44` |
| Docs / spec band | tighter (Stripe-docs-tier); spec'd per surface |
| Container max-width | `max-w-7xl` (1280px) for marketing surfaces; `max-w-3xl` (768px) for prose blocks inside |
| Horizontal padding | `px-6 md:px-10` |

Audience-aware density: marketing surfaces breathe; docs surfaces are tighter.

## Component conventions

| Component | File | Notes |
|---|---|---|
| Site shell | `src/layouts/main.astro` | Owns `<html>`, head metadata, theme bootstrap script, font loading, skip link |
| Top nav | `src/components/Nav.astro` | Sticky header, locked link order, logo on left, theme toggle on right, mobile menu via `<button aria-expanded>` |
| Theme toggle | `src/components/ThemeToggle.astro` | Inline SVG sun + moon, sun shown in dark theme, moon shown in light |
| Hero | `src/components/Hero.astro` | Eyebrow + H1 with dual-color treatment + sub-H1 + dual CTAs. Dot-grid backdrop |
| Tier 1 quick-win | `src/components/Tier1QuickWin.astro` | Lead paragraph + monospace prompt block + Clipboard API copy button + Tier 2 note |
| Dual-track band | `src/components/DualTrackBand.astro` | Two equal cards, stacked on mobile, side-by-side ≥768px |
| Dialogue strip | `src/components/DialogueStrip.astro` | Small-caps strip with dividers |
| Adopters | `src/components/Adopters.astro` | Empty-state at v1, populates from registry data when available |
| Site footer | `src/components/SiteFooter.astro` | Genesis credential + maintainer credential + repo links + license + copyright |

### Button styles

| Variant | Background | Border | Text | Hover |
|---|---|---|---|---|
| Primary | `--accent-warm` | none | `#0a0a0a` | `--accent-warm-deep` |
| Secondary | transparent | `1px solid var(--accent-warm)` | `--accent-warm` | bg `--accent-warm`, text `#0a0a0a` |
| Ghost (icon) | transparent | `1px solid var(--border)` | `--text-muted` | text `--accent-warm` |

Padding: `px-6 py-3.5` for hero CTAs (44px+ touch target). Radius: 6px. Buttons are full-width on mobile and `w-auto` from `sm:` up.

### Focus states

Global rule: every interactive element gets `outline: 2px solid var(--accent-warm); outline-offset: 3px;` via `:focus-visible`. No `outline: none` overrides without an explicit `:focus-visible` replacement.

## Motion

| Token | Value | Use |
|---|---|---|
| State transition | 150ms ease-out | Hover, focus, color shifts |
| Theme switch | 200ms (none currently; instant swap acceptable) | Future enhancement |

`prefers-reduced-motion: reduce` zeroes out all animation and transition durations via global CSS. Hero text-shadow glow is also suppressed under reduced motion.

## Accessibility floor

- WCAG 2.2 AA on color contrast; verify each new token pair
- Skip link on every page (`Skip to content` → `#main`)
- Sticky nav doesn't trap focus; mobile menu button has `aria-controls` and `aria-expanded`
- Active route in nav marked with `aria-current="page"`
- All decorative SVGs `aria-hidden="true"`; meaningful ones have accessible names
- Form-like interactives (copy button) have visible labels AND `aria-describedby` pointing to a live region for status announcements
- Reduced-motion respected on all motion (glow, transitions)
- Keyboard parity: every interactive element reachable via Tab; visible focus ring always

## Performance budget

- Lighthouse 95+ across Performance / Accessibility / Best Practices / SEO. CI gate to be wired.
- Astro static output; zero hydration cost on the homepage. Only inline scripts: theme bootstrap (~150 bytes), nav mobile-menu toggle (~200 bytes), Clipboard copy handler (~600 bytes).
- Font loading: preconnect to Google Fonts + single stylesheet request. Future improvement: self-host Inter + JetBrains Mono subsets to eliminate Google Fonts hop (deferred to post-v1).
- Images: logo is a 1.7MB PNG; needs optimization. Future improvement: convert to AVIF + WebP at the sizes actually used (≤64px served, originals reach far higher) via Astro's `<Image>` component. **Tracked as a hardening-phase concern**, not blocking the design phase.

## Open dependencies

These block full polish, not v1 ship:

1. **Light-theme logo variant.** Dark `assets/logo.png` cannot mechanically invert (loses the glow). Needs commissioned variant: white perforated plate with deep-amber line-only "ULC" letterforms. Until landed, the dark logo renders on both themes; on light theme it stays a circular dark plate (acceptable v1 read).
2. **Custom lighting SVG icon set.** Six-icon set described above. Hand-authored. Deferred to v1.1.
3. **OG image composition.** 1200×630 social preview, typographic treatment of the dual-audience H1 plus brand palette. Designer task post-v1.
4. **Logo asset optimization.** Convert to AVIF/WebP via Astro `<Image>`.

## Related artifacts

- `.harness/design-artifacts/design-system-v1.md` — strategic intent + competitor analysis + alternatives killed
- `src/styles/global.css` — concrete token implementation
- `docs/architecture/FRONTEND_GUIDELINES.md` — _to be authored_ once second surface ships (will capture component patterns, file layout rules, accessibility checklist)
- `docs/tasks/sections/hero.md` — first consuming spec
- `docs/tasks/SECTION_REGISTRY.md` — surface inventory
