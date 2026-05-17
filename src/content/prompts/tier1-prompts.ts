// Tier 1 designer LLM prompts. Single source of truth per SECTION_REGISTRY.md
// cross-surface SSOT table. Consumed by:
//   - src/components/Tier1QuickWin.astro (homepage hero, RENDER prompt only)
//   - src/pages/for-designers.astro      (RENDER + COMPARE + EXTRACT)
//   - src/pages/downloads.astro          (ALL 5; canonical catalog)
//   - future /spec#how-to-use-today      (RENDER prompt)
//
// The five prompts at /downloads#prompts are the canonical catalog; the
// homepage hero + /for-designers + /spec render named subsets via the
// individually-exported constants (each surface imports only what it shows).
// Named exports stay stable as the catalog grows so downstream consumers
// never need to track index positions.
//
// Copy authority: docs/growth/copy/downloads.md ("Designer LLM prompts
// section"). The RENDER prompt is identical across all four surfaces
// (homepage hero, /for-designers, /spec, /downloads) — verbatim parity is
// load-bearing; verify with CI grep against built HTML on every PR.

export interface Tier1Prompt {
  id: string;
  label: string;
  text: string;
}

export const TIER1_PROMPT_RENDER: Tier1Prompt = {
  id: 'tier1-render',
  label: 'Render a .ulc file as a spec sheet',
  text: 'Read the attached `.ulc.json` file. Render it as a clean spec sheet with sections for product identity, electrical, optical / photometric, physical, and accessories. Call out any fields that are missing or flagged as unknown. If a SHA-256 source-file hash is present, note which source file each measured attribute traces back to.',
};

export const TIER1_PROMPT_COMPARE: Tier1Prompt = {
  id: 'tier1-compare',
  label: 'Compare two .ulc files',
  text: 'Read the two attached `.ulc.json` files. Compare them on CRI, CCT range, wattage, optical accessory options, mounting kit, IP rating, and dim-to-warm behavior. Flag any field where the products diverge materially or where one declares the field and the other does not. End with a one-paragraph recommendation framed around which product fits a [project type] application.',
};

export const TIER1_PROMPT_EXTRACT: Tier1Prompt = {
  id: 'tier1-extract',
  label: 'Extract attributes for a luminaire-schedule line',
  text: 'Read the attached `.ulc.json` files. For each file, extract [CRI, CCT options, optical accessories, mounting kit, IP rating]. Return the result as a luminaire-schedule-ready table with one row per product and one column per attribute. Note any product missing any of the requested attributes.',
};

export const TIER1_PROMPT_SANITY_CHECK_VE: Tier1Prompt = {
  id: 'tier1-sanity-check-ve',
  label: 'Sanity-check a VE package',
  text: 'Read the two attached `.ulc.json` files: the original specified product and the VE-proposed alternative. Compare them on CRI, CCT, wattage, optical distribution, mounting type, dimming method, and any field flagged as missing or unknown. Explicitly state whether the VE alternative matches the original design intent on each compared field. End with a flag list of fields where the VE alternative deviates materially.',
};

export const TIER1_PROMPT_PULL_PROVENANCE: Tier1Prompt = {
  id: 'tier1-pull-provenance',
  label: 'Pull the source-file provenance for an attribute',
  text: 'Read the attached `.ulc.json` file. For each measured attribute (CRI, CCT, wattage, photometric distribution, IP rating, optical accessories), identify which source file (PDF, IES, or LDT) the value traces back to via the per-field provenance + SHA-256 hash. Return the answer as a list mapping attribute to source file.',
};

export const TIER1_PROMPTS: readonly Tier1Prompt[] = [
  TIER1_PROMPT_RENDER,
  TIER1_PROMPT_COMPARE,
  TIER1_PROMPT_EXTRACT,
  TIER1_PROMPT_SANITY_CHECK_VE,
  TIER1_PROMPT_PULL_PROVENANCE,
];
