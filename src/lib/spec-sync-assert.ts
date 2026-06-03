// Build-time gate: refuse to ship production builds that still carry
// the design-phase placeholder pin.
//
// Invoked from astro.config.mjs via a small inline integration so the
// throw happens during astro:config:setup (before any pages render).
// Dev / preview builds short-circuit so contributors can still work
// against a future placeholder pin without prod-deploying a bad state.

import { SPEC_SYNC, SPEC_SYNC_IS_PINNED } from '../../spec-sync.config';

export interface SpecSyncAssertOptions {
  /** True when this is a production build (forwarded from Astro). */
  isProduction: boolean;
}

export function assertSpecSyncIsPinned(options: SpecSyncAssertOptions): void {
  if (!options.isProduction) return;
  if (SPEC_SYNC_IS_PINNED) return;
  throw new Error(
    [
      'spec-sync: production build refused.',
      `  upstreamCommit is "${SPEC_SYNC.upstreamCommit}", which does not match a Git SHA shape.`,
      '  Bump SPEC_SYNC.upstreamCommit in spec-sync.config.ts to a real 7-40 char hex SHA',
      `  before deploying (gh api repos/${SPEC_SYNC.upstreamOwner}/${SPEC_SYNC.upstreamRepo}/commits/main --jq '.sha').`,
    ].join('\n'),
  );
}
