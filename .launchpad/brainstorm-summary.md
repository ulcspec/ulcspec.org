---
generated_at: 2026-05-14T00:00:00Z
generated_by: /lp-brainstorm
greenfield: true
cwd_state_when_generated: empty
---

# Project summary

ulcspec.org is the public front end for the ULC (Universal Luminaire Cutsheet) open specification. The spec itself lives at github.com/ulcspec/ULC (currently v0.5.1) as a JSON Schema Draft 2020-12, taxonomy, drift-guard tooling, Go reference CLI validator, canonical example records, per-category templates, and PIM platform mapping guides. The ULC README explicitly defers the narrative docs site to a later batch — this project is that batch.

The v1 site is scoped lean. It delivers three things in priority order: (1) a credibility surface that converts the primary visitor — a lighting manufacturer's product-data or marketing lead — into a published-ULC-file pilot; (2) an interactive browser validator where a user can drag a candidate `.ulc.json` onto the page and get pass/fail with errors in seconds, optionally with SHA-256 source-file hash verification when source PDFs/IES/LDTs are also dropped; (3) a navigable rendering of the spec content (authoring-patterns, schema, taxonomy, templates, PIM mapping guides) pulled from the ULC spec repo at build time so the spec repo remains the single source of truth.

The primary audience is manufacturers (the supply side of the ecosystem flywheel — no published .ulc.json files means no data for AI agents or software vendors to consume). Specifiers/designers, software/AI-tool builders, and industry bodies (DIAL, IES, LIA) are secondary audiences served by specific pages but do not drive the homepage CTA hierarchy.

Stack: Astro (static, content collections, MDX) for the site, Ajv (Draft 2020-12) client-side for the validator, TypeScript end-to-end, content synced from `ulcspec/ULC` at build, Cloudflare Pages hosting. Visual register: hybrid — modern dev-docs structural rigor (Stripe/Linear/Vercel style) with restrained light/luminance motif accents in heroes, dividers, and the validator/example surfaces. Effort estimate ~2–3 weeks solo for a polished v1.

# Suggested next step

Run `/lp-pick-stack` next to choose a stack.
