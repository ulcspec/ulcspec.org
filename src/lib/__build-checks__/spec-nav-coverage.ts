// Build-time drift check: every /spec/templates/* and /spec/pim/* manifest
// entry must have a sidebar nav item, and vice versa.
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

// Mirror of the templates + pim sub-route hrefs declared in
// SpecSidebar.astro's `sections` data. Sourced manually for editorial
// integrity; this file is the lock that keeps them in sync.
const SIDEBAR_TEMPLATES_ROUTES = [
  '/spec/templates/downlight',
  '/spec/templates/linear-pendant',
  '/spec/templates/wall-pack',
  '/spec/templates/high-bay',
  '/spec/templates/bollard',
  '/spec/templates/wall-sconce',
] as const;

const SIDEBAR_PIM_ROUTES = [
  '/spec/pim/salsify',
  '/spec/pim/akeneo',
  '/spec/pim/sap',
  '/spec/pim/custom-pim',
] as const;

const SIDEBAR_TEMPLATES_AND_PIM_ROUTES = [
  ...SIDEBAR_TEMPLATES_ROUTES,
  ...SIDEBAR_PIM_ROUTES,
];

function isTemplatesOrPim(route: string): boolean {
  return route.startsWith('/spec/templates/') || route.startsWith('/spec/pim/');
}

const manifestTemplatesAndPim: readonly string[] = SPEC_SYNC.files
  .filter((f) => isTemplatesOrPim(f.route))
  .map((f) => f.route);

const manifestSet = new Set<string>(manifestTemplatesAndPim);
const sidebarSet = new Set<string>(SIDEBAR_TEMPLATES_AND_PIM_ROUTES);

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
