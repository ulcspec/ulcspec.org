// Build-time loader for the /docs/taxonomy enum reference.
//
// Reads the vendored taxonomy + schema JSON (public/schema/*.json) at build
// time, groups the 81 closed-enum taxonomies into reader-facing sections, and
// computes, per enum, which ULC schema fields consume it (the "used by"
// cross-reference). The page renders the returned model; no client data fetch.
//
// Source of truth: public/schema/taxonomy.json and public/schema/ulc.json are
// vendored copies of the upstream ulcspec/ULC schemas. They refresh together at
// the spec-sync pin bump; this loader is schema-version-agnostic, so the page
// content tracks whatever is vendored without code changes.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface RawEnumDef {
  title?: string;
  description?: string;
  enum?: string[];
}

export interface TaxonomyEnum {
  /** The $def name, e.g. "PrimaryCategory". */
  name: string;
  /** Stable anchor id for deep-linking, e.g. "primarycategory". */
  anchor: string;
  title: string;
  description: string;
  values: readonly string[];
  /** ULC field names whose value-set is this enum, e.g. ["primary_category"]. */
  usedBy: readonly string[];
}

export interface TaxonomyGroup {
  id: string;
  title: string;
  enums: readonly TaxonomyEnum[];
}

// Read the vendored schema JSON at build time. The site is statically built
// (SSG), so process.cwd() is the project root during `astro build`; this is more
// robust than an import.meta.url-relative read, which Vite bundling can relocate.
function readSchemaJSON(file: string): Record<string, unknown> {
  const abs = join(process.cwd(), 'public', 'schema', file);
  return JSON.parse(readFileSync(abs, 'utf8')) as Record<string, unknown>;
}

const taxonomy = readSchemaJSON('taxonomy.json');
const ulc = readSchemaJSON('ulc.json');

const taxonomyDefs = (taxonomy.$defs ?? {}) as Record<string, RawEnumDef>;

// --- usage cross-reference -------------------------------------------------
//
// Walk the ULC schema tracking the nearest enclosing property name. When a node
// $refs a taxonomy enum, attribute it to that property name. Mirrors the schema
// shape: descend into `properties` (rebinding the field name), and pass the
// field name through `$defs`, `items`, and `additionalProperties` so an enum
// referenced under a property's array items still attributes to the property.

const TAXONOMY_REF_PREFIX = 'taxonomy.schema.json#/$defs/';
const usage: Record<string, Set<string>> = {};

function recordRef(node: Record<string, unknown>, field: string): void {
  const ref = node.$ref;
  if (typeof ref === 'string' && ref.startsWith(TAXONOMY_REF_PREFIX)) {
    const name = ref.slice(TAXONOMY_REF_PREFIX.length);
    (usage[name] ??= new Set<string>()).add(field);
  }
}

function walkUsage(value: unknown, field: string): void {
  if (Array.isArray(value)) {
    for (const item of value) walkUsage(item, field);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const node = value as Record<string, unknown>;
  recordRef(node, field);

  for (const [key, child] of Object.entries(node)) {
    if (key === 'properties' && child && typeof child === 'object') {
      for (const [propName, propVal] of Object.entries(child as Record<string, unknown>)) {
        walkUsage(propVal, propName);
      }
    } else if (key === '$defs' && child && typeof child === 'object') {
      for (const def of Object.values(child as Record<string, unknown>)) {
        walkUsage(def, field);
      }
    } else if ((key === 'items' || key === 'additionalProperties') && child && typeof child === 'object') {
      walkUsage(child, field);
    } else if (child && typeof child === 'object') {
      walkUsage(child, field);
    }
  }
}

walkUsage(ulc, '');

// --- grouping --------------------------------------------------------------
//
// Reader-facing sections, ordered to follow a record top to bottom. Any enum
// not listed here is appended to a final "Other taxonomies" group, so a future
// schema addition is never silently dropped.

const GROUP_DEFS: ReadonlyArray<{ id: string; title: string; members: readonly string[] }> = [
  {
    id: 'categorization',
    title: 'Categorization and identity',
    members: ['PrimaryCategory', 'SecondaryFunction', 'Shape', 'IndoorOutdoor', 'TechnicalRegion', 'EnvironmentRating', 'MountingType', 'RecordStatus'],
  },
  {
    id: 'mechanical',
    title: 'Mechanical and materials',
    members: ['HousingMaterial', 'LensMaterial', 'AccessoryType'],
  },
  {
    id: 'electrical',
    title: 'Electrical and control',
    members: ['ControlGearType', 'DimmingMethod', 'DimmingProtocol', 'ThermalControlMethod', 'AdaptiveLightingMode'],
  },
  {
    id: 'photometry',
    title: 'Photometric distribution and optics',
    members: ['DistributionType', 'OutdoorDistributionType', 'BeamFamily', 'SymmetryType', 'EmissionFace', 'LuminousOpeningShape', 'PhotometricCoordinateSystem', 'NegativeIntensityHandling', 'LongitudinalDistributionRange', 'LegacyCutoffClassification', 'Orientation'],
  },
  {
    id: 'color',
    title: 'Color and color rendering',
    members: ['NominalCCT', 'CriTier', 'ColorTunabilityCapability', 'ChromaticityShiftMetric', 'ChromaticityShiftMode', 'ChromaticityShiftThreshold', 'AlphaOpicChannel', 'ReferenceIlluminantType', 'TM30DesignIntent', 'TM30Level'],
  },
  {
    id: 'lumen-maintenance',
    title: 'Lumen maintenance and lifetime',
    members: ['FluxMaintenanceQuantity', 'FluxMaintenanceThreshold', 'LumenMaintenanceDeclarationFramework', 'LumenMaintenanceProjectionMethod', 'ProjectionBasis', 'ProjectionReliability', 'TM21InterpolationType', 'TM35Edition', 'AmbientCleanliness', 'TestedProductType', 'DutOperatingMode', 'FailureMode', 'TemperatureAxis', 'TemperatureMonitoringPoint'],
  },
  {
    id: 'flicker',
    title: 'Flicker and temporal light artifacts',
    members: ['FlickerMetric', 'FlickerRiskLevel', 'FlickerDimmingType', 'FlickerPhotodetectorSpectralCorrection', 'FlickerSamplingClass', 'FlickerTestChamberType', 'FlickerWaveformFileFormat'],
  },
  {
    id: 'instrumentation',
    title: 'Test conditions and instrumentation',
    members: ['PhotometryBasis', 'PhotometryMethod', 'PhotometryFormat', 'MeasurementRegime', 'GoniometerType', 'LaboratoryAccreditationScheme', 'LaboratoryCertification', 'StabilizationMethod', 'NonstandardConditionFlag', 'FileGenerationType', 'LEDDeviceClass', 'OpticalRadiationBand'],
  },
  {
    id: 'attestation',
    title: 'Attestation and compliance',
    members: ['AttestationProgram', 'AttestationStatus', 'AttestationVerificationType', 'RegulatoryValueType'],
  },
  {
    id: 'provenance',
    title: 'Provenance and data integrity',
    members: ['ProvenanceSource', 'ProvenanceMethod', 'SourceFileType', 'ComparisonOperator', 'ConformanceLevel'],
  },
  {
    id: 'sustainability',
    title: 'Sustainability',
    members: ['SustainabilityDeclarationType', 'IngredientRedListStatus'],
  },
];

function toAnchor(name: string): string {
  return name.toLowerCase();
}

function buildEnum(name: string): TaxonomyEnum | null {
  const def = taxonomyDefs[name];
  if (!def || !Array.isArray(def.enum)) return null;
  return {
    name,
    anchor: toAnchor(name),
    title: def.title ?? name,
    description: def.description ?? '',
    values: def.enum,
    usedBy: [...(usage[name] ?? [])].sort(),
  };
}

export function getTaxonomyGroups(): TaxonomyGroup[] {
  const grouped = new Set<string>();
  const groups: TaxonomyGroup[] = [];

  for (const g of GROUP_DEFS) {
    const enums: TaxonomyEnum[] = [];
    for (const member of g.members) {
      const e = buildEnum(member);
      if (e) {
        enums.push(e);
        grouped.add(member);
      }
    }
    if (enums.length > 0) {
      groups.push({ id: g.id, title: g.title, enums });
    }
  }

  // Any enum not placed above (e.g. a newly added taxonomy) lands here rather
  // than vanishing.
  const leftovers = Object.keys(taxonomyDefs)
    .filter((name) => !grouped.has(name) && Array.isArray(taxonomyDefs[name].enum))
    .sort()
    .map(buildEnum)
    .filter((e): e is TaxonomyEnum => e !== null);
  if (leftovers.length > 0) {
    groups.push({ id: 'other', title: 'Other taxonomies', enums: leftovers });
  }

  return groups;
}

export function getTaxonomyStats(): { enumCount: number; valueCount: number } {
  let enumCount = 0;
  let valueCount = 0;
  for (const def of Object.values(taxonomyDefs)) {
    if (Array.isArray(def.enum)) {
      enumCount += 1;
      valueCount += def.enum.length;
    }
  }
  return { enumCount, valueCount };
}
