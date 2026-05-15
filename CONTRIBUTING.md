# Contributing to ulcspec.org

Thanks for your interest in contributing. This repo is the public front end for the ULC (Universal Luminaire Cutsheet) open specification at [github.com/ulcspec/ULC](https://github.com/ulcspec/ULC). Two repos, two scopes — please make sure your contribution lands in the right one.

## Scope: site vs spec

### What belongs in this repo (ulcspec.org)

- Astro pages and layouts for the public surfaces: hero / validator / spec render / why-publish / governance / downloads.
- The in-browser `.ulc.json` validator (Ajv) and optional source-file SHA-256 verification (SubtleCrypto).
- The content-sync mechanism that pulls spec content (authoring patterns, schema, taxonomy, templates, PIM guides) from `ulcspec/ULC` at build time.
- Site styling (Tailwind), navigation, and visual design.
- Build pipeline, CI workflows, deployment configuration (Cloudflare Pages).

### What belongs in the spec repo ([ulcspec/ULC](https://github.com/ulcspec/ULC))

- JSON Schema, taxonomy, authoring patterns (A/B/C/D), per-category templates.
- PIM platform mapping guides (Salsify, Akeneo, SAP, custom).
- Reference validator CLI (`ulc`, Go binary).
- Crosswalks to adjacent standards (GLDF, ETIM, IES LM-63, EULUMDAT).
- Governance of the specification itself — see [ulcspec/ULC GOVERNANCE.md](https://github.com/ulcspec/ULC/blob/main/GOVERNANCE.md).

If your contribution affects the schema or any normative spec content, file it against the spec repo, not here. The site is a renderer; it does not own spec content.

## Local development

### Prerequisites

- Node.js 22.12+
- pnpm (do not use npm — see `docs/architecture/TECH_STACK.md` for the version-skew history)

### Commands

```sh
pnpm install      # install dependencies
pnpm dev          # start dev server (http://localhost:4321)
pnpm build        # static production build → dist/
pnpm preview      # preview the production build locally
pnpm typecheck    # astro check
```

## Code style

Style is enforced by lefthook (locally) and CI (on every PR). The active pre-commit hooks check end-of-file newlines, trailing whitespace, large-file size caps, and TypeScript types via `astro check`. Do not bypass hooks with `--no-verify`; if a hook is broken, fix the hook.

ESLint and Prettier are not yet wired (their lefthook entries are intentionally disabled until configs and configs land). When they do, `pnpm lint` and `pnpm format` will become real commands.

### Commit messages

Conventional Commit prefixes are required:

- `feat:` new site features (pages, components, validator capabilities)
- `fix:` bug fixes
- `chore:` housekeeping, dependency updates, governance files, CI config
- `docs:` documentation only
- `refactor:` code reorganization without behavior change
- `test:` test additions or corrections
- `style:` style-only changes (formatting, naming)
- `perf:` performance improvements
- `ci:` CI workflow changes

Subject lines are short, imperative, lowercase after the colon, no trailing period — match the convention used in the [ulcspec/ULC CONTRIBUTING.md](https://github.com/ulcspec/ULC/blob/main/CONTRIBUTING.md).

PR titles follow the same convention. Do not add `Co-Authored-By: Claude` or any AI co-authorship trailer.

### Branch naming

- `feat/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — housekeeping
- `docs/<short-description>` — documentation changes

## Pull request process

1. Fork the repo, create a branch off `main`.
2. Make your changes focused — one concern per PR.
3. Run quality gates locally: `pnpm typecheck`, `pnpm build`, `lefthook run pre-commit`.
4. Open a PR against `main`. The PR template (`.github/pull_request_template.md`) asks for Summary / Changes / Test plan / Related — fill each section.
5. CI runs the same checks. All must pass before merge.
6. Squash-merge to `main`. Solo-maintained — 0 required reviewers; review happens informally and may take a few days.
7. Use `Closes #N` in the PR body to auto-close linked issues on merge.

## Licensing of contributions

By submitting a contribution to this repository, you agree that your contribution is licensed under the same terms as the project — MIT, matching the existing [LICENSE](LICENSE).

## Code of conduct

All participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Please read it before engaging.

## Reporting security issues

Do not file security issues publicly. See [SECURITY.md](SECURITY.md) for the GitHub Private Vulnerability Reporting flow.

## Spec governance

For questions about the stewardship, decision process, or maintainership of the underlying ULC specification — not the site — see the upstream [ulcspec/ULC GOVERNANCE.md](https://github.com/ulcspec/ULC/blob/main/GOVERNANCE.md). This site repo defers to that document for spec governance.
