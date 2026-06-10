import { STAGE_ENTITIES, ENTITY_SYSTEMS } from '@/lib/ontology/rcm-config';
import type { StageData } from '@/lib/types';

export type OntologyNodeKind =
  | 'input'
  | 'tool'
  | 'rule'
  | 'source'
  | 'model'
  | 'agent'
  | 'entity'
  | 'output';

export type StageRunStatus = 'queued' | 'running' | 'done' | 'exception';

export interface OntologyGraphNode {
  id: string;
  label: string;
  sublabel?: string;
  kind: OntologyNodeKind;
  x: number;
  y: number;
  stepIndex?: number;
  active: boolean;
}

export interface OntologyGraphEdge {
  from: string;
  to: string;
  label?: string;
  active: boolean;
}

export interface StageOntologyGraph {
  nodes: OntologyGraphNode[];
  edges: OntologyGraphEdge[];
}

export const KIND_LABELS: Record<OntologyNodeKind, string> = {
  input: 'Input',
  tool: 'Tool',
  rule: 'Rule',
  source: 'Source',
  model: 'Model',
  agent: 'Agent',
  entity: 'Entity',
  output: 'Output',
};

function placeColumn(
  nodes: OntologyGraphNode[],
  kind: OntologyNodeKind,
  col: number,
  items: Omit<OntologyGraphNode, 'x' | 'y' | 'kind' | 'active'>[],
) {
  const count = Math.max(items.length, 1);
  items.forEach((item, i) => {
    nodes.push({
      ...item,
      kind,
      active: false,
      x: col,
      y: count === 1 ? 0.5 : 0.12 + (i / (count - 1)) * 0.76,
    });
  });
}

function isNodeActive(
  node: OntologyGraphNode,
  stage: StageData,
  opts: { visibleStepCount: number; runStatus: StageRunStatus; isDone: boolean },
): boolean {
  const { visibleStepCount, runStatus, isDone } = opts;

  if (node.kind === 'agent') return true;
  if (isDone) return true;

  if (visibleStepCount === 0 && runStatus === 'queued') {
    return node.kind === 'input' || node.kind === 'entity';
  }

  if (node.kind === 'input') {
    return visibleStepCount > 0 || runStatus === 'running';
  }

  if (node.kind === 'output') return false;

  if (
    node.id.startsWith('tool-') ||
    node.kind === 'rule' ||
    node.kind === 'source' ||
    node.kind === 'model'
  ) {
    if (node.id === 'reasoning') return visibleStepCount > 0;
    const stepIdx = node.stepIndex ?? 0;
    return (
      stepIdx < visibleStepCount ||
      (runStatus === 'running' && stepIdx === visibleStepCount)
    );
  }

  if (node.kind === 'entity') {
    return visibleStepCount > 0;
  }

  if (node.id === 'reasoning') return visibleStepCount > 0;

  return visibleStepCount > 0;
}

function annotateActivity(
  graph: StageOntologyGraph,
  stage: StageData,
  opts: { visibleStepCount: number; runStatus: StageRunStatus; isDone: boolean },
): StageOntologyGraph {
  const activeMap = Object.fromEntries(
    graph.nodes.map((n) => [n.id, isNodeActive(n, stage, opts)]),
  );

  return {
    nodes: graph.nodes.map((n) => ({ ...n, active: activeMap[n.id] ?? false })),
    edges: graph.edges.map((e) => ({
      ...e,
      active: (activeMap[e.from] ?? false) && (activeMap[e.to] ?? false),
    })),
  };
}

function awsServiceTool(stage: StageData): { title: string; detail: string } | null {
  if (stage.awsService === 'Bedrock') {
    return { title: 'AWS Bedrock', detail: 'Claude reasoning + appeal drafting' };
  }
  if (stage.awsService === 'ComprehendMedical') {
    return {
      title: 'Comprehend Medical',
      detail: 'NER · ICD-10 · RxNorm · SNOMED',
    };
  }
  return null;
}

export function buildStageOntologyGraph(
  stage: StageData,
  opts: {
    visibleStepCount: number;
    runStatus: StageRunStatus;
    isDone: boolean;
  },
): StageOntologyGraph {
  const nodes: OntologyGraphNode[] = [];
  const edges: OntologyGraphEdge[] = [];
  const agentId = 'agent';

  nodes.push({
    id: agentId,
    label: stage.agentName.replace(/ Agent$/, ''),
    sublabel: `${stage.mode} agent`,
    kind: 'agent',
    x: 0.5,
    y: 0.5,
    active: false,
  });

  const inputNodes = stage.inputs.map((inp, i) => ({
    id: `input-${i}`,
    label: inp.label,
    sublabel: inp.value,
  }));
  placeColumn(nodes, 'input', 0.1, inputNodes);
  inputNodes.forEach((n) =>
    edges.push({ from: n.id, to: agentId, label: 'feeds', active: false }),
  );

  const tools: Array<{
    id: string;
    label: string;
    sublabel?: string;
    kind: OntologyNodeKind;
    stepIndex?: number;
  }> = [];
  const svc = awsServiceTool(stage);
  if (svc) {
    tools.push({
      id: 'tool-aws',
      label: svc.title,
      sublabel: svc.detail,
      kind: 'source',
      stepIndex: 0,
    });
  }
  stage.reasoning.forEach((step, i) => {
    tools.push({
      id: `tool-reason-${i}`,
      label: step.text.length > 42 ? `${step.text.slice(0, 40)}…` : step.text,
      sublabel: step.detail,
      kind: 'model',
      stepIndex: i,
    });
  });

  tools.forEach((t, i) => {
    nodes.push({
      id: t.id,
      label: t.label,
      sublabel: t.sublabel,
      kind: t.kind,
      stepIndex: t.stepIndex,
      active: false,
      x: 0.3,
      y: tools.length === 1 ? 0.5 : 0.12 + (i / (tools.length - 1)) * 0.76,
    });
    edges.push({ from: t.id, to: agentId, label: 'invokes', active: false });
  });

  const entityNames = STAGE_ENTITIES[stage.id] ?? ['Agent', 'Orchestrator'];
  const entityNodes = entityNames.map((name, i) => ({
    id: `entity-${i}`,
    label: name,
    sublabel: ENTITY_SYSTEMS[name] ?? 'RCM ontology',
  }));
  placeColumn(nodes, 'entity', 0.72, entityNodes);
  entityNodes.forEach((n) =>
    edges.push({ from: agentId, to: n.id, label: 'grounds', active: false }),
  );

  const outputNodes = stage.outputs.map((out, i) => ({
    id: `output-${i}`,
    label: out.label,
    sublabel: out.value,
  }));
  placeColumn(nodes, 'output', 0.9, outputNodes);
  outputNodes.forEach((n, i) => {
    const entityTarget = entityNodes[Math.min(i, entityNodes.length - 1)];
    if (entityTarget) {
      edges.push({
        from: entityTarget.id,
        to: n.id,
        label: 'produces',
        active: false,
      });
    } else {
      edges.push({ from: agentId, to: n.id, label: 'produces', active: false });
    }
  });

  if (stage.reasoning.length > 0) {
    const stepCount = opts.visibleStepCount || 0;
    nodes.push({
      id: 'reasoning',
      label: 'Reasoning trace',
      sublabel: `${stepCount}/${stage.reasoning.length} steps`,
      kind: 'model',
      active: false,
      x: 0.5,
      y: 0.88,
    });
    edges.push({
      from: agentId,
      to: 'reasoning',
      label: 'explains',
      active: false,
    });
  }

  return annotateActivity({ nodes, edges }, stage, opts);
}
