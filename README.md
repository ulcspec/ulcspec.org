# ulcspec.org

Public front end for the **ULC (Universal Luminaire Cutsheet)** open specification: the docs site and adoption registry for the standard.

The spec itself, including the schema, taxonomy, authoring patterns, canonical reference records, validator, and the full README, lives at **[github.com/ulcspec/ULC](https://github.com/ulcspec/ULC)**. Start there for what ULC is, why it exists, and how to use it.

This repository builds the [ulcspec.org](https://ulcspec.org) site, which provides:

1. **The adoption registry**: which manufacturers have published ULC files for which products, updated as the ecosystem grows
2. **An interactive in-browser validator**: drag a candidate `.ulc.json` onto the page for pass/fail with line-anchored errors, plus optional SHA-256 verification of source PDF / IES / LDT files
3. **A navigable rendering of the spec content**: authoring patterns, schema, taxonomy, templates, and PIM guides, pulled from the spec repo at build time

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

- **[docs/architecture/PRD.md](docs/architecture/PRD.md)**: product requirements covering audience, success criteria, non-goals, and constraints
- **[docs/architecture/TECH_STACK.md](docs/architecture/TECH_STACK.md)**: language, runtime, frameworks, validation, content sync, and hosting
- **[docs/architecture/BACKEND_STRUCTURE.md](docs/architecture/BACKEND_STRUCTURE.md)**: static-site posture; no server, no API, no database
- **[docs/architecture/APP_FLOW.md](docs/architecture/APP_FLOW.md)**: entry routes, per-audience journeys, error and empty states

## Steward

ULC framework was first introduced by Foad Shafighi MIES, IALD, CLD in 2026 at the National Lighting Bureau AI Think Tank in New York.

## Governance

ULC is governed openly through the Schema Change Proposal process on GitHub. See [github.com/ulcspec/ULC](https://github.com/ulcspec/ULC) for governance documents, contribution guidelines, and the broader community.

## License

MIT. See `LICENSE` (matches the upstream ULC spec repo).
