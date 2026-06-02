// src/lib/spec-headings.ts
//
// Heading type used by <OnThisPage> on /spec/* sub-routes. Lives in
// src/lib rather than inline in the .astro component so pages can
// `satisfies readonly Heading[]` on their headings array without
// depending on importing types from a .astro file (Astro TS tooling
// for cross-component type imports is occasionally fragile).

export interface Heading {
  /** Anchor id (without the leading '#'). */
  id: string;
  /** Visible label. */
  label: string;
  /** Heading depth (2 = h2, 3 = h3). Drives indentation. */
  depth: 2 | 3;
}
