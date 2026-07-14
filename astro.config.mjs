// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { assertSpecSyncIsPinned } from './src/lib/spec-sync-assert';

// Small inline integration so the production-pin gate fires in
// astro:config:setup, before any content collection loads. Build
// fails fast when SPEC_SYNC.upstreamCommit is still the design-
// phase placeholder.
/** @type {import('astro').AstroIntegration} */
const specSyncPinGuard = {
	name: 'spec-sync-pin-guard',
	hooks: {
		'astro:config:setup': ({ command }) => {
			assertSpecSyncIsPinned({ isProduction: command === 'build' });
		},
	},
};

// https://astro.build/config
const SITE = 'https://ulcspec.org';

export default defineConfig({
	site: SITE,
	integrations: [
		mdx(),
		// The v1 deck lives at /v1-deck/ as a static passthrough in public/,
		// so @astrojs/sitemap (which only covers rendered routes) misses it.
		// Add it explicitly so the page is discoverable. Derived from SITE so
		// it stays in sync if the canonical origin ever changes.
		sitemap({ customPages: [`${SITE}/v1-deck/`] }),
		specSyncPinGuard,
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
