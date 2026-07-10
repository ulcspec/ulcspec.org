// Tier 1 designer LLM prompts. Single source of truth per SECTION_REGISTRY.md
// cross-surface SSOT table. Consumed by:
//   - src/pages/for-designers.astro (RENDER + COMPARE + EXTRACT)
//   - src/pages/downloads.astro     (all six; canonical catalog)
//
// The six prompts at /downloads#prompts are the canonical catalog; /for-designers
// renders a named subset via the individually-exported constants (each surface
// imports only what it shows). Named exports stay stable as the catalog grows so
// downstream consumers never need to track index positions.
//
// Copy authority: docs/growth/copy/downloads.md ("Designer LLM prompts
// section"). CI checks the RENDER prompt's label on the built /for-designers
// page (ci.yml greps for "Render a .ulc file as a spec sheet"); there is no
// cross-surface prompt-text parity grep.

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

export const TIER1_PROMPT_CHECK_ACHIEVEMENTS: Tier1Prompt = {
  id: 'tier1-check-achievements',
  label: 'Check what a product is documented for',
  text: 'Read the attached `.ulc.json` file. From `index.achievements`, report each theme (embodied carbon, circularity, material health, energy, dark sky, emergency) with its state: none, claimed, or documented. For each documented theme, name the qualifying programs and note that an evidence document is attached. For each claimed theme, note that no current evidence document backs it. Also report `index.restricted_substances_declared` and `index.conformance_level`. Do not infer qualifications the record does not carry.',
};

export const TIER1_PROMPTS: readonly Tier1Prompt[] = [
  TIER1_PROMPT_RENDER,
  TIER1_PROMPT_COMPARE,
  TIER1_PROMPT_EXTRACT,
  TIER1_PROMPT_SANITY_CHECK_VE,
  TIER1_PROMPT_PULL_PROVENANCE,
  TIER1_PROMPT_CHECK_ACHIEVEMENTS,
];
