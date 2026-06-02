# Section Registry

**Last Updated**: 2026-05-16
**Status**: dual-track rewrite landed

> Inventory of section specs and their delivery surfaces. Source of truth for which surfaces ship at v1, where each one lives, and which copy artifact each surface uses.

## Surface inventory (v1)

| Surface | Section spec | Copy artifact | Route | Surface type | Status |
|---|---|---|---|---|---|
| Homepage hero | [hero.md](sections/hero.md) | [hero](../growth/copy/hero.md) | `/` | Page | approved |
| For Designers | [for-designers.md](sections/for-designers.md) | [for-designers](../growth/copy/for-designers.md) | `/for-designers` | Page | approved |
| For Manufacturers | [for-manufacturers.md](sections/for-manufacturers.md) | [for-manufacturers](../growth/copy/for-manufacturers.md) | `/for-manufacturers` | Page | approved |
| Validator | [validator.md](sections/validator.md) | [validator](../growth/copy/validator.md) | `/validator` | Page | approved |
| Spec (rendered spec content) | [spec.md](sections/spec.md) | [spec](../growth/copy/spec.md) | `/spec` (+ sub-routes) | Page | approved |
| Governance | [governance.md](sections/governance.md) | [governance](../growth/copy/governance.md) | `/governance` | Page | approved |
| Downloads | [downloads.md](sections/downloads.md) | [downloads](../growth/copy/downloads.md) | `/downloads` | Page | approved |
| Adopters | [adopters.md](sections/adopters.md) | [adopters](../growth/copy/adopters.md) | `/#adopters` (landing-page section at v1; pivot to `/adopters` page when registry is non-empty) | **Landing-page section** (not its own page at v1) | approved |

## Top-nav order (locked, applies to every page)

1. For Designers
2. For Manufacturers
3. Validator
4. Spec
5. Governance
6. Downloads

The two audience-primary surfaces are named first; the four shared-utility surfaces (Validator, Spec, Governance, Downloads) follow. The logo (single dark plate, no light-mode variant) sits on the left of the nav.

## Surface relationships

- **`/` (homepage)** routes to `/for-designers` and `/for-manufacturers` via two equal audience-primary CTAs. Embeds the Tier 1 drag-into-LLM quick-win moment below the fold (single source of truth: the prompt template lives in this repo and is rendered identically on `/`, `/for-designers`, `/spec#how-to-use-today`, and `/downloads#prompts`). Hosts the adopters landing-page section at the bottom (`/#adopters`).
- **`/for-designers`** is the complete designer-track 8-step storyboard. Primary Ask: 90-day rep advocacy (top 5 preferred manufacturer reps). Tier 1 Try ULC Today section embeds three prompt blocks. Cross-links to `/validator`, `/spec#how-to-use-today`, `/downloads#examples`, `/governance`, `/#adopters`, `/for-manufacturers`.
- **`/for-manufacturers`** is the complete manufacturer-track 8-step storyboard. Primary Ask: 1–3 month pilot publication of 5–10 SKUs. Includes the dual-track designer-demand callout in the Insight section. Cross-links to `/validator`, `/spec`, `/spec#how-to-use-today`, `/governance`, `/#adopters`, `/for-designers`.
- **`/validator`** serves two consumer types as first-class: designers verifying a `.ulc` file received from a manufacturer rep + software vendors testing their own conformance. Cross-links to `/spec`, `/for-designers`, `/for-manufacturers`.
- **`/spec`** renders the upstream ULC spec content (authoring patterns, schema, taxonomy, templates, PIM guides, crosswalks). NEW at v1: prominently placed "How to use ULC today" two-tier consumption section (`/spec#how-to-use-today`) with the ready-to-copy Tier 1 designer prompt + Tier 2 specialty-tool framing. Cross-links to `/for-designers`, `/for-manufacturers`, the spec sub-routes.
- **`/governance`** is the stewardship + license + industry-engagement credibility surface. Stewarded-by framing: "ULC is stewarded by lighting professionals, for everyone who reads a luminaire datasheet during their work." Genesis credential: NLB AI Think Tank 2026 New York. Cross-links to `/for-designers`, `/for-manufacturers`, `/spec`, `/#adopters`.
- **`/downloads`** leads with the designer LLM prompts catalog (`/downloads#prompts`, NEW), then canonical example records (`/downloads#examples`), then the JSON Schema, then the Go CLI. Tier 1 designer activation content is the v1 priority. Cross-links to `/spec`, `/spec#how-to-use-today`, `/for-designers`, `/for-manufacturers`, `/validator`.
- **Adopters** is a landing-page section at `/#adopters` at v1, not its own page. Empty-state copy locked verbatim: "This list will populate as manufacturers publish `.ulc` files for their products." Pivots to `/adopters` page when the registry outgrows the landing-section footprint (likely 10–15 entries; design judgment when the first manufacturers publish). Registry data source: a manual JSON file in `ulcspec/ULC` (likely `adopters.json`), build-time fetched via the spec content sync mechanism.

## Deleted surfaces (no longer in v1)

| Surface | Reason for deletion |
|---|---|
| `/why-publish` | Audience-specific "why" content moved into `/for-designers` and `/for-manufacturers`. There is no longer a single mixed-audience "why" surface; mixing the two tracks dilutes both pitches. Section spec and copy artifact both deleted 2026-05-16. |

## Future surfaces (deferred to post-v1)

| Surface | Trigger for adding | Notes |
|---|---|---|
| `/adopters` (dedicated page) | When the adoption registry outgrows the landing-page section footprint (likely 10–15 entries) | The component is designed to render both layouts (empty-state-only landing section + populated card grid + dedicated page) without re-spec |
| `/changelog` or schema-version-diff viewer | When ULC reaches 1.0 | Multi-version docs paths (`/v1.0/spec/...`) deferred until then per ULC ROADMAP |
| Conference-talk asset page (v2 of the NLB AI Think Tank introduction) | When the v2 talk is delivered | Likely at `/talk` or embedded under `/governance`; deferred |
| Explainer video page | When the 90–120 sec explainer video is produced | Likely embedded on `/for-designers` and `/for-manufacturers` rather than its own page |

## Cross-surface single-source-of-truth content

| Content | Authored in | Rendered on |
|---|---|---|
| Tier 1 designer LLM prompt template (render-as-spec-sheet) | This repo (the five-prompt catalog at `src/content/prompts/` or equivalent) | Homepage hero Tier 1 quick-win block · `/for-designers` Try ULC Today section · `/spec#how-to-use-today` Tier 1 prompt block · `/downloads#prompts` (canonical catalog) |
| Designer LLM prompt templates (full catalog of 5) | This repo (single source) | `/downloads#prompts` (canonical) · subset rendered on `/for-designers` (3 prompts) · single prompt on `/` and `/spec#how-to-use-today` |
| Adopters registry JSON | `ulcspec/ULC` (single source) | Homepage adopters section at `/#adopters` (and future `/adopters` page) |
| ULC spec content (schema, taxonomy, authoring patterns, templates, PIM guides, crosswalks) | `ulcspec/ULC` (single source) | `/spec` (and sub-routes) |
| Canonical example records (4) | `ulcspec/ULC/examples/` (single source) | `/downloads#examples` (links to raw URLs) · `/validator` "Try a sample record" picker · `/for-manufacturers` Theme 1 inline visual (Pattern B Selux Aya) |
| Genesis credential ("National Lighting Bureau AI Think Tank 2026, New York") | This repo (string constant) | Homepage genesis line · `/governance` Genesis section · `/for-designers` Theme 2 + Proof section + Q4 objection answer · `/for-manufacturers` Theme 3 + Proof matrix |
| Maintainer credential ("Stewarded by Foad Shafighi, MIES IALD CLD. A practicing lighting designer.") | This repo (string constant) | Homepage footer · `/for-designers` cross-link footer · `/for-manufacturers` cross-link footer · `/governance` footer · `/spec` footer · `/validator` footer · `/downloads` footer |
| Industry-dialogue strip ("In active dialogue with DIAL · LIA · IES") | This repo (component) | Homepage · `/governance` · `/for-manufacturers` Theme 3 |
| Adopters empty-state sentence (locked verbatim: "This list will populate as manufacturers publish `.ulc` files for their products.") | This repo (string constant) | Homepage adopters section · future `/adopters` page |

## Maintenance

This registry updates when:
- A new surface lands or is deferred
- A surface's section spec or copy artifact moves
- A surface's route changes
- A cross-surface single source of truth is added or relocated
- A v1 → v2 pivot (e.g., adopters landing-section → `/adopters` page) executes
