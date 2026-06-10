import type { CaseId, StageId } from '@/lib/types';

/** RCM knowledge-graph entities grounded per stage (Zep-style ontology). */
export const STAGE_ENTITIES: Record<StageId, string[]> = {
  registration: ['Patient', 'Provider', 'Facility', 'Insurance'],
  eligibility: ['Payer', 'Plan', 'Coverage', 'Benefit'],
  priorAuth: ['Policy', 'PriorAuth', 'ClinicalCriteria', 'Appeal'],
  cdi: ['Encounter', 'Diagnosis', 'ClinicalDocument', 'Code'],
  charge: ['Charge', 'HCPCS', 'NDC', 'RevenueCode'],
  coding: ['Code', 'DRG', 'Modifier', 'HCC'],
  claim: ['Claim', 'Subscriber', 'EDI837'],
  denial: ['Denial', 'Appeal', 'PolicyCitation', 'CARC'],
  payment: ['ERA', 'Payment', 'Balance', 'Adjudication'],
};

/** Case-specific entity emphasis (hero subgraph nodes). */
export const CASE_ENTITIES: Record<
  CaseId,
  { label: string; entities: string[]; description: string }
> = {
  oncology: {
    label: 'Oncology · Aetna denial & appeal',
    entities: [
      'Patient',
      'Encounter',
      'Payer',
      'PriorAuth',
      'Denial',
      'Appeal',
      'ChemoRegimen',
      'Policy',
    ],
    description:
      'Stage IV NSCLC infusion — CO-50 denial overturned via NCCN + Aetna CPB grounding.',
  },
  inpatient: {
    label: 'Inpatient · Medicare DRG',
    entities: [
      'Patient',
      'Encounter',
      'Payer',
      'DRG',
      'Diagnosis',
      'MCC',
      'Claim',
      'Payment',
    ],
    description:
      'DRG 291 heart failure + MCC — CDI-driven specificity protects reimbursement.',
  },
  asc: {
    label: 'Outpatient ASC · BCBS-TX',
    entities: [
      'Patient',
      'Encounter',
      'Payer',
      'PriorAuth',
      'Procedure',
      'Claim',
      'Payment',
    ],
    description:
      'Knee arthroscopy — clean claim, 100% denial prevention, 8-day payment.',
  },
};

export const ENTITY_SYSTEMS: Record<string, string> = {
  Patient: 'Epic ADT / EMPI',
  Provider: 'NPI Registry',
  Facility: 'Epic / Cerner',
  Insurance: 'Textract OCR',
  Payer: 'EDI 270/271',
  Plan: 'Payer master',
  Coverage: 'Availity',
  Benefit: '271 response',
  Policy: 'Payer policy bundle',
  PriorAuth: 'Availity / payer portal',
  ClinicalCriteria: 'InterQual / NCCN',
  Appeal: 'Bedrock + policy cite',
  Encounter: 'EHR chart',
  Diagnosis: 'ICD-10-CM',
  ClinicalDocument: 'CDI workbench',
  Code: 'ICD / CPT / HCPCS',
  Charge: 'Charge master',
  HCPCS: 'J-code table',
  NDC: 'Pharmacy feed',
  RevenueCode: 'UB-04',
  DRG: 'MS-DRG grouper',
  Modifier: 'CMS NCCI',
  HCC: 'CMS-HCC RAF',
  Claim: '837P / 837I',
  Subscriber: 'Member roster',
  EDI837: 'Clearinghouse',
  Denial: '835 / CARC',
  PolicyCitation: 'NCCN / CPB PDF',
  CARC: 'X12 835',
  ERA: '835 remittance',
  Payment: 'Bank / lockbox',
  Balance: 'Patient ledger',
  Adjudication: 'Payer engine',
  ChemoRegimen: 'Oncology protocol',
  MCC: 'CC / MCC table',
  Procedure: 'CPT / ASC fee',
};
