// Astro Content Collections declaration for the ULC spec sync.
// The `spec` collection is loaded by src/lib/spec-sync-loader.ts at
// build time. The side-effect import below runs the sidebar↔manifest
// drift check during `astro check` / `astro build`.

import { defineCollection, z } from 'astro:content';

import { specSyncLoader } from './lib/spec-sync-loader';
import './lib/__build-checks__/spec-nav-coverage';

const spec = defineCollection({
  loader: specSyncLoader(),
  schema: z.object({
    upstreamPath: z.string(),
    route: z.string(),
    fallbackTitle: z.string().optional(),
  }),
});

export const collections = { spec };
