// Build-time GitHub Releases fetcher for ulcspec/ULC.
//
// Returns the latest release plus the previous five (up to six total), each
// with version, published date, brief notes summary, asset list with names,
// download URLs, and SHA-256 checksums when present in the release assets
// as a single `checksums.txt` or per-asset `*.sha256` file.
//
// Falls back to a `NoReleaseState` when the upstream repo has not yet
// shipped a release. The page renders an explicit "no release yet" message
// in that case rather than failing the build.
//
// Network failure modes:
//   - 404 (repo not found):        treated as no-release
//   - 200 with empty array:         treated as no-release
//   - 403 / rate-limit:             throws; build fails with a clear message
//   - 5xx / network timeout:        throws; build fails with a clear message
//
// Authentication: optional. When `process.env.GITHUB_TOKEN` is present
// (Cloudflare Pages env var, GitHub Actions runner, or a developer's
// shell), the fetcher passes `Authorization: Bearer <token>` and the
// rate limit lifts from 60/hour-per-IP to 5000/hour-per-token. The
// no-op-when-absent path keeps local dev builds working without a token.
// Adversarial-review hardening: on Cloudflare Pages shared egress IPs,
// the 60/hour unauthenticated budget can be partially consumed by other
// Pages tenants, so the authenticated path is the safer default for any
// CI environment. Minimum-privilege scope: a fine-grained PAT with
// public_repo read on `ulcspec/ULC`.

const REPO = 'ulcspec/ULC';
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases`;
const PREVIOUS_RELEASES_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Binary-target platforms recognized by `resolvePlatform`. This union is a
 * public contract: any consumer (e.g. `platformLabel: Record<Platform, ...>`
 * in `src/pages/downloads.astro`) must extend in lockstep. The string keys
 * are stable identifiers used both for asset classification and as cross-
 * file dictionary keys, NOT just for display.
 */
export type Platform =
  | 'darwin-arm64'
  | 'darwin-amd64'
  | 'linux-amd64'
  | 'linux-arm64'
  | 'windows-arm64'
  | 'windows-amd64';

// Recognized binary-asset filename suffixes. Upstream uses underscore-
// separated GoReleaser names (`ulc_0.5.1_darwin_amd64.tar.gz`); some
// projects use dash separators. Match both. The order here is the
// display order in the UI; `resolvePlatform` returns the first match
// and `sort` orders the asset list by `PLATFORM_PATTERNS` index. Patterns
// using shared affixes (linux / windows arm64 vs amd64) must list arm64
// before amd64 so substring overlap does not mis-classify.
const PLATFORM_PATTERNS = [
  ['darwin-arm64', /darwin[_-]arm64|macos[_-]arm64/i],
  ['darwin-amd64', /darwin[_-](amd64|x86_64)|macos[_-](amd64|x86_64)/i],
  ['linux-arm64', /linux[_-]arm64/i],
  ['linux-amd64', /linux[_-](amd64|x86_64)/i],
  ['windows-arm64', /windows[_-]arm64/i],
  ['windows-amd64', /windows[_-](amd64|x86_64)/i],
] as const satisfies ReadonlyArray<readonly [Platform, RegExp]>;

export interface ReleaseAsset {
  /** Asset filename, e.g. `ulc-darwin-arm64`. */
  name: string;
  /** Direct download URL on GitHub. */
  downloadUrl: string;
  /** Asset size in bytes (informational). */
  size: number;
  /** SHA-256 checksum, lowercase hex, if discoverable in the release. */
  sha256: string | null;
  /** Platform key resolved from the asset filename, or null if unmatched. */
  platform: Platform | null;
}

export interface ReleaseSummary {
  /** Release tag, e.g. `v0.5.1`. */
  tag: string;
  /** ISO 8601 publication date. */
  publishedAt: string;
  /** HTML URL to the release notes on GitHub. */
  htmlUrl: string;
  /** Release notes body (markdown). May be empty. */
  bodyMarkdown: string;
  /** Per-platform asset list (filtered + ordered for UI consumption). */
  assets: ReleaseAsset[];
}

export type ReleaseFetchResult =
  | { kind: 'released'; latest: ReleaseSummary; previous: ReleaseSummary[] }
  | { kind: 'no-release' };

/** Public entry point used by `src/pages/downloads.astro` at build time. */
export async function fetchReleases(): Promise<ReleaseFetchResult> {
  const raw = await fetchJson(RELEASES_URL);
  if (raw === null || (Array.isArray(raw) && raw.length === 0)) {
    return { kind: 'no-release' };
  }
  if (!Array.isArray(raw)) {
    throw new Error(
      `GitHub Releases API returned a non-array payload for ${REPO}.`,
    );
  }

  const candidates: RawRelease[] = raw.filter(
    (r) => !r.draft && !r.prerelease,
  );
  if (candidates.length === 0) {
    return { kind: 'no-release' };
  }
  const [latestRaw, ...restRaw] = candidates;

  // Checksums fetch (one extra round-trip) runs only for the latest
  // release, since the previous-releases list is version + date + notes
  // link only, no per-asset checksum rendering. Saves N round-trips
  // and keeps build-time fetch budget tight on the unauthenticated
  // 60/hour rate limit.
  const latest = await normalize(latestRaw, { withChecksums: true });
  const previous = await Promise.all(
    restRaw
      .slice(0, PREVIOUS_RELEASES_LIMIT)
      .map((r) => normalize(r, { withChecksums: false })),
  );

  return { kind: 'released', latest, previous };
}

interface RawAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface RawRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  assets: RawAsset[];
}

interface NormalizeOptions {
  withChecksums: boolean;
}

async function normalize(
  r: RawRelease,
  options: NormalizeOptions,
): Promise<ReleaseSummary> {
  const checksumAsset = options.withChecksums
    ? r.assets.find((a) => isChecksumFile(a.name))
    : undefined;
  const checksumIndex = await buildChecksumIndex(checksumAsset);

  // Filter out checksum files AND any asset without a resolved platform,
  // so the UI only renders binary downloads designers / engineers actually
  // need. Source archives and similar GoReleaser side-cars stay out of the
  // visible list. If an unmatched asset is load-bearing, extend the
  // PLATFORM_PATTERNS list above.
  const assets: ReleaseAsset[] = r.assets
    .filter((a) => !isChecksumFile(a.name))
    .map((a) => ({
      name: a.name,
      downloadUrl: a.browser_download_url,
      size: a.size,
      sha256: checksumIndex.get(a.name) ?? null,
      platform: resolvePlatform(a.name),
    }))
    .filter((a) => a.platform !== null)
    // Stable display order, derived from the index of each platform
    // in PLATFORM_PATTERNS so the single source of truth controls both
    // detection and ordering.
    .sort((a, b) => platformIndex(a.platform) - platformIndex(b.platform));

  return {
    tag: r.tag_name,
    publishedAt: r.published_at,
    htmlUrl: r.html_url,
    bodyMarkdown: r.body ?? '',
    assets,
  };
}

function resolvePlatform(name: string): Platform | null {
  for (const [platform, pattern] of PLATFORM_PATTERNS) {
    if (pattern.test(name)) return platform;
  }
  // Windows binaries are sometimes shipped as raw `.exe` without an
  // explicit platform tag in the filename. Match as a last resort.
  if (name.toLowerCase().endsWith('.exe')) return 'windows-amd64';
  return null;
}

function platformIndex(p: Platform | null): number {
  if (p === null) return PLATFORM_PATTERNS.length;
  return PLATFORM_PATTERNS.findIndex(([k]) => k === p);
}

function isChecksumFile(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    /(^|[_-])(checksums|sha256sums?)\.txt$/.test(lower) ||
    lower.endsWith('.sha256') ||
    lower.endsWith('.sha256sum')
  );
}

/**
 * Build a lookup of asset-name → sha256 hex by fetching and parsing the
 * checksum file from the release (one extra round-trip per release).
 * Supports `<hex>  <filename>` per line, which is what `sha256sum` and
 * GoReleaser's `checksums.txt` emit. Returns an empty Map when no
 * checksum file is present or the fetch fails; the UI falls back to
 * the "Verify against the release notes" text in that case.
 */
async function buildChecksumIndex(
  checksumAsset: RawAsset | undefined,
): Promise<Map<string, string>> {
  const empty = new Map<string, string>();
  if (!checksumAsset) return empty;

  try {
    const text = await fetchText(checksumAsset.browser_download_url);
    return parseChecksumLines(text);
  } catch (err) {
    // Non-fatal: a missing-or-malformed checksum file degrades the UI to
    // the "verify in release notes" fallback. The build does not fail.
    // Surface the swallowed error in the build log so a future GoReleaser
    // misconfiguration is visible in CI rather than invisibly degrading.
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[github-releases] Failed to fetch / parse ${checksumAsset.name}: ${message}. Falling back to "verify in release notes" UI.`,
    );
    return empty;
  }
}

function parseChecksumLines(text: string): Map<string, string> {
  // Matches the GoReleaser checksums.txt and `sha256sum` output shape that
  // ulcspec/ULC actually ships: `<64-hex>  <filename>`, one per line. If
  // a future producer ships `#`-commented files or BSD-tagged
  // `SHA256 (file) = <hex>` format, extend then.
  const index = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const match = /^([0-9a-f]{64})\s+(.+)$/i.exec(line.trim());
    if (match) index.set(match[2].trim(), match[1].toLowerCase());
  }
  return index;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetchWithTimeout(url, 'application/vnd.github+json');
  if (res.status === 404) return null;
  if (res.status === 403) {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(
      `GitHub Releases API returned 403 (rate-limit / forbidden) for ${url}.` +
        (reset ? ` Rate-limit resets at unix ${reset}.` : ''),
    );
  }
  if (!res.ok) {
    throw new Error(
      `GitHub Releases API returned ${res.status} for ${url}.`,
    );
  }
  return await res.json();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetchWithTimeout(url, 'text/plain');
  if (!res.ok) {
    throw new Error(`Fetch ${url} returned ${res.status}.`);
  }
  return await res.text();
}

async function fetchWithTimeout(
  url: string,
  accept: string,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = {
    Accept: accept,
    'User-Agent': 'ulcspec.org-build',
  };
  // Read GITHUB_TOKEN unprefixed (not PUBLIC_*) so it stays server-only
  // and never leaks into client bundles. Uses process.env to align with
  // src/lib/spec-sync-loader.ts; both modules run in the Node build
  // process where process.env is the native, well-typed access path.
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
