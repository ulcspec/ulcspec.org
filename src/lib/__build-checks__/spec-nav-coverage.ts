// Build-time drift check: every /docs/pim/* manifest entry must have a
// sidebar nav item, and vice versa.
//
// Imported once from src/content.config.ts so it executes during
// `astro build` and `astro check` (module load runs the assertion at the
// bottom). NOT a test runner; deliberately no Vitest dep at v1.
//
// The sidebar is hand-authored in SpecSidebar.astro for editorial control
// over group structure + labels. This check holds the two in sync so
// adding a manifest entry without a sidebar nav item (or vice versa)
// fails the build with a clear diagnostic.

import { SPEC_SYNC } from '../../../spec-sync.config';

// Mirror of the PIM sub-route hrefs declared in SpecSidebar.astro's
// `sections` data. Sourced manually for editorial integrity; this file is
// the lock that keeps them in sync.
const SIDEBAR_PIM_ROUTES = [
  '/docs/pim/salsify',
  '/docs/pim/akeneo',
  '/docs/pim/sap',
  '/docs/pim/custom-pim',
] as const;

/**
 * Drift check is intentionally scoped to /docs/pim/*. Future
 * /docs/crosswalks/* manifest entries are not covered here; the crosswalks
 * index renders SectionCard links directly from a separate source-of-truth
 * in /docs/crosswalks/index.astro. Broaden this predicate when crosswalk
 * sub-routes are wired in PR-1b.
 */
function isPim(route: string): boolean {
  return route.startsWith('/docs/pim/');
}

const manifestPim: readonly string[] = SPEC_SYNC.files
  .filter((f) => isPim(f.route))
  .map((f) => f.route);

const manifestSet = new Set<string>(manifestPim);
const sidebarSet = new Set<string>(SIDEBAR_PIM_ROUTES);

const inManifestNotSidebar = [...manifestSet].filter((r) => !sidebarSet.has(r));
const inSidebarNotManifest = [...sidebarSet].filter((r) => !manifestSet.has(r));

if (inManifestNotSidebar.length > 0 || inSidebarNotManifest.length > 0) {
  const lines = [
    'spec-nav-coverage: SpecSidebar.astro and SPEC_SYNC.files drift.',
  ];
  if (inManifestNotSidebar.length > 0) {
    lines.push(
      `  In manifest, missing from sidebar: ${inManifestNotSidebar.join(', ')}`,
    );
  }
  if (inSidebarNotManifest.length > 0) {
    lines.push(
      `  In sidebar, missing from manifest: ${inSidebarNotManifest.join(', ')}`,
    );
  }
  lines.push(
    '  Fix by editing src/components/SpecSidebar.astro AND',
    '  src/lib/__build-checks__/spec-nav-coverage.ts together,',
    '  OR by adding/removing the corresponding spec-sync.config.ts entry.',
  );
  throw new Error(lines.join('\n'));
}
