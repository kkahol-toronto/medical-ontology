import type {
  AnalyticsBundle,
  PatientSummary,
  StageDetail,
  StageId,
} from '@/lib/types';

// =============================================================================
// ASC case rich content — Sofia A. Ramirez / BCBS Texas PPO
// Outpatient knee arthroscopy + meniscus repair
// Source: /Users/kanavkahol/Downloads/Sample 3/RCM_Outpatient_ASC_Demo.xlsx
// =============================================================================

export const ascPatientSummary: PatientSummary = {
  hero: {
    headline: 'Ambulatory Surgery · Right Knee Arthroscopy + Meniscus Repair',
    subhead:
      'Encounter ENC-2025-04291 — BCBS Texas PPO Tier 1. Same-day surgery, clean-claim happy path, deductible collected at check-in, $444.48 patient balance.',
  },
  demographics: [
    { label: 'Patient', value: 'Sofia A. Ramirez', emphasis: true },
    { label: 'DOB · Age', value: '06/22/1985 · 39' },
    { label: 'Gender', value: 'Female' },
    { label: 'MRN', value: 'MRN-29374651' },
    { label: 'Address', value: '88 Birchwood Ave, Austin, TX 78701' },
    { label: 'Phone', value: '(512) 555-0247' },
    { label: 'Emergency contact', value: 'Luis Ramirez — (512) 555-0318' },
    { label: 'PCP', value: 'Dr. Priya Anand, MD' },
    { label: 'Language', value: 'English / Spanish' },
  ],
  insurance: [
    { label: 'Primary payer', value: 'BlueCross BlueShield of Texas', emphasis: true },
    { label: 'Plan type', value: 'PPO — Preferred Provider' },
    { label: 'Member ID', value: 'BCB-TX-7734291' },
    { label: 'Group #', value: 'GRP-88421-SXTECH' },
    { label: 'Employer', value: 'SX Technologies Inc.' },
    { label: 'Plan year deductible', value: '$2,500.00' },
    { label: 'Deductible met YTD', value: '$1,875.00' },
    { label: 'Remaining deductible', value: '$625.00 — collected at check-in', emphasis: true },
    { label: 'OOP max / met', value: '$6,000.00 / $1,875.00' },
    { label: 'Coinsurance (in-net)', value: '20% after deductible' },
    { label: 'ASC in-network', value: 'Yes — Tier 1' },
    { label: 'PA #', value: 'PA-2025-BCB-44129' },
  ],
  encounter: [
    { label: 'Encounter', value: 'ENC-2025-04291' },
    { label: 'Encounter type', value: 'Outpatient Surgery (ASC)' },
    { label: 'Service date', value: '04/08/2025' },
    { label: 'Check-in', value: '06:45 AM' },
    { label: 'Procedure start', value: '07:30 AM' },
    { label: 'Procedure end', value: '09:15 AM' },
    { label: 'Recovery discharge', value: '11:00 AM' },
    { label: 'Facility', value: 'Austin Ambulatory Surgery Ctr' },
    { label: 'Operating surgeon', value: 'Dr. Marcus Lee, MD' },
    { label: 'Anesthesiologist', value: 'Dr. Yemi Adeyemi, MD' },
    { label: 'Procedure', value: 'Arthroscopic Knee Surgery — Meniscus Repair', emphasis: true },
    { label: 'Primary CPT', value: '29881 — Arthroscopy, knee, surgical' },
    { label: 'ASA class', value: 'II' },
    { label: 'Discharge disposition', value: 'Home — no complications' },
    { label: 'Total billed', value: '$18,740.00' },
    { label: 'Expected reimbursement', value: '$9,122.40' },
  ],
  agentSummary: [
    {
      agent: 'AI Eligibility Bot v5 + Benefits Bot',
      bullets: [
        'BCBS PPO active Tier 1; $625 remaining deductible identified',
        'Patient cost estimate $1,069.48 — communicated via SMS + MyChart',
        'PA required for CPT 29881 — auto-triggered AI Auth Engine',
      ],
    },
    {
      agent: 'AI Auth Engine',
      bullets: [
        '3 PAs approved (29881, 00400, 29882) in 3.9 hr against InterQual',
        'MRI 03/15 Grade III medial meniscus tear documented as supporting evidence',
        'Auth #BCB-AUTH-44129 embedded in 837P claim',
      ],
    },
    {
      agent: 'AI CDI + AI Auto-Coder v3.1',
      bullets: [
        '6 ICD-10-CM diagnoses, 12 CPT codes; 96.4% avg confidence',
        'Z96.651 (presence right knee artif) CDI-confirmed for medical necessity',
        'APC 5115 + 5114 mapped with mod 51 multiple-procedure rule applied',
      ],
    },
    {
      agent: 'AI Claim Scrubber + EDI 837P',
      bullets: [
        '12/12 edits passed; CCI mod 51 auto-applied to add-on CPT 29882',
        '837P submitted to BCBS-TX via Change Healthcare 04/09 08:07',
        '277CA acknowledgment ACCEPTED 04/09 09:44',
      ],
    },
    {
      agent: 'AI ERA + AI Patient Portal',
      bullets: [
        'BCBS paid $9,122.40 EFT on 04/16 (Day 8); CO-45 $9,617.60 written off',
        'Patient balance $444.48; payment plan 0% APR offered',
        'GFE variance = $0.00 (NSA-compliant)',
      ],
    },
  ],
  finalOutcome: [
    { label: 'Total billed', value: '$18,740.00' },
    { label: 'BCBS payment (EFT)', value: '$9,122.40', emphasis: true },
    { label: 'CO-45 contractual write-off', value: '$9,617.60' },
    { label: 'Deductible collected', value: '($625.00) at check-in' },
    { label: 'Patient coinsurance 20%', value: '$444.48' },
    { label: 'Patient balance', value: '$444.48' },
    { label: 'Net revenue collected', value: '$9,747.40', emphasis: true },
    { label: 'Days from service to cash', value: '8 days (BCBS)' },
    { label: 'NSA GFE variance', value: '$0.00 — exact match' },
  ],
};

const eligibility: StageDetail = {
  stageId: 'eligibility',
  intro:
    'AI Eligibility Bot ran a 270/271 EDI exchange against BCBS Texas + a parallel benefits investigation. Coverage Tier 1 confirmed; $625 deductible gap surfaced and routed to AI check-in payment portal.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Coverage', value: 'Tier 1 PPO', sub: 'BCBS-TX' },
        { label: 'Deductible', value: '$625 remain', sub: 'of $2,500' },
        { label: 'OOP remaining', value: '$4,125', sub: 'of $6,000' },
        { label: 'Patient est', value: '$1,069.48' },
        { label: 'AI confidence', value: '99.7%' },
      ],
    },
    {
      kind: 'table',
      title: 'A · 270/271 real-time eligibility log',
      columns: ['Txn', 'Date', 'Payer', 'Plan', 'Member ID', 'Status', 'Eff', 'Tier', 'Auth', 'Score'],
      rows: [
        ['ELG-001', '04/07 07:22', 'BCBS Texas', 'PPO Select', 'BCB-TX-7734291', 'ACTIVE', '01/01/2025', 'Tier 1', 'Yes', '99.7%'],
      ],
    },
    {
      kind: 'table',
      title: 'B · Benefits investigation detail',
      columns: ['Benefit', 'In-network', 'OON', 'Ded', 'Met', 'Remain', 'Coins', 'OOP max', 'Auth needed'],
      rows: [
        ['ASC outpatient surgery', 'Covered', '60% R&C', '$2,500', '$1,875', '$625', '20%', '$6,000', 'Yes'],
        ['Anesthesia', 'Covered', '60%', '(same)', '(same)', '(same)', '20%', '(same)', 'No'],
        ['Lab / pathology', 'Covered', '70%', '(same)', '(same)', '(same)', '20%', '(same)', 'No'],
        ['Post-op PT', '20 visits', '50%', '(same)', '(same)', '(same)', '20%', '(same)', '> 6 visits'],
        ['DME — knee brace', 'Covered', '50%', '(same)', '(same)', '(same)', '20%', '(same)', '> $500'],
      ],
    },
    {
      kind: 'edi',
      title: 'C · 271 response — BCBS-TX coverage',
      transaction: '271',
      segments: [
        'ISA*00*          *00*          *ZZ*00620BCB       *ZZ*RCMDEMOPROVIDR *250407*0723*^*00501*000006281*0*P*:~',
        'GS*HB*00620BCB*RCMDEMOPROVIDR*20250407*0723*6281*X*005010X279A1~',
        'ST*271*0001*005010X279A1~',
        'BHT*0022*11*ELG-BCB-04291*20250407*0723~',
        'NM1*PR*2*BCBS TEXAS*****PI*00620~',
        'NM1*1P*2*AUSTIN AMBULATORY SURGERY CENTER*****XX*2109876543~',
        'NM1*IL*1*RAMIREZ*SOFIA*A***MI*BCB-TX-7734291~',
        'DMG*D8*19850622*F~',
        'EB*1**30**BCBS PPO SELECT~',
        'EB*C*FAM*30**HEALTH BENEFIT PLAN*23*2500*****Y~      // Annual ded $2,500',
        'EB*F*FAM*30**HEALTH BENEFIT PLAN*23*1875*****Y~      // MET $1,875',
        'EB*G*FAM*30**HEALTH BENEFIT PLAN*23*6000*****Y~      // OOP max $6,000',
        'EB*A*IND**30**********20~                              // 20% coins',
        'EB*1**30****29881~                                     // CPT 29881 covered',
        'EB*B**30****29881****Y~                                // PA REQUIRED',
        'EB*1**73****ASC TIER 1~                                // Tier 1 ASC',
        'MSG*PROVIDER IN-NETWORK TIER 1 - BCBS PPO SELECT~',
        'SE*15*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'warn',
      title: 'AI insights — $625 deductible gap',
      body: 'Deductible remaining $625 must be collected before service. AI Estimator computed full patient cost = $1,069.48 ($625 deductible + $444.48 coinsurance). SMS + MyChart estimate delivered 04/07 14:00; collected at check-in 04/08 06:45 via AI Payment Kiosk.',
    },
  ],
};

const priorAuth: StageDetail = {
  stageId: 'priorAuth',
  intro:
    'AI Auth Engine ran a 6-step decision audit, pulled InterQual 2025 criteria, and obtained 3 PAs in 3.9 hours — surgery, anesthesia, and meniscus repair add-on.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'PAs requested', value: '3' },
        { label: 'PAs approved', value: '3 of 3' },
        { label: 'Avg turnaround', value: '1.8 hr' },
        { label: 'AI confidence', value: '99.4%' },
        { label: 'Criteria source', value: 'InterQual 2025' },
      ],
    },
    {
      kind: 'table',
      title: 'A · Prior authorization log',
      columns: ['PA #', 'Date', 'Service', 'CPT', 'DX', 'Payer', 'Status', 'Auth #', 'Turnaround'],
      rows: [
        ['PA-2025-BCB-44129', '04/07', 'ASC Knee Arthroscopy', '29881', 'M23.201', 'BCBS-TX', 'APPROVED', 'BCB-AUTH-44129', '3.9 hrs'],
        ['PA-2025-BCB-44130', '04/07', 'Anesthesia — General', '00400', 'M23.201', 'BCBS-TX', 'APPROVED', 'BCB-AUTH-44130', '0.8 hrs'],
        ['PA-2025-BCB-44131', '04/07', 'Meniscus Repair Add-On', '29882', 'M23.201', 'BCBS-TX', 'APPROVED', 'BCB-AUTH-44131', '0.8 hrs'],
      ],
    },
    {
      kind: 'table',
      title: 'B · AI Auth Engine — decision audit trail',
      columns: ['Step', 'Time', 'Action', 'Source', 'Finding', 'AI decision', 'Conf'],
      rows: [
        ['AUD-001', '04/07 07:26', 'Extract CPT/DX from referral', 'Referral — Dr. Lee', 'CPT 29881; DX M23.201; 6 wks PT failed', 'Proceed to PA check', '99.1%'],
        ['AUD-002', '04/07 07:27', 'Check PA requirement', 'BCBS-TX PA grid', 'CPT 29881 — PA required; CPT 27447 N/A', 'PA required confirmed', '100%'],
        ['AUD-003', '04/07 07:28', 'Pull clinical guidelines', 'InterQual 2025', 'Arthroscopy medial meniscus tear: criteria met', 'Criteria met', '97.4%'],
        ['AUD-004', '04/07 07:29', 'Review patient clinical notes', 'EHR — Epic', 'MRI 03/15: Grade III medial meniscus tear', 'Supporting evidence uploaded', '99.8%'],
        ['AUD-005', '04/07 07:30', 'Submit PA request electronically', 'BCBS-TX portal', 'Submitted ref BCB-PA-TMP-7843', 'Submitted', '100%'],
        ['AUD-006', '04/07 11:14', 'Receive PA approval', 'BCBS-TX portal', 'Approved BCB-AUTH-44129; 1 procedure 04/08', 'Approved — notified team', '100%'],
      ],
    },
    {
      kind: 'edi',
      title: 'C · 278 — primary surgery PA request',
      transaction: '278',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*00620BCB       *250407*0730*^*00501*000005101*0*P*:~',
        'GS*HI*RCMDEMOPROVIDR*00620BCB*20250407*0730*5101*X*005010X217~',
        'ST*278*0001*005010X217~',
        'BHT*0007*13*PA-44129*20250407*0730~',
        'NM1*X3*2*BCBS TEXAS*****46*00620~',
        'NM1*1P*2*AUSTIN AMBULATORY SURGERY CENTER*****XX*2109876543~',
        'NM1*IL*1*RAMIREZ*SOFIA*A***MI*BCB-TX-7734291~',
        'DMG*D8*19850622*F~',
        'TRN*1*PA-44129*9RCMDEMO~',
        'UM*HS*I*1*24:B*Y***Y~',                            // Outpatient surgery, ASC
        'DTP*AAH*D8*20250408~',
        'HSD*VS*1*HS*1*34*1~',
        'HI*BK:M23201~',                                      // Principal DX
        'HI*BR:29881*BR:29882*BR:00400~',                     // Procedures
        'PWK*OZ*EL*1*AC*RCM-PKT-04291~',                      // MRI evidence
        'MSG*GRADE III MEDIAL MENISCUS TEAR - 6 WEEKS PT FAILED - INTERQUAL CRITERIA MET~',
        'SE*15*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Auth Engine outcome',
      body: 'All 3 PAs approved within hours. Decision trail captured for audit. Auth numbers pre-embedded in pre-bill workflow → claim 837P will pass payer PA-linkage edits on first submission.',
    },
  ],
};

const cdi: StageDetail = {
  stageId: 'cdi',
  intro:
    'AI CDI Assistant verified that "presence of right artificial knee joint" was an existing prosthesis (not from this encounter), preventing a coding error and ensuring documentation supports medical necessity for the contralateral procedure.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Documents reviewed', value: '8', sub: 'pre-op + intra-op + PACU' },
        { label: 'CDI queries sent', value: '0', sub: 'all clear' },
        { label: 'CDI flags resolved', value: '1', sub: 'Z96.651 confirmed pre-existing' },
        { label: 'AI confidence', value: '96.4%' },
      ],
    },
    {
      kind: 'medicalRecord',
      title: 'A · Pre-op H&P + operative note (excerpts)',
      sections: [
        {
          heading: 'Pre-operative diagnosis',
          body: 'Right knee pain, locking, and "giving way" symptoms x4 months. MRI right knee 03/15/2025 demonstrates Grade III tear of the posterior horn of the medial meniscus with intact articular cartilage. Conservative treatment (6 weeks of physical therapy + NSAIDs) failed.',
        },
        {
          heading: 'Past surgical history (PSH)',
          body: 'Right total knee arthroplasty 2019 — Note: this is a pre-existing prosthesis from prior surgery and is NOT from today\'s encounter. The arthroscopy is being performed on the same knee due to symptomatic medial meniscus pathology adjacent to the prosthesis.',
          flags: ['CDI verified — pre-existing'],
        },
        {
          heading: 'Operative note — Dr. Lee',
          body: 'Diagnostic arthroscopy revealed Grade III tear posterior horn medial meniscus. Loose body removed. Partial meniscectomy performed (CPT 29881). Meniscal repair attempted at peripheral tear site with 2 inside-out sutures (CPT 29882). Articular cartilage WNL. No evidence of prosthesis loosening. EBL <50 mL. Tourniquet time 38 min. Patient tolerated procedure well; transferred to PACU in stable condition.',
        },
        {
          heading: 'PACU disposition',
          body: 'Patient awoke without complication; pain controlled with PO oxycodone. Discharged home at 11:00 AM ambulatory with knee unloader brace. PT scheduled for follow-up. Surgical follow-up in 2 weeks.',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'CDI outcome',
      body: 'AI CDI flagged Z96.651 (presence of right artificial knee joint) for confirmation that the prosthesis was pre-existing and not from today\'s encounter. Operative note explicitly confirms — code retained as a comorbidity, supporting medical necessity narrative for arthroscopic intervention adjacent to the prosthesis. No physician query needed.',
    },
  ],
};

const charge: StageDetail = {
  stageId: 'charge',
  intro:
    'AI Charge Engine assembled 14 charge lines across surgery, anesthesia, MRI, labs, ECG, DME, and PACU recovery. All lines matched CDM with zero CCI conflicts.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Charge lines', value: '14 of 14', sub: 'all clean' },
        { label: 'Total billed', value: '$18,740.00' },
        { label: 'CDM matches', value: '100%' },
        { label: 'CCI conflicts', value: '0' },
        { label: 'Mod 51 applied', value: 'CPT 29882', sub: 'add-on' },
      ],
    },
    {
      kind: 'table',
      title: 'A · ASC charge ledger — 04/08/2025',
      columns: ['Line', 'Rev', 'CPT/HCPCS', 'Mod', 'Description', 'Units', 'Charge', 'Audit'],
      rows: [
        ['001', '0360', '29881', '—', 'Arthroscopy Knee Surg — Primary', 1, '$8,500.00', 'Clean'],
        ['002', '0360', '29882', '51', 'Meniscus Repair Add-On', 1, '$3,200.00', 'Clean'],
        ['003', '0370', '00400', 'AA, QS', 'Anesthesia — Extremity Sup', 1, '$2,100.00', 'Clean'],
        ['004', '0510', '99213', '25', 'Pre-Op E&M Established Pt', 1, '$180.00', 'Clean'],
        ['005', '0610', '73721', '—', 'MRI Right Knee w/o Contrast', 1, '$1,450.00', 'Clean'],
        ['006', '0290', 'A4570', '—', 'Knee Unloader Brace — Post-Op', 1, '$640.00', 'Clean'],
        ['007', '0420', '97110', 'GP', 'PT Therapeutic Exercise', 1, '$285.00', 'Clean'],
        ['008', '0300', '36415', '—', 'Venipuncture — Pre-Op Labs', 1, '$45.00', 'Clean'],
        ['009', '0300', '85025', '—', 'CBC w/ Differential', 1, '$85.00', 'Clean'],
        ['010', '0300', '80053', '—', 'Comprehensive Metabolic Panel', 1, '$110.00', 'Clean'],
        ['011', '0730', '93000', '—', 'ECG 12-Lead w/ Interpretation', 1, '$145.00', 'Clean'],
        ['012', '0270', 'A4649', '—', 'Surgical Supply Pack — Arthro', 1, '$320.00', 'Clean'],
        ['013', '0272', 'A4550', '—', 'Sterile Drapes & Gowns — OR', 1, '$185.00', 'Clean'],
        ['014', '0940', '99283', '—', 'PACU Monitoring (1.75 hrs)', 1, '$695.00', 'Clean'],
        ['TOTAL', '', '', '', '14/14 lines clean', '', '$18,740.00', '✓'],
      ],
    },
  ],
};

const coding: StageDetail = {
  stageId: 'coding',
  intro:
    'AI Auto-Coder produced 6 ICD-10-CM diagnoses + 12 CPT codes (1 bundled removed). APC mapping passed pre-bill audit; modifier 51 applied for the multiple-procedure rule.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'ICD-10-CM', value: '6 codes' },
        { label: 'CPT/HCPCS', value: '12 codes', sub: '11 billable + 1 bundled' },
        { label: 'APCs assigned', value: '5' },
        { label: 'Avg confidence', value: '95.6%' },
        { label: 'Modifiers applied', value: 'mod 25, 51, AA, QS, GP' },
      ],
    },
    {
      kind: 'coding',
      title: 'A · ICD-10-CM diagnoses',
      codes: [
        { code: 'M23.201', description: 'Derangement Unspec Medial Meniscus — Right Knee', confidence: 0.973, type: 'Principal', editable: true, sourceText: 'MRI right knee 03/15: Grade III tear posterior horn medial meniscus' },
        { code: 'M25.361', description: 'Stiffness Right Knee NEC', confidence: 0.948, type: 'Secondary', editable: true, sourceText: '4 months locking and giving-way; reduced ROM noted on H&P' },
        { code: 'I10', description: 'Essential Hypertension', confidence: 0.995, type: 'Comorbidity · HCC 85', editable: true, sourceText: 'Mild HTN well-controlled on lisinopril' },
        { code: 'J45.20', description: 'Mild Intermittent Asthma, Uncomplicated', confidence: 0.961, type: 'Comorbidity', editable: true, sourceText: 'Childhood asthma; rescue inhaler PRN, no recent exacerbation' },
        { code: 'Z96.651', description: 'Presence Right Artificial Knee Joint (Pre-existing)', confidence: 0.884, type: 'Status · CDI confirmed', editable: true, sourceText: 'Right TKR 2019 pre-existing — confirmed by operative note 04/08' },
        { code: 'Z87.39', description: 'Hx of Endocrine/Metabolic Disease', confidence: 0.902, type: 'Hx', editable: true, sourceText: 'Resolved gestational diabetes (2017)' },
      ],
    },
    {
      kind: 'coding',
      title: 'B · CPT/HCPCS procedures (outpatient ASC)',
      codes: [
        { code: '29881', description: 'Arthroscopy Knee Surgical — Removal Loose Body', confidence: 0.979, modifier: '—', type: 'Primary procedure · APC 5115', editable: true, sourceText: 'Diagnostic arthroscopy revealed Grade III tear; loose body removed' },
        { code: '29882', description: 'Meniscus Repair Add-On (Medial)', confidence: 0.963, modifier: '51', type: 'Add-on · APC 5114 · multi-proc', editable: true, sourceText: 'Inside-out sutures placed at peripheral tear site' },
        { code: '00400', description: 'Anesthesia — Superficial Extremities', confidence: 0.951, modifier: 'AA, QS', type: 'Anesthesia · APC 0275', editable: true, sourceText: 'General anesthesia with CRNA support; ASA II' },
        { code: '99213', description: 'E&M — Established Pt Pre-Op Assess', confidence: 0.948, modifier: '25', type: 'E&M · APC 5012', editable: true, sourceText: 'Same-day pre-op assessment by Dr. Lee — separate from procedure' },
        { code: '73721', description: 'MRI Knee w/o Contrast (Pre-op reads in today)', confidence: 0.982, type: 'Imaging · APC 8005', editable: true, sourceText: 'MRI 03/15 with formal interpretation read on day of surgery' },
        { code: 'A4570', description: 'Knee Brace — Unloader Type', confidence: 0.914, type: 'DME', editable: true, sourceText: 'Discharged with knee unloader brace per op note' },
        { code: '97110', description: 'PT — Therapeutic Exercise (Post-op same day)', confidence: 0.937, modifier: 'GP', type: 'PT', editable: true, sourceText: 'Post-op PT instruction delivered in PACU prior to discharge' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'C · APC assignment & reimbursement',
      rows: [
        { label: 'APC 5115', value: 'Level 5 Musculoskeletal — $4,122.40', emphasis: true },
        { label: 'APC 5114', value: 'Level 4 Musculoskeletal — $1,600 (50% multi-proc rule)' },
        { label: 'APC 0275', value: 'Anesthesia — $980.00' },
        { label: 'APC 5012', value: 'E&M Level 2 — $85.00' },
        { label: 'APC 8005', value: 'MRI w/o Contrast — $720.00' },
        { label: 'Total APC payment', value: '$9,122.40 (matches BCBS allowed)', emphasis: true },
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'No DRG / ICD-10-PCS for this case',
      body: 'Outpatient ASC encounter — no inpatient stay → no MS-DRG or ICD-10-PCS assignment. Reimbursement via APC (Ambulatory Payment Classification) on the 837P. Inpatient DRG/PCS workflow demonstrated in the CHF case.',
    },
  ],
};

const claim: StageDetail = {
  stageId: 'claim',
  intro:
    'AI Claim Scrubber ran 12 ASC-specific edits — all passed — and submitted the 837P to BCBS-TX via Change Healthcare. 277CA acknowledgment received in 97 minutes.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Edits passed', value: '12/12' },
        { label: 'Status', value: 'ACCEPTED', sub: 'BCBS-TX' },
        { label: '277CA ack', value: '97 min' },
        { label: 'Total billed', value: '$18,740.00' },
        { label: 'Claim #', value: 'CLM-BCB-2025-4291' },
      ],
    },
    {
      kind: 'keyValues',
      title: 'A · CMS-1500 / 837P claim summary',
      rows: [
        { label: 'Claim #', value: 'CLM-BCB-2025-4291' },
        { label: 'Bill type', value: '131 — Hospital Outpatient' },
        { label: 'Place of service', value: '24 — Ambulatory Surgery Center' },
        { label: 'Provider NPI', value: '2109876543' },
        { label: 'Provider name', value: 'Austin Ambulatory Surgery Center' },
        { label: 'Tax ID', value: '74-7654321' },
        { label: 'Rendering NPI', value: '9182736450 — Dr. Marcus Lee' },
        { label: 'Auth # on claim', value: 'BCB-AUTH-44129', emphasis: true },
        { label: 'Total charges', value: '$18,740.00', emphasis: true },
        { label: 'Amount paid prior', value: '$625.00 — patient deductible' },
        { label: 'Claim frequency', value: '1 — Original' },
      ],
    },
    {
      kind: 'edi',
      title: 'B · 837P claim — key segments',
      transaction: '837P',
      segments: [
        'ISA*00*          *00*          *ZZ*RCMDEMOPROVIDR *ZZ*00620BCB       *250409*0807*^*00501*000007192*0*P*:~',
        'GS*HC*RCMDEMOPROVIDR*00620BCB*20250409*0807*7192*X*005010X222A1~',
        'ST*837*0001*005010X222A1~',
        'BHT*0019*00*RCM-ASC-04291*20250409*0807*CH~',
        'NM1*41*2*AUSTIN AMBULATORY SURGERY CENTER*****46*2109876543~',
        'NM1*40*2*BCBS TEXAS*****46*00620~',
        'HL*1**20*1~',
        'NM1*85*2*AUSTIN AMBULATORY SURGERY CENTER*****XX*2109876543~',
        'REF*EI*74-7654321~',
        'HL*2*1*22*1~',
        'SBR*P*18*GRP-88421-SXTECH*****CI~',
        'NM1*IL*1*RAMIREZ*SOFIA*A***MI*BCB-TX-7734291~',
        'DMG*D8*19850622*F~',
        'NM1*PR*2*BCBS TEXAS*****PI*00620~',
        'CLM*ENC-2025-04291*18740.00***24:B:1*Y*A*Y*Y~',
        'AMT*F5*625.00~                                       // Deductible already collected',
        'REF*G1*BCB-AUTH-44129~                                // PA on claim',
        'HI*ABK:M23201*ABF:M25361*ABF:I10*ABF:J4520*ABF:Z96651*ABF:Z8739~',
        '— LX*1 29881 Arthroscopy primary —',
        'LX*1~',
        'SV1*HC:29881*8500.00*UN*1***1:2:3:4~',
        'DTP*472*D8*20250408~',
        'REF*XZ*BCB-AUTH-44129~',
        '— LX*2 29882 Meniscus repair (mod 51) —',
        'LX*2~',
        'SV1*HC:29882:51*3200.00*UN*1***1:2:3~',
        'DTP*472*D8*20250408~',
        'REF*XZ*BCB-AUTH-44131~',
        '— remaining 12 lines elided for display —',
        'SE*120*0001~',
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Scrubber outcome',
      body: 'All 12 edits passed including CCI mod 51 auto-application, OCE imaging APC check, PA linkage on both surgical lines, anesthesia AA+QS modifier validation, and timely-filing window. Clean claim submitted; BCBS-TX accepted in 97 minutes.',
    },
  ],
};

const denial: StageDetail = {
  stageId: 'denial',
  intro:
    'No denials. AI denial-prevention edits resolved all risks pre-bill. Net denial impact = $0; account flows directly through to adjudication.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Denials received', value: '0' },
        { label: 'Pre-bill alerts resolved', value: '5' },
        { label: 'Recovery needed', value: '$0' },
        { label: 'Clean claim status', value: '✓ NO DENIAL' },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Denial Engine — clean path',
      body: 'AI denial prevention rules surfaced 5 pre-bill risks (modifier validation, PA linkage, CCI sequencing, dx-pointer, OCE) — all resolved before submission. The 837P passed adjudication first time with zero denials, validating the AI scrubber\'s effectiveness for routine outpatient surgery.',
    },
  ],
};

const payment: StageDetail = {
  stageId: 'payment',
  intro:
    'BCBS-TX paid $9,122.40 EFT on 04/16 (Day 8). Patient owes $444.48 coinsurance after the deductible was collected at check-in; AI offered 0% APR payment plans via SMS.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'BCBS payment', value: '$9,122.40', sub: 'EFT 04/16' },
        { label: 'Patient owed', value: '$444.48', sub: 'after $625 upfront' },
        { label: 'CO-45 write-off', value: '$9,617.60' },
        { label: 'Days to cash', value: '8 days', sub: 'from submission' },
        { label: 'NSA GFE variance', value: '$0.00' },
      ],
    },
    {
      kind: 'edi',
      title: 'A · 835 ERA — BCBS payment',
      transaction: '835',
      segments: [
        'ISA*00*          *00*          *ZZ*00620BCB       *ZZ*RCMDEMOPROVIDR *250416*0900*^*00501*000008321*0*P*:~',
        'GS*HP*00620BCB*RCMDEMOPROVIDR*20250416*0900*8321*X*005010X221A1~',
        'ST*835*0001~',
        'BPR*I*9122.40*C*ACH*CCP*01*021000021*DA*9876543210*1234567890**01*021000021*DA*5555555555*20250416~',
        'TRN*1*EFT-BCB-20250416-09271*1234567890~',
        'REF*EV*00620~',
        'DTM*405*20250416~',
        'N1*PR*BCBS TEXAS~',
        'N1*PE*AUSTIN AMBULATORY SURGERY CENTER*XX*2109876543~',
        'LX*1~',
        'CLP*ENC-2025-04291*1*18740.00*9122.40*1069.48*CI*CLM-BCB-2025-4291*22*7~',
        'NM1*QC*1*RAMIREZ*SOFIA*A***MI*BCB-TX-7734291~',
        'SVC*HC:29881*8500.00*4122.40*UN*1~',
        'CAS*CO*45*4377.60~                                  // Contractual',
        'CAS*PR*1*312.50~                                    // Patient deductible',
        'CAS*PR*2*762.00~                                    // Patient coinsurance',
        'SVC*HC:29882:51*3200.00*1600.00*UN*1~',
        'CAS*CO*45*1600.00~',
        '— remaining lines elided —',
        'SE*42*0001~',
      ],
    },
    {
      kind: 'table',
      title: 'B · ERA line-level adjudication',
      columns: ['Line', 'CPT', 'Description', 'Billed', 'Allowed', 'CO-45', 'PR-1 Ded', 'PR-2 Coins', 'Paid'],
      rows: [
        ['001', '29881', 'Arthroscopy Knee Primary', '$8,500.00', '$4,122.40', '($4,377.60)', '$312.50', '$762.00', '$3,047.90'],
        ['002', '29882', 'Meniscus Repair Add-On', '$3,200.00', '$1,600.00', '($1,600.00)', '$195.00', '$281.00', '$1,124.00'],
        ['003', '00400', 'Anesthesia', '$2,100.00', '$980.00', '($1,120.00)', '$62.50', '$183.50', '$734.00'],
        ['004', '99213', 'E&M Pre-Op', '$180.00', '$85.00', '($95.00)', '$17.50', '$13.50', '$54.00'],
        ['005', '73721', 'MRI Knee', '$1,450.00', '$720.00', '($730.00)', '$25.00', '$139.00', '$556.00'],
        ['TOTAL', '', '5 of 14 shown', '$15,430.00', '$7,507.40', '($7,922.60)', '$612.50', '$1,379.00', '$5,515.90'],
      ],
    },
    {
      kind: 'arPriority',
      title: 'C · Patient balance & AI collections — Sofia Ramirez',
      rows: [
        {
          account: 'ENC-2025-04291',
          patient: 'Sofia A. Ramirez',
          payer: 'BCBS PPO + self-pay',
          balance: 444.48,
          daysAR: 6,
          propensity: 0.91,
          recommendedAction: 'Offer 0% APR plan; SMS payment link; auto-pay enrollment recommended.',
          paymentPlan: '3 months @ $148.16/mo · 0% APR',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'success',
      title: 'AI Patient Payment — outcome',
      body: 'Patient propensity-to-pay = 91% (very high) based on income proxy, employer profile, and on-time deductible at check-in. 0% APR 3-month plan offered via SMS; patient currently considering. NSA Good-Faith-Estimate variance was $0.00 — exact match with final bill (NSA-compliant).',
    },
  ],
};

const registration: StageDetail = {
  stageId: 'registration',
  intro:
    'Pre-registration completed 04/07 (day prior). Identity verified via OCR; insurance card scanned; consents eSigned; deductible collected at check-in 04/08 06:45.',
  sections: [
    {
      kind: 'kpis',
      items: [
        { label: 'Pre-reg tasks', value: '10/10' },
        { label: 'Deductible collected', value: '$625', sub: 'at check-in kiosk' },
        { label: 'Consents eSigned', value: '✓' },
        { label: 'GFE delivered', value: '04/07 14:00' },
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Pre-registration handed off',
      body: 'AI Reg Bot completed all 10 pre-op tasks: identity verification, insurance card scan, consents, financial disclosure, deductible collection, NSA GFE, medical history, lab results, anesthesia clearance, NPO instructions.',
    },
  ],
};

export const ascStageDetails: Partial<Record<StageId, StageDetail>> = {
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

export const ascAnalytics: AnalyticsBundle = {
  topMetrics: [
    { label: '$ Submitted', value: '$18,740' },
    { label: '$ Collected', value: '$9,747', sub: 'BCBS + upfront' },
    { label: '$ Adjusted (CO-45)', value: '$9,618' },
    { label: '$ Written off', value: '$0' },
    { label: '$ Patient owed', value: '$444' },
    { label: 'Clean claim rate', value: '100%' },
    { label: 'Denial rate', value: '0%' },
    { label: 'Days in A/R', value: '8 days' },
    { label: 'Net collection rate', value: '52.0%' },
    { label: 'NSA GFE variance', value: '$0' },
  ],
  endToEndTimeline: [
    { date: '04/07 07:22', label: 'Eligibility verified', agent: 'AI Elig Bot v5', status: 'success' },
    { date: '04/07 11:14', label: 'PA approved (3.9 hrs)', agent: 'AI Auth Engine', status: 'success' },
    { date: '04/07 16:30', label: 'Pre-registration complete', agent: 'Reg AI Bot', status: 'success' },
    { date: '04/08 06:45', label: 'Check-in + $625 collected', agent: 'AI Kiosk', status: 'success' },
    { date: '04/08 09:15', label: 'Surgery complete', agent: 'Dr. Lee', status: 'success' },
    { date: '04/08 13:15', label: 'Coding complete', agent: 'AI Auto-Coder', status: 'success' },
    { date: '04/09 08:07', label: '837P submitted', agent: 'AI Scrubber + EDI', status: 'success' },
    { date: '04/09 09:44', label: '277CA accepted', agent: 'BCBS-TX', status: 'success' },
    { date: '04/16 14:22', label: 'BCBS adjudicated', agent: 'BCBS-TX', status: 'success' },
    { date: '04/16', label: 'EFT $9,122.40 received', agent: 'AI ERA Processor', status: 'success' },
    { date: '04/19 10:00', label: 'Patient statement sent', agent: 'AI Stmt Bot', status: 'success' },
    { date: '04/25', label: 'Payment plan offered', agent: 'AI Payment Bot', status: 'info' },
  ],
  benchmarks: [
    { metric: 'Days from referral to surgery', thisCase: '~21 days', aiBenchmark: '14–21 days', industryAvg: '30–45 days', delta: '↑ 9–24 days faster' },
    { metric: 'Auth turnaround', thisCase: '3.9 hrs', aiBenchmark: '4–8 hrs', industryAvg: '24–48 hrs', delta: '↑ 20–44 hrs faster' },
    { metric: 'Clean claim rate', thisCase: '100%', aiBenchmark: '97–99%', industryAvg: '85–90%', delta: '↑ 10–15 pts' },
    { metric: 'Denial rate', thisCase: '0%', aiBenchmark: '2–4%', industryAvg: '5–10%', delta: '↑ 5–10 pts' },
    { metric: 'Days to payment', thisCase: '8 days', aiBenchmark: '10–15 days', industryAvg: '21–30 days', delta: '↑ 13–22 days faster' },
    { metric: 'NSA GFE variance', thisCase: '$0.00', aiBenchmark: '<$200', industryAvg: '$400–800', delta: 'Exact match', notes: 'AI Estimator' },
    { metric: 'Patient propensity to pay', thisCase: '91%', aiBenchmark: '70–85%', industryAvg: '55–70%', delta: '↑ 21–36 pts' },
    { metric: 'Patient satisfaction', thisCase: '4.9/5', aiBenchmark: '4.5–4.9', industryAvg: '3.8–4.2', delta: '↑ 0.7–1.1' },
  ],
};
