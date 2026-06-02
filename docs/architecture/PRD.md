# Product Requirements: ulcspec.org

> Astro 6: JSON Schema validator + spec content renderer for ULC

---

## Overview

ulcspec.org is the public front end for the [ULC (Universal Luminaire Cutsheet) open specification](https://github.com/ulcspec/ULC). The spec README explicitly defers the narrative docs site to a later batch; this project is that batch.

The v1 site is dual-track: it serves **lighting designers, interior designers, and architects who specify lighting fixtures** as the PRIMARY audience (the activation mechanic: designers ask their preferred manufacturers for ULC files, which propagates publication through the rep channel), and **luminaire manufacturers** as the SECONDARY audience (reached when designer demand pulls them in, complemented by direct outreach on the manufacturer track). Software vendors and AI tool builders are a TERTIARY consumption-layer audience, served implicitly through the spec content rather than via a dedicated marketing surface.

The v1 site delivers three pillars in priority order:

1. **An adoption registry as the central credibility surface.** A landing-page section that lists manufacturers who have published `.ulc` files for which products, populated from a manual JSON registry in `ulcspec/ULC`. At v1 the registry is honestly empty; the locked empty-state copy is "This list will populate as manufacturers publish `.ulc` files for their products." When adoption is non-empty, the registry pivots to its own page.
2. **An interactive in-browser validator.** A visitor drags a candidate `.ulc.json` onto the page and gets pass/fail with line-anchored errors in seconds. Two consumer types served: (a) designers verifying a `.ulc` file received from a manufacturer; (b) software vendors testing their own conformance. Optional source-file hash verification when the visitor drops PDF / IES / LDT files alongside the record.
3. **A navigable rendering of the spec content.** Schema, taxonomy, authoring patterns A/B/C/D, per-category templates, PIM platform mapping guides, plus the "How to use ULC today" two-tier consumption framing (Tier 1: generic LLMs natively parse `.ulc` with a ready-to-copy designer prompt; Tier 2: lighting-domain specialty tools add IES/LDT fetching + industry-shorthand glossary). All pulled from `ulcspec/ULC` at build time so the spec repo remains the single source of truth.

The site sells the activation flywheel: designers activate ULC consumption today (drag-into-LLM, Tier 1) and ask their preferred manufacturer reps to publish ULC files; manufacturers publish so their products surface in AI-mediated specifier discovery; the registry grows; designers verify against the registry before their next rep conversation.

**Deployment target:** Cloudflare Pages

## Users

**Lighting designers, interior designers, and architects who specify lighting fixtures (PRIMARY).** Lighting designers (any seniority, IES / IALD / LC / CLD credentialed) at 10-50-person specification-grade firms are the primary champion; interior designers (NCIDQ) and architects (AIA / RIBA / ARB / IDC) at 10-500+-person firms who specify lighting fixtures are the secondary champion within this audience tier. Goal: stop losing spec-time hours to manual PDF cross-referencing, drift-prone reference libraries, and rep-relationship bottlenecks for accurate product data. Constraint they care most about: can they act on it this quarter, with adoption they can see, using the tools they already use today. The activation path: try drag-into-LLM with a `.ulc` from `examples/` (Tier 1), then ask their top 5 preferred manufacturer reps for ULC files over the next 90 days.

**Luminaire manufacturers (SECONDARY).** CEO at a mid-size specification-grade luminaire manufacturer ($20M to $500M revenue, founder-led, family-owned, or early-PE-backed). Goal: protect specifier mindshare as designer workflows shift to AI-mediated product discovery; be in the answer set when a designer asks an AI which luminaire fits a project. Constraint: does ULC fit existing PIM workflows (Salsify / Akeneo / SAP / custom) without rebuilding the datasheet pipeline. Reached on the manufacturer track via `/for-manufacturers`, and increasingly through designer demand from the primary audience.

**Software vendors and AI tool builders (TERTIARY, consumption layer).** Design tools, specifier software, general LLM-based tool authors, and AI-driven product-recommendation agents. Served implicitly through the spec content (`/spec`) rather than via a dedicated marketing surface at v1. Goal: implement readers, writers, and validators against the schema. Constraint: machine-readable everything, clean schema URLs, canonical example records, mapping crosswalks, predictable content-types. The spec page's two-tier consumption framing names this audience as the consumption-layer extender of Tier 2 lighting-domain depth; no dedicated tool-vendor marketing pitch at v1.

**Industry bodies and standards stakeholders** (US and European bodies that govern adjacent open standards: DIAL, IES, IALD, LIA). Goal: evaluate whether ULC is a serious, well-stewarded standard worth engaging with. Constraint: governance signal, visible stewardship, transparent decision process, version stability commitments, no marketing puffery. Served via `/governance`.

## Success criteria

**Conversion metric (primary):** the activation flywheel turns. Designers consume ULC today (drag-into-LLM trials) and ask their preferred manufacturers for ULC publication; manufacturers publish so designers surface their products in AI-mediated discovery; the registry grows.

**Designer-side measurable:**

- Count of `/for-designers` page-views and recurring designer visits (page-view per session signal that designers return after a first trial).
- Count of `/spec#how-to-use-today` engagement (proxy for designers reading the Tier 1 drag-into-LLM prompt template).
- Count of `/downloads` visits for the designer LLM prompt templates (proxy for designers actually picking up the prompts to use).
- Count of designer-shared inbound traffic to the site (UTM-tagged referrals from social posts, chapter-event mentions, peer DMs).
- Designer-track Ask follow-up rate: of designers who indicate they ran the 90-day channel advocacy, how many manufacturers were named in the inbound from their reps.

**Manufacturer-side measurable:**

- Count of unique manufacturer organizations running the in-browser validator (UTM + IP-aggregate proxy; no PII captured).
- Count of `.ulc.json` records detectable in the wild post-launch (initially: manual census against pilot list; later: crawler against published manufacturer product pages).
- Count of pilot manufacturers nameable on the adoption registry with permission to display.
- Count of validator runs that returned PASS (signal that real records are being authored, not just dry-runs).

**Cross-audience measurable:**

- Adoption registry entry count (the central metric; the registry's emptiness or growth is the load-bearing public signal of the standard's traction).

**Qualitative:**

- Industry-body reception: do governing bodies for adjacent open standards reference ulcspec.org positively in their own publications or talks?
- Specifier-community reception: do designers cite the site when asking their preferred manufacturer reps for ULC files? Do peer designers reference the site at IALD / IES chapter events?
- Visual parity with adjacent open-standard documentation sites; the site must read as serious as peer specifications, not lighter.

## Non-goals

- **No site / design / installation context.** Per the ULC ROADMAP scope rule: lighting design data (pavement reflectance, pole spacing, mounting height, pedestrian activity) belongs in design tools, not in fixture metadata, and not in the spec site that documents fixture metadata. The site documents ULC; it does not lobby to expand ULC.
- **No dedicated AI / tool-vendor marketing surface at v1.** Tier 2 specialty tools (LightingAgent.AI and any successors) appear only as consumption-layer context inside `/spec`, never as a dedicated marketing surface. No `/for-tool-builders` page. No tool-vendor pitch. The strategic positioning + storyboard artifacts contain explicit anti-engineering-team discipline; the site honors it.
- **No interactive schema browser, taxonomy explorer UI, in-browser polar-plot rendering, or version-diff viewer at v1.** These are full-portal features deferred to v2 once supply-side momentum is real.
- **No multi-version docs paths at v1.** Per ULC's ROADMAP, pre-1.0 schema changes are additive; one rendered version of the spec is enough. Multi-version URL structure (`/v1.0/spec/`, etc.) is deferred until ULC reaches 1.0.
- **No dedicated /adopters page at v1.** Adoption is a landing-page section only until the registry is non-empty. When manufacturers begin publishing, the section pivots to its own page; v1 ships the landing-section component with the locked empty-state copy.
- **No CMS, no auth, no comments, no user accounts.** All site content is either marketing prose authored in this repo or spec content pulled from `ulcspec/ULC` at build time. The adoption registry is a manual JSON file in the spec repo, build-time-fetched.
- **No server-side validation endpoint.** The validator is client-side only; users who need byte-exact canonical-validator behavior download the Go CLI.
- **No `/why-publish` page.** Audience-specific "why" content moves into the new `/for-designers` and `/for-manufacturers` landing pages. There is no single mixed-audience "why" surface; mixing the two tracks dilutes both pitches.

## Constraints

- **Spec content single-source-of-truth.** All spec prose, schema, taxonomy, templates, PIM guides, and the adoption registry JSON are authored in [`ulcspec/ULC`](https://github.com/ulcspec/ULC) and pulled into this site at build. No spec content is forked into this repo. Sync mechanism: build-time fetch script with the pinned commit declared in `spec-sync.config.ts`.
- **Validator runs fully client-side.** No backend, no server-side validation endpoint, no API. Schema validation via [Ajv](https://ajv.js.org/) (JSON Schema Draft 2020-12). Source-file hash verification via browser `SubtleCrypto` when the user drops PDF / IES / LDT files alongside the `.ulc.json`. Drift risk vs. the canonical Go validator is mitigated by a CI parity check against the four canonical reference records (patterns A/B/C/D) in the spec repo.
- **Hosting budget: $0/year recurring.** Cloudflare Pages free tier. No databases, no third-party SaaS subscriptions baked into the site's operation. Analytics tool, if chosen, must fit the same $0 envelope or be omitted.
- **Maintenance budget: ~4–6 hours/year plus one half-day upgrade per year.** The site is a docs surface for a slow-moving open standard, not a product. Major framework upgrades (Astro, Tailwind) batched annually; spec-repo content drift handled automatically by the build-time sync.
- **Accessibility:** WCAG 2.2 AA target on every page. Validator results must be keyboard-navigable and screen-reader-announced; drag-drop must have a click-to-upload fallback. The validator serves both designer and software-vendor consumer types; both paths must be fully accessible.
- **Performance:** static-output Astro means Lighthouse 95+ achievable; the validator island is the only material JS payload and must lazy-load. The drag-into-LLM Tier 1 quick-win moment on the hero and on `/for-designers` is a static copy-able prompt with zero JS cost.
- **Single dark logo asset.** No light-mode variant. The dark plate is the brand mark in both light and dark modes (high-contrast stamp on light backgrounds; native blend on dark backgrounds).
- **NLB AI Think Tank 2026 New York is the genesis credential.** Used verbatim ("National Lighting Bureau AI Think Tank 2026, New York" or "NLB AI Think Tank 2026, NYC" in compressed contexts). No "Enlighten Europe 2025" references anywhere.
