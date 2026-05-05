import type {
  AnalyticsBundle,
  PatientSummary,
  StageDetail,
  StageId,
} from '@/lib/types';

// =============================================================================
// INPATIENT case rich content — James R. Mitchell / Medicare + AARP Plan G
// CHF systolic chronic — DRG 291 inpatient stay
// Source: /Users/kanavkahol/Downloads/Sample 2/RCM_Demo_Inpatient_Stay.xlsx
// =============================================================================

export const inpatientPatientSummary: PatientSummary = {
  hero: {
    headline: 'Acute Inpatient · CHF Systolic Chronic · MS-DRG 291',
    subhead:
      'Encounter ENC-2025-00847 — Medicare Part A/B with AARP Supplement Plan G. 7-day inpatient stay, CDI uplift on CKD3 → CC, two minor technical denials auto-reversed, $0 patient balance.',
  },
  demographics: [
    { label: 'Patient', value: 'James R. Mitchell', emphasis: true },
    { label: 'DOB · Age', value: '09/14/1958 · 66' },
    { label: 'Gender', value: 'Male' },
    { label: 'MRN', value: 'MRN-58291047' },
    { label: 'Address', value: '412 Maple Street, Springfield, IL 62704' },
    { label: 'Phone', value: '(217) 555-0193' },
    { label: 'Emergency contact', value: 'Carol Mitchell — (217) 555-0184' },
    { label: 'PCP', value: 'Dr. Sandra Torres, MD' },
  ],
  insurance: [
    { label: 'Primary payer', value: 'Medicare Part A & B', emphasis: true },
    { label: 'Member ID', value: '1EG4-TE5-MK72' },
    { label: 'Plan type', value: 'Traditional Medicare' },
    { label: 'Annual deductible', value: '$1,600.00 — fully met' },
    { label: 'OOP max / met', value: '$7,550.00 / $2,340.00' },
    { label: 'Coinsurance', value: '20% after deductible' },
    { label: 'Secondary payer', value: 'AARP Supplement Plan G', emphasis: true },
    { label: 'Secondary member ID', value: 'SG-00482917' },
    { label: 'PA required', value: 'Yes — obtained' },
    { label: 'PA #', value: 'PA-2025-88341' },
  ],
  encounter: [
    { label: 'Encounter', value: 'ENC-2025-00847' },
    { label: 'Admit date', value: '03/10/2025 — Emergent' },
    { label: 'Discharge date', value: '03/17/2025' },
    { label: 'LOS', value: '7 days', emphasis: true },
    { label: 'Admit source', value: 'Emergency Dept' },
    { label: 'Discharge disposition', value: 'Home with services' },
    { label: 'DRG', value: '291 — Heart Failure & Shock w/ MCC', emphasis: true },
    { label: 'DRG weight', value: '2.2100' },
    { label: 'MS-DRG payment', value: '$22,848.32' },
    { label: 'Facility', value: 'Springfield General Hospital' },
    { label: 'Attending', value: 'Dr. Kevin Patel, MD' },
    { label: 'Hospitalist', value: 'Dr. Anita Rao, MD' },
  ],
  agentSummary: [
    {
      agent: 'AI Eligibility Bot v4.2',
      bullets: [
        'Medicare Part A active; deductible $1,600 fully met (99.8% confidence)',
        'Plan G secondary covers 20% coinsurance — projected $0 patient balance',
        'SNF benefit (100 days) available if needed post-discharge',
      ],
    },
    {
      agent: 'AI Auth Engine',
      bullets: [
        'PA-2025-88341 approved 03/09 — 7-day inpatient (4.2 hr turnaround)',
        'Cardiology consult PA-88342 + Echo PA-88343 obtained as needed',
        'All authorizations linked to claim 837I',
      ],
    },
    {
      agent: 'AI CDI Assist + AI Auto-Coder v3.1',
      bullets: [
        '8 ICD-10-CM diagnoses · 4 ICD-10-PCS procedures · 99.1% accuracy',
        'CDI query 03/12 confirmed CKD Stage 3 → added CC, validated MS-DRG 291',
        'MS-DRG 291 (CHF + MCC) confirmed → $22,848.32 expected payment',
      ],
    },
    {
      agent: 'AI Claim Scrubber + AI Denial Engine',
      bullets: [
        '10/10 edits passed; 837I accepted by Medicare MAC same day',
        'CO-4 modifier denial $2,884 + N30 missing NPI $450 — both auto-fixed',
        '100% recovery, 3.1-day average resolution, zero manual touches',
      ],
    },
    {
      agent: 'AI ERA Processor + AI Discharge Bot',
      bullets: [
        'Medicare paid $22,848.32 EFT 04/03 (Day 24)',
        'Plan G secondary auto-crossover 04/07 — $0 balance confirmed',
        'Patient satisfaction 4.8/5 from post-discharge survey',
      ],
    },
  ],
  finalOutcome: [
    { label: 'Total billed', value: '$34,215.50' },
    { label: 'Medicare payment (EFT)', value: '$22,848.32', emphasis: true },
    { label: 'Plan G secondary', value: '$0.00 (no patient gap)' },
    { label: 'CO-45 contractual write-off', value: '$11,367.18' },
    { label: 'Patient balance', value: '$0.00 — fully adjudicated', emphasis: true },
    { label: 'Net revenue collected', value: '$22,848.32' },
    { label: 'Days from service to cash', value: '22 days' },
    { label: 'Final denial rate', value: '0% (2 reversed)' },
    { label: 'CDI uplift estimate', value: '+$4,200', emphasis: true },
  ],
};

const eligibility: StageDetail = {
  stageId: 'eligibility',
  intro:
    'AI Eligibility Bot ran a 3-payer 270/271 sweep — Medicare Part A, Part B, and AARP Plan G secondary — confirming active coverage and zero projected patient balance. Deductible was already fully met at admission.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Coverage', value: 'ACTIVE', sub: 'Medicare A/B + Plan G' },
        { label: 'Deductible met', value: '$1,600 of $1,600' },
        { label: 'Projected pt balance', value: '$0', sub: 'Plan G covers 20% coins' },
        { label: 'PA required', value: 'Yes — obtained' },
        { label: 'AI confidence', value: '99.8%' },
      ],
    },
    {
      kind: 'table',
      title: 'A · 270/271 real-time eligibility log',
      columns: ['Check', 'Date/Time', 'Payer', 'Plan', 'Member ID', 'Status', 'Ded', 'Met', 'OOP Max', 'OOP Met', 'Auth', 'Score'],
      rows: [
        ['ELG-001', '03/09 08:14', 'Medicare Part A', 'Traditional', '1EG4-TE5-MK72', 'ACTIVE', '$1,600', '$1,600', '$7,550', '$2,340', 'Yes', '99.8%'],
        ['ELG-002', '03/09 08:15', 'Medicare Part B', 'Traditional', '1EG4-TE5-MK72', 'ACTIVE', '$240', '$240', 'Incl', 'Incl', 'Yes', '99.8%'],
        ['ELG-003', '03/09 08:16', 'AARP Plan G', 'Supplemental', 'SG-00482917', 'ACTIVE', '$0', 'N/A', '∞', 'N/A', 'No', '98.9%'],
      ],
    },
    {
      kind: 'edi',
      title: 'B · 271 response — Medicare Part A coverage detail',
      transaction: '271',
      segments: [
        'ISA*00*          *00*          *ZZ*00440MAC       *ZZ*RCMDEMOPROVIDR *250309*0815*^*00501*000002113*0*P*:~',
        'GS*HB*00440MAC*RCMDEMOPROVIDR*20250309*0815*2113*X*005010X279A1~',
        'ST*271*0001*005010X279A1~',
        'BHT*0022*11*ELG-MCR-00847*20250309*0815~',
        'NM1*PR*2*MEDICARE*****PI*00440~',
        'NM1*1P*2*SPRINGFIELD GENERAL HOSPITAL*****XX*1932847503~',
        'NM1*IL*1*MITCHELL*JAMES*R***MI*1EG4-TE5-MK72~',
        'DMG*D8*19580914*M~',
        'EB*1**MA**MEDICARE PART A~',
        'EB*C*FAM*MA**HEALTH BENEFIT PLAN*23*1600*****Y~      // Annual ded $1,600',
        'EB*F*FAM*MA**HEALTH BENEFIT PLAN*23*1600*****Y~      // MET $1,600',
        'EB*B**MA****INPATIENT*****Y~                           // PA REQUIRED inpatient',
        'EB*1**MS**SNF BENEFIT*23*100*DA****Y~                  // 100 days SNF',
        'MSG*MEDICARE PART A ACTIVE 01/01/2025-12/31/2025~',
        'SE*14*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Eligibility insights',
      body: '4 alerts surfaced: (1) deductible fully met → no patient deductible owed, (2) Plan G covers 20% coinsurance → $0 projected patient balance, (3) inpatient PA REQUIRED — auto-initiated PA workflow, (4) SNF benefit 100 days available if needed. All 3 payers verified in <2 minutes.',
    },
  ],
};

const priorAuth: StageDetail = {
  stageId: 'priorAuth',
  intro:
    'Three prior-authorization requests issued via 278 EDI — inpatient admission, cardiology consult, and echocardiogram — all approved within 5 hours total against InterQual criteria.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'PAs issued', value: '3', sub: 'inpatient + 2 procedures' },
        { label: 'PAs approved', value: '3 of 3' },
        { label: 'Avg turnaround', value: '2.0 hr', sub: 'vs 24-48 industry' },
        { label: 'Criteria source', value: 'InterQual 2025' },
        { label: 'AI recommendation', value: 'Approve — all' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Prior authorization log — 278 transactions',
      columns: ['PA #', 'Request date', 'Auth type', 'Service', 'DX', 'Status', 'Auth #', 'Units', 'Valid From / To', 'Turnaround'],
      rows: [
        ['PA-2025-88341', '03/09/2025', 'Inpatient Admission', 'Acute Inpatient — CHF', 'I50.32', 'APPROVED', 'AUTH-MCR-88341', '7 days', '03/10–03/17', '4.2 hrs'],
        ['PA-2025-88342', '03/12/2025', 'Cardiology Consult', 'Inpatient consult', 'I50.32, I25.10', 'APPROVED', 'AUTH-MCR-88342', '1 visit', '03/12–03/17', '1.1 hrs'],
        ['PA-2025-88343', '03/14/2025', 'Echocardiogram', 'TTE w/ Doppler', 'I50.32', 'APPROVED', 'AUTH-MCR-88343', '1 study', '03/14–03/17', '0.8 hrs'],
      ],
    },
    {
      kind: 'edi',
      title: 'B · 278 — inpatient admission PA request',
      transaction: '278',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*00440MAC       *250309*0900*^*00501*000002301*0*P*:~',
        'GS*HI*RCMDEMOPROVIDR*00440MAC*20250309*0900*2301*X*005010X217~',
        'ST*278*0001*005010X217~',
        'BHT*0007*13*PA-88341*20250309*0900~',
        'NM1*X3*2*MEDICARE MAC*****46*00440~',
        'NM1*1P*2*SPRINGFIELD GENERAL HOSPITAL*****XX*1932847503~',
        'NM1*IL*1*MITCHELL*JAMES*R***MI*1EG4-TE5-MK72~',
        'DMG*D8*19580914*M~',
        'TRN*1*PA-88341*9RCMDEMO~',
        'UM*AR*I*7*21:B*Y***Y~',                           // Admission review, inpatient, 7 days
        'DTP*AAH*D8*20250310~',                            // Admit date
        'HSD*VS*7*DA*1*34*1~',                             // 7 days, daily
        'HI*BK:I5032*BF:I2510*BF:N183*BF:E119*BF:E785*BF:I10~', // ICD-10
        'PWK*OZ*EL*1*AC*RCM-PKT-00847~',                   // InterQual evidence
        'MSG*ACUTE DECOMPENSATED HEART FAILURE - SYSTOLIC CHRONIC - INTERQUAL CRITERIA MET~',
        'SE*15*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Auth Engine outcome',
      body: 'AI Auth Engine pulled InterQual criteria for acute heart failure, mapped EHR clinical evidence (BNP elevation, JVD, S3 gallop, decreased EF), and submitted via Medicare MAC portal. Approval received in 4.2 hours vs 24-48 hour industry median.',
    },
  ],
};

const cdi: StageDetail = {
  stageId: 'cdi',
  intro:
    'AI CDI Assistant identified one high-impact documentation opportunity — CKD stage specificity — that converted a non-CC into a CC, validating MS-DRG 291 (CHF + MCC) and protecting the $22,848 reimbursement.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Documents reviewed', value: '14', sub: 'admission to discharge' },
        { label: 'CDI queries sent', value: '1' },
        { label: 'Physician response', value: 'Same day' },
        { label: 'CCs added', value: '+1', sub: 'CKD3 (N18.3)' },
        { label: 'CDI uplift', value: '+$4,200', sub: 'DRG protect' },
      ],
    },
    {
      kind: 'medicalRecord',
      title: 'A · H&P (admission) — Dr. Patel, 03/10/2025',
      sections: [
        {
          heading: 'Chief complaint',
          body: '66-year-old male presents to ED with progressive dyspnea on exertion x4 days, orthopnea, 8 lb weight gain, bilateral lower extremity edema. Reports medication non-adherence x2 weeks (insurance lapse).',
        },
        {
          heading: 'History of present illness',
          body: 'Mr. Mitchell has known systolic heart failure (EF 30% baseline 2024) and CAD s/p CABG 2018. Long-standing hypertension, type 2 DM, and chronic kidney disease (Cr trended 1.6–1.8 over past year). Presented with NYHA class III–IV symptoms. BNP 1,840 in ED. CXR demonstrates bilateral interstitial edema and small bilateral pleural effusions.',
          flags: ['CDI candidate — CKD specificity'],
        },
        {
          heading: 'Physical exam',
          body: 'Vitals: BP 156/92, HR 108 irregular, RR 24, SpO₂ 92% on 2L NC. JVD 12cm. CV: irregular rate, S3 gallop. Lungs: bilateral crackles to mid-fields. Ext: 3+ pitting edema bilateral lower extremities to mid-calf. Mental status alert and oriented.',
        },
        {
          heading: 'Labs / studies',
          body: 'BMP: Na 134, K 4.6, Cl 101, CO₂ 24, BUN 38, Cr 1.7 (baseline 1.6 in clinic). CBC: WBC 8.2, Hgb 11.2, Plt 178. BNP 1,840. Troponin negative ×2. ECG: a-fib RVR @ 108. Echo (history): EF 30%, moderate MR. CXR: bilateral interstitial edema, cephalization, small pleural effusions.',
          flags: ['HCC capture'],
        },
        {
          heading: 'Assessment & plan',
          body: '1. Acute on chronic systolic CHF (HFrEF) — IV diuresis with furosemide 40mg IV BID, daily weights, monitor I&Os. 2. Atrial fibrillation with RVR — IV amiodarone load, then PO. 3. CKD — Cr stable; renal monitoring. 4. CAD — continue ACE-I/BB. 5. T2DM — sliding-scale insulin. 6. HTN — lisinopril, metoprolol succ.',
          flags: ['CDI follow-up — CKD stage'],
        },
      ],
    },
    {
      kind: 'cdiQueries',
      title: 'B · AI-drafted CDI query',
      queries: [
        {
          id: 'CDI-Q-00847-01',
          question:
            'Multiple notes reference "chronic kidney disease" with Cr 1.6-1.8 and clinic baseline Cr 1.6 over past 12 months. Can you specify the CKD stage as documented?',
          options: [
            'CKD Stage 2 (N18.2)',
            'CKD Stage 3 (N18.3)',
            'CKD Stage 4 (N18.4)',
            'Chronic kidney disease, unspecified (N18.9)',
            'Other — please specify',
          ],
          rationale:
            'eGFR derived from baseline Cr 1.6 = 47 mL/min/1.73m² (CKD Stage 3 by KDIGO criteria). Specifying N18.3 captures a CC (Comorbid Condition), validates MS-DRG 291 (Heart Failure + MCC), and protects ~$4,200 in reimbursement vs. unspecified CKD.',
          status: 'answered',
          physician: 'Dr. Kevin Patel, MD — answered 03/12 14:08',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'CDI outcome — CKD3 confirmed',
      body: 'Dr. Patel confirmed N18.3 (CKD Stage 3). CC added to claim, MS-DRG 291 (CHF + MCC) preserved, RAF +0.069. Estimated reimbursement protect of ~$4,200 vs. potential downcode to MS-DRG 292 (CHF + CC only).',
    },
  ],
};

const charge: StageDetail = {
  stageId: 'charge',
  intro:
    'AI Charge Engine assembled 30 charge lines spanning room/board, ICU monitoring, pharmacy, lab, radiology, cardiology, PT, and behavioral health — 100% clean against the chargemaster.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Charge lines', value: '30 of 30', sub: 'all clean' },
        { label: 'Total billed', value: '$34,215.50' },
        { label: 'CDM matches', value: '100%' },
        { label: 'CCI conflicts', value: '0' },
        { label: 'Late charges', value: '0' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Inpatient charge ledger (top lines)',
      columns: ['Line', 'Rev', 'CPT/HCPCS', 'Description', 'Date', 'Units', 'Charge', 'Audit'],
      rows: [
        ['001', '0100', '—', 'Med/Surg Semi-Private Room', '03/10–03/17', 7, '$17,150.00', 'Clean'],
        ['002', '0120', '—', 'ICU Telemetry (step-down)', '03/10–03/11', 2, '$7,600.00', 'Clean'],
        ['003', '0250', 'J1940', 'IV Furosemide 40mg', '03/10', 4, '$192.00', 'Clean'],
        ['004', '0250', 'J0692', 'IV Amiodarone 150mg', '03/10', 2, '$290.00', 'Clean'],
        ['009', '0300', '83880', 'BNP', '03/10', 1, '$195.00', 'Clean'],
        ['014', '0480', '93306', 'Echo w/ Doppler', '03/14', 1, '$1,650.00', 'Clean'],
        ['015', '0730', '93600', 'Cardiac Telemetry', '03/10–03/17', 7, '$2,884.00', 'Clean'],
        ['016', '0730', '99253', 'Cardiology Consult — Dr. Yuen', '03/12', 1, '$450.00', 'Clean'],
        ['017', '0420', '97110', 'PT Therapeutic Exercise', '03/15', 1, '$285.00', 'Clean'],
        ['025', '0940', '99232', 'Subsequent Hospital Care D3', '03/12', 1, '$275.00', 'Clean'],
        ['028', '0941', '99238', 'Hospital Discharge Day Mgmt', '03/17', 1, '$350.00', 'Clean'],
        ['TOTAL', '', '', '30 lines (full ledger above)', '', '', '$34,215.50', '✓ Clean'],
      ],
      footer: 'Full 30-line itemized bill captured by AI Charge Engine. All revenue codes mapped to chargemaster (CDM); no late charges added after coder lock.',
    },
  ],
};

const coding: StageDetail = {
  stageId: 'coding',
  intro:
    'AI Auto-Coder produced 8 ICD-10-CM diagnoses + 4 ICD-10-PCS procedures. MS-DRG 291 + APR-DRG 194 confirmed via dual grouper validation. CC/MCC matrix preserved by CDI query.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'ICD-10-CM', value: '8 codes' },
        { label: 'ICD-10-PCS', value: '4 codes', sub: 'procedural' },
        { label: 'MS-DRG', value: '291', sub: 'CHF + MCC · wt 2.21' },
        { label: 'APR-DRG', value: '194 SOI 3' },
        { label: 'Avg confidence', value: '95.6%' },
      ],
    },
    {
      kind: 'coding',
      title: 'A · ICD-10-CM diagnoses',
      codes: [
        { code: 'I50.32', description: 'Heart Failure, Systolic, Chronic', confidence: 0.973, type: 'Principal · MCC', editable: true, sourceText: '"Acute on chronic systolic CHF (HFrEF) — IV diuresis with furosemide" — H&P 03/10' },
        { code: 'I25.10', description: 'Atherosclerotic Heart Disease — Native Artery', confidence: 0.961, type: 'Secondary · CC', editable: true, sourceText: '"CAD s/p CABG 2018, continue ACE-I/BB" — H&P assessment' },
        { code: 'N18.3', description: 'Chronic Kidney Disease, Stage 3', confidence: 0.948, type: 'Secondary · CC · CDI confirmed', editable: true, sourceText: '"CKD Stage 3 (N18.3)" — Dr. Patel CDI response 03/12 14:08' },
        { code: 'E11.9', description: 'Type 2 Diabetes Mellitus', confidence: 0.982, type: 'Comorbidity', editable: true, sourceText: '"T2DM — sliding-scale insulin" — A/P' },
        { code: 'E78.5', description: 'Hyperlipidemia, Unspecified', confidence: 0.99, type: 'Comorbidity', editable: true, sourceText: '"continue ACE-I/BB; statin per home med list"' },
        { code: 'I10', description: 'Essential Hypertension', confidence: 0.995, type: 'Comorbidity · HCC 85', editable: true, sourceText: '"BP 156/92 → continue lisinopril, metoprolol succ"' },
        { code: 'Z87.39', description: 'Hx of Other Endocrine/Metabolic', confidence: 0.912, type: 'Hx', editable: true, sourceText: '"Long-standing hypertension, type 2 DM, and chronic kidney disease"' },
        { code: 'Z96.641', description: 'Presence of Right Artificial Hip Joint', confidence: 0.889, type: 'Hx', editable: true, sourceText: '"PMH includes right total hip replacement 2019"' },
      ],
    },
    {
      kind: 'coding',
      title: 'B · ICD-10-PCS procedures',
      codes: [
        { code: '4A023N7', description: 'Monitoring Cardiac Output, Venous', confidence: 0.954, type: 'Procedure · Dr. Patel', editable: true, sourceText: 'CVP-line monitoring 03/10 ICU' },
        { code: '5A02110', description: 'Performance Cardiac Output, Continuous', confidence: 0.968, type: 'Procedure · Dr. Patel', editable: true, sourceText: 'Telemetry-driven continuous cardiac monitoring 03/10–11' },
        { code: 'B245ZZZ', description: 'Fluoroscopy of Heart (Echo)', confidence: 0.941, type: 'Procedure · Dr. Rao', editable: true, sourceText: 'Echo with Doppler 03/14 — EF 28%, moderate MR' },
        { code: 'GZ3ZZZZ', description: 'Psychological Assessment', confidence: 0.897, type: 'Procedure · LSW Webb', editable: true, sourceText: 'Behavioral health screen 03/15 (PHQ-9 = 9 mild)' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'C · DRG assignment & financial impact',
      rows: [
        { label: 'MS-DRG', value: '291 — Heart Failure & Shock w/ MCC', emphasis: true },
        { label: 'MS-DRG weight', value: '2.2100' },
        { label: 'Base rate', value: '$10,339.03' },
        { label: 'Expected MS-DRG payment', value: '$22,848.32', emphasis: true },
        { label: 'APR-DRG', value: '194 — Heart Failure SOI 3' },
        { label: 'APR-DRG weight', value: '1.9800' },
        { label: 'CC/MCC validation', value: '✓ Passed (CKD3 added via CDI)' },
        { label: 'Audit result', value: 'Final DRG 291 — no variance' },
      ],
    },
  ],
};

const claim: StageDetail = {
  stageId: 'claim',
  intro:
    'AI Claim Scrubber ran 10 institutional edits — all passed — and submitted the 837I to Medicare MAC via Change Healthcare. 277CA acknowledgment received in 93 minutes.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Edits passed', value: '10/10' },
        { label: '837I status', value: 'ACCEPTED', sub: 'Medicare MAC' },
        { label: '277CA ack', value: '93 min' },
        { label: 'Total billed', value: '$34,215.50' },
        { label: 'Claim #', value: 'CLM-2025-847-MCR' },
      ],
    },
    {
      kind: 'edi',
      title: 'A · 837I institutional claim — key segments',
      transaction: '837I',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*00440MAC       *250319*0810*^*00501*000003814*0*P*:~',
        'GS*HC*RCMDEMOPROVIDR*00440MAC*20250319*0810*3814*X*005010X223A2~',
        'ST*837*0001*005010X223A2~',
        'BHT*0019*00*RCM-INPT-00847*20250319*0810*CH~',
        'NM1*41*2*SPRINGFIELD GENERAL HOSPITAL*****46*1932847503~',
        'NM1*40*2*MEDICARE MAC CGS*****46*00440~',
        'HL*1**20*1~',
        'NM1*85*2*SPRINGFIELD GENERAL HOSPITAL*****XX*1932847503~',
        'REF*EI*36-9981234~',
        'HL*2*1*22*0~',
        'SBR*P*18******MA~                                  // Medicare primary',
        'NM1*IL*1*MITCHELL*JAMES*R***MI*1EG4-TE5-MK72~',
        'DMG*D8*19580914*M~',
        'NM1*PR*2*MEDICARE*****PI*00440~',
        'CLM*ENC-2025-00847*34215.50***21:A:1*Y*A*Y*Y~',
        'DTP*434*RD8*20250310-20250317~',                    // 7-day stay',
        'CL1*1*1*01~                                          // Admit emergent · home disp',
        'REF*F8*PA-2025-88341~                                // PA on claim',
        'HI*ABK:I5032*ABF:I2510*ABF:N183*ABF:E119*ABF:E785*ABF:I10*ABF:Z8739*ABF:Z96641~',
        'HI*BBR:4A023N7*BBR:5A02110*BBR:B245ZZZ*BBR:GZ3ZZZZ~',
        'HI*BG:291~                                          // MS-DRG',
        '— LX*1 Room & Board —',
        'LX*1~',
        'SV2*0100*HC:99221*17150.00*UN*7~',
        'DTP*472*RD8*20250310-20250317~',
        '— remaining 29 lines elided for display —',
        'SE*250*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Scrubber outcome',
      body: '10/10 institutional edits passed: PA linkage, NPI LUHN, DRG validation, POS 21 inpatient, dx-pointer mapping, OCE checks, room/board day-count, PCS-DRG congruence, timely filing, duplicate check. 837I accepted by Medicare MAC; 277CA received in 93 minutes.',
    },
  ],
};

const denial: StageDetail = {
  stageId: 'denial',
  intro:
    'Two technical denials received from Medicare in early April — CO-4 modifier ($2,884) and N30 missing ordering NPI ($450). Both auto-corrected by AI and reversed within 3 days; no clinical denials.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Denials received', value: '2', sub: 'both technical' },
        { label: 'Recovery rate', value: '100%', sub: '$3,334 fully reversed' },
        { label: 'Avg resolution time', value: '3.1 days' },
        { label: 'AI automation', value: '100%' },
        { label: 'Manual touches', value: '0' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Denial log',
      columns: ['Denial #', 'Date', 'Payer', 'Code', 'Reason', 'Category', 'Billed', 'Denied', 'AI action', 'Resolution', 'Recovered'],
      rows: [
        ['DEN-001', '04/02', 'Medicare', 'CO-4', 'Inconsistent modifier — Rev 0730 / 93600', 'Technical', '$34,215.50', '$2,884.00', 'Auto-corrected modifier', 'REVERSED', '$2,884.00'],
        ['DEN-002', '04/03', 'Medicare', 'N30', 'Incomplete/Invalid ordering provider info', 'Administrative', '$34,215.50', '$450.00', 'Auto-appended NPI; resubmit', 'REVERSED', '$450.00'],
      ],
    },
    {
      kind: 'table',
      title: 'B · AI denial prevention alerts (pre-bill)',
      columns: ['Alert', 'Date', 'Rule', 'Risk', 'Finding', 'Action', 'Status', 'Time saved'],
      rows: [
        ['PRV-001', '03/18', 'AI-MED-NECS-04', 'Med Necessity', 'Echo DX linkage verified pre-bill', 'DX-Procedure link added', 'RESOLVED', '~4 hrs'],
        ['PRV-002', '03/18', 'AI-CODING-07', 'Coding', 'POA flags auto-validated', 'All flags confirmed', 'RESOLVED', '~2 hrs'],
        ['PRV-003', '03/19', 'AI-AUTH-01', 'Authorization', 'PA #88341 linked to claim', 'PA embedded in claim', 'RESOLVED', '~1 hr'],
        ['PRV-004', '03/19', 'AI-DUP-CHECK', 'Duplicate', 'No duplicate claims found', 'No action needed', 'CLEAR', 'Auto'],
        ['PRV-005', '03/19', 'AI-BT-01', 'Timely Filing', 'Within 365-day limit', 'Filed day 9 post-discharge', 'COMPLIANT', 'Auto'],
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Denial Engine — outcome',
      body: 'Both denials were technical (modifier + NPI) — not clinical. AI auto-applied the fixes and resubmitted within minutes. Net denial impact = $0; no manual coder/biller intervention required.',
    },
  ],
};

const payment: StageDetail = {
  stageId: 'payment',
  intro:
    'Medicare paid $22,848.32 EFT on 04/03 (Day 24). AARP Plan G secondary auto-crossed over and confirmed $0 balance gap. Patient owes $0; account closed 04/10.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Medicare payment', value: '$22,848.32', sub: 'EFT 04/03' },
        { label: 'Plan G secondary', value: '$0.00', sub: 'no gap' },
        { label: 'CO-45 write-off', value: '$11,367.18' },
        { label: 'Patient balance', value: '$0.00', sub: 'fully adjudicated' },
        { label: 'Days to cash', value: '22 days' },
      ],
    },
    {
      kind: 'edi',
      title: 'A · 835 ERA — Medicare payment',
      transaction: '835',
      segments: [
        'ISA*00*          *00*          *ZZ*00440MAC       *ZZ*RCMDEMOPROVIDR *250403*0900*^*00501*000005481*0*P*:~',
        'GS*HP*00440MAC*RCMDEMOPROVIDR*20250403*0900*5481*X*005010X221A1~',
        'ST*835*0001~',
        'BPR*I*22848.32*C*ACH*CCP*01*021000021*DA*9876543210*1234567890**01*021000021*DA*5555555555*20250403~',
        'TRN*1*EFT-MCR-20250401-847*1234567890~',
        'REF*EV*00440~',
        'DTM*405*20250403~',
        'N1*PR*MEDICARE MAC CGS~',
        'N1*PE*SPRINGFIELD GENERAL HOSPITAL*XX*1932847503~',
        'LX*1~',
        'CLP*ENC-2025-00847*1*34215.50*22848.32*0*MA*1CJN90847263001*11*7~',
        'NM1*QC*1*MITCHELL*JAMES*R***MI*1EG4-TE5-MK72~',
        'DTM*232*20250310~',
        'AMT*AU*22848.32~',                                 // DRG paid amount',
        'CAS*CO*45*11367.18~                                // Contractual write-off',
        'SVC*HC:99221*17150*11440*UN*7~',
        '— remaining adjudication lines elided —',
        'SE*40*0001~',
      ],
    },
    {
      kind: 'keyValues',
      title: 'B · Payment posting summary',
      rows: [
        { label: 'Total billed', value: '$34,215.50' },
        { label: 'Medicare payment', value: '($22,848.32)' },
        { label: 'Contractual adj CO-45', value: '($11,367.18)' },
        { label: 'Plan G secondary', value: '$0.00' },
        { label: 'Bundled adj CO-B13', value: '$0.00' },
        { label: 'Patient deductible', value: '$0.00 — already met YTD' },
        { label: 'Patient coinsurance', value: '$0.00 — covered by Plan G' },
        { label: 'PATIENT BALANCE', value: '$0.00', emphasis: true },
        { label: 'Statement', value: 'Zero-balance notification only' },
        { label: 'Account status', value: 'CLOSED 04/10/2025', emphasis: true },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI ERA + Patient Comm — outcome',
      body: 'Medicare paid the full DRG amount; AARP Plan G crossover auto-processed within 4 days; $0 patient balance confirmed by AI Statement Bot via SMS + MyChart. Patient survey 4.8/5.0.',
    },
  ],
};

const registration: StageDetail = {
  stageId: 'registration',
  intro:
    'Patient was admitted emergently from the ED. AI Reg Workflow auto-populated demographics from EHR and queued downstream eligibility/PA workflows.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Admission type', value: 'Emergent', sub: 'ED → inpatient' },
        { label: 'Demographics', value: 'Auto-pulled' },
        { label: 'Time to bed', value: '15 min' },
        { label: 'Eligibility queued', value: '✓' },
      ],
    },
  ],
};

export const inpatientStageDetails: Partial<Record<StageId, StageDetail>> = {
  registration,
  eligibility,
  priorAuth,
  cdi,
  charge,
  coding,
  claim,
  denial,
  payment,
};

export const inpatientAnalytics: AnalyticsBundle = {
  topMetrics: [
    { label: '$ Submitted', value: '$34,216' },
    { label: '$ Collected', value: '$22,848' },
    { label: '$ Adjusted (CO-45)', value: '$11,367' },
    { label: '$ Written off', value: '$0' },
    { label: '$ Patient owed', value: '$0' },
    { label: 'Clean claim rate', value: '100%' },
    { label: 'Final denial rate', value: '0%', sub: '2 reversed' },
    { label: 'Days in A/R', value: '22 days' },
    { label: 'Net collection rate', value: '66.8%' },
    { label: 'CDI uplift', value: '+$4,200' },
  ],
  endToEndTimeline: [
    { date: '03/09 08:14', label: 'Eligibility verified', agent: 'AI Elig Bot v4.2', status: 'success' },
    { date: '03/09 12:00', label: 'PA approved (4.2 hrs)', agent: 'AI Auth Engine', status: 'success' },
    { date: '03/10', label: 'Admission (emergent)', agent: 'Reg Workflow AI', status: 'success' },
    { date: '03/12', label: 'CDI query CKD3 — answered same day', agent: 'AI CDI Bot + Dr. Patel', status: 'success' },
    { date: '03/17', label: 'Discharge home w/ services', agent: 'AI Discharge Bot', status: 'success' },
    { date: '03/18', label: 'Coding complete (8 dx + 4 PCS)', agent: 'AI Auto-Coder', status: 'success' },
    { date: '03/19', label: '837I accepted by MAC', agent: 'EDI · 277CA 93 min', status: 'success' },
    { date: '04/01', label: 'Adjudicated DRG 291', agent: 'Medicare MAC', status: 'success' },
    { date: '04/02', label: 'CO-4 modifier denial — auto-fixed', agent: 'AI Denial Engine', status: 'success' },
    { date: '04/03', label: 'EFT $22,848.32 received', agent: 'Medicare', status: 'success' },
    { date: '04/07', label: 'Plan G secondary crossover $0', agent: 'AARP', status: 'success' },
    { date: '04/10', label: 'Account closed', agent: 'AI Final Close', status: 'success' },
  ],
  benchmarks: [
    { metric: 'Days to code', thisCase: '1 day', aiBenchmark: '1–2 days', industryAvg: '4–7 days', delta: '↑ 3–6 days faster' },
    { metric: 'Days to submit', thisCase: '9 days', aiBenchmark: '7–10 days', industryAvg: '11–15 days', delta: '↑ 2–6 days faster' },
    { metric: 'Days to payment', thisCase: '22 days', aiBenchmark: '18–25 days', industryAvg: '25–35 days', delta: '↑ 3–13 days faster' },
    { metric: 'Clean claim rate', thisCase: '100%', aiBenchmark: '97–99%', industryAvg: '85–90%', delta: '↑ 10–15 pts' },
    { metric: 'Denial rate (final)', thisCase: '0%', aiBenchmark: '2–4%', industryAvg: '5–10%', delta: '↑ 5–10 pts' },
    { metric: 'Coding accuracy', thisCase: '99.1%', aiBenchmark: '97–99%', industryAvg: '88–92%', delta: '↑ 7–11 pts' },
    { metric: 'CDI query response', thisCase: 'Same day', aiBenchmark: '1–2 days', industryAvg: '3–5 days', delta: '↑ 2–4 days faster' },
    { metric: 'Auth turnaround', thisCase: '4.2 hrs', aiBenchmark: '4–6 hrs', industryAvg: '24–48 hrs', delta: '↑ 20–44 hrs faster' },
  ],
};
