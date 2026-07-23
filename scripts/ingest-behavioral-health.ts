/**
 * ingest-behavioral-health.ts
 *
 * Parses the BH demo workbook and emits a seed JSON for ontology building.
 * Case TypeScript fixtures are maintained in data/cases/behavioral-health*.ts
 *
 * Usage: npm run ingest-bh
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { randomUUID } from 'node:crypto';

const ROOT = path.join(__dirname, '..');
const XLSX_PATH = path.join(
  ROOT,
  'docs/demo_workbooks/RCM_Behavioral_Health_Acute_Psychiatry_Denial_Appeal_Demo.xlsx',
);
const OUT = path.join(ROOT, 'data/ontology/_bh-seed.json');

interface SeedEntity {
  id: string;
  label: string;
  category: string;
  type: string;
  summary: string;
  attributes: Record<string, string | number | null>;
  uuid: string;
}

interface SeedRelation {
  id: string;
  source: string;
  target: string;
  relation: string;
}

function entity(
  id: string,
  label: string,
  category: string,
  type: string,
  summary: string,
  attributes: Record<string, string | number | null> = {},
): SeedEntity {
  return { id, label, category, type, summary, attributes, uuid: randomUUID() };
}

function rel(source: string, target: string, relation: string): SeedRelation {
  return { id: `rel_${source}_${target}_${relation}`.slice(0, 80), source, target, relation };
}

async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const patientSheet = XLSX.utils.sheet_to_json<Record<string, string>>(
    wb.Sheets['Patient Summary']!,
    { defval: '' },
  );
  const dxSheet = XLSX.utils.sheet_to_json<Record<string, string>>(
    wb.Sheets['Behavioral Health ICD & Codes']!,
    { defval: '' },
  );

  const entities: SeedEntity[] = [];
  const relations: SeedRelation[] = [];

  const patient = entity(
    'bh_patient_jordan_ellis',
    'Jordan M. Ellis',
    'Patient',
    'BehavioralHealthPatient',
    '38-year-old patient with severe MDD with psychotic features and active suicidal ideation; hero case for BH denial appeal demo.',
    { mrn: 'MRN-64172890', dob: '1987-09-22', gender: 'Non-binary' },
  );
  entities.push(patient);

  const encounter = entity(
    'bh_encounter_0417',
    'ENC-BH-2026-0417',
    'Encounter',
    'AcuteInpatientPsych',
    '8-day acute inpatient psychiatry stay at Lakeshore Behavioral Health Center (05/06–05/14/2026).',
    { los: 8, admission: '2026-05-06', discharge: '2026-05-14' },
  );
  entities.push(encounter);
  relations.push(rel(patient.id, encounter.id, 'HAS_ENCOUNTER'));

  const payer = entity(
    'bh_payer_uhc',
    'UnitedHealthcare Choice Plus PPO',
    'Payer',
    'CommercialPPO',
    'Primary payer for Jordan M. Ellis; denied days 6–8 on CO-50 + BH-LOS-06; overturned on appeal.',
    { member_id: 'UHC-CP-73492018', payer_id: '87726' },
  );
  entities.push(payer);
  relations.push(rel(encounter.id, payer.id, 'BILLED_TO'));

  for (const row of dxSheet) {
    const code = String(row['ICD-10-CM'] ?? row['ICD-10'] ?? '').trim();
    if (!code || code === 'ICD-10-CM' || !/^[A-Z]\d/.test(code)) continue;
    const id = `bh_dx_${code.toLowerCase().replace(/\./g, '_')}`;
    const dx = entity(
      id,
      `${code} — ${String(row['Full Description'] ?? row['Description'] ?? code).slice(0, 60)}`,
      'Diagnosis',
      'ICD10CM',
      String(row['Denial Relevance / Clinical Note'] ?? row['Clinical Note'] ?? `Diagnosis ${code} for ENC-BH-2026-0417.`),
      { code, poa: row['POA'] ?? 'Y', ai_confidence: row['AI Conf'] ?? null },
    );
    entities.push(dx);
    relations.push(rel(encounter.id, id, 'HAS_DIAGNOSIS'));
  }

  const denial = entity(
    'bh_denial_co50',
    'CO-50 / BH-LOS-06',
    'Denial',
    'MedicalNecessityDenial',
    'UnitedHealthcare denied days 6–8 ($10,672.50) citing insufficient continued-stay documentation.',
    { denied_amount: 10672.5, denial_date: '2026-05-22', carc: 'CO-50', payer_reason: 'BH-LOS-06' },
  );
  entities.push(denial);
  relations.push(rel(encounter.id, denial.id, 'DENIED_BY'));

  const appeal = entity(
    'bh_appeal_2026',
    'AI Appeal — Days 6–8 Overturn',
    'Appeal',
    'FirstLevelAppeal',
    'AI Appeal Agent assembled LOCUS/ASAM-grounded packet; UHC overturned 05/28/2026 recovering $10,672.50.',
    { filed: '2026-05-22', outcome: 'OVERTURNED', recovered: 10672.5 },
  );
  entities.push(appeal);
  relations.push(rel(denial.id, appeal.id, 'APPEALED_WITH'));

  // Parse pipeline rows from patient summary sheet
  for (const row of patientSheet) {
    const stage = String(row['RCM Stage'] ?? row['Stage'] ?? '').trim();
    if (!stage || stage === 'RCM Stage') continue;
    const id = `bh_stage_${stage.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    if (entities.some((e) => e.id === id)) continue;
    entities.push(
      entity(id, stage, 'RCMStage', 'PipelineStage', String(row['Key Event / Output'] ?? `RCM stage: ${stage}`), {
        status: row['Status'] ?? 'COMPLETE',
        date: row['Date'] ?? null,
      }),
    );
    relations.push(rel(encounter.id, id, 'PROCESSED_BY'));
  }

  const seed = {
    generatedAt: new Date().toISOString(),
    sourceWorkbook: path.relative(ROOT, XLSX_PATH),
    entityCount: entities.length,
    relationCount: relations.length,
    entities,
    relations,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(seed, null, 2), 'utf8');
  console.log(`✓ Wrote ${entities.length} entities, ${relations.length} relations → ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
