// src/lib/spec-sync.ts
//
// Helpers over spec-sync.config.ts. Loader (PR-1) and rendering pages
// both consume from here. Pure functions only; no side effects.
//
// What lives here vs in spec-sync.config.ts:
//   - config.ts: the manifest + pinned SHA (data)
//   - here:     URL builders + route↔upstream lookups (behavior)
//
// Literal types `SpecRoute` and `SpecUpstreamPath` are derived from the
// `as const satisfies SpecSyncConfig` declaration in spec-sync.config.ts
// so a route or path typo in any page becomes a compile-time error.

import { SPEC_SYNC, type SpecSyncManifestEntry } from '../../spec-sync.config';

/** Literal union of every /spec/* route declared in the manifest. */
export type SpecRoute = (typeof SPEC_SYNC.files)[number]['route'];

/** Literal union of every upstream path declared in the manifest. */
export type SpecUpstreamPath = (typeof SPEC_SYNC.files)[number]['upstreamPath'];

/**
 * Raw-content URL the loader fetches at build time.
 * https://raw.githubusercontent.com/<owner>/<repo>/<commit>/<path>
 *
 * Accepts a `SpecUpstreamPath` (a manifest-declared path) OR a raw string
 * for index-page README references that aren't in the manifest.
 */
export function rawContentUrl(upstreamPath: SpecUpstreamPath | string): string {
  const { upstreamOwner, upstreamRepo, upstreamCommit } = SPEC_SYNC;
  return `https://raw.githubusercontent.com/${upstreamOwner}/${upstreamRepo}/${upstreamCommit}/${upstreamPath}`;
}

/**
 * "Edit this page on GitHub" URL. Points at the branch (`main`) rather
 * than the pinned commit so contributors land on the editable HEAD.
 *
 * Index pages (without a manifest entry) pass a raw path to a README.
 */
export function editOnGitHubUrl(
  upstreamPath: SpecUpstreamPath | string
): string {
  const { upstreamOwner, upstreamRepo, upstreamEditBranch } = SPEC_SYNC;
  return `https://github.com/${upstreamOwner}/${upstreamRepo}/blob/${upstreamEditBranch}/${upstreamPath}`;
}

/**
 * Look up the manifest entry that backs a given /spec/* route. Returns
 * `undefined` for unknown routes (the optional API; callers that want a
 * build-time guarantee should use `manifestEntryForRouteOrThrow`).
 */
export function manifestEntryForRoute(
  route: SpecRoute | string
): SpecSyncManifestEntry | undefined {
  return SPEC_SYNC.files.find((f) => f.route === route);
}

/**
 * Strict variant: throws if the route is not in the manifest. This is the
 * preferred form for stub pages so that renaming a route in the manifest
 * without updating the page surfaces as a build error.
 */
export function manifestEntryForRouteOrThrow(
  route: SpecRoute
): SpecSyncManifestEntry {
  const entry = SPEC_SYNC.files.find((f) => f.route === route);
  if (!entry) {
    throw new Error(
      `spec-sync: no manifest entry for route "${route}". ` +
        `Update spec-sync.config.ts files[] to declare it.`
    );
  }
  return entry;
}
