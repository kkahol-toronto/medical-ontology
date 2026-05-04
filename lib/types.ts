export type CaseId = 'oncology' | 'inpatient' | 'asc';

export type StageId =
  | 'registration'
  | 'eligibility'
  | 'priorAuth'
  | 'cdi'
  | 'charge'
  | 'coding'
  | 'claim'
  | 'denial'
  | 'payment';

export type AiMode = 'AUTO' | 'ASSIST' | 'REVIEW';

export interface Patient {
  name: string;
  mrn: string;
  dob?: string;
  age?: number;
  gender?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  pcp?: string;
  attending?: string;
}

export interface Insurance {
  primaryPayer: string;
  planName?: string;
  memberId?: string;
  groupNumber?: string;
  deductible?: number;
  deductibleMet?: number;
  oopMax?: number;
  oopMet?: number;
  coinsurance?: string;
  secondaryPayer?: string;
  secondaryMemberId?: string;
}

export interface Encounter {
  encounterNumber: string;
  encounterType: string;
  serviceDate: string;
  facility: string;
  attending?: string;
  los?: number;
  drg?: string;
  drgWeight?: number;
  cancerStage?: string;
  notes?: string;
}

export interface DiagnosisCode {
  seq: number;
  code: string;
  description: string;
  type: string;
  poa?: string;
  aiConfidence?: number;
  hcc?: string;
  rafWeight?: number;
  cdiFlag?: boolean;
  notes?: string;
}

export interface ProcedureCode {
  seq: number;
  code: string;
  description: string;
  modifier?: string;
  units?: number;
  charge?: number;
  allowed?: number;
  aiConfidence?: number;
  notes?: string;
}

export interface ChargeLine {
  line: string;
  revCode?: string;
  revDesc?: string;
  hcpcs?: string;
  description: string;
  serviceDate?: string;
  units?: number;
  unitCharge?: number;
  totalCharge: number;
  aiAudit?: string;
}

export interface PriorAuthEvent {
  step: string;
  date: string;
  event: string;
  initiatedBy: string;
  details: string;
  status: string;
  daysElapsed?: number;
}

export interface DenialEvent {
  id: string;
  date: string;
  payer: string;
  claimNumber?: string;
  code: string;
  category: string;
  reason: string;
  billed: number;
  denied: number;
  aiAction: string;
  appealFiled: boolean;
  resolution: string;
  recovered: number;
}

export interface AdjudicationLine {
  line: string;
  hcpcs?: string;
  description: string;
  billed: number;
  allowed: number;
  paid: number;
  patientResp?: number;
  carc?: string;
  status: string;
}

export interface KpiSet {
  totalBilled: number;
  payerPayment: number;
  appealRecovered?: number;
  patientBalance: number;
  denialRate: number;
  denialOverturnRate?: number;
  daysToPayment: number;
  cleanClaimRate: number;
  netCollectionRate?: number;
  hccRaf?: number;
  appealCycleDays?: number;
  patientSatisfaction?: number;
}

export interface TimelineEvent {
  milestone: string;
  date: string;
  day?: string;
  responsible?: string;
  aiTool?: string;
  duration?: string;
  status: string;
  notes?: string;
  stage: StageId;
}

export interface ReasoningStep {
  text: string;
  detail?: string;
  durationMs?: number;
}

export interface StageData {
  id: StageId;
  name: string;
  mode: AiMode;
  agentName: string;
  awsService?: 'Bedrock' | 'ComprehendMedical' | null;
  inputs: { label: string; value: string }[];
  reasoning: ReasoningStep[];
  outputs: { label: string; value: string; emphasis?: boolean }[];
  kpiDeltas?: { label: string; value: string; positive?: boolean }[];
  exception?: { reason: string; resolution: string };
}

export interface RcmCase {
  id: CaseId;
  title: string;
  shortTitle: string;
  subtitle: string;
  payer: string;
  hero?: boolean;
  patient: Patient;
  insurance: Insurance;
  encounter: Encounter;
  clinicalNarrative: string;
  diagnoses: DiagnosisCode[];
  procedures: ProcedureCode[];
  charges: ChargeLine[];
  priorAuth: PriorAuthEvent[];
  denials: DenialEvent[];
  adjudication: AdjudicationLine[];
  timeline: TimelineEvent[];
  kpis: KpiSet;
  stages: Record<StageId, StageData>;
}
