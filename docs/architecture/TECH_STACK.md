# Tech Stack

> TypeScript — Node.js 22.12+

## Language & runtime

- **Language:** TypeScript (strict mode per `tsconfig.json`)
- **Runtime:** Node.js 22.12+ (per `package.json` `engines.node`)
- **Package manager:** pnpm

## Frameworks

- **Astro 7** (static output mode, content collections, MDX via `@astrojs/mdx@7`)
- **Tailwind CSS v4** (4.3.3), wired via the `@tailwindcss/vite` plugin in `astro.config.mjs`

## Validation

- **[Ajv](https://ajv.js.org/)** — JSON Schema Draft 2020-12 validator running fully client-side. Powers the in-browser `.ulc.json` validator island. Not yet installed; will be added when the validator section is built.
- **Browser SubtleCrypto** — SHA-256 hashing for optional source-file (PDF / IES / LDT) hash verification against references inside a `.ulc.json` record. No additional dependency.

## Content sync

- **Source of truth:** [`ulcspec/ULC`](https://github.com/ulcspec/ULC). All spec prose, schema files, taxonomy, authoring patterns, per-category templates, and PIM mapping guides are authored in the spec repo and consumed by this site at build time.
- **Mechanism:** TBD — see brainstorm Open Question #2. Candidates: (a) git submodule pinned to a tagged release, (b) build-time fetch script using `gh api` / raw GitHub URLs against a pinned commit, (c) git subtree. Decision deferred until first spec-content section is shaped.

## Data layer

Not applicable — no database, no server. Spec content is fetched at build time and rendered to static HTML; the validator works against JSON Schema files loaded into the browser.

## CI / deployment

- **CI:** GitHub Actions (wired via `.github/workflows/`)
- **Hosting:** Cloudflare Pages (free tier; edge-deployed; no cold starts)

---

## Historical note: the Tailwind 4.1.10 pin

An earlier scaffold under **npm** required pinning `@tailwindcss/vite` and `tailwindcss` to `4.1.10`. Tailwind v4.3.0's vite plugin reaches into vite-internal binding APIs that exist only on vite 8 + rolldown 1.x. Under npm, `vitefu` (Astro's transitive dependency) ended up bringing a duplicate `vite@8.0.13` alongside Astro's own `vite@7.3.3`; the plugin code loaded against vite 7 tried to read rolldown bindings from vite 8 and crashed with `Missing field tsconfigPaths` on the resolve plugin config.

The project switched to **pnpm**, whose stricter peer-dependency resolution dedupes vite to a single `7.3.3` instance across the entire dependency graph (verified via `pnpm why vite` reporting `Found 1 version of vite`). With no version skew, `@tailwindcss/vite@4.3.0`'s rolldown-binding code paths never trigger against an incompatible vite, and the pin is no longer needed. The `^4.1.10` carets in `package.json` are retained out of inertia and currently resolve to 4.3.0; they can be loosened or tightened freely.

**Implication:** stay on pnpm. If the project ever needs to switch back to npm, either reinstate the 4.1.10 pin or add a `vite` override in `package.json` to force a single version across the tree.


---

## Detected manifests

This document was seeded from the following manifests detected at the repo root:

- `package.json`


**Manifest paths only:** this section lists the manifest files detected
during seeding. The generator does not embed parsed manifest *content*
into this document, so secret-bearing fields like `scripts.*` values,
private-registry tokens, or `repositories[].url` credentials never reach
this output — there is no field-level redaction step because there is
nothing to redact in the rendered text. Every rendered doc is
additionally passed through `secret-patterns.txt` before write as a
defense-in-depth check; a match there refuses the write entirely
rather than redacting in place.
