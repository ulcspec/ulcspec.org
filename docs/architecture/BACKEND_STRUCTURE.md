# Backend Structure

ulcspec.org is fundamentally a **static site**. There is no backend service, no API, no database. This document captures the static-site posture so future contributors don't add server-side surface area without an explicit scope-change decision.

## Framework & style

- **Framework:** Astro 7 in **static output mode** (the default; `astro.config.mjs` does not opt into SSR or hybrid output).
- **API style:** not applicable. All surfaces are static HTML at v1. The interactive validator is a client-side Astro island that runs in the user's browser; it does not call a server.

## Routes

File-based routing via `src/pages/`. Expected v1 routes (placeholder pending confirmation in `/lp-shape-section`):

- `/` — homepage (hero, value prop, validator entry, pilot proof)
- `/validator` — interactive in-browser `.ulc.json` validator
- `/spec` — rendered spec content (authoring patterns, schema reference, taxonomy, templates, PIM guides) synced from `ulcspec/ULC`
- `/why-publish` — manufacturer value-prop, ROI, PIM integration paths
- `/governance` — stewardship, decision process, industry-body dialogue, pilots
- `/downloads` — pass-through to GitHub Releases for the Go reference CLI validator

Current files under `src/pages/` (`index.astro`, `markdown-page.md`) are demo content from the `with-tailwindcss` Astro template and will be replaced as each section is shaped.

## Data models

Not applicable. The validator consumes the ULC JSON Schema (Draft 2020-12) which is fetched at build time from the spec repo and loaded into the browser. No application-defined data models, no ORM, no persistence layer.

## Authentication

Not applicable. The site is fully public. No login, no user accounts, no per-user state. Visitor data (if any) lives in the chosen analytics tool — see brainstorm Open Question #9.

## Error handling

- **Validator errors** are surfaced client-side as line-anchored messages in the validator UI: schema violations, malformed JSON, missing required fields, hash mismatches when source files are dropped. The validator never reports to a server.
- **Build errors** are caught by GitHub Actions CI. If the spec-content sync fails (network error fetching from `ulcspec/ULC`, schema drift detected, secret pattern matched), the build aborts and Cloudflare Pages serves the previous successful deploy until the failure is resolved.
- **Route-level 404s** are served as static `404.html` rendered by Astro at build time.

## Observability

Minimal. The site is a docs surface, not a product, so observability investment is sized accordingly:

- **Cloudflare Pages built-in analytics** (free tier) if enabled — request counts and 4xx/5xx rates at the edge. No third-party APM.
- **Optional privacy-friendly analytics** (Plausible / Fathom / none) — pending brainstorm Open Question #9. Affects the cookie-banner story for EU manufacturer visitors.
- **No logs to aggregate** — there is no server to log from. Build-time logs live in GitHub Actions; runtime issues surface as user reports.

If a future iteration adds server endpoints (e.g., a hosted validator API), this document needs revisiting — that's a material architectural change, not an incremental addition.
