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
// it, because some packages' `exports` maps do not expose ./package.json.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const readPkg = (name) =>
  JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'));

const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const astroMajor = readPkg('astro').version.split('.')[0];

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
  const peerMajor = (peer.match(/(\d+)/) || [])[1];
  const ok = peerMajor === astroMajor;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${name}@${pkg.version} peer astro "${peer}" (major ${peerMajor}) vs installed astro major ${astroMajor}`,
  );
  if (!ok) failed = true;
}

if (failed) {
  console.error(
    `\nAstro integration peer mismatch: bump the integration to its astro-${astroMajor} release before merging.`,
  );
  process.exit(1);
}
console.log(`\nAll @astrojs integrations with an astro peer match installed astro major ${astroMajor}.`);
