import { STAGE_ORDER, STAGE_TITLE } from '@/data/cases';
import { CASE_ENTITIES, ENTITY_SYSTEMS } from '@/lib/ontology/rcm-config';
import type {
  OntologyGraphEdge,
  OntologyGraphNode,
  StageOntologyGraph,
} from '@/lib/ontology/stageOntologyGraph';
import type { RcmCase, StageId } from '@/lib/types';

/** Full encounter knowledge graph — 9 stages + case root entities. */
export function buildCaseOntologyGraph(
  case_: RcmCase,
  opts?: { highlightStage?: StageId },
): StageOntologyGraph {
  const nodes: OntologyGraphNode[] = [];
  const edges: OntologyGraphEdge[] = [];
  const meta = CASE_ENTITIES[case_.id];
  const highlight = opts?.highlightStage;

  nodes.push({
    id: 'encounter-root',
    label: case_.encounter.encounterNumber,
    sublabel: `${case_.patient.name} · ${case_.payer}`,
    kind: 'agent',
    x: 0.5,
    y: 0.12,
    active: true,
  });

  const stageCount = STAGE_ORDER.length;
  STAGE_ORDER.forEach((stageId, i) => {
    const stage = case_.stages[stageId];
    const x = stageCount === 1 ? 0.5 : 0.06 + (i / (stageCount - 1)) * 0.88;
    const id = `stage-${stageId}`;
    const isHighlight = highlight === stageId;
    nodes.push({
      id,
      label: STAGE_TITLE[stageId],
      sublabel: stage.agentName,
      kind: isHighlight ? 'tool' : 'output',
      x,
      y: 0.48,
      active: isHighlight || !highlight,
    });
    edges.push({
      from: 'encounter-root',
      to: id,
      label: 'orchestrates',
      active: true,
    });
    if (i > 0) {
      const prevId = `stage-${STAGE_ORDER[i - 1]}`;
      edges.push({
        from: prevId,
        to: id,
        label: 'next',
        active: true,
      });
    }
  });

  const entities = meta.entities;
  entities.forEach((name, i) => {
    const count = entities.length;
    const y = count === 1 ? 0.82 : 0.68 + (i / (count - 1)) * 0.22;
    const x = 0.15 + (i % 3) * 0.32;
    const id = `case-entity-${i}`;
    nodes.push({
      id,
      label: name,
      sublabel: ENTITY_SYSTEMS[name] ?? 'RCM ontology',
      kind: 'entity',
      x,
      y,
      active: true,
    });
    const anchorStage =
      name === 'Denial' || name === 'Appeal'
        ? 'stage-denial'
        : name === 'PriorAuth'
          ? 'stage-priorAuth'
          : name === 'DRG' || name === 'MCC'
            ? 'stage-coding'
            : name === 'Payment' || name === 'ERA'
              ? 'stage-payment'
              : 'encounter-root';
    edges.push({
      from: anchorStage,
      to: id,
      label: 'grounds',
      active: true,
    });
  });

  return { nodes, edges };
}

export function caseOntologySummary(case_: RcmCase) {
  const meta = CASE_ENTITIES[case_.id];
  return {
    label: meta.label,
    description: meta.description,
    entityCount: meta.entities.length,
    stageCount: STAGE_ORDER.length,
    encounterId: case_.encounter.encounterNumber,
    patientMrn: case_.patient.mrn,
  };
}
