/**
 * build-bh-ontology.ts
 *
 * Merges BH case seed + policy references into canonical ontology JSON.
 *
 * Usage: npm run build-bh-ontology
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const ROOT = path.join(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'data/ontology/_bh-seed.json');
const OUT_PATH = path.join(ROOT, 'data/ontology/behavioral-health.json');
const POLICIES_DIR = path.join(ROOT, 'data/policies');

export type BhCategory =
  | 'Patient'
  | 'Encounter'
  | 'Diagnosis'
  | 'Symptom'
  | 'Payer'
  | 'Policy'
  | 'PolicySection'
  | 'ClinicalCriteria'
  | 'LevelOfCare'
  | 'Assessment'
  | 'Denial'
  | 'Appeal'
  | 'Claim'
  | 'Charge'
  | 'Code'
  | 'Agent'
  | 'RCMStage'
  | 'Payment'
  | 'Provider'
  | 'Facility';

interface OntologyNode {
  id: string;
  label: string;
  category: BhCategory;
  type: string;
  summary: string;
  attributes: Record<string, string | number | null>;
  uuid: string;
}

interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

const nodes: OntologyNode[] = [];
const edges: OntologyEdge[] = [];
const nodeIds = new Set<string>();

function addNode(
  id: string,
  label: string,
  category: BhCategory,
  type: string,
  summary: string,
  attributes: Record<string, string | number | null> = {},
  uuid?: string,
) {
  if (nodeIds.has(id)) return;
  nodeIds.add(id);
  nodes.push({ id, label, category, type, summary, attributes, uuid: uuid ?? randomUUID() });
}

function addEdge(source: string, target: string, relation: string) {
  if (!nodeIds.has(source) || !nodeIds.has(target)) return;
  const id = `edge_${source}_${target}_${relation}`.slice(0, 96);
  if (edges.some((e) => e.id === id)) return;
  edges.push({ id, source, target, relation });
}

function policyExcerptSummary(citation: string, title: string, chunk: string, chunkIndex: number): string {
  const cleaned = chunk
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const excerpt = cleaned.length > 420 ? `${cleaned.slice(0, 420)}…` : cleaned;
  return `${citation} (${title}, excerpt ${chunkIndex}): ${excerpt} This policy language was cited in the Jordan M. Ellis appeal to justify continued acute inpatient psychiatric care and rebut UHC BH-LOS-06.`;
}

function chunkPolicy(slug: string, title: string, citation: string, text: string, maxChunks = 40) {
  const policyId = `bh_policy_${slug.replace(/-/g, '_')}`;
  addNode(
    policyId,
    title,
    'Policy',
    'BehavioralHealthPolicy',
    `${citation} — reference policy for medical necessity and level-of-care decisions in the BH appeal.`,
    { slug, citation },
  );

  // Split on paragraphs, then sentences for dense chunking
  const rawParts = text
    .split(/\n{2,}/)
    .flatMap((p) => p.split(/(?<=[.!?])\s+/))
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  const uniqueParts = [...new Set(rawParts)];
  const step = Math.max(1, Math.floor(uniqueParts.length / maxChunks));
  let chunkIdx = 0;
  for (let i = 0; i < uniqueParts.length && chunkIdx < maxChunks; i += step, chunkIdx++) {
    const chunk = uniqueParts[i]!;
    const sectionId = `${policyId}_sec_${chunkIdx + 1}`;
    addNode(
      sectionId,
      `${title} §${chunkIdx + 1}`,
      'PolicySection',
      'PolicyExcerpt',
      policyExcerptSummary(citation, title, chunk, chunkIdx + 1),
      { policy_slug: slug, chunk_index: chunkIdx + 1, citation },
    );
    addEdge(policyId, sectionId, 'HAS_SECTION');
    addEdge(sectionId, 'bh_appeal_2026', 'CITED_IN');
  }
}

async function loadPolicyText(slug: string): Promise<string> {
  try {
    return await fs.readFile(path.join(POLICIES_DIR, `${slug}.md`), 'utf8');
  } catch {
    return '';
  }
}

function buildCaseSpine() {
  addNode(
    'bh_patient_jordan_ellis',
    'Jordan M. Ellis',
    'Patient',
    'BehavioralHealthPatient',
    '38-year-old patient with severe MDD with psychotic features, active suicidal ideation with plan, and command hallucinations requiring acute inpatient stabilization.',
    { mrn: 'MRN-64172890', dob: '1987-09-22', phq9: 24, cssrs: 'High' },
  );

  addNode(
    'bh_facility_lakeshore',
    'Lakeshore Behavioral Health Center',
    'Facility',
    'AcutePsychiatryHospital',
    'Acute inpatient psychiatric facility in Columbus, OH where Jordan M. Ellis was treated for 8 days.',
    { city: 'Columbus', state: 'OH' },
  );

  addNode(
    'bh_provider_patel',
    'Dr. Maya Patel, MD',
    'Provider',
    'AttendingPsychiatrist',
    'Attending psychiatrist who signed the AI-drafted appeal letter and validated continued-stay medical necessity.',
    { npi: '1928374650', specialty: 'Psychiatry' },
  );

  addNode(
    'bh_encounter_0417',
    'ENC-BH-2026-0417',
    'Encounter',
    'AcuteInpatientPsych',
    '8-day emergency acute inpatient psychiatry admission (05/06–05/14/2026) for severe MDD with psychosis and suicidal ideation.',
    { los: 8, admission: '2026-05-06', discharge: '2026-05-14', legal_status: '72hr hold → voluntary' },
  );

  addNode(
    'bh_payer_uhc',
    'UnitedHealthcare Choice Plus PPO',
    'Payer',
    'CommercialPPO',
    'Primary commercial payer; denied claim on CO-50 + BH-LOS-06; overturned after AI appeal.',
    { member_id: 'UHC-CP-73492018', payer_id: '87726' },
  );

  addNode(
    'bh_auth_77419',
    'UHC-BH-IP-2026-77419',
    'ClinicalCriteria',
    'PriorAuthorization',
    'Initial precert approved days 1–3; partial extension days 4–5; full 8 days validated post-appeal.',
    { auth_number: 'UHC-BH-IP-2026-77419' },
  );

  addNode(
    'bh_claim_0417',
    'UHC-BH-2026-0515-0417',
    'Claim',
    'InstitutionalClaim837I',
    '837I institutional claim for 8-day acute psychiatry stay; initially denied then paid on replacement claim.',
    { icn: 'UHC-BH-2026-0515-0417', billed: 28460 },
  );

  addNode(
    'bh_denial_co50',
    'CO-50 / BH-LOS-06',
    'Denial',
    'MedicalNecessityDenial',
    'Payer denied days 6–8 ($10,672.50) citing insufficient documentation that lower level of care was unsafe.',
    { carc: 'CO-50', payer_reason: 'BH-LOS-06', denied_amount: 10672.5, denial_date: '2026-05-22' },
  );

  addNode(
    'bh_appeal_2026',
    'AI Appeal — Days 6–8 Overturn',
    'Appeal',
    'FirstLevelAppeal',
    'AI Appeal Agent consolidated LOCUS/ASAM evidence and daily risk trends; UHC overturned 05/28/2026.',
    { filed: '2026-05-22', outcome: 'OVERTURNED', recovered: 10672.5, ai_confidence: 0.947 },
  );

  addNode(
    'bh_payment_0602',
    'EFT-UHC-20260602-BH-0417',
    'Payment',
    'ERA835Payment',
    'Replacement claim paid 06/02/2026 — net payer payment $15,653.00 after appeal overturn.',
    { amount: 15653, payment_date: '2026-06-02' },
  );

  addNode(
    'bh_agent_appeal',
    'AI Appeal Agent',
    'Agent',
    'BedrockAppealAgent',
    'Bedrock-powered agent that drafts overturn letters citing payer policy, LOCUS/ASAM criteria, and clinical chronology.',
    { model: 'Claude Opus 4.6', automation_rate: 0.97 },
  );

  addNode(
    'bh_agent_um',
    'AI UM Assist',
    'Agent',
    'UtilizationManagementAgent',
    'Compiles C-SSRS, MSE, medication titration, and observation data for concurrent review submissions.',
    {},
  );

  addEdge('bh_patient_jordan_ellis', 'bh_encounter_0417', 'HAS_ENCOUNTER');
  addEdge('bh_encounter_0417', 'bh_facility_lakeshore', 'TREATED_AT');
  addEdge('bh_encounter_0417', 'bh_provider_patel', 'ATTENDED_BY');
  addEdge('bh_encounter_0417', 'bh_payer_uhc', 'BILLED_TO');
  addEdge('bh_encounter_0417', 'bh_auth_77419', 'AUTHORIZED_BY');
  addEdge('bh_encounter_0417', 'bh_claim_0417', 'SUBMITTED_AS');
  addEdge('bh_claim_0417', 'bh_denial_co50', 'DENIED_BY');
  addEdge('bh_denial_co50', 'bh_appeal_2026', 'APPEALED_WITH');
  addEdge('bh_appeal_2026', 'bh_agent_appeal', 'GENERATED_BY');
  addEdge('bh_appeal_2026', 'bh_payment_0602', 'RESULTED_IN');
  addEdge('bh_encounter_0417', 'bh_agent_um', 'REVIEWED_BY');

  const diagnoses = [
    ['F33.3', 'Major depressive disorder, recurrent, severe with psychotic symptoms', 'Principal diagnosis supporting acute inpatient level'],
    ['R45.851', 'Suicidal ideations', 'Active plan and intent — central appeal evidence'],
    ['F41.1', 'Generalized anxiety disorder', 'Contributed to agitation and impaired coping'],
    ['G47.00', 'Insomnia, unspecified', 'Sleep loss worsened psychosis and suicidality'],
    ['Z91.51', 'Personal history of suicidal behavior', 'Prior attempt increased continued-stay risk'],
    ['Z63.4', 'Disappearance and death of family member', 'Recent bereavement — precipitating factor'],
    ['Z56.6', 'Other physical and mental strain related to work', 'Employment stress contributed to decompensation'],
    ['I10', 'Essential hypertension', 'Monitored during antipsychotic titration'],
    ['E66.9', 'Obesity, unspecified', 'Metabolic risk during antipsychotic therapy'],
    ['Z79.899', 'Long-term use of other medications', 'Medication reconciliation support'],
    ['Z60.2', 'Problems related to living alone', 'Discharge safety barrier — PHP planning'],
    ['Z91.148', 'Other nonadherence to medication regimen', 'Medication lapse preceded admission'],
    ['Z62.810', 'Personal history of physical and sexual abuse in childhood', 'Trauma factor — consent-gated documentation'],
  ];

  for (const [code, desc, note] of diagnoses) {
    const id = `bh_dx_${code.toLowerCase().replace(/\./g, '_')}`;
    addNode(id, `${code}`, 'Diagnosis', 'ICD10CM', `${desc}. ${note}`, { code, description: desc });
    addEdge('bh_encounter_0417', id, 'HAS_DIAGNOSIS');
    addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
  }

  addNode(
    'bh_symptom_command_ah',
    'Command Auditory Hallucinations',
    'Symptom',
    'PsychoticSymptom',
    'Patient endorsed command auditory hallucinations at admission requiring 24/7 psychiatric monitoring.',
    {},
  );
  addEdge('bh_encounter_0417', 'bh_symptom_command_ah', 'PRESENTS_WITH');
  addEdge('bh_appeal_2026', 'bh_symptom_command_ah', 'CITES_EVIDENCE');

  const codes = [
    ['0124', 'Revenue', 'Psychiatry room & board'],
    ['99223', 'CPT', 'Initial hospital care — high complexity'],
    ['99233', 'CPT', 'Subsequent hospital care — high complexity'],
    ['90792', 'CPT', 'Psychiatric diagnostic evaluation with medical services'],
    ['0914', 'Revenue', 'Group psychotherapy — inpatient'],
  ];

  for (const [code, kind, desc] of codes) {
    const id = `bh_code_${code}`;
    addNode(id, `${code} — ${desc}`, 'Code', kind, `${kind} code used on claim UHC-BH-2026-0515-0417.`, { code, kind });
    addEdge('bh_claim_0417', id, 'CONTAINS_CODE');
  }

  for (let day = 1; day <= 8; day++) {
    const id = `bh_charge_day_${day}`;
    const denied = day >= 6;
    addNode(
      id,
      `Psych R&B — Day ${day}`,
      'Charge',
      'RoomAndBoard',
      `Acute inpatient psychiatry room & board day ${day}${denied ? ' (initially denied BH-LOS-06)' : ''}.`,
      { day, rev_code: '0124', amount: 1850, denied: denied ? 'yes' : 'no' },
    );
    addEdge('bh_claim_0417', id, 'HAS_CHARGE_LINE');
    if (denied) addEdge(id, 'bh_denial_co50', 'AFFECTED_BY');

    const mseId = `bh_mse_day_${day}`;
    addNode(
      mseId,
      `Daily MSE — Day ${day}`,
      'Assessment',
      'MentalStatusExam',
      `Structured mental status examination for inpatient day ${day} documenting mood, affect, thought process, and risk.`,
      { day },
    );
    addEdge('bh_encounter_0417', mseId, 'DOCUMENTED_IN');
    addEdge('bh_appeal_2026', mseId, 'CITES_EVIDENCE');
  }

  const refCodes: Array<[string, string, string]> = [
    ['CO-50', 'CARC', 'Claim Adjustment Reason Code CO-50 — payer determined services were not medically necessary; mapped to UHC behavioral health continued-stay denial on days 6–8.'],
    ['BH-LOS-06', 'PayerReason', 'UnitedHealthcare proprietary reason BH-LOS-06 — insufficient documentation that lower level of care was unsafe for continued inpatient psychiatric days.'],
    ['PR-2', 'RARC', 'Remittance Advice Remark Code PR-2 — coinsurance amount applied to patient responsibility after payer allowed amount on the overturned claim.'],
    ['CO-45', 'CARC', 'Claim Adjustment Reason Code CO-45 — charge exceeds fee schedule or maximum allowable; contractual write-off separate from medical-necessity denial.'],
  ];
  for (const [code, kind, summary] of refCodes) {
    const id = `bh_ref_${code.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    addNode(id, code, 'Code', kind, summary, { code, kind });
    if (code.startsWith('CO') || code.startsWith('BH')) {
      addEdge('bh_denial_co50', id, 'USES_CODE');
    }
  }

  const agents: Array<[string, string, string]> = [
    [
      'bh_agent_elig',
      'AI Eligibility Bot',
      'Runs 270/271 eligibility verification at admission for UnitedHealthcare Choice Plus PPO, confirming active coverage and BH inpatient benefits before precert.',
    ],
    [
      'bh_agent_cdi',
      'AI BH CDI Assist',
      'Reviews psychiatric documentation for completeness — flags bereavement (Z63.4), trauma history, and continued-stay rationale gaps that could trigger BH-LOS denials.',
    ],
    [
      'bh_agent_coder',
      'AI Auto-Coder',
      'Assigns ICD-10-CM and CPT codes on the 837I with 98.4% confidence, including principal diagnosis F33.3 and high-complexity E/M levels.',
    ],
    [
      'bh_agent_scrubber',
      'AI Claim Scrubber',
      'Validates the institutional claim against 12 edits (NDC, rev/CPT pairing, POA, auth linkage) before submission to the clearinghouse.',
    ],
    [
      'bh_agent_denial',
      'AI Denial Engine',
      'Classifies the CO-50 + BH-LOS-06 denial root cause and routes the case to the Appeal Agent with policy and clinical evidence recommendations.',
    ],
    [
      'bh_agent_era',
      'AI ERA Processor',
      'Parses the 835 remittance after appeal overturn and auto-posts the $15,653 replacement payment with PR-2 coinsurance split.',
    ],
    [
      'bh_agent_finnav',
      'AI Financial Navigator',
      'Offers payment plan, financial assistance, and EAP referrals after payer recovery — coordinates patient balance counseling.',
    ],
  ];
  for (const [id, label, summary] of agents) {
    addNode(id, label, 'Agent', 'RCMAgent', summary, {});
    addEdge('bh_encounter_0417', id, 'PROCESSED_BY');
  }

  const locLevels: Array<[string, string, string]> = [
    ['ASAM_L1', 'ASAM Level 1 — Outpatient', 'Outpatient psychiatric services for stable patients who do not require 24-hour monitoring — insufficient for Jordan M. Ellis at admission.'],
    ['ASAM_L2', 'ASAM Level 2 — Intensive Outpatient', 'IOP/PHP-level services (typically 9–20 hrs/week). Patient acuity exceeded this due to active suicidal plan and command hallucinations.'],
    ['ASAM_L3', 'ASAM Level 3 — Residential', 'Residential treatment with structured milieu but without 24/7 physician-directed care — ruled out given psychosis and 1:1 observation need.'],
    ['ASAM_L4', 'ASAM Level 4 — Medically Managed Intensive Inpatient', '24/7 physician-directed acute inpatient psychiatry — the justified level for Jordan M. Ellis days 1–8 per ASAM Dimension 3 acuity.'],
    ['LOCUS_0', 'LOCUS Level 0 — Recovery Maintenance', 'Lowest LOCUS acuity — maintenance and recovery support only; not appropriate for active SI with plan.'],
    ['LOCUS_1', 'LOCUS Level 1 — Low Intensity Community', 'Community-based outpatient support with minimal clinical intensity — insufficient given admission C-SSRS High risk.'],
    ['LOCUS_2', 'LOCUS Level 2 — Outpatient', 'Standard outpatient psychiatric care — could not safely manage command hallucinations or medication titration.'],
    ['LOCUS_3', 'LOCUS Level 3 — Intensive Outpatient', 'IOP-level care — patient required inpatient observation and antipsychotic titration beyond IOP capacity.'],
    ['LOCUS_4', 'LOCUS Level 4 — Partial Hospitalization', 'PHP considered at discharge planning but ruled unsafe due to living alone (Z60.2) and medication nonadherence history.'],
    ['LOCUS_5', 'LOCUS Level 5 — Medically Monitored Residential', 'Residential with nursing monitoring — below the acuity threshold for active psychosis and suicidal ideation days 1–7.'],
    ['LOCUS_6', 'LOCUS Level 6 — Medically Managed Inpatient', 'Acute medically managed inpatient psychiatry — matched patient acuity throughout the 8-day stay and cited in the overturn appeal.'],
  ];

  for (const [id, label, summary] of locLevels) {
    addNode(id, label, 'LevelOfCare', 'LevelOfCareCriteria', summary, {});
  }
  addEdge('bh_encounter_0417', 'ASAM_L4', 'REQUIRES_LOC');
  addEdge('bh_encounter_0417', 'LOCUS_6', 'REQUIRES_LOC');
  addEdge('LOCUS_4', 'bh_encounter_0417', 'RULED_OUT_FOR');

  const assessments: Array<[string, string, string]> = [
    ['bh_assess_phq9', 'PHQ-9 Score 24', 'Patient Health Questionnaire-9 scored 24 at admission indicating severe depression — supports medical necessity for acute inpatient stabilization.'],
    ['bh_assess_cssrs_admit', 'C-SSRS — Admission', 'Columbia Suicide Severity Rating Scale at admission: High risk with active ideation, intent, and plan — triggered 1:1 observation.'],
    ['bh_assess_cssrs_d3', 'C-SSRS — Day 3', 'Day 3 C-SSRS remained High — command auditory hallucinations persisted despite olanzapine initiation; continued inpatient care required.'],
    ['bh_assess_cssrs_d5', 'C-SSRS — Day 5', 'Day 5 C-SSRS Moderate-High — medication titration ongoing; patient not yet safe for step-down despite partial UM extension.'],
    ['bh_assess_cssrs_d7', 'C-SSRS — Day 7', 'Day 7 C-SSRS Moderate — still required Q15 observation; payer denial of days 6–8 contradicted documented risk trend.'],
    ['bh_assess_cssrs_dc', 'C-SSRS — Discharge', 'Discharge C-SSRS Low with safety plan and PHP arranged — demonstrates appropriate step-down only after acute stabilization.'],
    ['bh_assess_mse_daily', 'Daily MSE Documentation', 'Structured mental status examinations documented mood, affect, thought process, perception, and risk for all 8 inpatient days — core appeal evidence bundle.'],
  ];

  for (const [id, label, summary] of assessments) {
    addNode(id, label, 'Assessment', 'ClinicalAssessment', summary, {});
    addEdge('bh_encounter_0417', id, 'DOCUMENTED_IN');
    addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
  }

  const stages = [
    'registration', 'eligibility', 'priorAuth', 'cdi', 'charge', 'coding', 'claim', 'denial', 'payment',
  ];
  for (const s of stages) {
    const id = `bh_rcm_${s}`;
    addNode(id, s, 'RCMStage', 'RCMWorkflowStage', `RCM pipeline stage: ${s} for ENC-BH-2026-0417.`, { stage_id: s });
    addEdge('bh_encounter_0417', id, 'PROCESSED_BY');
  }

  const criteriaNodes = [
    ['bh_crit_active_si', 'Active Suicidal Ideation with Plan', 'Patient had active suicidal plan requiring 24/7 monitoring through day 7'],
    ['bh_crit_psychosis', 'Psychotic Symptoms Requiring Titration', 'Command hallucinations and psychosis required inpatient medication management'],
    ['bh_crit_php_unsafe', 'PHP Unsafe — Discharge Barrier', 'Partial hospitalization unsafe due to living alone and prior nonadherence'],
    ['bh_crit_med_titration', 'Antipsychotic Titration with QTc Monitoring', 'Olanzapine titration required labs and physician oversight days 4–7'],
    ['bh_crit_continued_stay', 'Continued Stay Medical Necessity Days 6–8', 'Consolidated rationale for days 6–8 that payer initially denied'],
  ];

  for (const [id, label, summary] of criteriaNodes) {
    addNode(id, label, 'ClinicalCriteria', 'MedicalNecessityCriterion', summary, {});
    addEdge('bh_appeal_2026', id, 'ASSERTS');
    addEdge(id, 'ASAM_L4', 'SUPPORTS_LOC');
  }
}

/** Expand graph to demo density (~200+ nodes) — ASAM/LOCUS dimensions, line items, UM, meds, docs. */
function buildExpandedClusters() {
  // ASAM six dimensions + sub-criteria
  const asamDims = [
    ['Dim1_AcuteIntox', 'Dimension 1 — Acute Intoxication/Withdrawal', 'No active withdrawal; benzodiazepine PRN available'],
    ['Dim1_Risk', 'Dimension 1 — Withdrawal Risk', 'Low withdrawal risk at admission'],
    ['Dim2_Biomed', 'Dimension 2 — Biomedical Conditions', 'HTN and obesity require monitoring during antipsychotic titration'],
    ['Dim2_Labs', 'Dimension 2 — Lab Monitoring', 'CMP and QTc monitoring during olanzapine increase'],
    ['Dim3_Emotional', 'Dimension 3 — Emotional/Behavioral', 'Severe MDD with psychotic features; PHQ-9 24'],
    ['Dim3_Psychosis', 'Dimension 3 — Psychosis Acuity', 'Command hallucinations days 1–4'],
    ['Dim4_Readiness', 'Dimension 4 — Readiness to Change', 'Limited insight days 1–3; improving by day 6'],
    ['Dim4_Motivation', 'Dimension 4 — Treatment Engagement', 'Participated in group therapy days 4–8'],
    ['Dim5_Relapse', 'Dimension 5 — Relapse Potential', 'Prior suicide attempt; medication nonadherence history'],
    ['Dim5_Support', 'Dimension 5 — Recovery Environment', 'Lives alone; bereavement trigger documented'],
    ['Dim6_Recovery', 'Dimension 6 — Recovery Environment', 'Family support via Avery Ellis; employer EAP eligible'],
    ['Dim6_Discharge', 'Dimension 6 — Discharge Planning', 'PHP arranged; safety plan required before discharge'],
  ];
  for (const [id, label, summary] of asamDims) {
    addNode(`bh_asam_${id}`, label, 'ClinicalCriteria', 'ASAMDimension', summary, { framework: 'ASAM' });
    addEdge('ASAM_L4', `bh_asam_${id}`, 'INCLUDES_CRITERION');
    addEdge('bh_appeal_2026', `bh_asam_${id}`, 'CITES_EVIDENCE');
    addEdge(`bh_asam_${id}`, 'bh_policy_bh_asam_loc', 'GROUNDED_BY');
  }

  // LOCUS seven evaluation parameters
  const locusParams = [
    ['RiskHarm', 'Risk of Harm', 'Active suicidal plan; command hallucinations'],
    ['Functional', 'Functional Status', 'Severely impaired self-care and sleep days 1–5'],
    ['Comorbidity', 'Medical Comorbidity', 'HTN, obesity, antipsychotic metabolic risk'],
    ['Recovery', 'Recovery Environment', 'Lives alone; unsafe without 24/7 monitoring days 1–7'],
    ['Treatment', 'Treatment History', 'Medication nonadherence preceded decompensation'],
    ['Engagement', 'Engagement & Recovery', 'Limited engagement days 1–2; improved days 5–8'],
    ['Acceptance', 'Acceptance & Engagement', 'Voluntary status after hold; family involved in planning'],
  ];
  for (const [id, label, summary] of locusParams) {
    addNode(`bh_locus_param_${id}`, `LOCUS — ${label}`, 'ClinicalCriteria', 'LOCUSParameter', summary, { framework: 'LOCUS' });
    addEdge('LOCUS_6', `bh_locus_param_${id}`, 'EVALUATED_ON');
    addEdge('bh_appeal_2026', `bh_locus_param_${id}`, 'CITES_EVIDENCE');
  }

  // Per-day C-SSRS + observation level
  for (let day = 1; day <= 8; day++) {
    const risk = day <= 2 ? 'High' : day <= 5 ? 'Moderate-High' : day <= 7 ? 'Moderate' : 'Low';
    const cssrsId = `bh_cssrs_day_${day}`;
    addNode(
      cssrsId,
      `C-SSRS Day ${day}`,
      'Assessment',
      'ColumbiaSuicideRating',
      `C-SSRS risk level ${risk} on inpatient day ${day}.`,
      { day, risk_level: risk },
    );
    addEdge('bh_encounter_0417', cssrsId, 'DOCUMENTED_IN');
    addEdge('bh_appeal_2026', cssrsId, 'CITES_EVIDENCE');
    addEdge(cssrsId, `bh_mse_day_${day}`, 'CORROBORATES');

    const obsId = `bh_obs_level_day_${day}`;
    const obs = day <= 4 ? '1:1' : day <= 7 ? 'Q15' : 'General';
    addNode(
      obsId,
      `Observation Level — Day ${day}`,
      'Assessment',
      'ObservationLevel',
      `Nursing observation level ${obs} on day ${day}.`,
      { day, level: obs },
    );
    addEdge('bh_encounter_0417', obsId, 'DOCUMENTED_IN');
    if (day >= 6) addEdge(obsId, 'bh_crit_continued_stay', 'SUPPORTS');
  }

  // Medications + monitoring
  const meds = [
    ['olanzapine', 'Olanzapine', 'Antipsychotic titrated days 2–6; QTc monitoring'],
    ['lorazepam', 'Lorazepam PRN', 'Anxiolytic for agitation days 1–4'],
    ['trazodone', 'Trazodone', 'Sleep aid; insomnia G47.00'],
    ['sertraline', 'Sertraline (home med)', 'SSRI held on admission; reconciled at discharge'],
  ];
  for (const [slug, label, summary] of meds) {
    const id = `bh_med_${slug}`;
    addNode(id, label, 'Symptom', 'PsychotropicMedication', summary, { medication: slug });
    addEdge('bh_encounter_0417', id, 'TREATED_WITH');
    if (slug === 'olanzapine') addEdge(id, 'bh_crit_med_titration', 'REQUIRES');
  }

  const labs = [
    ['cmp', 'CMP', '80053', 'Metabolic monitoring'],
    ['tsh', 'TSH', '84443', 'Thyroid function'],
    ['uds', 'Urine Drug Screen', '80307', 'Admission screen negative'],
    ['qtc', 'QTc Interval', 'EKG', 'Cardiac monitoring during olanzapine'],
  ];
  for (const [slug, label, code, summary] of labs) {
    const id = `bh_lab_${slug}`;
    addNode(id, label, 'Assessment', 'LaboratoryOrder', summary, { code });
    addEdge('bh_encounter_0417', id, 'ORDERED');
    addEdge('bh_med_olanzapine', id, 'MONITORED_BY');
  }

  // Additional charge lines (beyond daily R&B)
  const chargeLines = [
    ['009', '99223', 'Initial hospital care', 420],
    ['010', '99233', 'Subsequent hospital care ×7', 2800],
    ['011', '90792', 'Psychiatric diagnostic evaluation', 380],
    ['012', '0914', 'Group psychotherapy ×6', 720],
    ['013', '80053', 'CMP ×2', 220],
    ['014', '84443', 'TSH', 95],
    ['015', '80307', 'UDS', 85],
    ['016', 'Pharmacy', 'Inpatient psychotropics', 890],
  ];
  for (const [line, code, desc, amount] of chargeLines) {
    const id = `bh_charge_line_${line}`;
    addNode(id, `Line ${line} — ${desc}`, 'Charge', 'ClaimLineItem', `${desc} ($${amount}) on claim UHC-BH-2026-0515-0417.`, { line, code, amount });
    addEdge('bh_claim_0417', id, 'HAS_CHARGE_LINE');
  }

  // UM / prior auth timeline events
  const umEvents = [
    ['UM-01', '05/06/2026', 'Emergency admission notification', 'SUBMITTED'],
    ['UM-02', '05/06/2026', 'Initial precert days 1–3 approved', 'APPROVED'],
    ['UM-03', '05/09/2026', 'Concurrent review submitted', 'SUBMITTED'],
    ['UM-04', '05/10/2026', 'Partial extension days 4–5', 'PARTIAL'],
    ['UM-05', '05/15/2026', 'Documentation gap alert', 'ALERT'],
    ['UM-06', '05/28/2026', 'Retrospective appeal approved full stay', 'APPROVED'],
  ];
  for (const [step, date, event, status] of umEvents) {
    const id = `bh_um_${step.toLowerCase()}`;
    addNode(id, event, 'ClinicalCriteria', 'UMEvent', `${event} (${date}). Status: ${status}.`, { step, date, status });
    addEdge('bh_auth_77419', id, 'UM_TIMELINE');
    addEdge('bh_encounter_0417', id, 'REVIEWED_DURING');
    if (status === 'PARTIAL' || status === 'ALERT') addEdge(id, 'bh_denial_co50', 'PRECURSOR_TO');
  }

  // Appeal packet documents
  const appealDocs = [
    ['cover', 'Appeal Cover Letter', 'AI-generated medical necessity summary'],
    ['chronology', 'Clinical Chronology Days 1–8', 'Day-by-day MSE and C-SSRS trend'],
    ['mse_bundle', 'Daily MSE Bundle', '8 daily mental status examinations'],
    ['cssrs_bundle', 'C-SSRS Trend Report', 'Admission through discharge risk scores'],
    ['med_list', 'Medication Administration Record', 'Olanzapine titration and PRN lorazepam'],
    ['obs_log', 'Observation Level Log', '1:1 and Q15 observation documentation'],
    ['discharge', 'Discharge Summary', 'PHP referral and safety plan'],
    ['loc_asam', 'LOCUS/ASAM Level Justification', 'Level 4/6 criteria mapping'],
    ['attestation', 'Psychiatrist Attestation', 'Dr. Patel sign-off 05/22/2026'],
  ];
  for (const [slug, label, summary] of appealDocs) {
    const id = `bh_appeal_doc_${slug}`;
    addNode(id, label, 'ClinicalCriteria', 'AppealDocument', summary, { document_type: slug });
    addEdge('bh_appeal_2026', id, 'INCLUDES');
    addEdge('bh_agent_appeal', id, 'ATTACHED');
  }

  // Care team providers
  const providers = [
    ['brooks', 'Dr. Lena Brooks, MD', 'PCP', 'Primary care — referral source'],
    ['kim', 'Daniel Kim, LCSW', 'CaseManager', 'Concurrent review coordinator'],
    ['reyes', 'Monica Reyes, RN', 'BHNavigator', 'UHC behavioral health navigator'],
    ['ellis', 'Avery Ellis', 'EmergencyContact', 'Emergency contact and discharge support'],
  ];
  for (const [slug, label, role, summary] of providers) {
    const id = `bh_provider_${slug}`;
    addNode(id, label, 'Provider', role, summary, { role });
    addEdge('bh_patient_jordan_ellis', id, 'CARE_TEAM');
    addEdge('bh_encounter_0417', id, 'INVOLVED_IN');
  }

  // Additional symptoms / clinical findings
  const symptoms = [
    ['agitation', 'Severe Agitation', 'Required PRN lorazepam days 1–3'],
    ['insomnia', 'Severe Insomnia', 'G47.00 — sleep deprivation worsened psychosis'],
    ['anhedonia', 'Anhedonia', 'Marked loss of interest; PHQ-9 item elevated'],
    ['psychomotor', 'Psychomotor Retardation', 'Observed on admission MSE'],
    ['affect_flat', 'Flat Affect', 'Documented days 1–4; improving day 7'],
    ['hopelessness', 'Hopelessness', 'Contributed to suicidal ideation'],
    ['bereavement', 'Acute Bereavement', 'Z63.4 precipitating psychosocial stressor'],
  ];
  for (const [slug, label, summary] of symptoms) {
    const id = `bh_symptom_${slug}`;
    addNode(id, label, 'Symptom', 'ClinicalFinding', summary, {});
    addEdge('bh_encounter_0417', id, 'PRESENTS_WITH');
    addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
  }

  // EDI / transaction nodes
  const edi = [
    ['270', '270 Eligibility Inquiry', '05/06/2026 admission verification'],
    ['271', '271 Eligibility Response', 'ACTIVE coverage confirmed'],
    ['837i', '837I Institutional Claim', 'Submitted 05/15/2026'],
    ['835_denied', '835 ERA — Initial Denial', 'CO-50 + BH-LOS-06 posted 05/22'],
    ['835_paid', '835 ERA — Post-Appeal Payment', 'EFT $15,653.00 06/02/2026'],
    ['999', '999 Acknowledgment', 'Claim accepted by clearinghouse'],
  ];
  for (const [slug, label, summary] of edi) {
    const id = `bh_edi_${slug}`;
    addNode(id, label, 'Claim', 'EDITransaction', summary, { transaction: slug });
    addEdge('bh_encounter_0417', id, 'EXCHANGED');
    if (slug.includes('835_denied')) addEdge(id, 'bh_denial_co50', 'REPORTED');
    if (slug.includes('835_paid')) addEdge(id, 'bh_payment_0602', 'REPORTED');
  }

  // RCM stage substeps (2–3 per stage)
  const stageSubsteps: Record<string, string[]> = {
    registration: ['ADT intake', 'Insurance OCR', 'Hold documentation'],
    eligibility: ['270 outbound', '271 parse', 'Benefit extraction'],
    priorAuth: ['Emergency notification', 'Concurrent review', 'Partial extension'],
    cdi: ['NER extraction', 'CDI query Z63.4', 'Trauma history flag'],
    charge: ['LOS validation', 'MAR reconciliation', 'NDC verify'],
    coding: ['Principal DX F33.3', 'CPT MDM review', 'POA assignment'],
    claim: ['837I build', 'Scrub 12 edits', '999 ACK'],
    denial: ['835 parse', 'Root-cause classify', 'Appeal draft'],
    payment: ['835 post', 'Coinsurance calc', 'Patient statement'],
  };
  for (const [stage, steps] of Object.entries(stageSubsteps)) {
    const stageId = `bh_rcm_${stage}`;
    steps.forEach((step, i) => {
      const id = `bh_rcm_${stage}_step_${i + 1}`;
      addNode(id, step, 'RCMStage', 'StageSubstep', `${step} within ${stage} for ENC-BH-2026-0417.`, { parent_stage: stage });
      addEdge(stageId, id, 'HAS_SUBSTEP');
      addEdge('bh_encounter_0417', id, 'PROCESSED_BY');
    });
  }

  // Financial / patient programs
  const programs = [
    ['payment_plan', '0% APR Payment Plan', '6/12/18 month options'],
    ['fin_assist', 'Hospital Financial Assistance', 'Sliding scale up to 60%'],
    ['eap', 'Employer EAP', 'Northstar Digital — 6 counseling visits'],
    ['nami', 'NAMI Franklin County', 'Peer support referral'],
    ['uhc_cm', 'UHC BH Case Management', 'Post-discharge navigation'],
  ];
  for (const [slug, label, summary] of programs) {
    const id = `bh_program_${slug}`;
    addNode(id, label, 'Payment', 'FinancialProgram', summary, {});
    addEdge('bh_patient_jordan_ellis', id, 'ENROLLED_IN');
    addEdge('bh_payment_0602', id, 'OFFERED_AFTER');
  }

  // Cross-link LOC levels in hierarchy
  for (let i = 0; i <= 5; i++) {
    addEdge(`LOCUS_${i}`, `LOCUS_${i + 1}`, 'ESCALATES_TO');
  }
  for (let i = 1; i <= 3; i++) {
    addEdge(`ASAM_L${i}`, `ASAM_L${i + 1}`, 'ESCALATES_TO');
  }

  // Link diagnoses to symptoms and criteria
  addEdge('bh_dx_f33_3', 'bh_symptom_command_ah', 'MANIFESTS_AS');
  addEdge('bh_dx_r45_851', 'bh_crit_active_si', 'SUPPORTS');
  addEdge('bh_dx_z60_2', 'bh_crit_php_unsafe', 'SUPPORTS');
  addEdge('bh_dx_z91_148', 'bh_crit_php_unsafe', 'SUPPORTS');
  addEdge('bh_dx_z63_4', 'bh_symptom_bereavement', 'MANIFESTS_AS');
}

/** Grow graph to ~target node count with clinical corpus + payer rule atoms. */
function buildToTargetCount(target: number) {
  const spineIds = [
    'bh_encounter_0417',
    'bh_appeal_2026',
    'bh_denial_co50',
    'bh_patient_jordan_ellis',
    'bh_claim_0417',
    'bh_auth_77419',
  ];

  const mseDomains = ['Mood', 'Affect', 'Thought', 'Perception', 'Cognition', 'Insight', 'Judgment', 'Risk'];
  const shifts = ['Day', 'Evening', 'Night'];

  // Nursing / progress notes: 8 days × 3 shifts × 8 domains
  for (let day = 1; day <= 8; day++) {
    for (const shift of shifts) {
      for (const domain of mseDomains) {
        if (nodes.length >= target) return;
        const id = `bh_progress_${day}_${shift.toLowerCase()}_${domain.toLowerCase()}`;
        addNode(
          id,
          `${domain} — Day ${day} ${shift}`,
          'Assessment',
          'ProgressNoteEntry',
          `${domain} assessment on day ${day} ${shift.toLowerCase()} shift: documented mood, cognition, risk, and behavioral observations for Jordan M. Ellis. ${day >= 6 ? 'Supports continued-stay medical necessity for the denied days 6–8.' : 'Part of the clinical chronology submitted with the appeal packet.'}`,
          { day, shift, domain },
        );
        addEdge('bh_encounter_0417', id, 'DOCUMENTED_IN');
        addEdge(`bh_mse_day_${day}`, id, 'DETAIL_OF');
        if (day >= 6) addEdge(id, 'bh_crit_continued_stay', 'SUPPORTS');
        if (day >= 5) addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
      }
    }
  }

  // Group therapy & milieu events
  const groupTopics = [
    'Coping skills', 'Grief processing', 'Sleep hygiene', 'Safety planning',
    'Medication education', 'Relapse prevention', 'Anxiety management', 'Discharge prep',
  ];
  for (let session = 1; session <= 12; session++) {
    if (nodes.length >= target) return;
    const topic = groupTopics[(session - 1) % groupTopics.length]!;
    const id = `bh_group_session_${session}`;
    addNode(
      id,
      `Group Therapy Session ${session}`,
      'Assessment',
      'GroupTherapySession',
      `Inpatient group psychotherapy session ${session} on topic "${topic}" — patient participated in therapeutic milieu activities billed under rev code 0914. Documentation demonstrates engagement and treatment response during the 8-day stay.`,
      { session, topic },
    );
    addEdge('bh_encounter_0417', id, 'DOCUMENTED_IN');
    addEdge(id, 'bh_charge_line_012', 'BILLED_AS');
    addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
  }

  // PHQ-9 item-level nodes
  const phq9Items = [
    'Anhedonia', 'Depressed mood', 'Sleep disturbance', 'Fatigue', 'Appetite change',
    'Guilt/worthlessness', 'Concentration difficulty', 'Psychomotor change', 'Suicidal thoughts',
  ];
  phq9Items.forEach((item, i) => {
    if (nodes.length >= target) return;
    const id = `bh_phq9_item_${i + 1}`;
    addNode(id, `PHQ-9: ${item}`, 'Assessment', 'PHQ9Item', `PHQ-9 item "${item}" was marked elevated at admission contributing to the total score of 24 (severe depression). This symptom domain supported acute inpatient level-of-care assignment and appeal medical-necessity arguments.`, { item_index: i + 1 });
    addEdge('bh_assess_phq9', id, 'COMPOSED_OF');
    addEdge('bh_encounter_0417', id, 'DOCUMENTED_IN');
    addEdge('bh_dx_f33_3', id, 'SUPPORTS');
  });

  // UHC payer rule atoms
  const uhcRules = [
    'Concurrent review within 72 hours', 'Medical necessity documentation standard',
    'Continued stay requires lower-LOC unsafe statement', 'Emergency admission notification 24h',
    'Appeal deadline 180 days', 'Single case agreement criteria', 'Medical director review threshold',
    'BH-LOS continued stay code family', 'CO-50 medical necessity mapping', 'InterQual BH IP criteria',
    'LOCUS score threshold for IP', 'ASAM Level 4 IP criteria', 'PHP step-down requirements',
    'Observation vs inpatient distinction', 'One-to-one observation documentation',
  ];
  for (let i = 0; i < 80; i++) {
    if (nodes.length >= target) return;
    const rule = uhcRules[i % uhcRules.length]!;
    const id = `bh_uhc_rule_${i + 1}`;
    addNode(
      id,
      `UHC Rule ${i + 1}: ${rule}`,
      'Policy',
      'PayerRuleAtom',
      `UnitedHealthcare behavioral health utilization management rule: ${rule}. Applied during concurrent review and denial analysis for ENC-BH-2026-0417; referenced when mapping CO-50/BH-LOS-06 to appeal strategy.`,
      { rule_index: i + 1, rule },
    );
    addEdge('bh_payer_uhc', id, 'PUBLISHES');
    addEdge('bh_denial_co50', id, 'APPLIED');
    if (i % 3 === 0) addEdge('bh_appeal_2026', id, 'CITES_POLICY');
    if (i % 5 === 0) addEdge(id, 'bh_policy_bh_medical_necessity', 'DERIVED_FROM');
  }

  // Clinical evidence atoms linked to appeal
  const evidenceTemplates: Array<[string, string]> = [
    ['Documented active suicidal plan on day {d}', 'Nursing and psychiatry notes documented active suicidal ideation with plan — supports continued-stay medical necessity.'],
    ['Command hallucinations noted day {d}', 'Patient endorsed command auditory hallucinations requiring 24/7 psychiatric monitoring and antipsychotic management.'],
    ['1:1 observation maintained day {d}', 'One-to-one nursing observation maintained due to elopement and self-harm risk — lower LOC could not replicate this safety level.'],
    ['Medication adjustment day {d}', 'Psychotropic medication titration (olanzapine/lorazepam) required physician oversight and lab monitoring unavailable in outpatient settings.'],
    ['Family meeting day {d}', 'Family meeting documented psychosocial stressors, discharge barriers, and need for continued inpatient stabilization before PHP transition.'],
    ['Sleep disturbance day {d}', 'Severe insomnia (G47.00) documented — sleep deprivation worsened psychosis and suicide risk during the inpatient course.'],
    ['Agitation event day {d}', 'Agitation episode managed with PRN lorazepam — demonstrates ongoing behavioral acuity requiring inpatient milieu and medication access.'],
    ['PHP deemed unsafe day {d}', 'Clinical team documented that partial hospitalization remained unsafe due to living alone and medication nonadherence history.'],
  ];
  let evIdx = 0;
  for (let day = 1; day <= 8; day++) {
    for (const [tmpl, detail] of evidenceTemplates) {
      if (nodes.length >= target) return;
      evIdx++;
      const id = `bh_evidence_${evIdx}`;
      const headline = tmpl.replace('{d}', String(day));
      const summary = `Inpatient day ${day}: ${headline}. ${detail} Cited in the AI appeal packet to overturn UHC denial of days 6–8 ($10,672.50).`;
      addNode(id, headline, 'ClinicalCriteria', 'AppealEvidenceAtom', summary, { day, evidence_index: evIdx });
      addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
      addEdge(`bh_mse_day_${day}`, id, 'SUPPORTS');
      addEdge(id, spineIds[evIdx % spineIds.length]!, 'RELATED_TO');
    }
  }

  // DSM-5-TR crosswalk nodes for each diagnosis
  const dsmMap: Record<string, string> = {
    f33_3: '296.34 Major depressive disorder, recurrent, severe',
    r45_851: 'R45.851 Suicidal ideations',
    f41_1: '300.02 Generalized anxiety disorder',
    g47_00: 'Insomnia related to depressive episode',
    z91_51: 'History of suicidal behavior',
  };
  for (const [dxKey, dsm] of Object.entries(dsmMap)) {
    for (let v = 1; v <= 8; v++) {
      if (nodes.length >= target) return;
      const id = `bh_dsm_${dxKey}_v${v}`;
      addNode(id, `DSM-5-TR ${dsm} (ref ${v})`, 'Diagnosis', 'DSM5TRCrosswalk', `DSM-5-TR cross-reference for ICD linkage variant ${v}.`, { dsm, variant: v });
      addEdge(`bh_dx_${dxKey}`, id, 'CROSSWALKED_TO');
      addEdge('bh_appeal_2026', id, 'CITES_EVIDENCE');
    }
  }

  // Policy clause atoms (synthetic but structured)
  const clauseDescriptions: Record<string, string> = {
    Admission: 'Criteria for initial admission to acute inpatient psychiatry — requires documented risk of harm, psychosis, or inability to care for self.',
    ContinuedStay: 'Rules governing continued-stay reviews — payer must see evidence that lower level of care would be unsafe; central to BH-LOS-06 rebuttal.',
    Discharge: 'Discharge planning requirements including step-down LOC assessment, safety plan, and follow-up within 7 days.',
    Appeal: 'Member appeal rights, documentation standards, and timelines for overturning medical-necessity denials within 180 days.',
    MedicalNecessity: 'Definition of medically necessary behavioral health services aligned with ASAM/LOCUS and InterQual BH criteria.',
    LOC: 'Level-of-care assignment rules mapping clinical acuity to ASAM Levels 1–4 and LOCUS 0–6 for utilization management.',
  };
  const clauseTypes = ['Admission', 'ContinuedStay', 'Discharge', 'Appeal', 'MedicalNecessity', 'LOC'];
  for (let i = 0; nodes.length < target && i < 400; i++) {
    const ctype = clauseTypes[i % clauseTypes.length]!;
    const id = `bh_clause_atom_${i + 1}`;
    addNode(
      id,
      `BH Policy Clause ${i + 1} — ${ctype}`,
      'PolicySection',
      'PolicyClauseAtom',
      `${clauseDescriptions[ctype] ?? `${ctype} policy clause`} Atom ${i + 1} from the UHC behavioral health policy corpus — linked to the Jordan M. Ellis appeal to support medical necessity for continued inpatient days.`,
      { clause_type: ctype, index: i + 1 },
    );
    const policyAnchor = [
      'bh_policy_bh_asam_loc',
      'bh_policy_bh_locus_handout',
      'bh_policy_bh_medical_necessity',
      'bh_policy_bh_tn_acute_inpatient',
      'bh_policy_bh_fs121115',
    ][i % 5]!;
    addEdge(policyAnchor, id, 'HAS_CLAUSE');
    addEdge('bh_appeal_2026', id, 'CITED_IN');
    if (ctype === 'ContinuedStay') addEdge(id, 'bh_crit_continued_stay', 'DEFINES');
  }

  // Interlink spine nodes for density
  for (const spine of spineIds) {
    for (let j = 0; nodes.length < target && j < 15; j++) {
      const peer = spineIds[(spineIds.indexOf(spine) + j + 1) % spineIds.length]!;
      addEdge(spine, peer, 'ASSOCIATED_WITH');
    }
  }
}

async function main() {
  buildCaseSpine();
  buildExpandedClusters();

  const policyMeta = [
    { slug: 'bh-asam-loc', title: 'ASAM LOC Assessment Guide', citation: 'ASAM Criteria v4.1' },
    { slug: 'bh-locus-guide', title: 'LOCUS Utilization System Guide', citation: 'LOCUS Guide' },
    { slug: 'bh-locus-handout', title: 'LOCUS Levels of Care Handout', citation: 'AACP LOCUS Handout' },
    { slug: 'bh-medical-necessity', title: 'BH Medical Necessity Criteria', citation: 'Medical Necessity Criteria' },
    { slug: 'bh-tn-acute-inpatient', title: 'TN BH Acute Inpatient Guide', citation: 'TN-BH-Guide Acute Inpatient' },
    { slug: 'bh-fs121115', title: 'Behavioral Health Facility Services', citation: 'BehavioralHealthFS121115' },
  ];

  for (const p of policyMeta) {
    const text = await loadPolicyText(p.slug);
    const policyId = `bh_policy_${p.slug.replace(/-/g, '_')}`;
    if (text) {
      chunkPolicy(p.slug, p.title, p.citation, text, 80);
      addEdge('bh_appeal_2026', policyId, 'CITES_POLICY');
      addEdge('bh_denial_co50', policyId, 'EVALUATED_AGAINST');
    } else {
      addNode(
        policyId,
        p.title,
        'Policy',
        'BehavioralHealthPolicy',
        `${p.citation} — policy reference (run npm run extract-bh-policies to populate excerpts).`,
        { slug: p.slug, citation: p.citation },
      );
    }
  }

  addEdge('ASAM_L4', 'bh_policy_bh_asam_loc', 'GROUNDED_BY');
  addEdge('LOCUS_6', 'bh_policy_bh_locus_guide', 'GROUNDED_BY');
  addEdge('bh_crit_continued_stay', 'bh_policy_bh_tn_acute_inpatient', 'GROUNDED_BY');

  buildToTargetCount(1000);

  // Merge seed if present
  try {
    const seedRaw = await fs.readFile(SEED_PATH, 'utf8');
    const seed = JSON.parse(seedRaw) as {
      entities: Array<{
        id: string;
        label: string;
        category: string;
        type: string;
        summary: string;
        attributes: Record<string, string | number | null>;
        uuid: string;
      }>;
      relations: Array<{ source: string; target: string; relation: string }>;
    };
    for (const e of seed.entities) {
      addNode(
        e.id,
        e.label,
        e.category as BhCategory,
        e.type,
        e.summary,
        e.attributes,
        e.uuid,
      );
    }
    for (const r of seed.relations) {
      addEdge(r.source, r.target, r.relation);
    }
  } catch {
    /* seed optional */
  }

  const graph = {
    id: 'behavioral-health-rcm',
    title: 'Behavioral Health RCM Ontology',
    description: 'Knowledge graph for Jordan M. Ellis acute inpatient psychiatry denial appeal demo.',
    generatedAt: new Date().toISOString(),
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(graph, null, 2), 'utf8');
  console.log(`✓ Ontology: ${nodes.length} nodes, ${edges.length} edges → ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
