# Product Requirements: ulcspec.org

> Astro 6 — JSON Schema validator + spec content renderer for ULC

---

## Overview

ulcspec.org is the public front end for the [ULC (Universal Luminaire Cutsheet) open specification](https://github.com/ulcspec/ULC). The spec README explicitly defers the narrative docs site to a later batch; this project is that batch.

The v1 site delivers three pillars in priority order:

1. **A lean credibility surface** that converts the primary visitor — a lighting manufacturer's product-data or marketing lead — into a published-`.ulc.json` pilot. Homepage, why-publish narrative, governance, downloads.
2. **An interactive in-browser validator.** A visitor drags a candidate `.ulc.json` onto the page and gets pass/fail with line-anchored errors in seconds. Optionally drops the source PDF / IES / LDT files for SHA-256 hash verification against the references inside the record.
3. **A navigable rendering of the spec content** — schema, taxonomy, authoring patterns A/B/C/D, per-category templates, PIM platform mapping guides (Salsify, Akeneo, SAP, custom) — all pulled from `ulcspec/ULC` at build time so the spec repo remains the single source of truth.

The site sells supply: it exists to put `.ulc.json` files in manufacturer hands so AI agents and software vendors have data to consume.

**Deployment target:** Cloudflare Pages


## Users

**Manufacturer product-data / marketing leads (PRIMARY).** The supply side of the ecosystem flywheel. Goal: evaluate ULC fast enough to internally pitch a pilot — "drag a file, see it validate, decide in 10 minutes." Constraint they care most about: does this fit my PIM (Salsify / Akeneo / SAP / custom) without rebuilding our datasheet pipeline? Every homepage decision is filtered through "does this make a product-data lead start a pilot this week."

**Specifiers and lighting designers.** Goal: understand the format well enough to ask their tool vendors and manufacturers for ULC-format outputs. Constraint: low jargon load; they don't read schemas, they read narratives that explain why structured data makes their specifying workflow faster.

**Software vendors and AI tool builders** (DIALux/RELUX, specifier software, general LLM tool authors, LightingAgent.AI-class agents). Goal: implement readers, writers, validators against the schema. Constraint: machine-readable everything — clean schema URLs, canonical example records, mapping crosswalks to GLDF / ETIM / IES LM-63 / EULUMDAT, predictable content-types.

**Industry bodies and standards stakeholders** (DIAL behind DIALux/GLDF, IES in the US, LIA in the UK). Goal: evaluate whether ULC is a serious, well-stewarded standard worth engaging with. Constraint: governance signal — visible stewardship, transparent decision process, version stability commitments, no marketing puffery.

## Success criteria

**Conversion metric (primary):** manufacturers begin publishing `.ulc.json` files alongside their PDF / IES / LDT outputs. The site is the funnel; the funnel is graded on supply, not pageviews.

**Measurable:**

- Count of unique manufacturer organizations running the in-browser validator (analytics opt-in via the chosen analytics tool — see Open Question #9 in the brainstorm).
- Count of `.ulc.json` records detectable in the wild post-launch (initially: manual census against pilot list; later: crawler against published manufacturer product pages).
- Count of pilot manufacturers nameable on the site with permission to display logos.
- Count of validator runs that returned PASS (signal that real records are being authored, not just dry-runs).

**Qualitative:**

- Industry-body reception: do DIAL / IES / LIA reference ulcspec.org positively in their own publications or talks?
- Visual parity with [gldf.io](https://gldf.io) — the site must read as serious as the adjacent standard's site, not lighter.
- Specifier feedback: do designers cite the site when asking their tool vendors for ULC support?

## Non-goals

- **No site / design / installation context.** Per the ULC ROADMAP scope rule: lighting design data (pavement reflectance, pole spacing, mounting height, pedestrian activity) belongs in design tools, not in fixture metadata — and not in the spec site that documents fixture metadata. The site documents ULC; it does not lobby to expand ULC.
- **No interactive schema browser, taxonomy explorer UI, in-browser polar-plot rendering, or version-diff viewer at v1.** These are full-portal features deferred to v2 once supply-side momentum is real.
- **No multi-version docs paths at v1.** Per ULC's ROADMAP, pre-1.0 schema changes are additive; one rendered version of the spec is enough. Multi-version URL structure (`/v1.0/spec/`, etc.) is deferred until ULC reaches 1.0.
- **No CMS, no auth, no comments, no user accounts.** All site content is either marketing prose authored in this repo or spec content pulled from `ulcspec/ULC` at build time.
- **No server-side validation endpoint.** The validator is client-side only; users who need byte-exact canonical-validator behavior download the Go CLI.

## Constraints

- **Spec content single-source-of-truth.** All spec prose, schema, taxonomy, templates, and PIM guides are authored in [`ulcspec/ULC`](https://github.com/ulcspec/ULC) and pulled into this site at build. No spec content is forked into this repo. Sync mechanism (submodule vs. build-time fetch vs. subtree) is unresolved — see brainstorm Open Question #2.
- **Validator runs fully client-side.** No backend, no server-side validation endpoint, no API. Schema validation via [Ajv](https://ajv.js.org/) (JSON Schema Draft 2020-12). Source-file hash verification via browser `SubtleCrypto` when the user drops PDF / IES / LDT files alongside the `.ulc.json`. Drift risk vs. the canonical Go validator is mitigated by a CI parity check against the four canonical reference records (patterns A/B/C/D) in the spec repo.
- **Hosting budget: $0/year recurring.** Cloudflare Pages free tier. No databases, no third-party SaaS subscriptions baked into the site's operation. Analytics tool — if chosen — must fit the same $0 envelope or be omitted.
- **Maintenance budget: ~4–6 hours/year plus one half-day upgrade per year.** The site is a docs surface for a slow-moving open standard, not a product. Major framework upgrades (Astro, Tailwind) batched annually; spec-repo content drift handled automatically by the build-time sync.
- **Accessibility:** WCAG 2.2 AA target on every page. Validator results must be keyboard-navigable and screen-reader-announced; drag-drop must have a click-to-upload fallback.
- **Performance:** static-output Astro means Lighthouse 95+ achievable; the validator island is the only material JS payload and must lazy-load.

---

## Section registry

The section-by-section implementation registry lives in
[`../tasks/SECTION_REGISTRY.md`](../tasks/SECTION_REGISTRY.md). Run
`/lp-shape-section <name>` to add a new section spec there.

PRD and section registry are kept in separate files — this prevents
hybrid pointer+registry files whose shape is internally contradictory.
