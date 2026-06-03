# App Flow

> Up-to-date as of 2026-05-16. Authoritative surface inventory + nav order lives in [`docs/tasks/SECTION_REGISTRY.md`](../tasks/SECTION_REGISTRY.md); this doc captures the user-journey shape that registry implies.

## Entry routes (v1)

| Route | Surface | Section spec |
|---|---|---|
| `/` | Homepage (dual-audience routing + Tier 1 designer activation + adopters empty-state) | [hero.md](../tasks/sections/hero.md) |
| `/for-designers` | Designer-track 8-step storyboard, primary Ask: 90-day rep advocacy | [for-designers.md](../tasks/sections/for-designers.md) |
| `/for-manufacturers` | Manufacturer-track 8-step storyboard, primary Ask: 1–3 month pilot publication | [for-manufacturers.md](../tasks/sections/for-manufacturers.md) |
| `/validator` | In-browser `.ulc.json` validator + source-file hash verification | [validator.md](../tasks/sections/validator.md) |
| `/spec` (and sub-routes) | Rendered ULC spec content + "How to use ULC today" two-tier consumption section | [spec.md](../tasks/sections/spec.md) |
| `/governance` | Stewardship, license, decision process, industry-body dialogue | [governance.md](../tasks/sections/governance.md) |
| `/downloads` | Designer LLM prompt catalog + canonical example records + JSON Schema + Go CLI | [downloads.md](../tasks/sections/downloads.md) |
| `/#adopters` | Adopters landing-page section at v1 (pivots to `/adopters` when registry outgrows the footprint) | covered in [hero.md](../tasks/sections/hero.md) |

**Deleted in v1 vs the original brainstorm:** `/why-publish`. Audience-specific "why" content moved into `/for-designers` and `/for-manufacturers`; mixing the two tracks diluted both pitches.

## Top-nav order (locked, every page)

1. For Designers
2. For Manufacturers
3. Validator
4. Spec
5. Governance
6. Downloads

Logo (single dark plate, no light-mode variant) sits on the left; theme toggle on the right. The two audience-primary surfaces come first; utility surfaces follow.

## Primary user journeys

One per audience, matching PRD.md "Users":

- **Lighting designer (PRIMARY)** — Arrives via peer-shared link, IALD / IES chapter mention, search ("ULC luminaire cut sheet"), or designer-community post. Lands on `/`. Reads the dual-audience H1 + sub-H1, registers within ~5 seconds. Two main paths:
  - **Path A (immediate trial)**: scrolls to the Tier 1 quick-win, copies the prompt, clicks "Try a sample `.ulc` file →" to `/downloads#examples`, drops a canonical record into ChatGPT / Claude / Gemini alongside the prompt. Sees the spec sheet rendered.
  - **Path B (read first)**: clicks "I'm a designer →" to `/for-designers` for the full storyboard. Reaches the 90-day rep-advocacy primary Ask at Step 8.
  - Optional: scrolls to the adopters section to gauge peer adoption.

- **Luminaire manufacturer (SECONDARY)** — Arrives via industry-body referral, designer-driven introduction ("my designer asked me about ULC"), search, or direct outreach. Lands on `/`. Reads the dual-audience framing, clicks "I'm a manufacturer →" to `/for-manufacturers` for the full storyboard. Reaches the 1–3 month pilot publication primary Ask at Step 8. Optional: scrolls to `/#adopters`.

- **Industry body (DIAL / IES / LIA)** — Arrives via direct reference from Foad, peer-organization mention, or search ("ULC governance"). Lands on `/`, sees their organization named in the dialogue strip. Uses top-nav to reach `/governance`. Reads stewardship + license + engagement story.

- **Software vendor / AI tool builder (TERTIARY, consumption-only)** — Arrives via ULC GitHub repo homepage link. Lands on `/`, registers the dual-track is audience-facing not vendor-facing. Uses top-nav to reach `/spec`. Optionally reads `/spec#how-to-use-today` for the two-tier consumption model. Exits to GitHub to start implementing a reader. **No dedicated marketing surface at v1.**

- **Curious specifier doing first-time discovery** — Arrives via social post or conference mention. Reads H1 + Tier 1 quick-win, copies the prompt, opens an LLM in another tab, downloads a sample, drops it in, sees the workflow happen. Bookmarks and shares with a peer.

## Authentication flow

Not applicable. The site is fully public; there is no login surface.

## Navigation structure

ASCII sketch of the journey graph:

```
       (search / peer / referral)
                  │
                  ▼
                  / ─────────┬──── (Tier 1 trial) ──► /downloads#examples ──► LLM
                  │          │
                  │          ├──── "I'm a designer →"     ──► /for-designers ──► Step 8 Ask
                  │          ├──── "I'm a manufacturer →" ──► /for-manufacturers ──► Step 8 Ask
                  │          └──── /#adopters (empty at v1)
                  │
                  ├──► /validator (top-nav; designers verifying + vendors testing)
                  ├──► /spec (top-nav; includes #how-to-use-today)
                  ├──► /governance (top-nav; industry bodies)
                  └──► /downloads (top-nav; prompts catalog + examples + schema + CLI)
```

Cross-links between deep pages mirror the registry's "Surface relationships" section.

## Error & empty states

- **Adopters registry empty (current v1 state)** — render the locked sentence verbatim, centered, standards-document register: "This list will populate as manufacturers publish `.ulc` files for their products."
- **Clipboard API unavailable / JS disabled** — copy buttons hidden; prompt blocks stay selectable text. Page is HTML + CSS first; JS is enhancement.
- **Validator** (the only interactive surface, lives at `/validator`):
  - _No file dropped yet:_ idle drop zone with click-to-upload fallback and short explainer.
  - _Non-JSON file dropped:_ "This doesn't look like JSON. Drop a `.ulc.json` file."
  - _Malformed JSON:_ JSON parse error with line + column reference.
  - _Schema validation failures:_ line-anchored error list, each linking to the relevant field reference in `/spec`.
  - _Source files dropped without `.ulc.json`:_ "Drop the `.ulc.json` record first, then add the source PDF / IES / LDT files to verify hashes."
  - _Hash mismatch:_ explicit "the PDF you dropped does not match the SHA-256 hash referenced in the record" message.
- **Spec-content sync errors** surface at build time in CI; the build aborts and Cloudflare Pages continues serving the previous successful deploy until resolved.
- **Generic 404** for unknown routes — static `404.html` rendered by Astro with a link back to `/`.

## Analytics + telemetry

Cloudflare Web Analytics edge-beacon mode, page-views only, zero JS bundle, zero cookies, no PII captured. Audience segmentation via page-level traffic (`/for-designers` ≈ designer track; `/for-manufacturers` ≈ manufacturer track; `/spec` ≈ vendors / engineering leads; `/governance` ≈ industry bodies; `/validator` ≈ technical evaluators across both audiences) plus UTM-tagging on outbound referral links. No copy-button telemetry, no A/B testing infrastructure at v1.

## AI-agent discoverability

Site-wide concern, spec'd here:

- `llms.txt` at site root (canonical content index for LLM crawlers)
- `sitemap.xml` (Astro `@astrojs/sitemap` integration)
- JSON-LD structured data per page (`WebSite`, `Organization`, `TechArticle` where appropriate)
- Schema files served with correct content-type (`application/schema+json` for `.schema.json`)
