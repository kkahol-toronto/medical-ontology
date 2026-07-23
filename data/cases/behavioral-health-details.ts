import type {
  AnalyticsBundle,
  PatientSummary,
  StageDetail,
  StageId,
} from '@/lib/types';

export const behavioralHealthPatientSummary: PatientSummary = {
  hero: {
    headline: 'Acute Inpatient Psychiatry · Severe MDD with Psychotic Features',
    subhead:
      'Encounter ENC-BH-2026-0417 — UnitedHealthcare Choice Plus PPO. Initial claim denied CO-50 + BH-LOS-06 for days 6–8; AI Appeal Agent overturned with LOCUS/ASAM continued-stay evidence; $10,673 recovered.',
  },
  demographics: [
    { label: 'Patient', value: 'Jordan M. Ellis', emphasis: true },
    { label: 'DOB · Age', value: '09/22/1987 · 38' },
    { label: 'Gender', value: 'Non-binary' },
    { label: 'MRN', value: 'MRN-64172890' },
    { label: 'Address', value: '2147 Oak Ridge Ave, Columbus, OH 43215' },
    { label: 'Phone', value: '(614) 555-0186' },
    { label: 'Emergency contact', value: 'Avery Ellis — (614) 555-0244' },
    { label: 'PCP', value: 'Dr. Lena Brooks, MD' },
  ],
  insurance: [
    { label: 'Primary payer', value: 'UnitedHealthcare Choice Plus PPO', emphasis: true },
    { label: 'Plan name', value: 'UHC Choice Plus PPO' },
    { label: 'Member ID', value: 'UHC-CP-73492018' },
    { label: 'Group #', value: 'GRP-88421-NORTHSTAR' },
    { label: 'Employer', value: 'Northstar Digital Services' },
    { label: 'Plan year deductible', value: '$1,500.00' },
    { label: 'Deductible met YTD', value: '$1,500.00 — fully met', emphasis: true },
    { label: 'OOP max / met', value: '$6,500.00 / $2,940.00' },
    { label: 'Coinsurance', value: '20% after deductible' },
    { label: 'BH benefit', value: 'Covered — in-network inpatient' },
  ],
  encounter: [
    { label: 'Encounter', value: 'ENC-BH-2026-0417' },
    { label: 'Encounter type', value: 'Acute Inpatient Psychiatry', emphasis: true },
    { label: 'Admission', value: '05/06/2026 — Emergency / involuntary hold' },
    { label: 'Discharge', value: '05/14/2026 — Home with PHP' },
    { label: 'Length of stay', value: '8 days', emphasis: true },
    { label: 'Facility', value: 'Lakeshore Behavioral Health Center' },
    { label: 'Attending psychiatrist', value: 'Dr. Maya Patel, MD' },
    { label: 'Auth #', value: 'UHC-BH-IP-2026-77419 (post-appeal)', emphasis: true },
  ],
  clinical: [
    { label: 'Principal diagnosis', value: 'F33.3 — MDD, recurrent, severe with psychotic features', emphasis: true },
    { label: 'Risk at admission', value: 'High suicide risk; command hallucinations; active plan', emphasis: true },
    { label: 'PHQ-9 at admission', value: '24 — Severe depression' },
    { label: 'C-SSRS', value: 'High — active ideation with plan' },
    { label: 'Legal status', value: '72-hour emergency hold → voluntary' },
    { label: 'Treatment plan', value: '24/7 stabilization, medication management, group therapy' },
    { label: 'Discharge disposition', value: 'Home with partial hospitalization program' },
  ],
  agentSummary: [
    {
      agent: 'AI Eligibility Bot',
      bullets: [
        'Admission 05/06 — UHC ACTIVE; deductible $1,500 fully met; 20% coinsurance',
        'Concurrent review verified days 1–5 approved; days 6–8 pending at discharge',
        'Precert required — notification submitted within 2 hours of emergency admission',
      ],
    },
    {
      agent: 'AI Auth Engine + AI UM Assist',
      bullets: [
        'Initial precert approved days 1–3; partial extension days 4–5 on 05/10',
        'Days 6–8 deferred — documentation gap flagged by AI UM Assist',
        'Retrospective appeal validated acute inpatient level for full 8-day stay',
      ],
    },
    {
      agent: 'AI BH CDI + Auto-Coder',
      bullets: [
        '14 ICD-10-CM codes assigned · F33.3 principal · 98.4% confidence',
        'CDI flagged Z63.4 bereavement and Z62.810 trauma history for appeal narrative',
        'C-SSRS and daily MSE trend compiled for continued-stay justification',
      ],
    },
    {
      agent: 'AI Denial Engine + Appeal Agent',
      bullets: [
        'Claim denied 05/22 (CO-50 + BH-LOS-06); AI confidence 94.7% overturn likelihood',
        'Appeal packet cited LOCUS, ASAM Level 4, TN BH acute inpatient guide',
        'UHC overturned denial 05/28 — $10,672.50 reinstated for days 6–8',
      ],
    },
    {
      agent: 'AI ERA Bot + Financial Navigator',
      bullets: [
        'Replacement claim paid 06/02 — net payer payment $15,653.00',
        'Patient coinsurance $3,913.00; $500 deposit collected; balance $3,413.00',
        'Financial counseling + 0% APR payment plan offered',
      ],
    },
  ],
  finalOutcome: [
    { label: 'Total billed', value: '$28,460.00' },
    { label: 'UHC allowed', value: '$19,566.00' },
    { label: 'UHC payment (EFT)', value: '$15,653.00', emphasis: true },
    { label: 'Appeal recovered', value: '$10,672.50', emphasis: true },
    { label: 'Patient coinsurance (20%)', value: '$3,913.00' },
    { label: 'Patient balance remaining', value: '$3,413.00' },
    { label: 'Days from service to cash', value: '27 days (incl. 6-day appeal)' },
    { label: 'Appeal overturn ROI', value: '$10,673 recovered · ~$0 AI cost', emphasis: true },
  ],
};

const eligibility: StageDetail = {
  stageId: 'eligibility',
  intro:
    'AI Eligibility Bot ran real-time 270/271 EDI exchanges against UnitedHealthcare at admission, day 4 concurrent review, and discharge. Coverage ACTIVE, deductible fully met, behavioral health inpatient benefit in-network — precert notification required within 24 hours of emergency admission.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Verified checks', value: '3 of 3', sub: 'Admission · Day 4 · Discharge' },
        { label: 'Coverage', value: 'ACTIVE', sub: 'UHC Choice Plus PPO' },
        { label: 'Deductible met', value: '$1,500', sub: '100% of plan year' },
        { label: 'OOP remaining', value: '$3,560', sub: 'of $6,500 max' },
        { label: 'AI confidence', value: '99.9%' },
      ],
    },
    {
      kind: 'table',
      title: 'A · 270/271 real-time eligibility log',
      columns: ['Check', 'Date/Time', 'Plan', 'Member ID', 'Status', 'Ded', 'Met', 'OOP Max', 'OOP Met', 'Coins', 'BH Inpt', 'Auth', 'Score'],
      rows: [
        ['ELG-BH-001', '05/06 08:42', 'UHC Choice Plus PPO', 'UHC-CP-73492018', 'ACTIVE', '$1,500', '$1,500 FULL', '$6,500', '$2,940', '20%', 'IN-NET', 'Notify 24h', '99.9%'],
        ['ELG-BH-002', '05/09 11:05', 'UHC Choice Plus PPO', 'UHC-CP-73492018', 'ACTIVE', '$1,500', 'FULL', '$6,500', '$2,940', '20%', 'IN-NET', 'Days 1–5 partial', '99.9%'],
        ['ELG-BH-003', '05/14 09:18', 'UHC Choice Plus PPO', 'UHC-CP-73492018', 'ACTIVE', 'FULL', 'FULL', '$6,500', 'TBD', '20%', 'IN-NET', 'Days 6–8 pending', '99.8%'],
      ],
    },
    {
      kind: 'edi',
      title: 'B · Outbound 270 inquiry — admission 05/06/2026',
      transaction: '270',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*87726UHC       *260506*0842*^*00501*000006417*0*P*:~',
        'GS*HS*RCMDEMOPROVIDR*87726UHC*20260506*0842*6417*X*005010X279A1~',
        'ST*270*0001*005010X279A1~',
        'BHT*0022*13*RCM-271-BH-0417-ADM*20260506*0842~',
        'HL*1**20*1~',
        'NM1*PR*2*UNITEDHEALTHCARE*****PI*87726~',
        'HL*2*1*21*1~',
        'NM1*1P*2*LAKESHORE BEHAVIORAL HEALTH CENTER*****XX*1928374650~',
        'HL*3*2*22*0~',
        'TRN*1*RCM-TRN-0506-0417*9RCMDEMO~',
        'NM1*IL*1*ELLIS*JORDAN*M***MI*UHC-CP-73492018~',
        'REF*6P*GRP-88421-NORTHSTAR~',
        'DMG*D8*19870922*U~',
        'DTP*291*D8*20260506~',
        'EQ*30~',
        'EQ*47**FAM**30~                                    // Inpatient psychiatric',
        'EQ*30**FAM**0124~                                  // Room & board rev code',
        'SE*18*0001~',
        'GE*1*6417~',
        'IEA*1*000006417~',
      ],
    },
    {
      kind: 'edi',
      title: 'C · Inbound 271 response — coverage + BH benefits',
      transaction: '271',
      segments: [
        'ISA*00*          *00*          *ZZ*87726UHC       *ZZ*RCMDEMOPROVIDR *260506*0844*^*00501*000006417*0*P*:~',
        'GS*HB*87726UHC*RCMDEMOPROVIDR*20260506*0844*6417*X*005010X279A1~',
        'ST*271*0001*005010X279A1~',
        'BHT*0022*11*RCM-271-BH-0417-ADM*20260506*0844~',
        'HL*1**20*1~',
        'NM1*PR*2*UNITEDHEALTHCARE*****PI*87726~',
        'NM1*IL*1*ELLIS*JORDAN*M***MI*UHC-CP-73492018~',
        'REF*6P*GRP-88421-NORTHSTAR~',
        'DMG*D8*19870922*U~',
        'INS*Y*18*001*25***FT~',
        'DTP*356*D8*20260101~',
        'DTP*357*D8*20261231~',
        'EB*1**30**UHC CHOICE PLUS PPO~',
        'EB*C*FAM*30**HEALTH BENEFIT PLAN*23*1500*****Y~     // Annual deductible $1,500',
        'EB*F*FAM*30**HEALTH BENEFIT PLAN*23*1500*****Y~     // Deductible MET $1,500',
        'EB*G*FAM*30**HEALTH BENEFIT PLAN*23*6500*****Y~     // OOP max $6,500',
        'EB*A*FAM*30**HEALTH BENEFIT PLAN*23*2940*****Y~     // OOP met $2,940',
        'EB*A*IND**30**********20~                            // 20% coinsurance',
        'EB*1**47****BEHAVIORAL HEALTH INPATIENT*****Y~      // BH inpatient covered',
        'EB*B**47****IN-NETWORK*****Y~                       // Precert required',
        'MSG*ACTIVE COVERAGE 01/01/2026-12/31/2026 · EMERGENCY BH ADMISSION NOTIFICATION WITHIN 24H~',
        'SE*22*0001~',
        'GE*1*6417~',
        'IEA*1*000006417~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Eligibility Bot — admission insights',
      body:
        '4 alerts surfaced at ED registration: (1) deductible fully met → no patient deductible on this stay, (2) 20% coinsurance applies to allowed amount (~$3,913 projected), (3) BH inpatient precert/notification required within 24 hours — auto-routed to AI Auth Engine, (4) employer Northstar Digital EAP benefit flagged for discharge planning. All checks completed in 3 minutes.',
    },
  ],
};

const priorAuth: StageDetail = {
  stageId: 'priorAuth',
  intro:
    'Emergency admission notification, initial precert (days 1–3), concurrent review, and partial extension through day 5. Days 6–8 deferred pending consolidated continued-stay rationale — the gap that drove the claim denial.',
  sections: [
    {
      kind: 'timeline',
      title: 'UM timeline — partial auth → claim denial → appeal',
      events: [
        { date: '05/06/2026', label: 'Emergency admission notification', agent: 'AI Auth Engine', detail: 'UHC notified within 2 hours; active suicidal plan documented.', status: 'success' },
        { date: '05/06/2026', label: 'Initial precert approved', agent: 'UHC BH UM', detail: 'Days 1–3 approved under UHC-BH-IP-2026-77419.', status: 'success' },
        { date: '05/09/2026', label: 'Concurrent review submitted', agent: 'AI UM Assist', detail: 'C-SSRS, daily MSE, medication titration compiled.', status: 'success' },
        { date: '05/10/2026', label: 'Partial extension', agent: 'UHC UM', detail: 'Days 4–5 approved; days 6–8 deferred.', status: 'progress' },
        { date: '05/15/2026', label: 'Documentation gap alert', agent: 'AI UM Assist', detail: 'Flagged missing consolidated continued-stay rationale.', status: 'progress' },
      ],
    },
    {
      kind: 'policyCitation',
      title: 'LOCUS / ASAM level-of-care criteria',
      source: 'ASAM Criteria Level 4 · LOCUS Acute Inpatient',
      quote:
        'Acute inpatient psychiatric care is medically necessary when the patient presents with active suicidal ideation with plan, psychotic symptoms requiring 24/7 physician oversight, and inability to safely manage at a lower level of care.',
    },
  ],
};

const denial: StageDetail = {
  stageId: 'denial',
  intro:
    'UnitedHealthcare denied days 6–8 ($10,672.50) on CO-50 (medical necessity) + proprietary BH-LOS-06 (continued-stay documentation gap). AI Denial Engine classified as appealable with 94.7% overturn confidence. AI Appeal Agent assembled LOCUS/ASAM-grounded packet with daily clinical chronology; Dr. Maya Patel attested; UHC overturned in 6 days.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Denial outcome', value: 'OVERTURNED', sub: 'Days 6–8 reinstated' },
        { label: 'Denial codes', value: 'CO-50 + BH-LOS-06' },
        { label: '$ at risk → recovered', value: '$10,672.50' },
        { label: 'AI overturn confidence', value: '94.7%' },
        { label: 'Appeal cycle', value: '6 days', sub: 'vs 21–45 day avg' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'A · Denial record — initial adjudication',
      rows: [
        { label: 'Claim #', value: 'UHC-BH-2026-0515-0417' },
        { label: 'ICN', value: 'UHC-ICN-20260522-0417' },
        { label: 'Payer', value: 'UnitedHealthcare Choice Plus PPO' },
        { label: 'Date denial received', value: '05/22/2026' },
        { label: 'Primary CARC', value: 'CO-50 — Non-covered / not medically necessary', emphasis: true },
        { label: 'Payer reason code', value: 'BH-LOS-06 — Continued stay documentation insufficient', emphasis: true },
        { label: 'Denied service dates', value: '05/11/2026 – 05/13/2026 (inpatient days 6–8)', emphasis: true },
        { label: 'Denied lines', value: 'Rev 0124 days 6–8 + proportional E/M and ancillary', emphasis: true },
        { label: 'Total denied', value: '$10,672.50', emphasis: true },
        { label: 'Denial reason (verbatim)', value: '"Documentation did not clearly establish why a lower level of care was unsafe after day 5 for continued acute inpatient psychiatric days 6 through 8."' },
        { label: 'Denial category', value: 'Medical Necessity — Continued Stay / Documentation Gap' },
        { label: 'AI recommendation', value: 'APPEAL IMMEDIATELY — LOCUS/ASAM + clinical chronology = strong basis', emphasis: true },
      ],
    },
    {
      kind: 'table',
      title: 'B · AI root-cause analysis',
      columns: ['Finding', 'Payer view', 'Clinical reality (record)', 'AI resolution'],
      rows: [
        ['Continued-stay rationale fragmented', 'Could not see cumulative risk days 6–8', 'Daily MSE + C-SSRS + observation log show residual hallucinations and self-harm urge 05/10', 'AI day-by-day chronology bundle'],
        ['Lower LOC not explicitly ruled out', 'PHP/outpatient appeared feasible', 'Family meeting 05/12: PHP unsafe until psychosis resolved; sibling supervision not available until 05/14', 'PHP unsafe statement + Z60.2 living alone'],
        ['Suicide risk trend omitted from packet', 'Risk appeared resolved by day 5', 'C-SSRS Moderate day 7; 1:1→Q15 only on 05/11; agitation/self-harm urge 05/10', 'Full C-SSRS trend + nursing notes'],
        ['Medication titration not linked to LOC', 'Stable enough for step-down implied', 'Risperidone titration active days 6–8; ECG/metabolic monitoring ongoing', 'Pharmacy note + UM continued-stay review 05/10'],
      ],
    },
    {
      kind: 'timeline',
      title: 'C · AI Appeal Agent — fully automated workflow',
      events: [
        { date: '05/22 14:00', label: 'Denial received & parsed', agent: 'AI Denial Engine', detail: '835 ERA parsed; CO-50 + BH-LOS-06 on rev 0124 days 6–8; denial letter ingested.', status: 'success' },
        { date: '05/22 14:02', label: 'Root cause classification', agent: 'AI Clinical Rules Engine', detail: 'Documentation gap — not clinical merit. 94.7% overturn confidence based on UHC BH-LOS historical reversals with LOCUS/ASAM evidence.', status: 'success', ms: 420000 },
        { date: '05/22 14:08', label: 'Clinical evidence retrieval', agent: 'AI EHR Integration + NLP', detail: 'Pulled 12 chart documents: ED psych eval, admission H&P, daily progress notes, nursing notes, C-SSRS series, UM review 05/10, discharge summary, Dr. Patel attestation.', status: 'success', ms: 680000 },
        { date: '05/22 14:18', label: 'LOCUS / ASAM mapping', agent: 'AI Guideline Knowledge Base', detail: 'LOCUS Level 6 + ASAM Level 4 criteria mapped to days 6–8: residual psychosis, self-harm urge under stress, no safe discharge environment.', status: 'success', ms: 360000 },
        { date: '05/22 14:24', label: 'Payer policy citation', agent: 'AI Payer Policy Engine', detail: 'TN BH Acute Inpatient Guide + UHC medical necessity criteria — continued stay requires documentation that lower LOC unsafe.', status: 'success', ms: 280000 },
        { date: '05/22 14:30', label: 'Appeal letter drafted', agent: 'AI Appeal Agent (Bedrock Claude)', detail: '5-page letter: clinical chronology days 1–8, C-SSRS/MSE trend, 05/10 self-harm urge, medication titration, PHP unsafe, family supervision plan.', status: 'success', ms: 960000 },
        { date: '05/22 15:10', label: 'Psychiatrist attestation', agent: 'Dr. Maya Patel, MD', detail: '"Days 6–8 were medically necessary. Patient had only recently transitioned from command hallucinations and active suicidal intent; experienced recurrent self-harm urge 05/10; required risperidone titration; PHP was unsafe until 05/14."', status: 'success' },
        { date: '05/22 16:00', label: 'Appeal submitted to UHC', agent: 'AI Appeal Agent + UHC Provider Portal', detail: 'Appeal ID UHC-APPEAL-BH-2026-0417 — 8 attachments including daily MSE bundle and UM review.', status: 'success' },
        { date: '05/28 11:30', label: 'APPEAL OVERTURNED — full days 6–8', agent: 'UHC BH Medical Director', detail: '"Upon review of submitted clinical documentation including continued-stay rationale, C-SSRS trend, and attestation, denial of days 6–8 is reversed."', status: 'success' },
      ],
    },
    {
      kind: 'medicalRecord',
      title: 'D · Physician appeal attestation excerpt — Dr. Patel, 05/23/2026',
      sections: [
        {
          heading: 'Post-denial clinical addendum',
          body: 'I reviewed the payer denial of hospital days 6 through 8 and the complete record. Those days were medically necessary. On and immediately before the denied period, the patient had only recently transitioned from active suicidal intent and command hallucinations, experienced a recurrent self-harm urge under ordinary psychosocial stress on 05/10, and required active titration of both antidepressant and antipsychotic medication. The patient did not yet have a safe discharge environment, confirmed family supervision, or an immediately available partial-hospitalization placement.',
          flags: ['Appeal attestation'],
        },
        {
          heading: 'Continued-stay criteria met through 05/14',
          body: 'Discharge before sustained resolution of psychosis and completion of the safety plan would have created an unacceptably high risk of suicide, failed transition, and readmission. The patient met acute inpatient continued-stay criteria until 05/14/2026, when safety, medication response, family supervision, and next-day PHP were all established.',
          flags: ['Medical necessity'],
        },
      ],
    },
    {
      kind: 'policyCitation',
      title: 'E · TN BH Acute Inpatient Guide — appeal citation',
      source: 'TN-BH-Guide Acute Inpatient Hospital',
      quote:
        'Continued acute inpatient psychiatric care is supported when active suicidal ideation with plan persists, psychotic symptoms require medication titration with monitoring, and a lower level of care would pose imminent safety risk — including when partial hospitalization is not yet safe or available.',
    },
    {
      kind: 'keyValues',
      title: 'F · Corrected claim & final payment',
      rows: [
        { label: 'Replacement claim #', value: 'UHC-BH-2026-0515-0417-COR' },
        { label: 'Submission date', value: '05/29/2026' },
        { label: 'Frequency code', value: '7 — Replacement of prior claim' },
        { label: 'Appeal reference', value: 'UHC-APPEAL-BH-2026-0417' },
        { label: 'Total charges', value: '$28,460.00' },
        { label: 'UHC allowed', value: '$19,566.00' },
        { label: 'UHC payment EFT', value: '$15,653.00', emphasis: true },
        { label: 'Appeal recovered (days 6–8)', value: '$10,672.50', emphasis: true },
        { label: 'Patient coinsurance 20%', value: '$3,913.00' },
        { label: 'Patient balance remaining', value: '$3,413.00' },
        { label: 'Days from discharge to cash', value: '27 days (incl. 6-day appeal)' },
      ],
    },
    {
      kind: 'callout',
      tone: 'warn',
      title: 'Human review checkpoint',
      body:
        'The appeal letter is AI-drafted but requires attending psychiatrist attestation before submission. Dr. Patel reviewed the packet, added the post-denial clinical addendum, and electronically signed within 50 minutes — meeting UHC behavioral health appeal requirements.',
    },
  ],
};

export const behavioralHealthStageDetails: Partial<Record<StageId, StageDetail>> = {
  registration: {
    stageId: 'registration',
    intro: 'Emergency psychiatric admission registered with ADT feed; insurance OCR verified; 72-hour hold documented.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Admission type', value: 'Emergency / Involuntary hold' },
          { label: 'Registration accuracy', value: '100%' },
          { label: 'Insurance verified', value: 'UHC-CP-73492018' },
        ],
      },
    ],
  },
  eligibility,
  priorAuth,
  cdi: {
    stageId: 'cdi',
    intro:
      'AI BH CDI Assist scanned the longitudinal inpatient chart (ED eval, admission H&P, daily progress notes, nursing notes, social work, pharmacy, UM review, discharge summary). It surfaced 4 documentation opportunities tied to medical necessity and appeal strength — bereavement specificity, trauma history consent, psychosis specificity, and continued-stay rationale consolidation.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Documents reviewed', value: '12', sub: 'ED through discharge' },
          { label: 'CDI queries sent', value: '3 of 4 candidates' },
          { label: 'Physician response', value: '100%', sub: 'Same-day / next-day' },
          { label: 'Appeal-critical flags', value: '4', sub: 'LOC + risk narrative' },
          { label: 'UM gap prevented', value: '1', sub: 'Consolidated continued-stay note' },
        ],
      },
      {
        kind: 'medicalRecord',
        title: 'A · Emergency psychiatric evaluation — Dr. Ruiz, 05/06/2026 08:35',
        sections: [
          {
            heading: 'Chief complaint',
            body: '"I do not trust myself to be alone. The voices keep telling me I should die." Jordan M. Ellis, 38-year-old non-binary adult, brought by sibling after three weeks of worsening depression, withdrawal, poor sleep, medication nonadherence, and increasing suicidal thoughts.',
            flags: ['High acuity'],
          },
          {
            heading: 'History of present illness',
            body: 'Over the last four days the patient developed intermittent auditory hallucinations described as a male voice saying death would "stop the burden." This morning the patient disclosed a plan to overdose on available prescription medication and had placed several medication bottles on the kitchen table. Recent bereavement following death of a close family member. Denies alcohol or illicit drug use. Unable to identify a reliable safety plan.',
            flags: ['CDI candidate — Z63.4 bereavement'],
          },
          {
            heading: 'Mental status examination',
            body: 'Awake and oriented ×4. Mood "empty and scared." Affect constricted and tearful. Thought process linear but slowed. Thought content notable for hopelessness, active suicidal ideation with overdose plan, and command auditory hallucinations. Insight limited. Judgment impaired. Impulse control poor in setting of active suicidal intent.',
            flags: ['Appeal evidence'],
          },
          {
            heading: 'Risk assessment & disposition',
            body: 'Columbia-Suicide Severity Rating Scale indicates high acute risk. Risk factors: active plan and intent, command hallucinations, prior suicide attempt (~4 years ago), medication nonadherence, recent bereavement, living alone, insomnia. Patient not safe for discharge or lower level of care. Placed on emergency involuntary hold with continuous observation; transfer to locked inpatient psychiatric unit.',
            flags: ['LOCUS/ASAM Level 4/6'],
          },
        ],
      },
      {
        kind: 'medicalRecord',
        title: 'B · Psychiatric admission H&P — Dr. Patel, 05/06/2026 12:20',
        sections: [
          {
            heading: 'Diagnostic formulation',
            body: 'Presentation most consistent with recurrent major depressive disorder, current episode severe with psychotic features. Generalized anxiety disorder also present. Current suicide risk remains high with command hallucinations and active suicidal intent.',
          },
          {
            heading: 'Initial diagnoses',
            body: 'F33.3 MDD recurrent severe with psychotic features; R45.851 suicidal ideation; F41.1 GAD; G47.00 insomnia; Z91.51 personal history of suicidal behavior; Z91.148 medication nonadherence; Z63.4 bereavement; Z60.2 living alone; I10 essential hypertension; E66.9 obesity.',
            flags: ['Principal DX cluster'],
          },
          {
            heading: 'Initial treatment plan',
            body: 'Locked acute inpatient psychiatry. Suicide precautions and constant observation. Start sertraline 50 mg daily; risperidone 0.5 mg BID for psychotic symptoms. Hydroxyzine PRN anxiety; trazodone PRN insomnia. Baseline CBC, CMP, TSH, UDS, ECG. Individual therapy, daily groups, family collateral, discharge planning. Estimated LOS 5–8 days depending on resolution of suicidal intent and psychosis.',
            flags: ['Medical necessity'],
          },
        ],
      },
      {
        kind: 'medicalRecord',
        title: 'C · Utilization management continued-stay review — 05/10/2026',
        sections: [
          {
            heading: 'Concurrent review — hospital days 6 through 8 requested',
            body: 'Patient entered with active overdose plan, command auditory hallucinations, prior suicide attempt, inability to contract for safety, and no safe home supervision. During review period: residual hallucinations, fluctuating self-harm urges (acute episode 05/10 after stressful phone call), active medication titration, not yet safe for PHP. PHP not feasible until psychosis resolved, suicidal intent decreased, family supervision arranged, and next-day program intake confirmed.',
            flags: ['BH-LOS-06 rebuttal', 'CDI critical'],
          },
        ],
      },
      {
        kind: 'cdiQueries',
        title: 'D · AI-drafted CDI queries (compliant, non-leading)',
        queries: [
          {
            id: 'CDI-Q-BH-0417-01',
            question:
              'Multiple notes reference "recent bereavement" and "death of a close family member" as a precipitant. Can you confirm the psychosocial diagnosis as documented?',
            options: [
              'Disappearance and death of family member (Z63.4)',
              'Other specified problems related to primary support group (Z63.8)',
              'Acute stress reaction (F43.0)',
              'No additional diagnosis — narrative only',
            ],
            rationale:
              'Z63.4 supports psychosocial stressor documentation for continued-stay medical necessity and appeal narrative. Non-leading query routes through standard CDI workflow.',
            status: 'answered',
            physician: 'Dr. Maya Patel, MD — answered 05/07 10:15',
          },
          {
            id: 'CDI-Q-BH-0417-02',
            question:
              'Admission notes document command auditory hallucinations. For coding specificity, can you confirm the psychotic symptom diagnosis as documented?',
            options: [
              'Psychotic disorder with hallucinations, unspecified (F28)',
              'Unspecified psychosis not due to substance (F29)',
              'Document in narrative only — attributed to F33.3',
              'Other — please specify',
            ],
            rationale:
              'Clarifies whether psychosis is captured only within F33.3 or warrants additional specificity — strengthens appeal clinical severity narrative without upcoding.',
            status: 'answered',
            physician: 'Dr. Maya Patel, MD — answered 05/08 09:40',
          },
          {
            id: 'CDI-Q-BH-0417-03',
            question:
              'Social work note references childhood abuse history. Is this documented with patient consent for inclusion in the legal medical record?',
            options: [
              'Personal history of physical and sexual abuse in childhood (Z62.810) — consent obtained',
              'Document in therapy notes only — not for billing record',
              'Defer to outpatient therapist',
            ],
            rationale:
              'Trauma history supports discharge planning complexity and PHP safety assessment. Consent-gated per facility policy before coding Z62.810 on the claim.',
            status: 'pending',
            physician: 'Dr. Maya Patel, MD — open',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'CDI → appeal pipeline',
        body:
          'Each CDI finding feeds the AI UM Assist continued-stay packet and Appeal Agent chronology. The 05/10 UM continued-stay review (section C) was auto-generated from nursing notes + progress notes to close the documentation gap that triggered BH-LOS-06.',
      },
    ],
  },
  charge: {
    stageId: 'charge',
    intro:
      'AI Charge Engine assembled 16 charge lines for the 8-day acute inpatient psychiatry stay — 8 room & board days (rev 0124), E/M (99223/99233), psychiatric evaluation (90792), group therapy (0914), labs for antipsychotic monitoring, and inpatient psychotropics. Days 6–8 flagged for UM/deferral tracking.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Charge lines', value: '16/16', sub: 'CDM verified' },
          { label: 'Total billed', value: '$28,460.00' },
          { label: 'LOS validated', value: '8 days', sub: 'ADT + nursing census' },
          { label: 'Denied lines flagged', value: '3 days R&B', sub: 'BH-LOS-06' },
          { label: 'Late charges', value: '0' },
        ],
      },
      {
        kind: 'table',
        title: 'A · Inpatient charge ledger — ENC-BH-2026-0417',
        columns: ['Line', 'Rev', 'HCPCS', 'Service', 'Units', 'Charge', 'AI audit'],
        rows: [
          ['001', '0124', '—', 'Psychiatry R&B — Day 1', 1, '$1,850.00', 'LOS day 1 · auth days 1–3'],
          ['002', '0124', '—', 'Psychiatry R&B — Day 2', 1, '$1,850.00', 'LOS day 2 · 1:1 obs'],
          ['003', '0124', '—', 'Psychiatry R&B — Day 3', 1, '$1,850.00', 'LOS day 3 · C-SSRS High'],
          ['004', '0124', '—', 'Psychiatry R&B — Day 4', 1, '$1,850.00', 'LOS day 4 · partial auth'],
          ['005', '0124', '—', 'Psychiatry R&B — Day 5', 1, '$1,850.00', 'LOS day 5 · partial auth'],
          ['006', '0124', '—', 'Psychiatry R&B — Day 6 (DENIED)', 1, '$1,850.00', 'BH-LOS-06 · UM deferred'],
          ['007', '0124', '—', 'Psychiatry R&B — Day 7 (DENIED)', 1, '$1,850.00', 'BH-LOS-06 · Q15 obs'],
          ['008', '0124', '—', 'Psychiatry R&B — Day 8 (DENIED)', 1, '$1,850.00', 'BH-LOS-06 · discharge PHP'],
          ['009', '0510', '99223', 'Initial hospital care — high MDM', 1, '$420.00', 'Admission H&P documented'],
          ['010', '0510', '99233', 'Subsequent hospital care × 7', 7, '$2,800.00', 'Daily MSE · high MDM'],
          ['011', '0510', '90792', 'Psychiatric diagnostic eval w/ med services', 1, '$380.00', 'Admission eval'],
          ['012', '0914', '—', 'Group psychotherapy — inpatient', 6, '$720.00', '6 sessions billed'],
          ['013', '0300', '80053', 'CMP × 2 (metabolic / QTc monitor)', 2, '$220.00', 'Risperidone monitor'],
          ['014', '0300', '84443', 'TSH', 1, '$95.00', 'Psych med workup'],
          ['015', '0300', '80307', 'Urine drug screen', 1, '$85.00', 'Admission screen negative'],
          ['016', '0250', '—', 'Inpatient psychotropics (MAR)', 1, '$890.00', 'Sertraline · risperidone · PRNs'],
        ],
        footer: 'Total billed = $28,460.00 · 16 lines · MAR reconciled to pharmacy charges · Days 6–8 R&B ($5,550) + proportional services = $10,672.50 initially denied.',
      },
      {
        kind: 'callout',
        tone: 'warn',
        title: 'AI Charge Engine — UM deferral alert',
        body: 'Days 6–8 room & board flagged at charge capture because concurrent review deferred authorization. Charge retained on claim for transparency; AI UM Assist auto-attached continued-stay review note 05/10 to support appeal if denied.',
      },
    ],
  },
  coding: {
    stageId: 'coding',
    intro:
      'AI Auto-Coder assigned 14 ICD-10-CM diagnoses and validated CPT 99223/99233/90792 against inpatient psychiatry MDM guidelines. Every code includes confidence score, source text from the medical record, and is editable by the coder.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'ICD-10-CM', value: '14 codes', sub: 'avg conf 98.1%' },
          { label: 'Principal DX', value: 'F33.3', sub: 'Psychotic depression' },
          { label: 'CPT E/M', value: '99223 + 99233×7' },
          { label: 'Psych eval', value: '90792 × 1' },
          { label: 'POA accuracy', value: '100%' },
        ],
      },
      {
        kind: 'coding',
        title: 'A · ICD-10-CM diagnoses with explainability',
        codes: [
          { code: 'F33.3', description: 'Major depressive disorder, recurrent, severe with psychotic symptoms', confidence: 0.994, type: 'Principal', editable: true, sourceText: '"recurrent major depressive disorder, current episode severe with psychotic features" — Dr. Patel admission H&P 05/06' },
          { code: 'R45.851', description: 'Suicidal ideations', confidence: 0.991, type: 'Symptom / Risk · Appeal core', editable: true, sourceText: '"active suicidal ideation with overdose plan and intent" — ED psych eval 05/06; C-SSRS High' },
          { code: 'F41.1', description: 'Generalized anxiety disorder', confidence: 0.978, type: 'Secondary', editable: true, sourceText: '"Generalized anxiety disorder also present" — admission formulation' },
          { code: 'G47.00', description: 'Insomnia, unspecified', confidence: 0.966, type: 'Symptom', editable: true, sourceText: '"two to three hours of fragmented sleep nightly" — ED HPI 05/06' },
          { code: 'Z91.51', description: 'Personal history of suicidal behavior', confidence: 0.987, type: 'History / Risk', editable: true, sourceText: '"One prior suicide attempt by medication ingestion approximately four years ago" — ED psych history' },
          { code: 'Z63.4', description: 'Disappearance and death of family member', confidence: 0.942, type: 'Psychosocial · CDI confirmed', editable: true, sourceText: '"recent death of a close family member" — CDI query CDI-Q-BH-0417-01 answered 05/07' },
          { code: 'Z91.148', description: 'Other nonadherence to medication regimen', confidence: 0.961, type: 'Risk factor', editable: true, sourceText: '"stopped approximately six weeks ago" sertraline — admission H&P' },
          { code: 'Z60.2', description: 'Problems related to living alone', confidence: 0.918, type: 'SDOH · Discharge barrier', editable: true, sourceText: '"Patient lives alone in an apartment" — social work assessment 05/06; PHP unsafe' },
          { code: 'I10', description: 'Essential hypertension', confidence: 0.993, type: 'Comorbidity', editable: true, sourceText: '"Essential hypertension" — past medical history; monitored during admission' },
          { code: 'E66.9', description: 'Obesity, unspecified', confidence: 0.971, type: 'Comorbidity', editable: true, sourceText: '"obesity" — past medical history; metabolic monitoring' },
          { code: 'Z79.899', description: 'Long-term use of other medications', confidence: 0.969, type: 'Medication status', editable: true, sourceText: 'Sertraline restarted; risperidone initiated — pharmacy reconciliation 05/13' },
        ],
      },
      {
        kind: 'coding',
        title: 'B · CPT / HCPCS procedure codes',
        codes: [
          { code: '99223', description: 'Initial hospital care — high complexity MDM', confidence: 0.976, type: 'E/M · Day 1', editable: true, sourceText: 'Admission H&P — high risk, psychosis, SI with plan, medication initiation — MDM high' },
          { code: '99233', description: 'Subsequent hospital care — high complexity MDM', confidence: 0.968, modifier: '×7 days', type: 'E/M · Daily', editable: true, sourceText: 'Daily progress notes 05/07–05/14 — ongoing SI/psychosis titration, 1:1/Q15 observation, med changes' },
          { code: '90792', description: 'Psychiatric diagnostic evaluation with medical services', confidence: 0.954, type: 'Psychiatric eval', editable: true, sourceText: 'Comprehensive admission psychiatric evaluation with medical management — Dr. Patel 05/06' },
          { code: '80053', description: 'Comprehensive metabolic panel', confidence: 0.991, type: 'Lab × 2', editable: true, sourceText: 'CMP for risperidone metabolic monitoring — pharmacy note 05/13' },
          { code: '84443', description: 'TSH', confidence: 0.989, type: 'Lab', editable: true, sourceText: 'Thyroid function — psych med workup at admission' },
          { code: '80307', description: 'Urine drug screen', confidence: 0.997, type: 'Lab', editable: true, sourceText: 'Admission UDS negative — ED psych eval' },
        ],
      },
      {
        kind: 'keyValues',
        title: 'C · Inpatient BH coding summary',
        rows: [
          { label: 'Bill type', value: '111 — Hospital inpatient psychiatric', emphasis: true },
          { label: 'Place of service', value: '51 — Inpatient psychiatric facility' },
          { label: 'Admission type', value: '1 — Emergency' },
          { label: 'Admission source', value: '7 — Emergency room' },
          { label: 'Discharge status', value: '01 — Discharged to home with PHP', emphasis: true },
          { label: 'Attending NPI', value: '1928374650 — Dr. Maya Patel, MD' },
          { label: 'Facility NPI', value: '1548293017 — Lakeshore BH Center' },
          { label: 'Principal DX POA', value: 'Y — Present on admission' },
          { label: 'Audit result', value: '✓ All codes supported by chart' },
        ],
      },
    ],
  },
  claim: {
    stageId: 'claim',
    intro:
      'AI Claim Scrubber ran 12 behavioral-health institutional edits — all passed — and submitted the 837I to UnitedHealthcare via Change Healthcare. 999 acknowledgment received; ICN UHC-BH-2026-0515-0417 assigned. Auth span flagged for days 6–8 pending UM outcome.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Edits passed', value: '12/12', sub: 'BH institutional' },
          { label: 'Clean claim rate', value: '100%' },
          { label: 'Submission', value: '837I · accepted', sub: 'Change Healthcare' },
          { label: 'ICN', value: 'UHC-BH-2026-0515-0417' },
          { label: 'Submitted', value: '05/15/2026' },
        ],
      },
      {
        kind: 'keyValues',
        title: 'A · UB-04 / 837I claim summary',
        rows: [
          { label: 'Claim #', value: 'UHC-BH-2026-0515-0417' },
          { label: 'Claim type', value: 'Institutional Inpatient — Acute Psychiatry' },
          { label: 'Bill type', value: '111 — Inpatient psychiatric' },
          { label: 'Facility', value: 'Lakeshore Behavioral Health Center' },
          { label: 'Facility NPI', value: '1548293017' },
          { label: 'Tax ID', value: '31-4429876' },
          { label: 'Attending NPI', value: '1928374650 — Dr. Maya Patel, MD' },
          { label: 'Patient acct #', value: 'ENC-BH-2026-0417' },
          { label: 'Admission / Discharge', value: '05/06/2026 – 05/14/2026 (8 days)', emphasis: true },
          { label: 'Principal DX', value: 'F33.3 — MDD severe with psychotic features', emphasis: true },
          { label: 'Auth # on claim', value: 'UHC-BH-IP-2026-77419 (days 1–5)', emphasis: true },
          { label: 'Total charges', value: '$28,460.00', emphasis: true },
          { label: 'Claim frequency', value: '1 — Original' },
        ],
      },
      {
        kind: 'table',
        title: 'B · BH institutional scrubbing edits — 12/12 passed',
        columns: ['Edit', 'Type', 'Rule', 'Description', 'Result', 'AI resolution'],
        rows: [
          ['SCR-BH-001', 'Auth', 'AI-PA-LINK', 'Precert on claim for authorized days', 'PASSED', 'UHC-BH-IP-2026-77419 embedded'],
          ['SCR-BH-002', 'Auth', 'AI-PA-SPAN', 'Service dates vs auth span', 'WARN', 'Days 6–8 outside partial auth — flagged for appeal'],
          ['SCR-BH-003', 'NPI', 'AI-NPI-LUHN', 'Attending + facility NPI validation', 'PASSED', 'Patel + Lakeshore verified'],
          ['SCR-BH-004', 'Rev/CPT', 'AI-REV-CPT', 'Rev 0124 + 0510 E/M pairing', 'PASSED', 'Inpatient psych pairing OK'],
          ['SCR-BH-005', 'LOS', 'AI-LOS-ADT', 'Room & board days vs ADT census', 'PASSED', '8 days matched'],
          ['SCR-BH-006', 'DX', 'AI-DX-POA', 'Principal DX POA assignment', 'PASSED', 'F33.3 POA = Y'],
          ['SCR-BH-007', 'DX', 'AI-DX-SECONDARY', 'Secondary DX pointer mapping', 'PASSED', '14 DX pointers validated'],
          ['SCR-BH-008', 'BH', 'AI-BH-LOC', 'Acute psych bill type 111', 'PASSED', 'POS 51 inpatient psych'],
          ['SCR-BH-009', 'Lab', 'AI-LAB-UNITS', 'CMP/TSH/UDS units', 'PASSED', 'Units match orders'],
          ['SCR-BH-010', 'Timely', 'AI-TF', 'Filing within UHC window', 'PASSED', 'Filed Day +1 post-discharge'],
          ['SCR-BH-011', 'Dup', 'AI-DUP-CHECK', 'Duplicate claim detection', 'PASSED', 'No prior claim on file'],
          ['SCR-BH-012', 'COB', 'AI-COB', 'Single primary payer', 'PASSED', 'UHC primary only'],
        ],
      },
      {
        kind: 'edi',
        title: 'C · 837I institutional claim — key segments',
        transaction: '837I',
        segments: [
          'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*87726UHC       *260515*0905*^*00501*000007829*0*P*:~',
          'GS*HC*RCMDEMOPROVIDR*87726UHC*20260515*0905*7829*X*005010X223A2~',
          'ST*837*0001*005010X223A2~',
          'BHT*0019*00*RCM-BH-0417*20260515*0905*CH~',
          'NM1*41*2*LAKESHORE BEHAVIORAL HEALTH CENTER*****46*1548293017~',
          'NM1*40*2*UNITEDHEALTHCARE*****46*87726~',
          'HL*1**20*1~',
          'NM1*85*2*LAKESHORE BEHAVIORAL HEALTH CENTER*****XX*1548293017~',
          'REF*EI*31-4429876~',
          'HL*2*1*22*0~',
          'SBR*P*18*GRP-88421-NORTHSTAR*****CI~',
          'NM1*IL*1*ELLIS*JORDAN*M***MI*UHC-CP-73492018~',
          'DMG*D8*19870922*U~',
          'NM1*PR*2*UNITEDHEALTHCARE*****PI*87726~',
          'CLM*ENC-BH-2026-0417*28460.00***11:B:1*Y*A*Y*Y~',
          'DTP*434*RD8*20260506-20260514~',
          'CL1*1*1*01~',
          'REF*F8*UHC-BH-IP-2026-77419~',
          'HI*ABK:F333*ABF:R45851*ABF:F411*ABF:G4700*ABF:Z9151*ABF:Z634*ABF:Z91148*ABF:Z602*ABF:I10*ABF:E669~',
          '— LX*1 Rev 0124 Day 1 R&B —',
          'LX*1~',
          'SV2*0124*HC:0124*1850.00*UN*1~',
          'DTP*472*D8*20260506~',
          '— LX*9 99223 Initial hospital care —',
          'LX*9~',
          'SV2*0510*HC:99223*420.00*UN*1~',
          'DTP*472*D8*20260506~',
          '— … remaining 14 lines elided for display …',
          'SE*280*0001~',
          'GE*1*7829~',
          'IEA*1*000007829~',
        ],
      },
      {
        kind: 'callout',
        tone: 'success',
        title: 'AI Scrubber outcome',
        body: '12/12 BH institutional edits passed in 9 minutes. 837I accepted on first submission. SCR-BH-002 WARN on auth span for days 6–8 was expected — AI UM Assist pre-built appeal packet template in case of BH-LOS-06 denial (which occurred 05/22).',
      },
    ],
  },
  denial,
  payment: {
    stageId: 'payment',
    intro: 'Replacement claim paid 06/02 after appeal overturn. ERA auto-posted $15,653.00; patient balance $3,413.00 with financial navigation offered.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Net payer payment', value: '$15,653.00' },
          { label: 'Contractual adj', value: '($8,894.00)' },
          { label: 'Patient balance', value: '$3,413.00' },
          { label: 'Days to payment', value: '27' },
        ],
      },
    ],
  },
};

export const behavioralHealthAnalytics: AnalyticsBundle = {
  topMetrics: [
    { label: 'Total billed', value: '$28,460' },
    { label: 'UHC payment', value: '$15,653', sub: 'Post-appeal EFT' },
    { label: 'Appeal recovered', value: '$10,673', sub: 'Days 6–8 overturned' },
    { label: 'Patient balance', value: '$3,413' },
    { label: 'Clean claim rate', value: '100%' },
    { label: 'Denial overturn rate', value: '100%' },
    { label: 'Days in A/R', value: '27 days' },
    { label: 'Appeal cycle', value: '6 days' },
    { label: 'AI automation rate', value: '97%' },
  ],
  endToEndTimeline: [
    { date: '05/06/2026', label: 'Emergency admission', agent: 'AI Auth Engine', status: 'success', detail: 'UHC notified; days 1–3 approved' },
    { date: '05/10/2026', label: 'Partial extension', agent: 'UHC UM', status: 'progress', detail: 'Days 4–5 only; 6–8 pending' },
    { date: '05/15/2026', label: 'Claim submitted', agent: '837I', status: 'success', detail: 'ICN UHC-BH-2026-0515-0417' },
    { date: '05/22/2026', label: 'Claim denied', agent: 'UHC', status: 'fail', detail: 'CO-50 + BH-LOS-06' },
    { date: '05/28/2026', label: 'Appeal overturned', agent: 'AI Appeal Agent', status: 'success', detail: 'LOCUS/ASAM evidence' },
    { date: '06/02/2026', label: 'Payment posted', agent: 'AI ERA Bot', status: 'success', detail: '$15,653 EFT' },
  ],
  benchmarks: [
    { metric: 'Total billed', thisCase: '$28,460', aiBenchmark: '—', industryAvg: '—', delta: '—', notes: '8-day acute inpatient psych' },
    { metric: 'Appeal recovered', thisCase: '$10,673', aiBenchmark: '—', industryAvg: '—', delta: '100% overturn', notes: 'Days 6–8 + related services' },
    { metric: 'Days to payment', thisCase: '27 days', aiBenchmark: '25–35 days', industryAvg: '45–65 days', delta: '↑ 18–38 days faster', notes: 'Incl. 6-day appeal' },
    { metric: 'Appeal cycle time', thisCase: '6 days', aiBenchmark: '8–14 days', industryAvg: '21–45 days', delta: '↑ 15–39 days faster', notes: 'AI auto-appeal' },
    { metric: 'Clean claim rate', thisCase: '100%', aiBenchmark: '97%', industryAvg: '85%', delta: '↑ 12 pts', notes: '12/12 edits passed' },
    { metric: 'AI automation rate', thisCase: '97%', aiBenchmark: '95%', industryAvg: '40%', delta: '↑ 57 pts', notes: 'BH-specific agents' },
  ],
};
