// Fails if any installed @astrojs/* integration's declared `astro` peer major
// does not match the installed astro major.
//
// Why this exists: Dependabot bumps `astro` and `@astrojs/*` as separate
// packages, so an Astro major can land without its matching integration major
// (that is how astro 7 first arrived with @astrojs/mdx still at 6). pnpm does
// not fail on that: `strict-peer-dependencies` is a resolution-time check, and
// CI installs with `--frozen-lockfile`, which skips resolution. This script is
// a post-install assertion instead, so it runs regardless of lockfile state.
//
// It reads node_modules/<pkg>/package.json directly rather than `require`-ing
// it, because some packages' `exports` maps do not expose ./package.json. The
// declared peer is matched with semver, so a compound range such as
// "^7.0.0 || ^8.0.0" accepts either major rather than only the first one named.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const root = process.cwd();
const require = createRequire(join(root, 'noop.cjs'));
const semver = require('semver');
const readPkg = (name) =>
  JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'));

const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const astroVersion = readPkg('astro').version;

const names = Object.keys({ ...rootPkg.dependencies, ...rootPkg.devDependencies }).filter((n) =>
  n.startsWith('@astrojs/'),
);

let failed = false;
for (const name of names) {
  let pkg;
  try {
    pkg = readPkg(name);
  } catch {
    continue; // not installed in this tree
  }
  const peer = pkg.peerDependencies?.astro;
  if (!peer) {
    console.log(`--   ${name}@${pkg.version}: declares no astro peer (skipped)`);
    continue;
  }
  const ok = semver.satisfies(astroVersion, peer, { includePrerelease: true });
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${name}@${pkg.version} peer astro "${peer}" vs installed astro ${astroVersion}`,
  );
  if (!ok) failed = true;
}

if (failed) {
  console.error(
    `\nAstro integration peer mismatch: an integration's astro peer range does not accept installed astro ${astroVersion}. Bump the integration before merging.`,
  );
  process.exit(1);
}
console.log(`\nAll @astrojs integrations with an astro peer accept installed astro ${astroVersion}.`);
