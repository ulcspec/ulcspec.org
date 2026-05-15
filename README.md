# ulcspec.org

Public front end for the **ULC (Universal Luminaire Cutsheet)** open specification. The v1 site delivers three pillars: (1) a credibility surface that converts lighting manufacturers into published-`.ulc.json` pilots; (2) an interactive in-browser validator where visitors drag a candidate `.ulc.json` onto the page and get pass/fail with line-anchored errors, plus optional SHA-256 verification of source PDF / IES / LDT files; and (3) a navigable rendering of the spec content (authoring patterns, schema, taxonomy, templates, PIM guides) pulled from the spec repo at build time.

The spec itself lives at **[github.com/ulcspec/ULC](https://github.com/ulcspec/ULC)** and remains the single source of truth for schema, taxonomy, and prose.

## Development

```sh
pnpm install      # install dependencies
pnpm dev          # start dev server (http://localhost:4321)
pnpm build        # static production build → dist/
pnpm preview      # preview the production build locally
pnpm typecheck    # astro check
```

Requires Node.js 22.12+ and pnpm. See `docs/architecture/TECH_STACK.md` for the full stack and the historical note on why pnpm (not npm) is the correct package manager for this project.

## Design context

- **[docs/architecture/PRD.md](docs/architecture/PRD.md)** — product requirements: audience, success criteria, non-goals, constraints
- **[docs/architecture/TECH_STACK.md](docs/architecture/TECH_STACK.md)** — language, runtime, frameworks, validation, content sync, hosting
- **[docs/architecture/BACKEND_STRUCTURE.md](docs/architecture/BACKEND_STRUCTURE.md)** — static-site posture; no server, no API, no database
- **[docs/architecture/APP_FLOW.md](docs/architecture/APP_FLOW.md)** — entry routes, per-audience journeys, error & empty states
- **[docs/brainstorms/2026-05-14-ulcspec-org-site-brainstorm.md](docs/brainstorms/2026-05-14-ulcspec-org-site-brainstorm.md)** — v1 brainstorm: scope, stack rationale, open questions

## License

MIT — see `LICENSE` (matches the upstream ULC spec repo).
