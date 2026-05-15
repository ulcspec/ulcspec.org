# ulcspec.org — v1 site brainstorm

**Date:** 2026-05-14
**Source repo studied:** [ulcspec/ULC](https://github.com/ulcspec/ULC) @ v0.5.1 (default branch `main`, primary language Go, MIT)
**cwd state at brainstorm time:** empty (greenfield) — `/Users/foadshafighi/dev/My Projects/ulcspec.org`

---

## What We're Building

ulcspec.org is the public front end for the ULC (Universal Luminaire Cutsheet) open specification. The spec is published at [ulcspec/ULC](https://github.com/ulcspec/ULC) as JSON Schema + narrative docs + a Go reference validator. The README explicitly defers the site to a later batch — this brainstorm captures the v1 scope.

**v1 site delivers three things, in priority order:**

1. **A lean credibility surface** that converts the primary visitor — a manufacturer's product-data or marketing lead — into a published-ULC-file pilot. Homepage, why-publish narrative, governance/pilots, downloads, FAQ.
2. **An interactive browser validator.** Drag-and-drop a candidate `.ulc.json`; get pass/fail + line-anchored errors in seconds. Optional source-file (PDF/IES/LDT) drop triggers SHA-256 hash verification against the references inside the record.
3. **A navigable rendering of the spec content** — schema, taxonomy, authoring-patterns, per-category templates, PIM platform mapping guides (Salsify, Akeneo, SAP, custom). All pulled from `ulcspec/ULC` at build time so the spec repo remains single source of truth.

Out of scope for v1: interactive schema browser with field-level deep-linking, taxonomy explorer UI, in-browser photometry rendering (polar plots), version diff viewer, multi-version docs paths. These move to v2 once supply-side momentum is real.

---

## Why This Approach

### Audience targeting

Four candidate audiences (specifiers/designers, manufacturers, software/AI tool builders, industry bodies). **Primary v1 audience: manufacturers.** Without `.ulc.json` files in the wild, AI agents and software vendors have nothing to consume — the flywheel starts with supply. Every content + design decision is filtered through "does this make a manufacturer's product-data lead start a pilot this week."

The other three audiences are still served (governance page for bodies, schema/examples for tool builders, narrative for designers) — they just don't drive the homepage CTA hierarchy.

### Site ambition

Lean credibility + interactive validator + rendered spec content. **Not** a full standards portal (defers interactive browsers/explorers/viewers), **not** marketing-only-with-docs-on-GitHub (loses the validator + rendered spec UX advantage), **not** docs-first RFC style (loses the marketing surface manufacturers need).

The interactive validator is the v1 differentiator. Manufacturers' product-data leads will not download a Go CLI to evaluate ULC; they will drag a file onto a website.

### Content sourcing

**Single source of truth: `ulcspec/ULC`.** The site repo pulls spec content at build time (mechanism in Open Questions). Edits to authoring-patterns.md, schema fields, taxonomy, templates, and PIM guides happen in the spec repo and flow to the site on next build. Site repo holds marketing/narrative pages and the renderer only.

Rejected alternatives: moving prose to the site repo (drift between schema and its docs), monorepo (mixes spec governance with frontend CI/CD), manual copy-paste (high drift, unacceptable).

### Visual register

**Hybrid — modern dev-docs base, restrained light/luminance accents.** Stripe/Linear/Vercel structural rigor as the foundation, with a light-motif visual signature in heroes, dividers, and the validator/example surfaces. Reads credible in front of DIAL/IES/LIA without looking like every other SaaS docs site. Differentiates from incumbent lighting-association sites which are visually dated.

Rejected: standards-org formal (max credibility but dated and off-putting to manufacturer marketing teams), designer-led light-led (high creative ceiling but high execution risk), pure dev-docs (no differentiation from generic SaaS).

### Stack: Astro + Ajv

Picked over Next.js + Go→WASM and Docusaurus + Ajv. Key reasons:

- **Astro's content-collections API** is purpose-built for content-led sites with marketing pages — the islands model means zero JS on narrative pages and isolated client JS for the validator surface. Smallest possible payload.
- **Ajv** (JSON Schema Draft 2020-12) runs fully client-side. Drift risk against the canonical Go validator is real but containable: share the test fixtures from `ulcspec/ULC` and add a CI parity check that both validators agree on the canonical reference records (patterns A/B/C/D).
- **Cloudflare Pages** hosting — free, fast edge, no cold starts.
- **Effort estimate: ~2–3 weeks solo** for a polished v1.

Why not WASM: ~5–15 MB WASM bundle for the Go validator, file-I/O sharp edges in Go→WASM, and Next.js's React overhead is more than this content-led site needs. Validator fidelity is "good enough" for evaluation; users who need byte-exact validation download the CLI anyway.

Why not Docusaurus: free multi-version docs is nice for post-v1.0 ULC, but Docusaurus's React layout opinions fight the hybrid-light marketing register. Astro's `[...slug]` routing handles versioning fine when ULC reaches v1.0.

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primary audience | Manufacturers (publishers) | Supply-side flywheel; no published files = no ecosystem. |
| v1 scope | Lean credibility + interactive validator + rendered spec content | One killer feature (validator), three content pillars. |
| Content source-of-truth | Pulled from `ulcspec/ULC` at build | Spec repo stays canonical; site is a renderer. |
| Visual register | Hybrid — dev-docs base, light-motif accents | Credibility + differentiation; manageable execution risk. |
| Site framework | Astro (static, content collections, MDX) | Right shape for marketing + docs hybrid; smallest payload. |
| Validator | Ajv (JSON Schema Draft 2020-12) client-side TS | Smallest payload, fastest UX. Drift mitigated via CI parity. |
| Index-builder parity | TS port of Go logic, CI-checked against canonical examples | Single test corpus protects both implementations. |
| Source-file hash verification | Optional drag-and-drop of source PDF/IES/LDT, `SubtleCrypto` SHA-256 | Cool capability; surfaces the hash-integrity story. |
| Hosting | Cloudflare Pages | Free, edge, no cold starts. |
| Versioning UX | Single-version at v1; multi-version deferred to post-ULC-1.0 | Per ROADMAP, pre-1.0 is additive; one rendered version is enough. |
| Domain | ulcspec.org (already owned, points TBD) | Matches repo org name. |

**Assumption: the `ulcspec.org` domain is owned but not yet pointed at any host.** (Verify before scaffold.)

**Assumption: `assets/logo.png` in the ULC repo is the current brand mark.** (Verify on first design pass; may need vector + dark-mode variants.)

---

## Open Questions

1. **Hero CTA hierarchy.** Validator drop zone as the hero, OR a "Why publish ULC" value-prop hero with the validator on a dedicated page? Trade-off: validator-as-hero converts technical evaluators fast but loses the marketing pitch to product-data leads; pitch-as-hero converts decision-makers but adds a click before validation.
2. **Content sync mechanism.** Three options: (a) git submodule pinned to a tagged release of `ulcspec/ULC`, (b) a build-time fetch script using `gh api` / raw GitHub URLs against a pinned commit, (c) git subtree. Submodule is most explicit; fetch script is simplest. Decide during scaffold.
3. **Pilot manufacturers to feature.** README says pilots are underway. Which can be named publicly on v1? Logos require permission. If none yet, plan a "join the pilot" CTA instead.
4. **Industry-body endorsement language.** Active dialogue with DIAL, IES, LIA per GOVERNANCE — is there approved language or letters to display, or do we stick to "in active dialogue with" framing?
5. **Existing brand assets.** Beyond `assets/logo.png`, are there established fonts, colors, or design tokens? If not, we set them on the design pass.
6. **Marketing copy authorship.** Who drafts the hero, value-prop, and pilot-page copy? (Likely Foad, but worth confirming whether external copywriting is in play.)
7. **Validator scope.** Schema-only, OR schema + index-builder parity + (optional) source-file hash verification? Decision affects scope of TS port from Go. Recommendation: all three from day one, hash-verification is opt-in once user drags source files.
8. **Multi-file drop.** Does the validator accept a single `.ulc.json` only, or a folder/zip of multiple records? (Manufacturers running PIM exports will want batch.)
9. **Analytics + privacy.** Plausible / Fathom / none? Affects cookie banner story for EU manufacturer visitors.
10. **AI-agent discoverability.** Meta: a site about AI-readable lighting data should itself be machine-readable. Confirm we want JSON-LD structured data, a clean sitemap, an `llms.txt`, and the schema files served with correct content-type. Probably yes.
11. **Versioning commitment.** Stay flat URLs (`/spec/`, `/schema/`) for v1, with a redirect plan for when ULC reaches 1.0 and we add `/v1.0/spec/`? Worth deciding now to avoid URL breakage later.
12. **Search.** Algolia DocSearch (free for OSS docs sites) or Pagefind (static, no third-party) for in-site search? Astro pairs well with Pagefind.

---

## Next Steps

1. **Run `/lp-pick-stack`** to formally lock the stack pattern (Astro static + TypeScript + Ajv + Cloudflare Pages). The decision is made; this just emits the signed `scaffold-decision.json` the pipeline needs.
2. **Run `/lp-scaffold-stack`** to materialize the chosen stack layers.
3. **Run `/lp-define`** to scaffold the four canonical architecture docs (product, design, architecture, CI/CD) and the section registry.
4. **Design definition pass** (`/lp-define-design`) — establish the hybrid-light visual register: type, color (including the light-motif accent palette — luminance gradients, photometric polar plot accents), spacing, components.
5. **Section shaping** (`/lp-shape-section`) per section, in this priority order:
   1. Homepage (hero + validator entry + pilot proof + nav to spec)
   2. Validator page (drag-and-drop, results, source-hash verification)
   3. Spec render (authoring-patterns, schema reference, taxonomy, templates, PIM guides)
   4. Why-publish (manufacturer value-prop, ROI, PIM integration paths)
   5. Governance & pilots (industry-body dialogue, stewardship, pilots)
   6. Downloads (validator binary releases via GitHub Releases pass-through)
7. Resolve Open Questions 1–12 (above) inline as each section is shaped.

---

## Cross-references

- ULC repo: <https://github.com/ulcspec/ULC>
- ULC README (project status, v0.5.1, ulcspec.org deferred-batch language): repo root
- ROADMAP scope rules (explicitly NOT in v1.0.0 — useful for what NOT to extend ULC with on the site): `ROADMAP.md`
- GOVERNANCE (steward, industry-body dialogue, decision process): `GOVERNANCE.md`
- Authoring patterns A/B/C/D (the four real-world manufacturer publishing shapes the site must support documenting): `docs/authoring-patterns.md`
