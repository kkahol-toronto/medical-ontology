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
    'AI Eligibility Bot verified UnitedHealthcare coverage at admission, day 4 concurrent review, and discharge. Deductible fully met; 20% coinsurance applies; behavioral health inpatient benefit active.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Coverage', value: 'ACTIVE', sub: 'UHC Choice Plus PPO' },
        { label: 'Deductible met', value: '$1,500', sub: '100% of plan year' },
        { label: 'OOP remaining', value: '$3,560', sub: 'of $6,500 max' },
        { label: 'AI confidence', value: '99.9%' },
      ],
    },
    {
      kind: 'table',
      title: '270/271 eligibility log',
      columns: ['Check', 'Date', 'Status', 'Ded Met', 'OOP Remain', 'Coins', 'Auth'],
      rows: [
        ['Admission', '05/06/2026', 'ACTIVE', '$1,500 FULL', '$3,560', '20%', 'Notification due'],
        ['Day 4 Review', '05/09/2026', 'ACTIVE', '$1,500 FULL', '$3,560', '20%', 'Days 1–5 approved'],
        ['Discharge', '05/14/2026', 'ACTIVE', 'FULL', 'TBD', '20%', 'Days 6–8 pending'],
      ],
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
    'UnitedHealthcare denied the entire claim on CO-50 (medical necessity) + BH-LOS-06 (continued stay days 6–8). AI Denial Engine classified as appealable documentation gap. AI Appeal Agent assembled LOCUS/ASAM-grounded packet; overturn in 6 days.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Denial codes', value: 'CO-50 + BH-LOS-06' },
        { label: 'Denied amount', value: '$10,672.50' },
        { label: 'AI overturn confidence', value: '94.7%', sub: 'Appealable' },
        { label: 'Appeal cycle', value: '6 days' },
      ],
    },
    {
      kind: 'table',
      title: 'AI root-cause analysis',
      columns: ['Finding', 'Impact', 'Resolution'],
      rows: [
        ['Continued-stay rationale fragmented', 'Payer missed cumulative severity', 'AI day-by-day clinical chronology'],
        ['Lower LOC not explicitly ruled out', 'Medical necessity appeared incomplete', 'PHP unsafe + home environment documented'],
        ['Suicide risk trend omitted', 'Critical evidence missing from packet', 'Full C-SSRS + 1:1 observation timeline'],
      ],
    },
    {
      kind: 'policyCitation',
      title: 'TN BH Acute Inpatient Guide — appeal citation',
      source: 'TN-BH-Guide Acute Inpatient Hospital',
      quote:
        'Continued acute inpatient care is supported when active suicidal ideation with plan persists, psychotic symptoms require medication titration with monitoring, and a lower level of care would pose imminent safety risk.',
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
    intro: 'AI BH CDI Assist reviewed admission note, daily MSE, C-SSRS, and psychosocial history. Flagged bereavement and trauma history for appeal narrative.',
    sections: [
      {
        kind: 'table',
        title: 'Principal diagnoses (AI auto-coded)',
        columns: ['Seq', 'ICD-10', 'Description', 'AI Conf', 'Appeal relevance'],
        rows: [
          ['1', 'F33.3', 'MDD recurrent severe with psychotic features', '99.4%', 'Principal — supports acute inpatient'],
          ['2', 'R45.851', 'Suicidal ideations', '99.1%', 'Central appeal evidence'],
          ['3', 'F41.1', 'Generalized anxiety disorder', '97.8%', 'Contributed to agitation'],
          ['4', 'Z91.51', 'Personal history of suicidal behavior', '98.7%', 'Continued-stay risk factor'],
        ],
      },
    ],
  },
  charge: {
    stageId: 'charge',
    intro: 'AI Charge Engine captured 16 lines: 8-day psych room & board (rev 0124), initial/subsequent hospital care, psych eval, group therapy.',
    sections: [
      {
        kind: 'kpis',
        items: [
          { label: 'Charge lines', value: '16' },
          { label: 'Total charges', value: '$28,460.00' },
          { label: 'LOS validated', value: '8 days' },
        ],
      },
    ],
  },
  coding: {
    stageId: 'coding',
    intro: 'AI Auto-Coder assigned F33.3 principal with 98.4% confidence; CPT 99223/99233/90792 validated against inpatient psychiatry guidelines.',
    sections: [],
  },
  claim: {
    stageId: 'claim',
    intro: '837I submitted 05/15; 12/12 scrub edits passed; auth span flagged for days 6–8 pending concurrent review outcome.',
    sections: [],
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
