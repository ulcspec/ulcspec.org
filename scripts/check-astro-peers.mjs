// Asserts that the installed astro and its integrations agree on versions, so a
// Dependabot bump of one package cannot silently strand another on an
// incompatible version. It checks BOTH directions of the coupling:
//
//   A. every installed dependency that declares a peer on `astro` must accept
//      the installed astro (this is how @astrojs/mdx pins astro).
//   B. every package that `astro` itself pins as a peer must be at a version
//      astro accepts (this is how astro pins @astrojs/markdown-remark to an
//      exact version; that package declares no astro peer, so only direction B
//      catches its drift).
//
// Why a script and not pnpm's strict-peer-dependencies: that check runs at
// resolution time, and CI installs with `--frozen-lockfile`, which skips
// resolution. This assertion runs post-install, so it fires regardless. It is
// chained into `pnpm build`, so every build path runs it (CI, local, and the
// Cloudflare Pages production build), not only the CI workflow.
//
// It reads node_modules/<pkg>/package.json with `fs` rather than `require`,
// because some packages' `exports` maps do not expose ./package.json, and it
// matches versions with semver so a compound range like "^7.0.0 || ^8.0.0"
// accepts either major.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import semver from 'semver';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const readInstalled = (name) => readJson(join(root, 'node_modules', name, 'package.json'));

// Pure evaluator, kept free of the filesystem so the self-test can drive it with
// synthetic inputs. Returns one entry per version relationship actually checked.
export function evaluate({ astroVersion, astroPeers, packages }) {
  const opts = { includePrerelease: true };
  const checks = [];

  // Direction A: an integration declares a peer range on astro.
  for (const { name, version, astroPeer } of packages) {
    if (!astroPeer) continue;
    checks.push({
      label: `${name}@${version} peer astro "${astroPeer}" vs astro ${astroVersion}`,
      ok: semver.satisfies(astroVersion, astroPeer, opts),
    });
  }

  // Direction B: astro declares a peer range on a package we depend on.
  for (const [name, range] of Object.entries(astroPeers)) {
    const pkg = packages.find((p) => p.name === name);
    if (!pkg) continue; // astro lists it, but we do not depend on it: not ours to check
    checks.push({
      label: `astro peers ${name} "${range}" vs installed ${name}@${pkg.version}`,
      ok: semver.satisfies(pkg.version, range, opts),
    });
  }

  return checks;
}

function selfTest() {
  const cases = [
    // [astroVersion, astroPeers, packages, expected-all-ok]
    ['8.0.0', {}, [{ name: '@astrojs/x', version: '7.0.0', astroPeer: '^7.0.0' }], false],
    ['7.1.6', {}, [{ name: '@astrojs/x', version: '7.0.0', astroPeer: '^7.0.0' }], true],
    ['8.0.1', {}, [{ name: '@astrojs/x', version: '8.0.0', astroPeer: '^7.0.0 || ^8.0.0' }], true],
    ['7.1.6', { '@astrojs/markdown-remark': '7.2.2' }, [{ name: '@astrojs/markdown-remark', version: '7.3.0' }], false],
    ['7.1.6', { '@astrojs/markdown-remark': '7.2.2' }, [{ name: '@astrojs/markdown-remark', version: '7.2.2' }], true],
  ];
  cases.forEach(([astroVersion, astroPeers, packages, want], i) => {
    const checks = evaluate({ astroVersion, astroPeers, packages });
    const allOk = checks.every((c) => c.ok);
    if (checks.length === 0 || allOk !== want) {
      throw new Error(
        `check-astro-peers self-test case ${i} failed: expected all-ok=${want}, got ${allOk} over ${checks.length} check(s)`,
      );
    }
  });
}

// Prove the evaluator still flags drift before trusting it on the real tree.
selfTest();

const rootPkg = readJson(join(root, 'package.json'));
const declared = Object.keys({ ...rootPkg.dependencies, ...rootPkg.devDependencies });

const astroVersion = readInstalled('astro').version; // throws loudly if astro is absent
const astroPeers = readInstalled('astro').peerDependencies ?? {};

const packages = [];
for (const name of declared) {
  if (name === 'astro') continue;
  let pkg;
  try {
    pkg = readInstalled(name);
  } catch (err) {
    if (err.code === 'ENOENT') continue; // declared but not materialized: skip
    throw err; // present but unreadable: fail loud rather than silently skip
  }
  packages.push({ name, version: pkg.version, astroPeer: pkg.peerDependencies?.astro });
}

const checks = evaluate({ astroVersion, astroPeers, packages });

if (checks.length === 0) {
  console.error(
    'check-astro-peers found no astro peer relationships to verify; it would pass without checking anything. Aborting.',
  );
  process.exit(1);
}

let failed = false;
for (const check of checks) {
  console.log(`${check.ok ? 'OK  ' : 'FAIL'} ${check.label}`);
  if (!check.ok) failed = true;
}

if (failed) {
  console.error(
    `\nAstro ecosystem version mismatch against installed astro ${astroVersion}. Align the package before merging.`,
  );
  process.exit(1);
}
console.log(`\nAstro ${astroVersion} and its integrations agree (${checks.length} peer relationship(s) checked).`);
