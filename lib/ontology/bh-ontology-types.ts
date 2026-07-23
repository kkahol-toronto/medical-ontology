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

export interface BhOntologyNode {
  id: string;
  label: string;
  category: BhCategory;
  type: string;
  summary: string;
  attributes: Record<string, string | number | null>;
  uuid: string;
}

export interface BhOntologyEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface BhOntologyGraph {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
  nodes: BhOntologyNode[];
  edges: BhOntologyEdge[];
}

export const BH_CATEGORY_COLORS: Record<BhCategory, string> = {
  Patient: '#3b82f6',
  Encounter: '#8b5cf6',
  Diagnosis: '#ec4899',
  Symptom: '#f43f5e',
  Payer: '#06b6d4',
  Policy: '#f97316',
  PolicySection: '#fb923c',
  ClinicalCriteria: '#eab308',
  LevelOfCare: '#22c55e',
  Assessment: '#14b8a6',
  Denial: '#ef4444',
  Appeal: '#a855f7',
  Claim: '#6366f1',
  Charge: '#64748b',
  Code: '#475569',
  Agent: '#ff7a1a',
  RCMStage: '#94a3b8',
  Payment: '#10b981',
  Provider: '#0ea5e9',
  Facility: '#78716c',
};

export interface ForceGraphNode extends BhOntologyNode {
  x?: number;
  y?: number;
  color?: string;
}

export interface ForceGraphLink {
  source: string;
  target: string;
  relation: string;
}
