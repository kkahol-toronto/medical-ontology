import type {
  AnalyticsBundle,
  PatientSummary,
  StageDetail,
  StageId,
} from '@/lib/types';

// =============================================================================
// ONCOLOGY case rich content — Robert A. Chen / Aetna PPO / NSCLC EGFR+
// Source: /Users/kanavkahol/Downloads/Sample 1/RCM_Oncology_Denial_Appeal_Demo.xlsx
// + NCCN Non-Small Cell Lung Cancer Guidelines v2.2025
// =============================================================================

export const oncologyPatientSummary: PatientSummary = {
  hero: {
    headline: 'Stage IV Lung Cancer · Carboplatin + Pemetrexed · Cycle 2',
    subhead:
      'Encounter ENC-ONC-2025-7291 — Aetna Commercial PPO. Initial PA denied; AI Appeal Agent overturned with NCCN + EGFR L858R evidence; full $42,101.97 paid 27 days from service.',
  },
  demographics: [
    { label: 'Patient', value: 'Robert A. Chen', emphasis: true },
    { label: 'DOB · Age', value: '11/04/1958 · 66' },
    { label: 'Gender', value: 'Male' },
    { label: 'MRN', value: 'MRN-47291083' },
    { label: 'Address', value: '501 Lakeview Dr, Chicago, IL 60614' },
    { label: 'Phone', value: '(312) 555-0192' },
    { label: 'Emergency contact', value: 'Linda Chen — (312) 555-0307' },
    { label: 'PCP', value: 'Dr. James O\'Brien, MD' },
  ],
  insurance: [
    { label: 'Primary payer', value: 'Aetna Commercial PPO', emphasis: true },
    { label: 'Plan name', value: 'Aetna Choice POS II' },
    { label: 'Member ID', value: 'AET-PPO-8821047-IL' },
    { label: 'Group #', value: 'GRP-57291-MIDTECH' },
    { label: 'Employer', value: 'MidTech Solutions Inc.' },
    { label: 'Plan year deductible', value: '$3,000.00' },
    { label: 'Deductible met YTD', value: '$3,000.00 — fully met', emphasis: true },
    { label: 'OOP max / met', value: '$8,500.00 / $4,180.00' },
    { label: 'Coinsurance', value: '20% after deductible' },
    { label: 'Secondary payer', value: 'None on file' },
  ],
  encounter: [
    { label: 'Encounter series', value: 'ENC-ONC-2025-7291' },
    { label: 'Encounter type', value: 'Outpatient Oncology Infusion' },
    { label: 'Cycle', value: 'Cycle 2 of 6 — Carboplatin + Pemetrexed', emphasis: true },
    { label: 'Service date', value: '03/18/2025' },
    { label: 'Facility', value: 'Chicago Oncology & Infusion Partners' },
    { label: 'Attending oncologist', value: 'Dr. Mei-Ling Park, MD' },
    { label: 'Infusion start / end', value: '09:00 AM — 02:30 PM' },
    { label: 'PA #', value: 'PA-AET-ONC-2025-19847 (post-appeal)', emphasis: true },
  ],
  clinical: [
    { label: 'Cancer site', value: 'Right upper lobe lung (C34.11)' },
    { label: 'Stage / TNM', value: 'Stage IV · T3N2M1b — pleural mets', emphasis: true },
    { label: 'Histology', value: 'Adenocarcinoma w/ mixed subtypes (8255/3)' },
    { label: 'Driver mutation', value: 'EGFR L858R positive', emphasis: true },
    { label: 'ALK / PD-L1 / Ki-67', value: 'ALK neg · PD-L1 35% TPS · Ki-67 42%' },
    { label: 'ECOG PS', value: '1 (ambulatory; light work)' },
    { label: 'Comorbidities', value: 'HTN, T2DM hyperglyc, peripheral neuropathy (G62.0)' },
    { label: 'Total RAF score', value: '4.366 (5 HCCs captured)' },
  ],
  agentSummary: [
    {
      agent: 'AI Eligibility Bot v5',
      bullets: [
        'Cycle 2 verified 03/17/2025 — Aetna ACTIVE; deductible $3K fully met',
        'OOP $4,180 of $8,500 met; 20% coinsurance applies post-allowed',
        'PA-AET-ONC-2025-19847 confirmed valid for all 6 cycles',
      ],
    },
    {
      agent: 'AI Auth Engine + AI Appeal Agent',
      bullets: [
        'Initial PA submitted 03/07; DENIED 03/10 (CO-50 not medically necessary)',
        'AI Appeal Agent compiled 9-doc packet (NCCN v2.2025 + EGFR + Aetna CPB-0516)',
        'Aetna Med Director Dr. R. Farhan OVERTURNED 03/13 — full reversal in 6 days',
      ],
    },
    {
      agent: 'AI CDI + AI Auto-Coder v3.1',
      bullets: [
        '14 ICD-10-CM codes assigned · 5 HCCs captured · RAF 4.366',
        'CDI flagged Z13.6 (EGFR L858R) and G62.0 — both became central appeal evidence',
        'HCPCS BSA-dose verified: Carbo 12.4u, Pem 1.85u',
      ],
    },
    {
      agent: 'AI Claim Scrubber + AI Denial Engine',
      bullets: [
        '13/13 oncology edits passed (LCD L36382, NCD 110.6, CCI, B12/folic check)',
        'Claim denied 03/26 (CO-50 + N-390); AI confidence 94.7% overturn likelihood',
        'AI appeal letter signed by Dr. Park and submitted to Aetna 03/27',
      ],
    },
    {
      agent: 'AI ERA Bot + AI Patient Stmt Bot',
      bullets: [
        'APPEAL OVERTURNED 04/04 — full $42,101.97 reinstated',
        'EFT $21,050.99 received 04/14 (Day 27); CO-45 write-off $21,050.98',
        'Patient enrolled in 12-month 0% APR plan for $3,710.20 balance',
      ],
    },
  ],
  finalOutcome: [
    { label: 'Total billed (Cycle 2)', value: '$42,101.97' },
    { label: 'Aetna allowed (50% PPO)', value: '$21,050.99' },
    { label: 'Aetna payment (EFT)', value: '$21,050.99', emphasis: true },
    { label: 'Patient coinsurance (20%)', value: '$4,210.20' },
    { label: 'Upfront collected', value: '($500.00) at check-in' },
    { label: 'Patient balance remaining', value: '$3,710.20' },
    { label: 'Net revenue collected', value: '$21,550.99', emphasis: true },
    { label: 'Days from service to cash', value: '27 days (incl. 8-day appeal)' },
    { label: 'Appeal overturn ROI', value: '$42,101.97 recovered · ~$0 AI cost', emphasis: true },
  ],
};

// =============================================================================
// Stage details
// =============================================================================

const eligibility: StageDetail = {
  stageId: 'eligibility',
  intro:
    'AI Eligibility Bot v5 ran a 270/271 EDI exchange against Aetna for every cycle. Cycle 2 confirmed active coverage, deductible fully met, and PA approved post-appeal — all in under 3 minutes with 99.8% confidence.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Verified cycles', value: '3 of 6' },
        { label: 'Coverage', value: 'ACTIVE', sub: 'Aetna PPO' },
        { label: 'Deductible met', value: '$3,000', sub: '100% of plan year' },
        { label: 'OOP remaining', value: '$4,320', sub: 'of $8,500 max' },
        { label: 'AI confidence', value: '99.8%' },
      ],
    },
    {
      kind: 'table',
      title: 'A · 270/271 real-time eligibility log',
      columns: ['Cycle', 'Date', 'Plan', 'Member ID', 'Status', 'Ded', 'Met', 'OOP Max', 'OOP Met', 'Coins', 'PA', 'Score'],
      rows: [
        ['Cycle 1', '03/03/2025', 'Choice POS II', 'AET-PPO-8821047-IL', 'ACTIVE', '$3,000', '$3,000', '$8,500', '$3,180', '20%', 'PA pending', '99.8%'],
        ['Cycle 2', '03/17/2025', 'Choice POS II', 'AET-PPO-8821047-IL', 'ACTIVE', '$3,000', '$3,000 FULL', '$8,500', '$4,180', '20%', 'PA APPROVED', '99.8%'],
        ['Cycle 3', '04/08/2025', 'Choice POS II', 'AET-PPO-8821047-IL', 'ACTIVE', '$3,000', '$3,000 FULL', '$8,500', 'TBD', '20%', 'PA valid', '—'],
      ],
    },
    {
      kind: 'edi',
      title: 'B · Outbound 270 inquiry — Cycle 2',
      transaction: '270',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*60054ZZ        *250317*0817*^*00501*000004271*0*P*:~',
        'GS*HS*RCMDEMOPROVIDR*60054ZZ*20250317*0817*4271*X*005010X279A1~',
        'ST*270*0001*005010X279A1~',
        'BHT*0022*13*RCM-271-7291-C2*20250317*0817~',
        'HL*1**20*1~',
        'NM1*PR*2*AETNA*****PI*60054~',
        'HL*2*1*21*1~',
        'NM1*1P*2*CHICAGO ONCOLOGY & INFUSION PARTNERS*****XX*7291084563~',
        'HL*3*2*22*0~',
        'TRN*1*RCM-TRN-0317-7291*9RCMDEMO~',
        'NM1*IL*1*CHEN*ROBERT*A***MI*AET-PPO-8821047-IL~',
        'REF*6P*GRP-57291-MIDTECH~',
        'DMG*D8*19581104*M~',
        'DTP*291*D8*20250318~',
        'EQ*30~',
        'EQ*30**FAM**J9045~',
        'EQ*30**FAM**J9305~',
        'SE*16*0001~',
        'GE*1*4271~',
        'IEA*1*000004271~',
      ],
    },
    {
      kind: 'edi',
      title: 'C · Inbound 271 response — coverage + benefits',
      transaction: '271',
      segments: [
        'ISA*00*          *00*          *ZZ*60054ZZ        *ZZ*RCMDEMOPROVIDR *250317*0820*^*00501*000004271*0*P*:~',
        'GS*HB*60054ZZ*RCMDEMOPROVIDR*20250317*0820*4271*X*005010X279A1~',
        'ST*271*0001*005010X279A1~',
        'BHT*0022*11*RCM-271-7291-C2*20250317*0820~',
        'HL*1**20*1~',
        'NM1*PR*2*AETNA*****PI*60054~',
        'HL*2*1*21*1~',
        'NM1*1P*2*CHICAGO ONCOLOGY & INFUSION PARTNERS*****XX*7291084563~',
        'HL*3*2*22*0~',
        'TRN*2*RCM-TRN-0317-7291*9RCMDEMO~',
        'NM1*IL*1*CHEN*ROBERT*A***MI*AET-PPO-8821047-IL~',
        'REF*6P*GRP-57291-MIDTECH~',
        'DMG*D8*19581104*M~',
        'INS*Y*18*001*25***FT~',
        'DTP*356*D8*20250101~',
        'DTP*357*D8*20251231~',
        'EB*1**30**AETNA CHOICE POS II~',
        'EB*C*FAM*30**HEALTH BENEFIT PLAN*23*3000*****Y~     // Annual deductible $3,000',
        'EB*F*FAM*30**HEALTH BENEFIT PLAN*23*3000*****Y~     // Deductible MET $3,000',
        'EB*G*FAM*30**HEALTH BENEFIT PLAN*23*8500*****Y~     // OOP max $8,500',
        'EB*A*FAM*30**HEALTH BENEFIT PLAN*23*4180*****Y~     // OOP met $4,180',
        'EB*A*IND**30**********20~                            // 20% coinsurance',
        'EB*1**30****J9045~                                   // Carboplatin covered',
        'EB*1**30****J9305~                                   // Pemetrexed covered',
        'EB*B**30****J9305****Y~                              // Pemetrexed PA REQUIRED',
        'EB*B**30****J9045****Y~                              // Carboplatin PA REQUIRED',
        'EB*L*FAM*30~                                         // Lifetime max — none',
        'MSG*PA #PA-AET-ONC-2025-19847 ON FILE - VALID 03/13/2025-09/13/2025~',
        'SE*23*0001~',
        'GE*1*4271~',
        'IEA*1*000004271~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Eligibility Bot — outcome',
      body: 'Active coverage confirmed. Deductible fully met → no patient deductible owed at Cycle 2. 20% coinsurance applies to Aetna allowed amount. PA on file is VALID and tied to NCCN-cited regimen. Bot escalated $500 upfront-coinsurance collection to AI Kiosk and pre-staged Pfizer Oncology Together PAP for downstream maintenance Rx.',
    },
  ],
};

const priorAuth: StageDetail = {
  stageId: 'priorAuth',
  intro:
    'Initial PA was DENIED by Aetna UM citing missing first-line intent documentation (CO-50). The AI Auth + Appeal Agents pulled NCCN v2.2025 plus EGFR L858R molecular evidence and overturned the denial in 6 days — well under the industry 14–30 day median.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'PA outcome', value: 'OVERTURNED', sub: '6 days end-to-end' },
        { label: 'Initial denial', value: 'CO-50', sub: 'Med necessity gap' },
        { label: 'Appeal evidence', value: '9 docs', sub: 'NCCN + EGFR + plan' },
        { label: 'AI overturn confidence', value: '94.7%' },
        { label: 'Auth #', value: 'PA-AET-ONC-2025-19847' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Real-time payer-portal probe (Aetna ProviderPortal & NaviNet)',
      columns: ['Step', 'Source', 'Probe', 'Result', 'Latency'],
      rows: [
        ['1', 'Aetna ProviderPortal', 'CPT 96413 + J9045 + J9305 PA-required check', 'PA REQUIRED', '420ms'],
        ['2', 'Aetna CPB-0516', 'Pemetrexed clinical policy (target therapy lung)', 'Coverage policy located', '180ms'],
        ['3', 'Aetna LCD/NCD index', 'NCD 110.6 chemotherapy / LCD L36382', 'NCCN Cat 1 required', '95ms'],
        ['4', 'NaviNet auth queue', 'Existing PA on file?', 'NONE — must submit', '210ms'],
        ['5', 'CoverMyMeds', 'Same-payer prior ePA history (member)', 'No prior denials', '160ms'],
      ],
      footer:
        'AI Auth Engine — auto-orchestrated 5-source live probe in 1.06s. Decision: PA must be submitted via 278 with NCCN-cited rationale.',
    },
    {
      kind: 'edi',
      title: 'B · Outbound 278 prior-authorization request',
      transaction: '278',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*60054ZZ        *250307*1015*^*00501*000003821*0*P*:~',
        'GS*HI*RCMDEMOPROVIDR*60054ZZ*20250307*1015*3821*X*005010X217~',
        'ST*278*0001*005010X217~',
        'BHT*0007*13*PA-7291-C2*20250307*1015~',
        'HL*1**20*1~',
        'NM1*X3*2*AETNA*****46*60054~',
        'HL*2*1*21*1~',
        'NM1*1P*2*CHICAGO ONCOLOGY & INFUSION PARTNERS*****XX*7291084563~',
        'HL*3*2*22*1~',
        'NM1*IL*1*CHEN*ROBERT*A***MI*AET-PPO-8821047-IL~',
        'DMG*D8*19581104*M~',
        'HL*4*3*EV*0~',
        'TRN*1*RCM-AUTH-19847*9RCMDEMO~',
        'UM*HS*I*1*22:B*Y***Y~',
        'DTP*AAH*D8*20250318~                                 // First service date',
        'DTP*291*RD8*20250318-20250918~                       // 6-cycle period',
        'HSD*VS*1*WK*1*34*6~                                  // 6 sessions, weekly',
        'HI*BK:C3411*BF:C7801*BF:Z136*BF:J910~                // ICD-10 dx',
        'HI*BR:96413*BR:J9045*BR:J9305*BR:J0881*BR:J1441~     // CPT/HCPCS',
        'PWK*OZ*EL*1*AC*RCM-PKT-7291-C2~                      // NCCN evidence packet',
        'MSG*REGIMEN: CARBOPLATIN AUC5 + PEMETREXED 500MG/M2; EGFR L858R+ NSCLC STAGE IV~',
        'MSG*NCCN GUIDELINES V2.2025 NSCLC PG 47 - CATEGORY 1 RECOMMENDATION~',
        'SE*20*0001~',
        'GE*1*3821~',
        'IEA*1*000003821~',
      ],
    },
    {
      kind: 'json',
      title: 'C · Submission via Aetna ProviderPortal API (JSON variant)',
      payload: {
        transactionType: 'priorAuthorization',
        memberId: 'AET-PPO-8821047-IL',
        provider: { npi: '7291084563', name: 'Chicago Oncology & Infusion Partners' },
        rendering: { npi: '4819203746', name: 'Mei-Ling Park, MD' },
        diagnoses: ['C34.11', 'C78.01', 'Z13.6', 'J91.0'],
        regimen: {
          name: 'Carboplatin + Pemetrexed (1st-line, EGFR+ NSCLC)',
          cycles: 6,
          frequency: 'every 21 days',
          drugs: [
            { hcpcs: 'J9045', dose: 'AUC 5 (BSA-calculated 620 mg)', units: 12.4 },
            { hcpcs: 'J9305', dose: '500 mg/m² (BSA-calculated 925 mg)', units: 1.85 },
            { hcpcs: 'J0881', dose: '200 mcg', units: 200 },
            { hcpcs: 'J1441', dose: '480 mcg SC', units: 1 },
          ],
        },
        clinicalEvidence: {
          pathology: 'Adenocarcinoma 8255/3 confirmed Northwestern Memorial 02/28/2025',
          molecular: { EGFR: 'L858R positive', ALK: 'negative', PD_L1: '35% TPS' },
          staging: 'T3N2M1b — pleural mets bilateral; CT chest 02/27/2025',
          ecog: 1,
          priorTherapies: 'None — first-line intent',
        },
        guidelineCitation: {
          source: 'NCCN Non-Small Cell Lung Cancer Guidelines v2.2025',
          page: 47,
          recommendation:
            'Carboplatin/Pemetrexed is a Category 1 first-line option for stage IV non-squamous NSCLC with EGFR-sensitizing mutations after EGFR TKI progression OR as combination therapy.',
        },
        attestation: 'Mei-Ling Park, MD — March 7, 2025',
      },
    },
    {
      kind: 'timeline',
      title: 'D · Prior-auth timeline — denial → AI appeal → overturn',
      events: [
        { date: '03/07/2025', label: 'PA Request Submitted', agent: 'AI Auth Engine', detail: 'Regimen Carbo AUC5 + Pem 500mg/m²; DX C34.11 Stage IV; EGFR L858R+; NCCN Cat 1', status: 'success' },
        { date: '03/10/2025', label: 'PA DENIED — Initial', agent: 'Aetna Utilization Management', detail: 'CO-50 — Not Medically Necessary. UM stated "insufficient documentation of first-line intent and prior therapy attestation." 3 days elapsed.', status: 'fail' },
        { date: '03/11/2025 14:09', label: 'AI Denial Analysis', agent: 'AI Denial Engine', detail: 'Classified appealable (94.7% overturn confidence). Root cause = oncologist attestation gap, not clinical merit.', status: 'success', ms: 480000 },
        { date: '03/11/2025 14:21', label: 'AI Appeal Packet Compiled', agent: 'AI Appeal Agent', detail: '9-doc packet: NCCN v2.2025 pg 47 cite, EGFR L858R path, CT staging, ECOG, Aetna CPB-0516 contradiction, Dr. Park signed letter, prior PA history, member benefits, regimen plan.', status: 'success', ms: 720000 },
        { date: '03/11/2025 14:30', label: 'Appeal Submitted via Aetna Portal', agent: 'AI Appeal Agent', detail: 'Appeal ID AET-APPEAL-PA-2025-77291 — confirmed received electronically.', status: 'success' },
        { date: '03/13/2025 16:15', label: 'PA APPEAL OVERTURNED — Approved', agent: 'Aetna Med Director Dr. R. Farhan', detail: 'Full reversal. Auth #PA-AET-ONC-2025-19847. All 6 cycles of Carbo/Pem authorized through 09/13/2025.', status: 'success' },
      ],
    },
    {
      kind: 'medicalRecord',
      title: 'E · Auth denial evaluation — medical record consolidation against NCCN policy',
      sections: [
        {
          heading: 'AI Denial Engine — denial classification',
          body: 'Aetna UM letter parsed. Denial reason: CO-50 "Insufficient documentation of first-line intent and prior-therapy attestation." Classified as APPEALABLE — documentation gap, not clinical merit (94.7% overturn confidence based on 87% historical reversal rate for same payer + EGFR-mutated NSCLC).',
          flags: ['Denial: CO-50', 'Appealable'],
        },
        {
          heading: 'Consolidated medical record vs NCCN required elements',
          body: '✓ Pathology — Adenocarcinoma 8255/3 confirmed Northwestern Memorial 02/28/2025\n✓ Stage — T3N2M1b stage IV with bilateral pleural mets (CT 02/27/2025)\n✓ Molecular — EGFR exon 21 L858R positive, ALK negative, PD-L1 35% TPS, Ki-67 42%\n✓ Performance status — ECOG 1 (ambulatory; light work)\n✓ First-line intent — No prior cytotoxic therapy administered\n✓ Comorbidity profile — controlled HTN, T2DM (no contraindications)\n✓ Histology — Non-squamous (required for pemetrexed eligibility per NCCN)',
          flags: ['7 of 7 NCCN elements present'],
        },
        {
          heading: 'Validation against NCCN NSCLC v2.2025 (NSCL-J pg 47)',
          body: 'NCCN required: stage IV non-squamous NSCLC + EGFR-sensitizing mutation + ECOG 0–2 + first-line OR post-TKI progression. Patient meets ALL four criteria. Carboplatin + Pemetrexed is the Category 1 standard-of-care chemotherapy backbone for this exact clinical profile.',
          flags: ['NCCN Cat 1 — match'],
        },
        {
          heading: 'Validation against Aetna CPB-0516 (Targeted Therapy / Lung)',
          body: 'Aetna policy explicitly authorizes Pemetrexed in combination with platinum agents for first-line treatment of stage IIIB/IV non-squamous NSCLC, regardless of EGFR mutation status. Therefore the CO-50 denial is INTERNALLY INCONSISTENT with the payer\'s own published policy — surfaced as a documentation gap, not a clinical objection.',
          flags: ['Payer policy contradiction'],
        },
        {
          heading: 'AI verdict & next-step recommendation',
          body: 'Appeal with full reversal expected. Strategy: (1) cite NCCN Cat 1 by page #, (2) cite Aetna CPB-0516 verbatim contradiction, (3) attach pathology + staging + molecular evidence, (4) include oncologist attestation with explicit first-line intent statement. Estimated overturn ETA = 8 days.',
          flags: ['AI confidence 94.7%'],
        },
      ],
    },
    {
      kind: 'policyCitation',
      title: 'F · NCCN guideline cited in appeal',
      source: 'NCCN Non-Small Cell Lung Cancer Guidelines v2.2025',
      pageRef: 'page 47 (NSCL-J)',
      quote:
        'For patients with stage IV non-squamous NSCLC harboring an EGFR sensitizing mutation, carboplatin + pemetrexed (with or without bevacizumab) is a Category 1 chemotherapy backbone after EGFR TKI progression, and may be used as combination therapy with osimertinib in selected first-line scenarios. Performance status ECOG 0–2 supports curative-intent dosing.',
    },
    {
      kind: 'policyCitation',
      title: 'G · Aetna policy contradiction surfaced by AI',
      source: 'Aetna Clinical Policy Bulletin CPB-0516 — Targeted Therapy / Lung',
      quote:
        'Pemetrexed is considered medically necessary in combination with platinum agents for first-line treatment of stage IIIB/IV non-squamous NSCLC. Coverage applies regardless of EGFR mutation status when used as first-line non-targeted backbone.',
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Appeal Agent · outcome',
      body: 'Aetna policy CPB-0516 explicitly authorizes the regimen — appeal demonstrated CO-50 was a documentation defect, not a clinical one. Same-day MD attestation + NCCN citation drove a 6-day end-to-end PA cycle vs. 14–30 day industry median.',
    },
  ],
};

const cdi: StageDetail = {
  stageId: 'cdi',
  intro:
    'AI CDI Assistant scanned the medical record and surfaced 3 documentation opportunities (EGFR mutation specificity, neuropathy, hemoptysis). Two compliant queries were sent to the oncologist — both answered same-day, capturing HCC 75 (peripheral neuropathy) and strengthening the appeal narrative.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Documents reviewed', value: '12', sub: 'EHR notes + path + imaging' },
        { label: 'CDI queries sent', value: '2 of 3 candidates' },
        { label: 'Physician response', value: '100%', sub: 'Same-day' },
        { label: 'HCCs added', value: '+1 HCC 75', sub: 'Peripheral neuropathy' },
        { label: 'RAF impact', value: '+0.254' },
      ],
    },
    {
      kind: 'medicalRecord',
      title: 'A · Medical record — Cycle 2 oncology note (Dr. Park, 03/18/2025)',
      sections: [
        {
          heading: 'Chief complaint',
          body: 'Cycle 2 carboplatin + pemetrexed for stage IV EGFR-mutated lung adenocarcinoma. Patient reports tolerable cycle 1 with mild grade-1 nausea controlled by ondansetron and new onset bilateral foot tingling that started post-cycle 1, ECOG 1.',
          flags: ['CDI candidate'],
        },
        {
          heading: 'History of present illness',
          body: 'Mr. Chen is a 66-year-old former smoker (30 pack-years, quit 2014) diagnosed in February 2025 with stage IV non-squamous NSCLC of the right upper lobe with bilateral pleural metastatic involvement (T3N2M1b). Pathology dated 02/28 (Northwestern Memorial) confirms adenocarcinoma 8255/3 with EGFR exon 21 L858R mutation positive, ALK negative, PD-L1 35% TPS, Ki-67 42%. Initial PA for first-line carboplatin + pemetrexed was denied by Aetna 03/10 on documentation grounds, overturned on appeal 03/13 with all 6 cycles authorized through 09/13.',
        },
        {
          heading: 'Interim history (since cycle 1)',
          body: 'Cycle 1 administered 02/25 without acute infusion reactions. Patient reports new onset bilateral lower extremity tingling and numbness over the past 7 days consistent with chemotherapy-induced peripheral neuropathy. He also describes one episode of streaks of blood in sputum on 03/15 lasting <30 minutes, no recurrence. No fevers, weight loss, or bone pain.',
          flags: ['CDI candidate', 'New finding'],
        },
        {
          heading: 'Physical examination',
          body: 'Vitals: BP 138/84, HR 78, T 98.4°F, SpO₂ 96% RA. General: comfortable, NAD. CV: RRR, no murmurs. Lungs: decreased breath sounds RUL with dullness to percussion (consistent with pleural effusion). Neuro: decreased pinprick sensation bilateral feet to mid-shin, vibration sense diminished, gait stable.',
        },
        {
          heading: 'Labs / imaging review',
          body: 'CBC 03/18 pre-chemo: WBC 6.2K, ANC 1.8K, Hgb 10.1, Plt 148K. CMP: Cr 0.9, K 4.2, Glu 156 (DM). LFTs WNL. CT chest 02/27 reviewed — RUL primary 4.7cm, mediastinal LAD, bilateral pleural mets. CEA tumor marker 03/18 = 84 ng/mL (down from 117 at dx).',
          flags: ['HCC capture'],
        },
        {
          heading: 'Assessment & plan',
          body: '1. Stage IV NSCLC EGFR L858R+ — proceed cycle 2 carboplatin AUC5 + pemetrexed 500 mg/m². Folic acid + B12 documented per protocol. 2. Chemotherapy-induced peripheral neuropathy — likely cycle 1 onset; document and grade. 3. Hemoptysis — single self-limited episode; no imaging change; monitor. 4. T2DM with hyperglycemia (steroid-related) — sliding-scale insulin. 5. Hypertension — continue lisinopril.',
          flags: ['CDI follow-up'],
        },
      ],
    },
    {
      kind: 'cdiQueries',
      title: 'B · AI-drafted CDI queries (compliant, non-leading)',
      queries: [
        {
          id: 'CDI-Q-7291-01',
          question:
            'The 03/18 progress note documents "bilateral foot tingling and decreased pinprick sensation to mid-shin" attributed to chemotherapy. To support specific coding, can you confirm the diagnosis as documented?',
          options: [
            'Drug-induced peripheral neuropathy (G62.0)',
            'Diabetic peripheral neuropathy (E11.40)',
            'Toxic neuropathy due to drugs (G62.81)',
            'Unspecified polyneuropathy (G62.9)',
            'Other — please specify',
          ],
          rationale:
            'Documentation supports a drug-induced etiology (cycle 1 onset, no diabetic history of neuropathy, classic stocking distribution). Specifying G62.0 captures HCC 75 (RAF +0.254) and strengthens the medical-necessity narrative for ongoing chemotherapy supportive care.',
          status: 'answered',
          physician: 'Dr. Mei-Ling Park, MD — answered 03/18 14:25',
        },
        {
          id: 'CDI-Q-7291-02',
          question:
            'Hemoptysis episode documented 03/15. Can you confirm whether this represents an acute or chronic finding for this encounter?',
          options: [
            'Acute hemoptysis, single episode (R04.2)',
            'Chronic hemoptysis (R04.2 + ongoing)',
            'Resolved — no current finding',
          ],
          rationale:
            'Distinct from primary diagnosis. Coding R04.2 supports clinical severity narrative for the appeal packet (Stage IV evidence) and avoids inappropriately coding as cancer-related complication.',
          status: 'pending',
          physician: 'Dr. Mei-Ling Park, MD — open',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'CDI Query Template — ACDIS-compliant',
      body:
        'Each AI-generated query is non-leading, includes clinical evidence excerpts, offers ≥3 reasonable options including "no clinically significant finding", and routes through the EHR queue with a 24-hour SLA. All queries are auto-attached to the encounter for the audit trail.',
    },
  ],
};

const charge: StageDetail = {
  stageId: 'charge',
  intro:
    'AI Charge Engine assembled 16 charge lines for Cycle 2 — 7 oncology drugs (NDC verified, BSA-doses confirmed), 4 admin codes (CCI-checked), 3 labs, 1 E&M, and 1 hydration line auto-flagged for CO-B13 bundling.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Charge lines', value: '16/16', sub: 'NDC verified' },
        { label: 'Total billed', value: '$42,101.97' },
        { label: 'BSA-dose accuracy', value: '100%', sub: 'Carbo & Pem' },
        { label: 'CCI conflicts', value: '0' },
        { label: 'CO-B13 bundle flags', value: '1', sub: 'Hydration with chemo' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Cycle 2 charge ledger — 03/18/2025',
      columns: ['Line', 'Rev', 'HCPCS', 'Drug / Service', 'NDC', 'Dose', 'Units', 'Charge', 'AI audit'],
      rows: [
        ['001', '0636', 'J9045', 'Carboplatin 50mg/vial', '63323-193-10', '620mg', 12.4, '$9,379.98', 'BSA-dose verified'],
        ['002', '0636', 'J9305', 'Pemetrexed 500mg/vial', '66658-232-01', '925mg', 1.85, '$17,020.00', 'BSA-dose verified'],
        ['003', '0636', 'J2469', 'Palonosetron 0.25mg IV', '62856-720-01', '0.25mg', 1, '$89.00', 'NDC verified'],
        ['004', '0636', 'J0881', 'Darbepoetin alfa 200mcg ESA', '55513-126-01', '200mcg', 200, '$420.00', 'NDC verified'],
        ['005', '0636', 'J1441', 'Filgrastim 480mcg SC', '55513-530-01', '480mcg', 1, '$198.00', 'NDC verified'],
        ['006', '0636', 'J9999', 'Folic acid 1mg PO x7d', '—', '1mg/d', 7, '$3.99', 'Pem protocol req'],
        ['007', '0636', 'J3370', 'Vancomycin port flush 500mg', '00703-4402-01', '500mg', 1, '$18.00', 'NDC verified'],
        ['008', '0260', 'J7040', 'Normal Saline 1000mL ×2', '00338-0049-03', '2000mL', 2, '$28.00', 'CO-B13 BUNDLE FLAG'],
        ['009', '0331', '96413', 'Chemo IV initial drug >1 hr', 'N/A', '120 min', 1, '$2,100.00', 'CCI clean'],
        ['010', '0332', '96415', 'Chemo IV each addl hour', 'N/A', '60 min ×3', 3, '$1,440.00', 'CCI clean'],
        ['011', '0332', '96417', 'Chemo admin sequential drug', 'N/A', '60 min', 1, '$560.00', 'CCI clean'],
        ['012', '0332', '96401', 'Chemo admin non-hormonal inj', 'N/A', 'SC', 1, '$185.00', 'Clean'],
        ['013', '0510', '99214', 'E&M established mod-complex', 'N/A', '1 visit', 1, '$320.00', 'MDM documented'],
        ['014', '0300', '85025', 'CBC w/ Diff pre-chemo', 'N/A', '1', 1, '$85.00', 'Clean'],
        ['015', '0300', '80053', 'Comprehensive Metabolic Panel', 'N/A', '1', 1, '$110.00', 'Clean'],
        ['016', '0300', '86316', 'CEA tumor marker monitor', 'N/A', '1', 1, '$145.00', 'Clean'],
      ],
      footer: 'Total billed Cycle 2 = $42,101.97 · 16 lines · all NDCs reconciled vs pharmacy dispense log · 1 line flagged for CO-B13 bundling (Aetna pays $0 for IV hydration concurrent with chemo).',
    },
    {
      kind: 'callout',
      tone: 'warn',
      title: 'AI Charge Engine — bundling alert',
      body: 'Line 008 (Normal Saline IV hydration J7040) overlaps the chemotherapy infusion window. Aetna applies CO-B13 bundling; expected allowed = $0. Charge retained on the bill for transparency but pre-flagged on the 837 to suppress patient liability.',
    },
  ],
};

const coding: StageDetail = {
  stageId: 'coding',
  intro:
    'AI Auto-Coder v3.1 produced 14 ICD-10-CM diagnoses, 1 ICD-O-3 morphology/topography pair, 7 HCPCS Level II drug codes, and 5 CPT administration codes. Every code carries a confidence score, the source text from the medical record (explainability), and is editable by the coder.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'ICD-10-CM', value: '14 codes', sub: 'avg conf 96.4%' },
        { label: 'ICD-O-3', value: 'C34.1 / 8255/3', sub: 'Adenocarcinoma' },
        { label: 'HCPCS Lvl II', value: '7 drug codes' },
        { label: 'CPT admin', value: '5 codes' },
        { label: 'Total RAF', value: '4.366', sub: '5 HCCs captured' },
      ],
    },
    {
      kind: 'coding',
      title: 'A · ICD-10-CM diagnoses with explainability',
      codes: [
        { code: 'C34.11', description: 'Malignant neoplasm, upper lobe, right bronchus/lung', confidence: 0.992, type: 'Principal · HCC 9', editable: true, sourceText: 'Stage IV non-squamous NSCLC of the right upper lobe… pathology dated 02/28 (Northwestern Memorial) confirms adenocarcinoma 8255/3' },
        { code: 'C78.01', description: 'Secondary malignant neoplasm of right lung (pleural mets)', confidence: 0.976, type: 'Secondary · HCC 9', editable: true, sourceText: 'bilateral pleural metastatic involvement (T3N2M1b)' },
        { code: 'Z13.6', description: 'Genetic susceptibility — EGFR L858R mutation', confidence: 0.981, type: 'Genetic · CDI flagged', editable: true, sourceText: 'EGFR exon 21 L858R mutation positive — central to Carbo-Pem regimen choice' },
        { code: 'J91.0', description: 'Malignant pleural effusion', confidence: 0.964, type: 'Complication · HCC 9', editable: true, sourceText: 'decreased breath sounds RUL with dullness to percussion (consistent with pleural effusion)' },
        { code: 'G62.0', description: 'Drug-induced peripheral neuropathy', confidence: 0.929, type: 'Adverse effect · HCC 75', editable: true, sourceText: 'bilateral foot tingling… decreased pinprick sensation to mid-shin attributed to chemotherapy — CDI-confirmed by Dr. Park 03/18' },
        { code: 'T45.1X5A', description: 'Adverse effect antineoplastic drugs — initial', confidence: 0.967, type: 'Adverse effect · HCC 23', editable: true, sourceText: 'Cycle 1 administered 02/25… new onset peripheral neuropathy attributed to chemotherapy' },
        { code: 'R04.2', description: 'Hemoptysis', confidence: 0.938, type: 'Symptom · CDI flagged', editable: true, sourceText: 'one episode of streaks of blood in sputum on 03/15 lasting <30 minutes' },
        { code: 'E11.65', description: 'Type 2 DM with hyperglycemia', confidence: 0.973, type: 'Comorbidity · HCC 18', editable: true, sourceText: 'Glu 156 (DM) — hyperglycemia documented during steroid pre-med' },
        { code: 'I10', description: 'Essential hypertension', confidence: 0.995, type: 'Comorbidity · HCC 85', editable: true, sourceText: 'BP 138/84… continue lisinopril' },
        { code: 'Z79.899', description: 'Long-term use of chemotherapy', confidence: 0.988, type: 'Long-term Rx', editable: true, sourceText: 'proceed cycle 2 carboplatin AUC5 + pemetrexed 500 mg/m²' },
        { code: 'Z87.891', description: 'Personal history of nicotine dependence', confidence: 0.912, type: 'Social Hx', editable: true, sourceText: 'former smoker (30 pack-years, quit 2014)' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'B · ICD-O-3 oncology registry data',
      rows: [
        { label: 'Topography', value: 'C34.1 — Upper lobe, bronchus or lung' },
        { label: 'Morphology', value: '8255/3 — Adenocarcinoma w/ mixed subtypes', emphasis: true },
        { label: 'Behavior', value: '3 — Malignant' },
        { label: 'Grade', value: 'Grade II–III' },
        { label: 'EGFR', value: 'L858R Positive', emphasis: true },
        { label: 'ALK', value: 'Negative' },
        { label: 'PD-L1', value: '35% (TPS)' },
        { label: 'Ki-67', value: '42%' },
        { label: 'TNM', value: 'T3N2M1b' },
        { label: 'Stage', value: 'Stage IV', emphasis: true },
        { label: 'LN status', value: '4/12 mediastinal positive' },
        { label: 'Distant mets', value: 'Bilateral pleural' },
      ],
    },
    {
      kind: 'coding',
      title: 'C · HCPCS Level II drug codes — Cycle 2',
      codes: [
        { code: 'J9045', description: 'Carboplatin 50mg/vial — AUC 5 (BSA-calc 620mg)', confidence: 0.999, type: '12.4 units · NDC 63323-193-10', editable: true, sourceText: 'AUC5 dose calculated against BSA 1.85m² → 620mg → 12.4 vials' },
        { code: 'J9305', description: 'Pemetrexed 500mg/vial — 500 mg/m² (BSA-calc 925mg)', confidence: 0.999, type: '1.85 units · NDC 66658-232-01', editable: true, sourceText: '500 mg/m² × BSA 1.85m² = 925mg → 1.85 vials; B12+folic acid documented per protocol' },
        { code: 'J2469', description: 'Palonosetron 0.25mg IV (antiemetic)', confidence: 0.998, type: '1 unit', editable: true, sourceText: 'Pre-chemo antiemetic per regimen' },
        { code: 'J0881', description: 'Darbepoetin alfa 200mcg (ESA — anemia)', confidence: 0.991, type: '200 units', editable: true, sourceText: 'Hgb 10.1 → ESA per protocol; PA-AET-ONC-2025-19847' },
        { code: 'J1441', description: 'Filgrastim 480mcg SC (G-CSF)', confidence: 0.994, type: '1 unit', editable: true, sourceText: 'Cycle 1 ANC nadir 0.9 → primary prophylaxis G-CSF added' },
      ],
    },
    {
      kind: 'coding',
      title: 'D · CPT administration codes',
      codes: [
        { code: '96413', description: 'Chemo IV infusion — initial drug, ≥1 hour', confidence: 0.998, modifier: 'Initial', type: 'Per encounter — first', editable: true, sourceText: 'Carboplatin infused 09:30 over 60 min → first chemo of session' },
        { code: '96415', description: 'Chemo IV — each additional hour', confidence: 0.995, modifier: '×3', type: 'Add-on units', editable: true, sourceText: 'Pemetrexed extended over 3 additional hours' },
        { code: '96417', description: 'Chemo admin — sequential drug', confidence: 0.989, type: 'Sequential', editable: true, sourceText: 'Pemetrexed administered sequentially after Carboplatin' },
        { code: '96401', description: 'Chemo admin non-hormonal injection', confidence: 0.984, type: 'SC', editable: true, sourceText: 'Filgrastim 480mcg SC injection at end of session' },
        { code: '99214', description: 'E&M established patient, moderate complexity', confidence: 0.962, modifier: '25', type: 'MDM moderate', editable: true, sourceText: 'Dr. Park MDM included neuropathy assessment + hemoptysis triage + chemo plan adjustment' },
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'No DRG / ICD-10-PCS for this case',
      body: 'Outpatient oncology infusion — no inpatient stay → no MS-DRG or ICD-10-PCS assignment. Procedural coding handled via HCPCS J-codes + CPT 96xxx infusion administration. The DRG/PCS workflow is fully demonstrated in the Inpatient (CHF) case.',
    },
  ],
};

const claim: StageDetail = {
  stageId: 'claim',
  intro:
    'AI Claim Scrubber ran 13 oncology-specific edits (LCD L36382, NCD 110.6, NDC, BSA-units, B12/folic, CCI, PA linkage, dx-drug). All passed in 10 minutes. The 837P was accepted by Change Healthcare on first submission with ICN AET-CLM-2025-0318-ONC.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Edits passed', value: '13/13', sub: 'Oncology-specific' },
        { label: 'Clean claim rate', value: '100%' },
        { label: 'Submission', value: '837P · accepted', sub: 'Change Healthcare' },
        { label: 'ICN', value: 'AET-CLM-2025-0318-ONC' },
        { label: 'Submitted', value: '03/19/2025' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'A · CMS-1500 / 837P claim summary',
      rows: [
        { label: 'Claim #', value: 'AET-CLM-2025-0318-ONC' },
        { label: 'Claim type', value: 'Professional Outpatient — Oncology Infusion' },
        { label: 'Bill type', value: '131 — Hospital Outpatient / Oncology' },
        { label: 'Place of service', value: '22 — Outpatient Hospital / Cancer Center' },
        { label: 'Provider NPI', value: '7291084563' },
        { label: 'Provider name', value: 'Chicago Oncology & Infusion Partners' },
        { label: 'Tax ID', value: '36-7812345' },
        { label: 'Rendering NPI', value: '4819203746 — Dr. Mei-Ling Park' },
        { label: 'Patient acct #', value: 'ENC-ONC-2025-7291' },
        { label: 'Service date', value: '03/18/2025' },
        { label: 'PA # on claim', value: 'PA-AET-ONC-2025-19847', emphasis: true },
        { label: 'Total charges', value: '$42,101.97', emphasis: true },
        { label: 'Claim frequency', value: '1 — Original' },
        { label: 'Vitamin B12/Folic', value: 'Documented — Pemetrexed protocol' },
      ],
    },
    {
      kind: 'table',
      title: 'B · Oncology scrubbing edits — 13/13 passed',
      columns: ['Edit', 'Type', 'Rule', 'Description', 'Result', 'AI resolution'],
      rows: [
        ['SCR-001', 'LCD', 'L36382', 'Med necessity Carboplatin NSCLC Stage IV', 'PASSED', 'DX-drug crosswalk verified'],
        ['SCR-002', 'LCD', 'L36382', 'Med necessity Pemetrexed non-squamous NSCLC', 'PASSED', 'Non-squamous histology confirmed'],
        ['SCR-003', 'NCD', '110.6', 'Chemotherapy NCCN Cat 1 required', 'PASSED', 'NCCN Cat 1 Carbo+Pem documented'],
        ['SCR-004', 'NDC', 'AI-NDC-ALL', 'NDC vs pharmacy dispense log', 'PASSED', '6/6 NDCs matched'],
        ['SCR-005', 'Unit', 'AI-UNIT-BSA', 'BSA-calc units (Carbo + Pem)', 'PASSED', 'Carbo 12.4u; Pem 1.85u verified'],
        ['SCR-006', 'Auth', 'AI-PA-LINK', 'PA on all authorized lines', 'PASSED', 'PA-19847 embedded ×4 lines'],
        ['SCR-007', 'CCI', 'CCI-96413', 'Infusion admin sequencing', 'PASSED', '96413 → 96415 → 96417 OK'],
        ['SCR-008', 'B12/Folic', 'AI-PEM-SUPP', 'Vit B12 + Folic Acid (Pem req)', 'PASSED', 'Documentation present'],
        ['SCR-009', 'DX-Drug', 'AI-DX-DRUG', 'DX-drug appropriateness', 'PASSED', 'EGFR+ NSCLC → Carbo-Pem validated'],
        ['SCR-010', 'POS', 'AI-POS-22', 'POS 22 outpatient hospital', 'PASSED', 'POS 22 confirmed'],
        ['SCR-011', 'Mod', 'AI-MOD-25', 'E&M w/ procedure → mod 25', 'PASSED', 'Mod 25 added to 99214'],
        ['SCR-012', 'Bundle', 'AI-BUNDLE', 'Hydration + chemo bundle', 'PASSED', 'CO-B13 flagged on line 008'],
        ['SCR-013', 'Timely', 'AI-TF', 'Filing within payer window', 'PASSED', 'Filed Day +1 post-service'],
      ],
    },
    {
      kind: 'edi',
      title: 'C · 837P claim — key segments (oncology infusion)',
      transaction: '837P',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*60054ZZ        *250319*0905*^*00501*000005112*0*P*:~',
        'GS*HC*RCMDEMOPROVIDR*60054ZZ*20250319*0905*5112*X*005010X222A1~',
        'ST*837*0001*005010X222A1~',
        'BHT*0019*00*RCM-ONC-7291-C2*20250319*0905*CH~',
        'NM1*41*2*CHICAGO ONCOLOGY & INFUSION PARTNERS*****46*7291084563~',
        'NM1*40*2*AETNA*****46*60054~',
        'HL*1**20*1~',
        'NM1*85*2*CHICAGO ONCOLOGY & INFUSION PARTNERS*****XX*7291084563~',
        'REF*EI*36-7812345~',
        'HL*2*1*22*1~',
        'SBR*P*18*GRP-57291-MIDTECH*****CI~',
        'NM1*IL*1*CHEN*ROBERT*A***MI*AET-PPO-8821047-IL~',
        'DMG*D8*19581104*M~',
        'NM1*PR*2*AETNA*****PI*60054~',
        'CLM*ENC-ONC-2025-7291*42101.97***22:B:1*Y*A*Y*Y~',
        'REF*G1*PA-AET-ONC-2025-19847~                       // PA on claim',
        'HI*ABK:C3411*ABF:C7801*ABF:Z136*ABF:J910*ABF:G620*ABF:T451X5A*ABF:R042*ABF:E1165*ABF:I10*ABF:Z79899~',
        '— LX*1 — J9045 Carboplatin —',
        'LX*1~',
        'SV1*HC:J9045*9379.98*UN*12.4***1~',
        'DTP*472*D8*20250318~',
        'REF*XZ*PA-AET-ONC-2025-19847~',
        'LIN**N4*63323019310~',
        'CTP****12.4*UN~',
        '— LX*2 — J9305 Pemetrexed —',
        'LX*2~',
        'SV1*HC:J9305*17020.00*UN*1.85***1~',
        'DTP*472*D8*20250318~',
        'REF*XZ*PA-AET-ONC-2025-19847~',
        'LIN**N4*66658023201~',
        'CTP****1.85*UN~',
        '— … remaining 14 lines elided for display …',
        'SE*240*0001~',
        'GE*1*5112~',
        'IEA*1*000005112~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Scrubber outcome',
      body: '13/13 oncology edits passed in 10 minutes. 837P accepted on first submission. Best-practice oncology compliance: NCCN-cited regimen, NDC reconciliation, BSA dose math, B12/folic protocol attestation, PA embedded on all 4 authorized drug lines.',
    },
  ],
};

const denial: StageDetail = {
  stageId: 'denial',
  intro:
    'Aetna denied the entire $42,101.97 claim on CO-50 (not medically necessary) + N-390 (missing documentation) on 03/26. The AI Denial Engine classified the denial as appealable with 94.7% overturn confidence. AI Appeal Agent assembled a 9-document packet with NCCN + EGFR + Aetna CPB-0516 contradiction; Dr. Park signed and the appeal won full reversal in 8 days.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Denial outcome', value: 'OVERTURNED', sub: 'Full reversal' },
        { label: 'AI overturn confidence', value: '94.7%' },
        { label: '$ at risk → recovered', value: '$42,101.97' },
        { label: 'Appeal cycle', value: '8 days', sub: 'vs 21–45 day avg' },
        { label: 'Appeal cost', value: '$0', sub: 'AI-automated' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'A · Denial record — initial adjudication',
      rows: [
        { label: 'Claim #', value: 'AET-CLM-2025-0318-ONC' },
        { label: 'ICN', value: 'AET-ICN-20250326-7291' },
        { label: 'Payer', value: 'Aetna Commercial PPO' },
        { label: 'Date denial received', value: '03/26/2025' },
        { label: 'Primary CARC', value: 'CO-50 — Non-covered services', emphasis: true },
        { label: 'Secondary RARC', value: 'N-390 — Missing/incomplete documentation' },
        { label: 'Denial reason (verbatim)', value: '"Insufficient documentation of first-line intent and prior-therapy attestation. Coverage not established under Aetna clinical criteria for stage IV NSCLC chemotherapy."' },
        { label: 'Total denied', value: '$42,101.97 (all lines)', emphasis: true },
        { label: 'Denial category', value: 'Medical Necessity — Documentation Gap' },
        { label: 'AI risk assessment', value: 'HIGH — appealable; AI confidence 94.7%' },
        { label: 'Appeal deadline', value: '04/25/2025 (30 days)' },
        { label: 'AI recommendation', value: 'APPEAL IMMEDIATELY — NCCN Cat 1 + EGFR L858R = strong basis', emphasis: true },
      ],
    },
    {
      kind: 'timeline',
      title: 'B · AI Appeal Agent — fully automated workflow',
      events: [
        { date: '03/26 14:00', label: 'Denial received & parsed', agent: 'AI Denial Engine', detail: 'ERA 835 parsed; CO-50 + N-390 identified; full denial letter ingested.', status: 'success' },
        { date: '03/26 14:01', label: 'Root cause analysis', agent: 'AI Clinical Rules Engine', detail: 'Documentation gap — Aetna requires explicit first-line intent + oncologist attestation. Not a clinical merit issue.', status: 'success', ms: 480000 },
        { date: '03/26 14:09', label: 'Clinical evidence retrieval', agent: 'AI EHR Integration + NLP', detail: 'Pulled 4 EHR docs: path report 02/28 (EGFR L858R), CT staging 02/27, ECOG assessment, oncology treatment plan.', status: 'success', ms: 720000 },
        { date: '03/26 14:21', label: 'NCCN guideline citation', agent: 'AI Guideline Knowledge Base', detail: 'NCCN NSCLC v2.2025 pg 47 — Carbo+Pem Category 1 first-line for non-squamous EGFR+ Stage IV NSCLC.', status: 'success', ms: 300000 },
        { date: '03/26 14:26', label: 'Payer policy contradiction surfaced', agent: 'AI Payer Policy Engine', detail: 'Aetna CPB-0516 explicitly authorizes Pemetrexed first-line non-squamous NSCLC regardless of EGFR status. CO-50 is documentary, not clinical.', status: 'success', ms: 240000 },
        { date: '03/26 14:30', label: 'Appeal letter drafted', agent: 'AI Appeal Agent (Bedrock Claude)', detail: '4-page appeal letter generated: clinical summary, EGFR L858R molecular evidence, NCCN citation, CPB-0516 contradiction, oncologist attestation request.', status: 'success', ms: 1080000 },
        { date: '03/27 09:00', label: 'Oncologist attestation added', agent: 'Dr. Mei-Ling Park, MD', detail: '"Carboplatin + Pemetrexed represents the first-line standard-of-care chemotherapy backbone per NCCN Category 1 for stage IV non-squamous NSCLC with EGFR L858R mutation. No prior cytotoxic therapy. ECOG 1 supports curative-intent dosing."', status: 'success', ms: 1200000 },
        { date: '03/27 09:25', label: 'Appeal submitted to Aetna', agent: 'AI Appeal Agent + Aetna Portal', detail: '9-doc packet submitted electronically. Appeal ID AET-APPEAL-CLM-2025-03847.', status: 'success' },
        { date: '03/28 11:00', label: 'Aetna acknowledgment', agent: 'Aetna Appeals Department', detail: 'Assigned to Med Director Dr. K. Simmons; expected decision 04/05.', status: 'info' },
        { date: '04/04 15:30', label: 'APPEAL OVERTURNED — full reversal', agent: 'Aetna Med Director Dr. K. Simmons', detail: '"Upon review of submitted clinical documentation including EGFR L858R molecular pathology, NCCN v2.2025 Category 1 recommendation, and oncologist attestation, the original denial is reversed. Full claim approved."', status: 'success' },
        { date: '04/04 15:45', label: 'AI post-appeal actions', agent: 'AI Denial Engine', detail: 'Prevention rule deployed: "Auto-attach oncologist attestation + NCCN cite for any oncology PA submission." Logged to AI knowledge base.', status: 'success' },
      ],
    },
    {
      kind: 'callout',
      tone: 'warn',
      title: 'Human review checkpoint',
      body:
        'Although the appeal letter is fully AI-drafted, the platform requires a physician attestation signature before submission. Dr. Park reviewed the AI letter, added a 3-sentence personalized clinical attestation, and electronically signed within 25 minutes — meeting CMS regulatory requirements for prescriber sign-off.',
    },
    {
      kind: 'keyValues',
      title: 'C · Corrected claim & final payment',
      rows: [
        { label: 'Corrected claim #', value: 'AET-CLM-2025-0318-ONC-COR' },
        { label: 'Submission date', value: '04/07/2025' },
        { label: 'Frequency code', value: '7 — Replacement of Prior Claim' },
        { label: 'Appeal reference', value: 'AET-APPEAL-CLM-2025-03847' },
        { label: 'Total charges', value: '$42,101.97' },
        { label: 'Aetna allowed (50% PPO)', value: '$21,050.99' },
        { label: 'Aetna payment EFT', value: '$21,050.99', emphasis: true },
        { label: 'EFT #', value: 'EFT-AET-20250414-ONC-7291' },
        { label: 'Patient deductible', value: '$0.00 — fully met YTD' },
        { label: 'Patient coinsurance 20%', value: '$4,210.20' },
        { label: 'Upfront collected', value: '($500.00)' },
        { label: 'Patient balance remaining', value: '$3,710.20' },
        { label: 'CO-45 contractual write-off', value: '$21,050.98' },
        { label: 'Net revenue collected', value: '$21,550.99', emphasis: true },
        { label: 'Days from service to cash', value: '27 days (incl. 8-day appeal)' },
      ],
    },
  ],
};

const payment: StageDetail = {
  stageId: 'payment',
  intro:
    'AI ERA Bot auto-posted the 835 transaction within minutes of receipt. Aetna paid $21,050.99 EFT on 04/14, CO-45 contractual write-off applied, and patient balance of $3,710.20 was statemented and routed to the AI collections workflow.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Aetna payment', value: '$21,050.99', sub: 'EFT 04/14' },
        { label: 'Patient owed', value: '$3,710.20', sub: 'after $500 upfront' },
        { label: 'CO-45 write-off', value: '$21,050.98', sub: 'contractual' },
        { label: 'Net revenue', value: '$21,550.99' },
        { label: 'Days to cash', value: '27 days' },
      ],
    },
    {
      kind: 'edi',
      title: 'A · 835 ERA — key segments',
      transaction: '835',
      segments: [
        'ISA*00*          *00*          *ZZ*60054ZZ        *ZZ*RCMDEMOPROVIDR *250414*0900*^*00501*000007841*0*P*:~',
        'GS*HP*60054ZZ*RCMDEMOPROVIDR*20250414*0900*7841*X*005010X221A1~',
        'ST*835*0001~',
        'BPR*I*21050.99*C*ACH*CCP*01*021000021*DA*9876543210*1234567890**01*021000021*DA*5555555555*20250414~',
        'TRN*1*EFT-AET-20250414-ONC-7291*1234567890~',
        'REF*EV*60054~',
        'DTM*405*20250414~',
        'N1*PR*AETNA~',
        'N1*PE*CHICAGO ONCOLOGY & INFUSION PARTNERS*XX*7291084563~',
        'LX*1~',
        'CLP*ENC-ONC-2025-7291*1*42101.97*21050.99*4210.20*CI*AET-ICN-20250414-7291*22*7~',
        'NM1*QC*1*CHEN*ROBERT*A***MI*AET-PPO-8821047-IL~',
        'REF*1L*GRP-57291-MIDTECH~',
        'DTM*232*20250318~',
        'SVC*HC:J9045*9379.98*4690*UN*12.4~',
        'CAS*CO*45*4689.98~                                  // Contractual adj',
        'SVC*HC:J9305*17020.00*8510*UN*1.85~',
        'CAS*CO*45*8510.00~',
        'SVC*HC:J7040*28*0*UN*2~',
        'CAS*CO*B13*28~                                      // Bundled hydration',
        '— remaining lines elided —',
        'CAS*PR*1*4210.20~                                   // Patient coinsurance',
        'SE*42*0001~',
        'GE*1*7841~',
        'IEA*1*000007841~',
      ],
    },
    {
      kind: 'table',
      title: 'B · Payment posting summary by line',
      columns: ['Line', 'HCPCS', 'Billed', 'Allowed', 'Paid', 'CO-45', 'Patient', 'Status'],
      rows: [
        ['001', 'J9045', '$9,379.98', '$4,690.00', '$3,752.00', '$4,689.98', '$938.00', 'Paid'],
        ['002', 'J9305', '$17,020.00', '$8,510.00', '$6,808.00', '$8,510.00', '$1,702.00', 'Paid'],
        ['003', 'J2469', '$89.00', '$44.00', '$35.20', '$45.00', '$8.80', 'Paid'],
        ['004', 'J0881', '$420.00', '$210.00', '$168.00', '$210.00', '$42.00', 'Paid'],
        ['005', 'J1441', '$198.00', '$99.00', '$79.20', '$99.00', '$19.80', 'Paid'],
        ['006', 'J9999', '$3.99', '$2.00', '$1.60', '$1.99', '$0.40', 'Paid'],
        ['007', 'J3370', '$18.00', '$9.00', '$7.20', '$9.00', '$1.80', 'Paid'],
        ['008', 'J7040', '$28.00', '$0.00', '$0.00', '$28.00', '$0.00', 'CO-B13 bundled'],
        ['009-012', '96413/15/17/01', '$4,285.00', '$2,142.50', '$1,714.00', '$2,142.50', '$428.50', 'Paid'],
        ['013', '99214', '$320.00', '$160.00', '$128.00', '$160.00', '$32.00', 'Paid'],
        ['014-016', 'Labs', '$340.00', '$170.00', '$136.00', '$170.00', '$34.00', 'Paid'],
        ['TOTAL', '', '$42,101.97', '$21,050.99', '$16,840.79', '$21,050.98', '$4,210.20', '✓ Posted'],
      ],
    },
    {
      kind: 'arPriority',
      title: 'C · AR prioritization queue — top accounts ranked by AI',
      rows: [
        {
          account: 'ENC-ONC-2025-7291',
          patient: 'Robert A. Chen',
          payer: 'Aetna PPO + self-pay',
          balance: 3710.2,
          daysAR: 12,
          propensity: 0.82,
          recommendedAction: 'High propensity → enroll 12-month 0% APR plan ($309/mo); send SMS link.',
          paymentPlan: '12 months @ $309/mo · 0% APR',
        },
        {
          account: 'ENC-ONC-2025-7045',
          patient: 'Linda Patel',
          payer: 'BCBS PPO + self-pay',
          balance: 2840.0,
          daysAR: 31,
          propensity: 0.74,
          recommendedAction: 'Med-high propensity → IVR call + 6-month 0% APR plan offer.',
          paymentPlan: '6 months @ $473/mo · 0% APR',
        },
        {
          account: 'ENC-ONC-2025-6913',
          patient: 'James Whitmore',
          payer: 'Medicare + secondary',
          balance: 1185.5,
          daysAR: 47,
          propensity: 0.61,
          recommendedAction: 'Medium propensity → financial counselor outreach + charity-care screen.',
          paymentPlan: '12 months @ $99/mo (offered)',
        },
        {
          account: 'ENC-ONC-2025-6870',
          patient: 'Maria Santos',
          payer: 'Self-pay',
          balance: 8420.75,
          daysAR: 62,
          propensity: 0.38,
          recommendedAction: 'Low propensity → route to charity-care + Pfizer Oncology Together PAP enrollment.',
          paymentPlan: 'Charity-care 80% · plan for residual',
        },
      ],
    },
    {
      kind: 'table',
      title: 'D · Propensity-to-pay model — feature stack (per-account)',
      columns: ['Feature', 'Source', 'Mr. Chen value', 'Model weight', 'Contribution'],
      rows: [
        ['FICO score', 'Equifax soft-pull (FCRA-compliant)', '742', '0.22', '+0.18 (high)'],
        ['Estimated household income', 'Experian / IRS area-median proxy', '$108,400', '0.18', '+0.14 (high)'],
        ['Prior payment history (24m)', 'Internal A/R ledger', '6/6 paid in full', '0.20', '+0.20 (max)'],
        ['Upfront payment collected', 'AI Kiosk @ check-in', '$500 (100% of est)', '0.10', '+0.10 (max)'],
        ['Insurance type & supplement', '270/271 + member roster', 'Aetna PPO + FEP secondary', '0.08', '+0.07'],
        ['Statement open / read rate', 'Bounce/SMS engagement signals', '100% / 100%', '0.07', '+0.06'],
        ['Bankruptcy / collections history', 'Equifax public records', 'None last 7y', '0.08', '+0.08 (max)'],
        ['Days since last payment', 'Internal A/R ledger', '0 (active)', '0.07', '+0.07'],
        ['MODEL OUTPUT', '', '0.82 (HIGH)', '1.00', '↑ pre-approve 12mo @ 0%'],
      ],
      footer: 'Model: gradient-boosted classifier; AUC = 0.91; trained on 2.4M historical accounts; refreshed monthly. External credit data via Equifax + Experian under FCRA permissible-purpose 604(a)(3)(F).',
    },
    {
      kind: 'table',
      title: 'E · Personalized payment-plan offer matrix',
      columns: ['Propensity tier', 'Term', 'APR', 'Min payment', 'Down payment', 'Concession'],
      rows: [
        ['HIGH (≥0.75)', '12 mo', '0%', '$50', 'None', 'Auto-approved by AI'],
        ['MED-HIGH (0.60–0.74)', '6 mo', '0%', '$50', 'None', 'Auto-approved by AI'],
        ['MEDIUM (0.45–0.59)', '12 mo', '0%', '$50', '10%', 'Counselor review'],
        ['LOW (0.30–0.44)', '24 mo', '0%', '$25', '10%', 'Charity-care screen'],
        ['VERY LOW (<0.30)', 'N/A', 'N/A', 'N/A', 'N/A', 'Auto-route to PAP / charity-care'],
      ],
    },
    {
      kind: 'timeline',
      title: 'F · AI follow-up cadence — Mr. Chen ($3,710.20 balance)',
      events: [
        { date: '04/15 09:02', label: 'Statement #1 emailed', agent: 'AI Patient Stmt Bot', status: 'success', detail: 'Open rate tracked. Includes one-click 12-month plan link.' },
        { date: '04/15 09:04', label: 'SMS link sent', agent: 'AI Outreach Bot', status: 'success', detail: 'Patient clicked link 22s later, accepted 12-month plan.' },
        { date: '04/15 09:05', label: 'Plan e-signed via mobile', agent: 'Patient (self-service)', status: 'success', detail: 'ACH on file from prior cycle reused; first payment scheduled 05/15.' },
        { date: '05/14', label: 'Pre-charge SMS reminder', agent: 'AI Patient Stmt Bot', status: 'info', detail: '"Hi Mr. Chen, your $309 payment will run tomorrow. Reply STOP to pause."' },
        { date: '05/15', label: 'Auto-charge $309', agent: 'AI Payment Engine', status: 'success', detail: 'ACH success. Auto-receipt emailed. Balance now $3,401.20.' },
        { date: '05/16', label: 'Confirmation + thank-you', agent: 'AI Outreach Bot', status: 'success', detail: 'NPS prompt sent. Patient rated experience 5/5.' },
        { date: 'IF MISSED', label: 'Day 1: friendly SMS retry', agent: 'AI Outreach Bot', status: 'info', detail: 'Soft retry; offer to re-schedule via SMS.' },
        { date: 'IF MISSED', label: 'Day 5: IVR call w/ live transfer option', agent: 'AI Voice Bot (NIRA)', status: 'info', detail: 'Polite reminder; option to transfer to financial counselor.' },
        { date: 'IF MISSED', label: 'Day 10: counselor outreach + plan re-negotiation', agent: 'Human counselor', status: 'info', detail: 'Re-evaluate propensity; offer extended 24mo plan if needed.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Collections — outcome',
      body: 'Patient signed up for 12-month plan via SMS link in 22 seconds. Propensity score 0.82 (HIGH) driven by FICO 742, full prior payment history, and successful $500 upfront capture. Equifax/Experian credit data accessed under FCRA permissible-purpose 604(a)(3)(F). AI Patient Stmt Bot handles all subsequent statements, auto-charges, and dunning cadence with zero human touch unless a payment is missed; satisfaction rating 4.7/5.0.',
    },
  ],
};

// Registration is the legacy "stub" stage in our model; light content.
const registration: StageDetail = {
  stageId: 'registration',
  intro:
    'AI Registration Bot ingested the patient referral, confirmed identity via OCR scan, validated insurance card, and queued the eligibility check — all hands-free.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Identity verified', value: '✓', sub: 'Govt ID OCR' },
        { label: 'Insurance card', value: '✓', sub: 'OCR + 270 ping' },
        { label: 'Demographics', value: '12 fields', sub: 'auto-populated' },
        { label: 'Time to ready', value: '11 sec' },
        { label: 'AI confidence', value: '99.4%' },
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Registration handed off',
      body: 'Patient identity + insurance card auto-validated; encounter ENC-ONC-2025-7291 created and routed to AI Eligibility Bot for cycle-2 270/271 verification.',
    },
  ],
};

export const oncologyStageDetails: Partial<Record<StageId, StageDetail>> = {
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

// =============================================================================
// Per-case analytics bundle (oncology)
// =============================================================================

export const oncologyAnalytics: AnalyticsBundle = {
  topMetrics: [
    { label: '$ Submitted (Cycle 2)', value: '$42,102' },
    { label: '$ Collected', value: '$21,551', sub: 'Aetna + patient upfront' },
    { label: '$ Adjusted (CO-45)', value: '$21,051' },
    { label: '$ Written off', value: '$0', sub: 'No charity / bad debt' },
    { label: '$ Patient owed', value: '$3,710' },
    { label: 'Clean claim rate', value: '100%' },
    { label: 'Denial rate', value: '100%', sub: '1 of 1 — overturned' },
    { label: 'Days in A/R', value: '27 days' },
    { label: 'Collection rate', value: '51.2%', sub: 'PPO contract' },
    { label: 'HCC RAF score', value: '4.366' },
  ],
  endToEndTimeline: [
    { date: '03/03/2025', label: 'Eligibility verified', agent: 'AI Elig Bot v5', status: 'success', detail: 'Aetna active; PA pending' },
    { date: '03/07/2025', label: 'PA submitted', agent: 'AI Auth Engine', status: 'success', detail: '6-cycle Carbo-Pem regimen' },
    { date: '03/10/2025', label: 'PA DENIED CO-50', agent: 'Aetna UM', status: 'fail', detail: 'Documentation gap' },
    { date: '03/13/2025', label: 'PA OVERTURNED', agent: 'Aetna MD Dr. Farhan', status: 'success', detail: 'Auth #PA-AET-ONC-2025-19847' },
    { date: '03/17/2025', label: 'Pre-registration complete', agent: 'Reg AI Bot', status: 'success', detail: 'Consents, GFE, $500 collected' },
    { date: '03/18/2025', label: 'Cycle 2 infusion', agent: 'Dr. Park + RN', status: 'success', detail: 'Carbo 620mg + Pem 925mg' },
    { date: '03/18/2025', label: 'Charge capture + coding', agent: 'AI Charge + Auto-Coder', status: 'success', detail: '16 lines · 14 dx · RAF 4.366' },
    { date: '03/19/2025', label: '837P submitted', agent: 'AI Scrubber + EDI', status: 'success', detail: 'ICN AET-CLM-2025-0318-ONC' },
    { date: '03/26/2025', label: 'CLAIM DENIED CO-50', agent: 'Aetna', status: 'fail', detail: '$42,101.97 at risk' },
    { date: '03/27/2025', label: 'AI appeal submitted', agent: 'AI Appeal Agent + Dr. Park', status: 'success', detail: '9-doc packet · NCCN + EGFR + CPB-0516' },
    { date: '04/04/2025', label: 'APPEAL OVERTURNED', agent: 'Aetna MD Dr. Simmons', status: 'success', detail: 'Full reversal — $42,101.97 reinstated' },
    { date: '04/14/2025', label: 'EFT $21,050.99 received', agent: 'Aetna PPO', status: 'success', detail: 'Day 27 from service' },
    { date: '04/18/2025', label: 'Patient statement + plan', agent: 'AI Stmt Bot', status: 'success', detail: '12-month 0% APR enrolled' },
  ],
  benchmarks: [
    { metric: 'Days from service to PA approval (incl appeal)', thisCase: '6 days', aiBenchmark: '5–8 days', industryAvg: '14–21 days', delta: '↑ 8–15 days faster', notes: 'AI auto-appeal vs manual' },
    { metric: 'Appeal overturn rate', thisCase: '100%', aiBenchmark: '58–68%', industryAvg: '42–55%', delta: '↑ 32–45 pts', notes: 'AI clinical evidence package' },
    { metric: 'Days to appeal resolution', thisCase: '8 days', aiBenchmark: '8–14 days', industryAvg: '21–45 days', delta: '↑ 13–37 days faster' },
    { metric: 'Appeal cost (AI vs manual)', thisCase: '$0', aiBenchmark: '$150–250', industryAvg: '$400–800', delta: '↑ $400–800 saved' },
    { metric: 'Days to payment (incl appeal)', thisCase: '27 days', aiBenchmark: '25–35 days', industryAvg: '45–65 days', delta: '↑ 18–38 days faster' },
    { metric: 'Drug unit accuracy (BSA)', thisCase: '100%', aiBenchmark: '95–98%', industryAvg: '84–90%', delta: '↑ 10–16 pts' },
    { metric: 'NDC verification rate', thisCase: '100%', aiBenchmark: '96–99%', industryAvg: '87–93%', delta: '↑ 7–13 pts' },
    { metric: 'HCC capture rate', thisCase: '100% (5/5)', aiBenchmark: '83–91%', industryAvg: '62–74%', delta: '↑ 26–38 pts', notes: 'RAF 4.366' },
    { metric: 'Oncology clean claim rate', thisCase: '100%', aiBenchmark: '93–97%', industryAvg: '79–86%', delta: '↑ 14–21 pts' },
    { metric: 'AI automation rate', thisCase: '98%', aiBenchmark: '85–94%', industryAvg: '40–55%', delta: '↑ 43–58 pts', notes: 'Only MD attestation manual' },
  ],
};
