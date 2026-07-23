import graphData from '@/data/ontology/behavioral-health.json';
import type {
  BhCategory,
  BhOntologyEdge,
  BhOntologyGraph,
  BhOntologyNode,
  ForceGraphLink,
  ForceGraphNode,
} from './bh-ontology-types';
import { BH_CATEGORY_COLORS } from './bh-ontology-types';

const graph = graphData as BhOntologyGraph;

export function getBhOntologyGraph(): BhOntologyGraph {
  return graph;
}

export function indexBhNodes(): Map<string, BhOntologyNode> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

export function indexBhEdges(): BhOntologyEdge[] {
  return graph.edges;
}

export function getNeighborIds(nodeId: string, hops = 1): Set<string> {
  const neighbors = new Set<string>([nodeId]);
  let frontier = new Set<string>([nodeId]);
  for (let h = 0; h < hops; h++) {
    const next = new Set<string>();
    for (const e of graph.edges) {
      if (frontier.has(e.source)) {
        neighbors.add(e.target);
        next.add(e.target);
      }
      if (frontier.has(e.target)) {
        neighbors.add(e.source);
        next.add(e.source);
      }
    }
    frontier = next;
  }
  return neighbors;
}

const RELATION_PRIORITY: Record<string, number> = {
  HAS_ENCOUNTER: 1,
  HAS_DIAGNOSIS: 1,
  HAS_SECTION: 1,
  HAS_CLAUSE: 1,
  DENIED_BY: 1,
  APPEALED_WITH: 1,
  SUBMITTED_AS: 1,
  GENERATED_BY: 1,
  RESULTED_IN: 1,
  AUTHORIZED_BY: 1,
  TREATED_AT: 1,
  ATTENDED_BY: 1,
  HAS_CHARGE_LINE: 1,
  INCLUDES: 1,
  ASSERTS: 1,
  SUPPORTS_LOC: 1,
  GROUNDED_BY: 1,
  PUBLISHES: 2,
  APPLIED: 2,
  DOCUMENTED_IN: 2,
  PROCESSED_BY: 2,
  CITES_EVIDENCE: 3,
  CITES_POLICY: 3,
  CITED_IN: 4,
  RELATED_TO: 5,
  ASSOCIATED_WITH: 5,
  DERIVED_FROM: 5,
};

function relationPriority(relation: string): number {
  return RELATION_PRIORITY[relation] ?? 3;
}

export function getEgoSubgraph(
  nodeId: string,
  hops = 1,
  maxNodes = 36,
): {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
  totalNeighbors: number;
  truncated: boolean;
} {
  const egoIds = getNeighborIds(nodeId, hops);
  const totalNeighbors = egoIds.size - 1;

  let includedIds = egoIds;
  let truncated = false;

  if (egoIds.size > maxNodes) {
    truncated = true;
    const edgeList = graph.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId,
    );
    const ranked = edgeList
      .map((e) => {
        const other = e.source === nodeId ? e.target : e.source;
        return { id: other, priority: relationPriority(e.relation), relation: e.relation };
      })
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

    includedIds = new Set<string>([nodeId]);
    for (const r of ranked) {
      if (includedIds.size >= maxNodes) break;
      includedIds.add(r.id);
    }
  }

  const nodes = graph.nodes
    .filter((n) => includedIds.has(n.id))
    .map((n) => ({
      ...n,
      color: BH_CATEGORY_COLORS[n.category] ?? '#94a3b8',
    }));
  const links = graph.edges
    .filter((e) => includedIds.has(e.source) && includedIds.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      relation: e.relation,
    }));

  return { nodes, links, totalNeighbors, truncated };
}

function linkEndpointId(endpoint: string | { id?: string }): string {
  return typeof endpoint === 'object' ? String(endpoint.id ?? '') : String(endpoint);
}

export function isLinkInEgo(
  link: { source: string | { id?: string }; target: string | { id?: string } },
  egoIds: Set<string>,
): boolean {
  const s = linkEndpointId(link.source);
  const t = linkEndpointId(link.target);
  return egoIds.has(s) && egoIds.has(t);
}

export function getNodeRelations(nodeId: string): Array<{
  relation: string;
  targetId: string;
  targetLabel: string;
  targetCategory: BhCategory;
  direction: 'out' | 'in';
}> {
  const byId = indexBhNodes();
  const out: Array<{
    relation: string;
    targetId: string;
    targetLabel: string;
    targetCategory: BhCategory;
    direction: 'out' | 'in';
  }> = [];

  for (const e of graph.edges) {
    if (e.source === nodeId) {
      const t = byId.get(e.target);
      if (t) {
        out.push({
          relation: e.relation,
          targetId: t.id,
          targetLabel: t.label,
          targetCategory: t.category,
          direction: 'out',
        });
      }
    }
    if (e.target === nodeId) {
      const t = byId.get(e.source);
      if (t) {
        out.push({
          relation: e.relation,
          targetId: t.id,
          targetLabel: t.label,
          targetCategory: t.category,
          direction: 'in',
        });
      }
    }
  }
  return out;
}

export function toForceGraphData(): {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
} {
  const nodes: ForceGraphNode[] = graph.nodes.map((n) => ({
    ...n,
    color: BH_CATEGORY_COLORS[n.category] ?? '#94a3b8',
  }));
  const links: ForceGraphLink[] = graph.edges.map((e) => ({
    source: e.source,
    target: e.target,
    relation: e.relation,
  }));
  return { nodes, links };
}

export function searchNodes(query: string, limit = 20): BhOntologyNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return graph.nodes
    .filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.label.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
