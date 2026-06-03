// Pinned-commit manifest for the ULC spec content sync.
// Loader: src/lib/spec-sync.ts (PR-1, see docs/tasks/sections/spec-plan.md).
// To advance the pin: bump UPSTREAM_COMMIT and rebuild.
// To add a file: append to `files` AND add a route under src/pages/spec/.

export interface SpecSyncManifestEntry {
  /** Path inside the upstream repo, relative to repo root. */
  upstreamPath: string;
  /** Collection entry id this file becomes (without extension). */
  id: string;
  /** Site sub-route under /spec/ that renders this content. */
  route: string;
  /** Optional human-facing title fallback when the file has no H1. */
  fallbackTitle?: string;
}

export interface SpecSyncConfig {
  upstreamOwner: string;
  upstreamRepo: string;
  /**
   * Pinned commit SHA. Full 40-char preferred; short SHA accepted.
   * The version badge shows the first 7 characters when it's a real SHA.
   */
  upstreamCommit: string;
  /** Short label used in the version badge ("ULC v0.5.1"). */
  upstreamVersion: string;
  /** Branch used for "Edit this page on GitHub" links. */
  upstreamEditBranch: string;
  files: readonly SpecSyncManifestEntry[];
}

// `as const satisfies` (not `: T = ... as const`) so the literal types of
// `files[].route` and `files[].id` survive narrowing. Downstream code in
// src/lib/spec-sync.ts derives a `SpecRoute` / `SpecUpstreamPath` literal
// union from this declaration.
export const SPEC_SYNC = {
  upstreamOwner: 'ulcspec',
  upstreamRepo: 'ULC',
  // Pinned to the v0.6.0 release commit (PR #25, 2026-06-03), which ships the
  // computed-conformance model (PR #24). Advance via:
  //   gh api repos/ulcspec/ULC/commits/main --jq '.sha'
  // and rebuild. The badge auto-detects a real SHA and renders it.
  upstreamCommit: '0999ebc66db8893b29f131ebdd5990c2bdc526e8',
  upstreamVersion: 'v0.6.0',
  upstreamEditBranch: 'main',
  files: [
    {
      upstreamPath: 'docs/authoring-patterns.md',
      id: 'authoring-patterns',
      route: '/docs/authoring-patterns',
      fallbackTitle: 'Authoring patterns',
    },
    // NOTE: /docs/schema and /docs/taxonomy are intentionally NOT synced here.
    // They render at build time from the vendored public/schema/{ulc,taxonomy}.json
    // via src/lib/{schema,taxonomy}-reference.ts, which is the single source of
    // truth for those pages. Declaring spec-sync entries for them too would fetch
    // a second copy at the pinned commit and create a drift vector against the
    // vendored files (bump one without the other and the pages would silently
    // render the stale representation). The vendored JSON is the one copy.
    //
    // The templates/* and pim/* entries below are pre-declared for the planned
    // loader wiring (PR-1b): their pages are honest stubs today and do not yet
    // read the spec collection, but keeping the manifest entries warms the
    // content cache for that wiring and keeps the spec-nav-coverage build check
    // (src/lib/__build-checks__/spec-nav-coverage.ts) honest.
    {
      upstreamPath: 'templates/downlight.md',
      id: 'templates/downlight',
      route: '/docs/templates/downlight',
      fallbackTitle: 'Downlight template',
    },
    {
      upstreamPath: 'templates/linear-pendant.md',
      id: 'templates/linear-pendant',
      route: '/docs/templates/linear-pendant',
      fallbackTitle: 'Linear pendant template',
    },
    {
      upstreamPath: 'templates/wall-pack.md',
      id: 'templates/wall-pack',
      route: '/docs/templates/wall-pack',
      fallbackTitle: 'Wall-pack template',
    },
    {
      upstreamPath: 'templates/high-bay.md',
      id: 'templates/high-bay',
      route: '/docs/templates/high-bay',
      fallbackTitle: 'High-bay template',
    },
    {
      upstreamPath: 'templates/bollard.md',
      id: 'templates/bollard',
      route: '/docs/templates/bollard',
      fallbackTitle: 'Bollard template',
    },
    {
      upstreamPath: 'templates/wall-sconce.md',
      id: 'templates/wall-sconce',
      route: '/docs/templates/wall-sconce',
      fallbackTitle: 'Wall-sconce template',
    },
    {
      upstreamPath: 'mappings/pim/salsify.md',
      id: 'pim/salsify',
      route: '/docs/pim/salsify',
      fallbackTitle: 'Salsify PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/akeneo.md',
      id: 'pim/akeneo',
      route: '/docs/pim/akeneo',
      fallbackTitle: 'Akeneo PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/sap.md',
      id: 'pim/sap',
      route: '/docs/pim/sap',
      fallbackTitle: 'SAP PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/custom-pim.md',
      id: 'pim/custom-pim',
      route: '/docs/pim/custom-pim',
      fallbackTitle: 'Custom / in-house PIM mapping',
    },
  ],
} as const satisfies SpecSyncConfig;

/** True when upstreamCommit looks like a real Git SHA (not the placeholder). */
export const SPEC_SYNC_IS_PINNED: boolean = /^[0-9a-f]{7,40}$/i.test(
  SPEC_SYNC.upstreamCommit
);

/** Short SHA for the badge; first 7 chars when pinned, raw string otherwise. */
export const SPEC_SYNC_SHORT_SHA: string = SPEC_SYNC_IS_PINNED
  ? SPEC_SYNC.upstreamCommit.slice(0, 7)
  : SPEC_SYNC.upstreamCommit;
