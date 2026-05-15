# Security Policy

## Reporting a vulnerability

Report potential security vulnerabilities through GitHub's Private Vulnerability
Reporting at [github.com/ulcspec/ulcspec.org/security/advisories/new](https://github.com/ulcspec/ulcspec.org/security/advisories/new).

Acknowledgement target: 7 days. Patch target depends on severity and scope,
communicated in the advisory thread. ulcspec.org is solo-maintained; please
treat the acknowledgement target as best-effort rather than a contractual SLA.
Coordinated disclosure is preferred — please give the maintainer reasonable
time to ship a fix before public discussion.

## Scope

ulcspec.org is the public front end for the ULC specification at
[github.com/ulcspec/ULC](https://github.com/ulcspec/ULC). The two repos have
different scopes and different security postures.

### In scope (this repo)

- Site code: Astro pages, layouts, components, the in-browser `.ulc.json`
  validator (Ajv + SubtleCrypto), and any client-side JavaScript.
- Build pipeline: the content-sync mechanism that pulls spec content from
  `ulcspec/ULC` at build time, and the integrity checks around it.
- CI workflows under `.github/workflows/`.
- Deployment configuration (Cloudflare Pages).
- Sealed LaunchPad envelopes (`.launchpad/scaffold-decision.json`,
  `scaffold-receipt.json`, `bootstrap-manifest.json`) where tampering would
  affect build reproducibility.

### Out of scope — report elsewhere

- **Spec data integrity or schema correctness.** Report at
  [github.com/ulcspec/ULC](https://github.com/ulcspec/ULC) — that repo owns
  the schema, taxonomy, authoring patterns, and reference validator CLI.
- **Third-party dependency CVEs.** Report to the upstream maintainer.
  Dependabot surfaces these here automatically; the response is typically a
  version bump PR rather than a coordinated advisory on this repo.
- **Astro, Tailwind, Cloudflare Pages framework vulnerabilities.** Report to
  the respective upstream projects.
- **Disagreements with the specification's normative content.** Open an
  issue or discussion on the ULC spec repo.

## Supported versions

ulcspec.org is a continuously-deployed static site. Only the currently
deployed `main` branch is supported; security fixes ship as PRs against
`main` and deploy on merge. There are no historical version branches to
back-patch.
