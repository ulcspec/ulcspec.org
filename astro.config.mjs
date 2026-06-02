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
export default defineConfig({
	site: 'https://ulcspec.org',
	integrations: [mdx(), sitemap(), specSyncPinGuard],
	vite: {
		plugins: [tailwindcss()],
	},
});
