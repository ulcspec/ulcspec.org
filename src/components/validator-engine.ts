// Validator engine: first-draft, surface-specific to /validator.
//
// At v1 first-draft this is a hand-rolled structural pre-validator: native
// JSON.parse with line+col extraction on syntax errors, plus a minimal
// top-level-required-fields check sourced from `/schema/ulc.json`. The
// full Ajv (JSON Schema Draft 2020-12) wire-up is gated on the `ajv` dep
// addition (see validator-plan.md OQ-1) and lands in the implementation PR.
//
// All four canonical reference records in `public/examples/` PASS this
// pre-validator. Random JSON FAILs with line-anchored "missing required"
// errors. Malformed JSON FAILs with line+col reference.
//
// SubtleCrypto SHA-256 hash verification IS fully wired here at v1, no
// dep needed, all browser-native.

export interface ParseSuccess {
  ok: true;
  data: unknown;
  text: string;
}

export interface ParseFailure {
  ok: false;
  error: {
    line: number;
    column: number;
    message: string;
  };
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface ValidationError {
  /** JSON-pointer path of the offending field, e.g. `/product_family/manufacturer`. */
  path: string;
  /** Approximate line in the source text (1-based). 0 if not locatable. */
  line: number;
  message: string;
  /** Schema-expected shape, e.g. "required field present" or "string". */
  expected: string;
  /** Actual value or shape encountered. */
  actual: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  /** Detected authoring pattern A/B/C/D if record passes; null otherwise. */
  pattern: 'A' | 'B' | 'C' | 'D' | null;
  /** Manufacturer slug + display name if extractable. */
  manufacturer: { slug: string; display: string } | null;
  /** Catalog model string if extractable. */
  model: string | null;
  /** Declared ULC version, e.g. "0.3.0". */
  version: string | null;
  /**
   * Computed conformance level read from `index.conformance_level`
   * ("core" / "standard" / "full"). The builder computes this from the
   * data the record carries; it is never hand-declared. Null when absent.
   */
  conformanceLevel: string | null;
  /** Source-file declarations from the record's `source_files` block. */
  sources: SourceDeclaration[];
}

export interface SourceDeclaration {
  /** Logical type: cutsheet, ies, ldt, uld, etc. */
  type: string;
  filename: string;
  sha256: string;
}

export interface SchemaSubset {
  required: string[];
}

/**
 * Parse user-supplied JSON with line + column extraction on failure.
 * Native `JSON.parse` throws a `SyntaxError` whose message includes a
 * position offset; we walk back through the source text to recover the
 * line/column for a useful error UX.
 */
export function parseUlcJson(text: string): ParseResult {
  try {
    const data = JSON.parse(text);
    return { ok: true, data, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const positionMatch = message.match(/position\s+(\d+)/i);
    let line = 1;
    let column = 1;
    if (positionMatch) {
      const offset = Number.parseInt(positionMatch[1], 10);
      ({ line, column } = offsetToLineCol(text, offset));
    }
    return {
      ok: false,
      error: { line, column, message: cleanParseMessage(message) },
    };
  }
}

function offsetToLineCol(
  text: string,
  offset: number,
): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const limit = Math.min(offset, text.length);
  for (let i = 0; i < limit; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function cleanParseMessage(message: string): string {
  return message
    .replace(/\s*in JSON at position\s+\d+(\s+\(line\s+\d+\s+column\s+\d+\))?/i, '')
    .trim();
}

/**
 * Locate a JSON path's line number in the source text. Best-effort: scans
 * for the deepest key in the path. Used to anchor validation errors to a
 * visible line in the rendered JSON view.
 */
export function findLineForPath(text: string, path: string): number {
  if (!path) return 1;
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return 1;
  const leaf = parts[parts.length - 1];
  if (!leaf) return 1;
  const needle = new RegExp(`"${escapeRegex(leaf)}"\\s*:`);
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (needle.test(lines[i])) return i + 1;
  }
  return 1;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Minimal structural validation. Checks the top-level required fields
 * declared in the schema's `required` array (7 at this spec version) and
 * reports any missing or type-wrong values with line-anchored errors.
 * Returns record metadata on pass so the result-state can populate the
 * summary band, including the builder-computed `index.conformance_level`.
 *
 * NOT a substitute for Ajv. Documented as such in the result-state
 * fidelity disclosure.
 */
export function validateStructure(
  data: unknown,
  text: string,
  schema: SchemaSubset,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push({
      path: '/',
      line: 1,
      message: 'Top-level value must be a JSON object.',
      expected: 'object',
      actual: data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data,
    });
    return emptyFailResult(errors);
  }

  const record = data as Record<string, unknown>;

  for (const field of schema.required) {
    if (!(field in record)) {
      errors.push({
        path: `/${field}`,
        line: findLineForPath(text, `/${field}`),
        message: `Required field "${field}" is missing.`,
        expected: 'present',
        actual: 'missing',
      });
    }
  }

  if ('ulc_version' in record && typeof record.ulc_version !== 'string') {
    errors.push({
      path: '/ulc_version',
      line: findLineForPath(text, '/ulc_version'),
      message: '"ulc_version" must be a string.',
      expected: 'string',
      actual: typeof record.ulc_version,
    });
  }

  if ('record_id' in record && typeof record.record_id !== 'string') {
    errors.push({
      path: '/record_id',
      line: findLineForPath(text, '/record_id'),
      message: '"record_id" must be a string.',
      expected: 'string',
      actual: typeof record.record_id,
    });
  }

  if (errors.length > 0) {
    return emptyFailResult(errors);
  }

  return {
    valid: true,
    errors: [],
    pattern: detectPattern(record),
    manufacturer: extractManufacturer(record),
    model: extractModel(record),
    version: typeof record.ulc_version === 'string' ? record.ulc_version : null,
    conformanceLevel: extractConformanceLevel(record),
    sources: extractSources(record),
  };
}

function emptyFailResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: false,
    errors,
    pattern: null,
    manufacturer: null,
    model: null,
    version: null,
    conformanceLevel: null,
    sources: [],
  };
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === 'string' ? v : null;
}

function detectPattern(record: Record<string, unknown>): 'A' | 'B' | 'C' | 'D' | null {
  const conf = asObject(record.configuration);
  if (!conf) return null;
  const pattern = conf.pattern;
  if (pattern === 'A' || pattern === 'B' || pattern === 'C' || pattern === 'D') {
    return pattern;
  }
  return null;
}

function extractManufacturer(
  record: Record<string, unknown>,
): { slug: string; display: string } | null {
  const fam = asObject(record.product_family);
  if (!fam) return null;
  const mfr = asObject(fam.manufacturer);
  if (!mfr) return null;
  const slug = getString(mfr, 'slug') ?? '';
  const display = getString(mfr, 'display_name') ?? '';
  if (!slug && !display) return null;
  return { slug, display };
}

function extractModel(record: Record<string, unknown>): string | null {
  const fam = asObject(record.product_family);
  if (!fam) return null;
  return getString(fam, 'catalog_model') ?? getString(fam, 'family_display_name');
}

/**
 * Read the builder-computed conformance level from `index.conformance_level`.
 * The value is never hand-declared; the reference builder grades the record
 * from its populated fields and stamps the achieved level into the generated
 * index. Returns null when the index or the field is absent.
 */
function extractConformanceLevel(record: Record<string, unknown>): string | null {
  const index = asObject(record.index);
  if (!index) return null;
  return getString(index, 'conformance_level');
}

/**
 * Source-file declarations live under `source_files` as an array of objects
 * with shape `{ file_type, reference: { filename, sha256, ... } }`. Skip
 * malformed entries silently; callers iterate the returned array.
 */
function extractSources(record: Record<string, unknown>): SourceDeclaration[] {
  const block = record.source_files;
  if (!Array.isArray(block)) return [];
  const out: SourceDeclaration[] = [];
  for (const entry of block) {
    const e = asObject(entry);
    if (!e) continue;
    const ref = asObject(e.reference);
    if (!ref) continue;
    const filename = getString(ref, 'filename');
    const sha256 = getString(ref, 'sha256');
    const type = getString(e, 'file_type') ?? 'source';
    if (filename && sha256) {
      out.push({ type, filename, sha256 });
    }
  }
  return out;
}

/**
 * SHA-256 hash of a file via browser SubtleCrypto. Returns lowercase hex.
 * Throws if SubtleCrypto is unavailable (very old browser, insecure
 * context). Caller must catch and degrade UI gracefully.
 */
export async function computeFileHash(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SubtleCrypto is unavailable in this browser.');
  }
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Load the minimal schema subset from `/schema/ulc.json` at first
 * interaction. Cached as a Promise on the module so concurrent
 * cache-miss callers share one fetch. The full schema file is ~70KB;
 * we extract only the top-level `required` array at v1. Full Ajv
 * consumption of the schema lands with the dep-add PR.
 */
let schemaPromise: Promise<SchemaSubset> | null = null;

export function loadSchemaSubset(): Promise<SchemaSubset> {
  if (!schemaPromise) {
    schemaPromise = fetchSchemaSubset().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}

async function fetchSchemaSubset(): Promise<SchemaSubset> {
  const response = await fetch('/schema/ulc.json');
  if (!response.ok) {
    throw new Error(`Failed to load schema: ${response.status}`);
  }
  const raw = (await response.json()) as unknown;
  const obj = asObject(raw);
  if (!obj || !Array.isArray(obj.required)) {
    throw new Error('Schema at /schema/ulc.json is missing a top-level required[] array.');
  }
  const required = obj.required.filter((s): s is string => typeof s === 'string');
  return { required };
}
