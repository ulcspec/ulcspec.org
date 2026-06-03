// Build-time loader for the /docs/schema field-by-field reference.
//
// Reads the vendored ULC JSON Schema (public/schema/ulc.json) at build time and
// flattens it into per-section field tables: one section for the record root,
// one per structural block ($def), and a "Common types" section for the value
// composites (ProvenancedNumber, the DualUnit family, Provenance, FileReference)
// that are documented once and linked rather than exploded on every field that
// uses them. Enum-typed fields link to the taxonomy reference.
//
// Schema-version-agnostic: the page content tracks whatever ulc.json is vendored
// (it refreshes at the spec-sync pin bump), with no code change here.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface SchemaNode {
  type?: string | string[];
  $ref?: string;
  title?: string;
  description?: string;
  // A property value can be a boolean subschema: `false` forbids the property
  // (JSON Schema 2020-12), `true` allows anything. ULC uses `false` to forbid
  // the removed top-level conformance_level.
  properties?: Record<string, SchemaNode | boolean>;
  required?: string[];
  items?: SchemaNode;
  additionalProperties?: boolean | SchemaNode;
  enum?: unknown[];
  const?: unknown;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  default?: unknown;
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
}

export interface FieldRow {
  path: string;
  typeLabel: string;
  /** In-page anchor (#schema-x) or cross-doc link (/docs/taxonomy#x). */
  typeLink?: string;
  required: boolean;
  description: string;
  constraints: string;
}

export interface SchemaSection {
  id: string;
  name: string;
  description: string;
  /** "root" | "block" | "common". */
  kind: string;
  fields: FieldRow[];
}

function readSchemaJSON(file: string): SchemaNode {
  return JSON.parse(readFileSync(join(process.cwd(), 'public', 'schema', file), 'utf8')) as SchemaNode;
}

const ulc = readSchemaJSON('ulc.json');
const defs = (ulc as { $defs?: Record<string, SchemaNode> }).$defs ?? {};

const TAXONOMY_REF = 'taxonomy.schema.json#/$defs/';
const LOCAL_REF = '#/$defs/';

// Value composites: documented once under "Common types", linked from fields.
const COMMON_TYPES: readonly string[] = [
  'ProvenancedNumber',
  'DualUnitLength',
  'DualUnitMass',
  'DualUnitTemperature',
  'DualUnitArea',
  'DualUnitMassPerLength',
  'Provenance',
  'FileReference',
];

// Section order, following a record top to bottom. Each name is a $def rendered
// as its own field table. The root scalars/arrays are a synthetic first section.
const BLOCK_ORDER: readonly string[] = [
  'ProductFamily',
  'Configuration',
  'Applicability',
  'CoveredAxis',
  'DerivationRule',
  'Electrical',
  'Photometry',
  'Colorimetry',
  'AlphaOpicMetrics',
  'FlickerMeasurements',
  'OutdoorClassification',
  'OperatingPoint',
  'TestConditions',
  'Instrumentation',
  'CorrectionsApplied',
  'Uncertainty',
  'ThermalDerating',
  'LumenMaintenancePackageEntry',
  'LumenMaintenanceLuminaire',
  'ChromaticityShiftProjection',
  'SustainabilityDeclaration',
  'CompatibleAccessory',
  'SourceFile',
  'Attestation',
  'Extensions',
  'Index',
];

function anchorFor(defName: string): string {
  return 'schema-' + defName.toLowerCase();
}

// describeType returns the display label and (optionally) a link for a node's
// type, without recursing into named $defs.
function describeType(node: SchemaNode): { label: string; link?: string } {
  if (node.$ref) {
    if (node.$ref.startsWith(TAXONOMY_REF)) {
      const name = node.$ref.slice(TAXONOMY_REF.length);
      return { label: `${name} (enum)`, link: `/docs/taxonomy#${name.toLowerCase()}` };
    }
    if (node.$ref.startsWith(LOCAL_REF)) {
      const name = node.$ref.slice(LOCAL_REF.length);
      return { label: name, link: `#${anchorFor(name)}` };
    }
    return { label: node.$ref };
  }
  if (node.anyOf || node.oneOf) {
    const variants = (node.anyOf ?? node.oneOf ?? []).map((v) => describeType(v).label);
    return { label: variants.join(' | ') };
  }
  if (node.type === 'array' && node.items) {
    const inner = describeType(node.items);
    return { label: `array of ${inner.label}`, link: inner.link };
  }
  if (node.enum) {
    return { label: 'enum' };
  }
  if (Array.isArray(node.type)) {
    return { label: node.type.join(' | ') };
  }
  return { label: node.type ?? 'object' };
}

function constraintsOf(node: SchemaNode): string {
  const parts: string[] = [];
  if (node.format) parts.push(`format ${node.format}`);
  if (typeof node.minimum === 'number' && typeof node.maximum === 'number') {
    parts.push(`${node.minimum} to ${node.maximum}`);
  } else if (typeof node.minimum === 'number') {
    parts.push(`min ${node.minimum}`);
  } else if (typeof node.maximum === 'number') {
    parts.push(`max ${node.maximum}`);
  }
  if (typeof node.minLength === 'number') parts.push(`min length ${node.minLength}`);
  if (typeof node.minItems === 'number') parts.push(`min ${node.minItems} item${node.minItems === 1 ? '' : 's'}`);
  if (node.pattern) parts.push('pattern');
  if (node.const !== undefined) parts.push(`const ${JSON.stringify(node.const)}`);
  if (node.enum && Array.isArray(node.enum) && node.enum.length <= 6) {
    parts.push(node.enum.map((v) => String(v)).join(', '));
  }
  if (node.default !== undefined) parts.push(`default ${JSON.stringify(node.default)}`);
  return parts.join('; ');
}

// flatten emits field rows for a node's properties. Inline (anonymous) objects
// and arrays-of-inline-objects recurse with a dotted/[]-suffixed path; named
// $defs are linked, never recursed, which bounds the walk.
function flatten(node: SchemaNode, prefix: string, rows: FieldRow[]): void {
  const props = node.properties ?? {};
  const required = new Set(node.required ?? []);
  for (const [name, spec] of Object.entries(props)) {
    // A boolean subschema (`false` forbids the property, e.g. the removed
    // top-level conformance_level; `true` allows anything) is not a
    // documentable field, so skip it rather than emit a typeless phantom row.
    if (typeof spec === 'boolean') continue;
    const path = prefix ? `${prefix}.${name}` : name;
    const { label, link } = describeType(spec);
    rows.push({
      path,
      typeLabel: label,
      typeLink: link,
      required: required.has(name),
      description: spec.description ?? spec.title ?? '',
      constraints: constraintsOf(spec),
    });
    // Recurse only into inline (no-$ref) object shapes.
    if (!spec.$ref) {
      if (spec.type === 'object' && spec.properties) {
        flatten(spec, path, rows);
      } else if (spec.type === 'array' && spec.items && !spec.items.$ref && spec.items.type === 'object' && spec.items.properties) {
        flatten(spec.items, `${path}[]`, rows);
      }
    }
  }
}

function rootSection(): SchemaSection {
  const rows: FieldRow[] = [];
  flatten(ulc, '', rows);
  return {
    id: 'schema-root',
    name: 'Record root',
    description: 'The top-level shape of a ULC record. Most fields are structural blocks documented in their own sections below; the index block is computed by the builder, never authored.',
    kind: 'root',
    fields: rows,
  };
}

function blockSection(defName: string): SchemaSection | null {
  const def = defs[defName];
  if (!def) return null;
  const rows: FieldRow[] = [];
  flatten(def, '', rows);
  return {
    id: anchorFor(defName),
    name: defName,
    description: def.description ?? def.title ?? '',
    kind: 'block',
    fields: rows,
  };
}

export function getSchemaSections(): SchemaSection[] {
  const sections: SchemaSection[] = [rootSection()];
  for (const name of BLOCK_ORDER) {
    if (COMMON_TYPES.includes(name)) continue;
    const s = blockSection(name);
    if (s) sections.push(s);
  }
  // Any structural $def not in BLOCK_ORDER and not a common type still gets a
  // section, so a future schema addition is never silently dropped.
  const placed = new Set(BLOCK_ORDER);
  for (const name of Object.keys(defs).sort()) {
    if (placed.has(name) || COMMON_TYPES.includes(name)) continue;
    const s = blockSection(name);
    if (s) sections.push(s);
  }
  return sections;
}

export function getCommonTypeSections(): SchemaSection[] {
  const out: SchemaSection[] = [];
  for (const name of COMMON_TYPES) {
    const s = blockSection(name);
    if (s) {
      s.kind = 'common';
      out.push(s);
    }
  }
  return out;
}

export function getSchemaMeta(): { version: string; fieldCount: number; sectionCount: number } {
  const sections = [...getSchemaSections(), ...getCommonTypeSections()];
  const fieldCount = sections.reduce((n, s) => n + s.fields.length, 0);
  const idx = defs.Index?.properties?.ulc_version;
  void idx;
  return { version: typeof ulc.title === 'string' ? ulc.title : 'ULC', fieldCount, sectionCount: sections.length };
}
