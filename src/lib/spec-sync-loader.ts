// Astro Content Layer loader for the ULC spec sync.
//
// Reads SPEC_SYNC.files at build time; for each entry, fetches the raw
// MDX/JSON body from raw.githubusercontent.com pinned to the manifest's
// upstreamCommit; caches per <commit>:<path> in .astro/cache/spec-sync/
// so an unchanged pin only fetches once. Auth is best-effort via the
// GITHUB_TOKEN env var (CF Pages provides it; local dev falls through
// to unauthenticated requests, which work for public repos at lower
// rate limits).
//
// Failures retry 3× with 500ms-linear backoff. After exhaustion the
// loader throws and the build fails — preferable to silently shipping
// a partial spec collection.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { Loader, LoaderContext } from 'astro/loaders';

import {
  SPEC_SYNC,
  type SpecSyncManifestEntry,
} from '../../spec-sync.config';

const RAW_HOST = 'https://raw.githubusercontent.com';
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;
// Per-attempt fetch timeout. Matches REQUEST_TIMEOUT_MS in
// src/lib/github-releases.ts so the two build-time fetchers fail-fast on
// the same wall. Without this, a stalled raw.githubusercontent.com
// connection would let the retry loop wait forever and hang the entire
// Cloudflare Pages build until the runner's outer watchdog fires.
const FETCH_TIMEOUT_MS = 10_000;
const CACHE_DIR = '.astro/cache/spec-sync';

function cacheKeyHash(commit: string, path: string): string {
  return createHash('sha256').update(`${commit}:${path}`).digest('hex').slice(0, 16);
}

function cachePathFor(commit: string, path: string): string {
  return join(process.cwd(), CACHE_DIR, `${cacheKeyHash(commit, path)}.txt`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  token: string | undefined,
  logger: LoaderContext['logger'],
): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': 'ulcspec.org-build',
    Accept: 'text/plain, application/json, */*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    // Fresh controller per attempt so an AbortError from the previous
    // attempt cannot leak across iterations. Treated as a retryable
    // failure by the catch below, just like any other network error.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }
      return await res.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < RETRY_ATTEMPTS) {
        const backoff = RETRY_BACKOFF_MS * attempt;
        logger.warn(
          `[spec-sync] fetch attempt ${attempt}/${RETRY_ATTEMPTS} failed (${lastError.message}); retrying in ${backoff}ms`,
        );
        await sleep(backoff);
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(
    `spec-sync: ${RETRY_ATTEMPTS} fetch attempts failed for ${url}: ${lastError?.message ?? 'unknown error'}`,
  );
}

async function loadEntry(
  entry: SpecSyncManifestEntry,
  context: LoaderContext,
): Promise<{ body: string; fromCache: boolean }> {
  const { upstreamOwner, upstreamRepo, upstreamCommit } = SPEC_SYNC;
  const url = `${RAW_HOST}/${upstreamOwner}/${upstreamRepo}/${upstreamCommit}/${entry.upstreamPath}`;
  const cache = cachePathFor(upstreamCommit, entry.upstreamPath);

  if (existsSync(cache)) {
    return { body: readFileSync(cache, 'utf8'), fromCache: true };
  }
  const body = await fetchWithRetry(url, process.env.GITHUB_TOKEN, context.logger);
  writeFileSync(cache, body, 'utf8');
  return { body, fromCache: false };
}

function isMarkdownPath(upstreamPath: string): boolean {
  return upstreamPath.endsWith('.md') || upstreamPath.endsWith('.mdx');
}

export function specSyncLoader(): Loader {
  return {
    name: 'spec-sync-loader',
    load: async (context: LoaderContext): Promise<void> => {
      const { files, upstreamCommit } = SPEC_SYNC;
      mkdirSync(join(process.cwd(), CACHE_DIR), { recursive: true });

      context.logger.info(
        `[spec-sync] loading ${files.length} entries pinned at ${upstreamCommit.slice(0, 7)}`,
      );

      // Markdown processor: created once per load() invocation, shared
      // across all .md entries. Pre-renders the body to HTML so the
      // Astro <Content /> component on consuming pages can render the
      // entry without a runtime markdown step.
      const markdown = await createMarkdownProcessor({});

      // Clear any stale entries from the store so a removed manifest file
      // does not survive into the collection.
      context.store.clear();

      for (const entry of files) {
        const { body, fromCache } = await loadEntry(entry, context);
        const digest = createHash('sha256').update(body).digest('hex');

        if (isMarkdownPath(entry.upstreamPath)) {
          const rendered = await markdown.render(body);
          context.store.set({
            id: entry.id,
            data: {
              upstreamPath: entry.upstreamPath,
              route: entry.route,
              fallbackTitle: entry.fallbackTitle ?? '',
            },
            body,
            digest,
            rendered: {
              html: rendered.code,
              metadata: {
                headings: rendered.metadata.headings,
                frontmatter: rendered.metadata.frontmatter,
              },
            },
          });
        } else {
          // JSON Schema files: pass through; consumers that need HTML
          // render them via dedicated walkers (PR-2).
          context.store.set({
            id: entry.id,
            data: {
              upstreamPath: entry.upstreamPath,
              route: entry.route,
              fallbackTitle: entry.fallbackTitle ?? '',
            },
            body,
            digest,
          });
        }
        context.logger.info(
          `[spec-sync] ${fromCache ? 'cache' : 'fetch'} ${entry.id} (${body.length} bytes)`,
        );
      }
    },
  };
}
