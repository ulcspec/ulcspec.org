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
  // Pinned to the current upstream HEAD at PR-1a land time
  // (2026-05-17). Advance via:
  //   gh api repos/ulcspec/ULC/commits/main --jq '.sha'
  // and rebuild. The badge auto-detects a real SHA and renders it.
  upstreamCommit: '6eb8edab5132df977fb3d9da0348d8de9018dba6',
  upstreamVersion: 'v0.5.1',
  upstreamEditBranch: 'main',
  files: [
    {
      upstreamPath: 'docs/authoring-patterns.md',
      id: 'authoring-patterns',
      route: '/spec/authoring-patterns',
      fallbackTitle: 'Authoring patterns',
    },
    {
      upstreamPath: 'schema/ulc.schema.json',
      id: 'schema',
      route: '/spec/schema',
      fallbackTitle: 'Schema reference',
    },
    {
      upstreamPath: 'schema/taxonomy.schema.json',
      id: 'taxonomy',
      route: '/spec/taxonomy',
      fallbackTitle: 'Taxonomy',
    },
    {
      upstreamPath: 'templates/downlight.md',
      id: 'templates/downlight',
      route: '/spec/templates/downlight',
      fallbackTitle: 'Downlight template',
    },
    {
      upstreamPath: 'templates/linear-pendant.md',
      id: 'templates/linear-pendant',
      route: '/spec/templates/linear-pendant',
      fallbackTitle: 'Linear pendant template',
    },
    {
      upstreamPath: 'templates/wall-pack.md',
      id: 'templates/wall-pack',
      route: '/spec/templates/wall-pack',
      fallbackTitle: 'Wall-pack template',
    },
    {
      upstreamPath: 'templates/high-bay.md',
      id: 'templates/high-bay',
      route: '/spec/templates/high-bay',
      fallbackTitle: 'High-bay template',
    },
    {
      upstreamPath: 'templates/bollard.md',
      id: 'templates/bollard',
      route: '/spec/templates/bollard',
      fallbackTitle: 'Bollard template',
    },
    {
      upstreamPath: 'templates/wall-sconce.md',
      id: 'templates/wall-sconce',
      route: '/spec/templates/wall-sconce',
      fallbackTitle: 'Wall-sconce template',
    },
    {
      upstreamPath: 'mappings/pim/salsify.md',
      id: 'pim/salsify',
      route: '/spec/pim/salsify',
      fallbackTitle: 'Salsify PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/akeneo.md',
      id: 'pim/akeneo',
      route: '/spec/pim/akeneo',
      fallbackTitle: 'Akeneo PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/sap.md',
      id: 'pim/sap',
      route: '/spec/pim/sap',
      fallbackTitle: 'SAP PIM mapping',
    },
    {
      upstreamPath: 'mappings/pim/custom-pim.md',
      id: 'pim/custom-pim',
      route: '/spec/pim/custom-pim',
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
