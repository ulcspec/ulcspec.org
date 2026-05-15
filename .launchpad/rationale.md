---
generated_by: /lp-pick-stack
generated_at: 2026-05-14T14:07:36Z
matched_category_id: manual-override
---

# Why this stack?

## project-understanding

- ulcspec.org is the deferred front-end for the ULC open specification (per the spec README).
- Primary audience: lighting manufacturers (the supply side of the AI-readable-luminaire-data ecosystem).
- Three v1 pillars: lean credibility site, interactive in-browser .ulc.json validator, and a rendered spec content area pulled from ulcspec/ULC at build.

## matched-category

- manual-override: Manual override.

## stack

- astro as frontend at .

## why-this-fits

- Astro static + content collections is the right shape for a marketing-plus-docs hybrid: zero JS on narrative pages, isolated client JS on the validator island.
- Ajv (JSON Schema Draft 2020-12) runs fully client-side for instant drag-and-drop validation without a server.
- TypeScript end-to-end matches stated preference and keeps the validator + schema rendering type-aware.
- Cloudflare Pages edge hosting is free, global, and fast for international manufacturer visitors.

## alternatives

- Next.js + Go-to-WASM canonical validator: zero validator drift, but ~5-15MB WASM bundle and React overhead heavier than needed. Deferred to v2 if validator-fidelity becomes a credibility bet.
- Docusaurus + Ajv: free multi-version docs, but React layout opinions fight the hybrid-light marketing visual register. Astro [...slug] handles versioning when ULC reaches 1.0.
- Marketing-only site (docs stay on GitHub): loses the in-browser validator UX and rendered-spec navigability advantages.

## notes

- Content source-of-truth is github.com/ulcspec/ULC; site repo pulls at build via a pinned-release sync mechanism (final pick during scaffold).
- Validator-drift risk against canonical Go CLI mitigated via CI parity check on the four canonical reference records.
- Visual register: hybrid (modern dev-docs base with restrained light/luminance motif accents).
- Manual-override routed: the catalog tied across marketing-astro + static-blog-astro + static-blog-eleventy + static-blog-hugo. User picked the marketing-astro shape (Astro single-frontend at root); override produces an identical layer spec
