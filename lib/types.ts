export type CaseId = 'oncology' | 'inpatient' | 'asc' | 'behavioralHealth';

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

// ===========================================================================
// Rich stage-detail content (rendered in the Agent Work Surface, below the
// summary widget). Each stage is a list of typed "sections" that the
// StageDetailPanel renders polymorphically.
// ===========================================================================

export type CalloutTone = 'info' | 'warn' | 'success' | 'danger';

export interface KpiItem {
  label: string;
  value: string;
  sub?: string;
}

export interface KeyValueRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface TimelineItem {
  date: string;
  label: string;
  agent?: string;
  detail?: string;
  status?: 'success' | 'fail' | 'progress' | 'info';
  ms?: number;
}

export interface CdiQuery {
  id: string;
  question: string;
  options: string[];
  rationale: string;
  status?: 'pending' | 'answered' | 'resolved';
  physician?: string;
}

export interface CodingItem {
  code: string;
  description: string;
  sourceText: string;
  confidence: number;
  type?: string;
  modifier?: string;
  editable?: boolean;
  status?: 'AI-coded' | 'CDI-flagged' | 'Final';
}

export interface MedRecordSection {
  heading: string;
  body: string;
  flags?: string[];
}

export interface ArPriorityRow {
  account: string;
  patient: string;
  payer: string;
  balance: number;
  daysAR: number;
  propensity: number;
  recommendedAction: string;
  paymentPlan?: string;
}

export type StageSection =
  | { kind: 'kpis'; items: KpiItem[] }
  | { kind: 'keyValues'; title?: string; rows: KeyValueRow[] }
  | { kind: 'table'; title?: string; columns: string[]; rows: (string | number)[][]; footer?: string }
  | { kind: 'timeline'; title?: string; events: TimelineItem[] }
  | { kind: 'edi'; title?: string; transaction?: string; segments: string[] }
  | { kind: 'json'; title?: string; payload: unknown }
  | { kind: 'medicalRecord'; title?: string; sections: MedRecordSection[] }
  | { kind: 'cdiQueries'; title?: string; queries: CdiQuery[] }
  | { kind: 'coding'; title?: string; codes: CodingItem[] }
  | { kind: 'policyCitation'; title?: string; source: string; quote: string; pageRef?: string }
  | { kind: 'callout'; tone: CalloutTone; title: string; body: string }
  | { kind: 'arPriority'; title?: string; rows: ArPriorityRow[] };

export interface StageDetail {
  stageId: StageId;
  intro?: string;
  sections: StageSection[];
}

// ===========================================================================
// Patient Summary (top-level summary view per case, mirrors the Patient
// Summary tab in each Excel workbook).
// ===========================================================================

export interface PatientSummary {
  hero: { headline: string; subhead: string };
  demographics: KeyValueRow[];
  insurance: KeyValueRow[];
  encounter: KeyValueRow[];
  clinical?: KeyValueRow[];
  agentSummary: { agent: string; bullets: string[] }[];
  finalOutcome: KeyValueRow[];
}

// ===========================================================================
// Analytics dashboard (per-case + cross-portfolio rollup).
// ===========================================================================

export interface AnalyticsBenchmark {
  metric: string;
  thisCase: string;
  aiBenchmark: string;
  industryAvg: string;
  delta: string;
  notes?: string;
}

export interface AnalyticsBundle {
  topMetrics: KpiItem[];
  endToEndTimeline: TimelineItem[];
  benchmarks: AnalyticsBenchmark[];
  payerBreakdown?: { payer: string; submitted: number; paid: number; denialRate: number; avgDaysAR: number; collectionRate: number }[];
  arAging?: { bucket: string; count: number; balance: number }[];
  denialDistribution?: { category: string; count: number; pct: number; recoverable: number }[];
  topDenialRootCauses?: { rank: number; cause: string; pct: number; recommendation: string }[];
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
  // New: rich stage-by-stage detail rendered in the work surface.
  stageDetails?: Partial<Record<StageId, StageDetail>>;
  patientSummary?: PatientSummary;
  analytics?: AnalyticsBundle;
}
