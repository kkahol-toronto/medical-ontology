'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Move, Network, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildCaseOntologyGraph,
  caseOntologySummary,
} from '@/lib/ontology/caseOntologyGraph';
import {
  buildStageOntologyGraph,
  KIND_LABELS,
  type OntologyGraphEdge,
  type OntologyGraphNode,
  type OntologyNodeKind,
  type StageOntologyGraph,
  type StageRunStatus,
} from '@/lib/ontology/stageOntologyGraph';
import type { RcmCase, StageData, StageId } from '@/lib/types';
import { cn } from '@/lib/utils';

type GraphSize = 'compact' | 'full';

type NodeStyle = {
  fill: string;
  stroke: string;
  activeStroke: string;
  text: string;
  subtext: string;
  w: number;
  h: number;
};

type GraphPalette = {
  bgStart: string;
  bgEnd: string;
  edgeActive: string;
  edgeInactive: string;
  edgeLabel: string;
  arrowActive: string;
  arrowInactive: string;
  inactiveOpacity: number;
  badgeActiveText: string;
  badgeInactiveFill: string;
  badgeInactiveText: string;
  nodes: Record<OntologyNodeKind, NodeStyle>;
};

const NODE_DIMS: Record<OntologyNodeKind, { w: number; h: number }> = {
  input: { w: 108, h: 52 },
  tool: { w: 112, h: 52 },
  rule: { w: 112, h: 52 },
  source: { w: 112, h: 52 },
  model: { w: 112, h: 48 },
  agent: { w: 128, h: 58 },
  entity: { w: 104, h: 52 },
  output: { w: 108, h: 52 },
};

const RCM_PALETTE: GraphPalette = {
  bgStart: 'rgba(88,28,135,0.14)',
  bgEnd: 'rgba(255,122,26,0.08)',
  edgeActive: 'rgba(255,122,26,0.7)',
  edgeInactive: 'rgba(255,255,255,0.14)',
  edgeLabel: 'rgba(255,255,255,0.55)',
  arrowActive: 'rgba(255,122,26,0.75)',
  arrowInactive: 'rgba(255,255,255,0.2)',
  inactiveOpacity: 0.42,
  badgeActiveText: '#0b1736',
  badgeInactiveFill: 'rgba(255,255,255,0.1)',
  badgeInactiveText: 'rgba(255,255,255,0.55)',
  nodes: {
    input: {
      fill: 'rgba(59,130,246,0.22)',
      stroke: 'rgba(96,165,250,0.5)',
      activeStroke: '#60a5fa',
      text: '#bfdbfe',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.input,
    },
    tool: {
      fill: 'rgba(139,92,246,0.22)',
      stroke: 'rgba(167,139,250,0.5)',
      activeStroke: '#a78bfa',
      text: '#ddd6fe',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.tool,
    },
    rule: {
      fill: 'rgba(245,158,11,0.22)',
      stroke: 'rgba(251,191,36,0.5)',
      activeStroke: '#fbbf24',
      text: '#fde68a',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.rule,
    },
    source: {
      fill: 'rgba(16,185,129,0.18)',
      stroke: 'rgba(52,211,153,0.5)',
      activeStroke: '#34d399',
      text: '#a7f3d0',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.source,
    },
    model: {
      fill: 'rgba(236,72,153,0.18)',
      stroke: 'rgba(244,114,182,0.5)',
      activeStroke: '#f472b6',
      text: '#fbcfe8',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.model,
    },
    agent: {
      fill: 'rgba(255,122,26,0.28)',
      stroke: 'rgba(255,122,26,0.55)',
      activeStroke: '#ff7a1a',
      text: '#ffedd5',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.agent,
    },
    entity: {
      fill: 'rgba(16,185,129,0.15)',
      stroke: 'rgba(52,211,153,0.45)',
      activeStroke: '#10b981',
      text: '#86efac',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.entity,
    },
    output: {
      fill: 'rgba(255,122,26,0.15)',
      stroke: 'rgba(255,122,26,0.45)',
      activeStroke: '#fb923c',
      text: '#ffedd5',
      subtext: 'rgba(255,255,255,0.55)',
      ...NODE_DIMS.output,
    },
  },
};

const FULL_SCALE = 1.55;

function nodeWidth(
  label: string,
  sublabel: string | undefined,
  base: number,
  full: boolean,
) {
  if (!full) return base;
  const chars = Math.max(label.length, sublabel?.length ?? 0);
  return Math.max(base * FULL_SCALE, 28 + chars * 7.2);
}

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function GraphLegend({
  size,
  activeCount,
  totalCount,
}: {
  size: GraphSize;
  activeCount: number;
  totalCount: number;
}) {
  const text = size === 'full' ? 'text-xs' : 'text-[9px]';
  return (
    <div className={`flex flex-wrap items-center gap-3 ${text}`}>
      <span className="text-white/50">
        <span className="font-semibold text-orange-300">{activeCount}</span>/
        {totalCount} active
      </span>
      {(
        ['input', 'tool', 'rule', 'agent', 'entity', 'output'] as OntologyNodeKind[]
      ).map((k) => (
        <span key={k} className="flex items-center gap-1.5 text-white/60">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: RCM_PALETTE.nodes[k].activeStroke }}
          />
          {KIND_LABELS[k]}
        </span>
      ))}
    </div>
  );
}

function InteractiveOntologyGraph({
  graph,
  width,
  height,
  size,
  svgId,
  graphKey,
}: {
  graph: StageOntologyGraph;
  width: number;
  height: number;
  size: GraphSize;
  svgId: string;
  graphKey: string;
}) {
  const { nodes, edges } = graph;
  const palette = RCM_PALETTE;
  const full = size === 'full';
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(
    null,
  );
  const labelSize = full ? 13 : 10;
  const subSize = full ? 11 : 8;
  const badgeSize = full ? 9 : 7;

  const defaultPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) {
      map[n.id] = { x: n.x * width, y: n.y * height };
    }
    return map;
  }, [nodes, width, height]);

  const [positions, setPositions] = useState(defaultPositions);

  useEffect(() => {
    setPositions(defaultPositions);
  }, [graphKey, defaultPositions]);

  const nodeMap = useMemo(
    () =>
      Object.fromEntries(
        nodes.map((n) => [
          n.id,
          {
            ...n,
            px: positions[n.id]?.x ?? n.x * width,
            py: positions[n.id]?.y ?? n.y * height,
          },
        ]),
      ),
    [nodes, positions, width, height],
  );

  const clientToSvg = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * width,
        y: ((clientY - rect.top) / rect.height) * height,
      };
    },
    [width, height],
  );

  const onPointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const pt = clientToSvg(e.clientX, e.clientY);
    const pos = positions[id] ?? { x: 0, y: 0 };
    dragRef.current = { id, offsetX: pt.x - pos.x, offsetY: pt.y - pos.y };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const pt = clientToSvg(e.clientX, e.clientY);
    const { id, offsetX, offsetY } = dragRef.current;
    setPositions((prev) => ({
      ...prev,
      [id]: {
        x: Math.max(40, Math.min(width - 40, pt.x - offsetX)),
        y: Math.max(30, Math.min(height - 30, pt.y - offsetY)),
      },
    }));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full touch-none select-none"
      role="img"
      aria-label="Interactive ontology knowledge graph"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <defs>
        <linearGradient id={`${svgId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bgStart} />
          <stop offset="100%" stopColor={palette.bgEnd} />
        </linearGradient>
        <filter id={`${svgId}-glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id={`${svgId}-arrow`}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={palette.arrowActive} />
        </marker>
        <marker
          id={`${svgId}-arrow-dim`}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={palette.arrowInactive} />
        </marker>
      </defs>
      <rect width={width} height={height} fill={`url(#${svgId}-bg)`} rx="12" />

      {edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const d = edgePath(from.px, from.py, to.px, to.py);
        const midX = (from.px + to.px) / 2;
        const midY = (from.py + to.py) / 2;
        return (
          <g key={`${edge.from}-${edge.to}-${i}`} opacity={edge.active ? 1 : 0.45}>
            <path
              d={d}
              fill="none"
              stroke={edge.active ? palette.edgeActive : palette.edgeInactive}
              strokeWidth={edge.active ? (full ? 2.5 : 2) : 1.25}
              strokeDasharray={edge.active ? 'none' : '4 4'}
              markerEnd={
                edge.active
                  ? `url(#${svgId}-arrow)`
                  : `url(#${svgId}-arrow-dim)`
              }
            />
            {edge.label && edge.active && (
              <text
                x={midX}
                y={midY - 8}
                textAnchor="middle"
                fill={palette.edgeLabel}
                fontSize={full ? 11 : 9}
                fontWeight={600}
                className="uppercase tracking-wide"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {nodes.map((node) => {
        const style = palette.nodes[node.kind];
        const w = nodeWidth(node.label, node.sublabel, style.w, full);
        const h = full ? style.h * FULL_SCALE : style.h;
        const cx = positions[node.id]?.x ?? node.x * width;
        const cy = positions[node.id]?.y ?? node.y * height;
        const label = full
          ? node.label
          : node.label.length > 16
            ? `${node.label.slice(0, 14)}…`
            : node.label;
        const sub = node.sublabel
          ? full
            ? node.sublabel
            : node.sublabel.length > 22
              ? `${node.sublabel.slice(0, 20)}…`
              : node.sublabel
          : undefined;
        const stroke = node.active ? style.activeStroke : style.stroke;

        return (
          <g
            key={node.id}
            opacity={node.active ? 1 : palette.inactiveOpacity}
            filter={node.active ? `url(#${svgId}-glow)` : undefined}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => onPointerDown(node.id, e)}
          >
            <rect
              x={cx - w / 2}
              y={cy - h / 2}
              width={w}
              height={h}
              rx="10"
              fill={style.fill}
              stroke={stroke}
              strokeWidth={node.active ? (full ? 2.5 : 2) : 1.25}
            />
            <rect
              x={cx - w / 2 + 6}
              y={cy - h / 2 + 5}
              width={KIND_LABELS[node.kind].length * (full ? 6.2 : 5.2) + 10}
              height={full ? 14 : 11}
              rx="4"
              fill={
                node.active ? style.activeStroke : palette.badgeInactiveFill
              }
            />
            <text
              x={cx - w / 2 + 11}
              y={cy - h / 2 + (full ? 14 : 12)}
              fill={
                node.active ? palette.badgeActiveText : palette.badgeInactiveText
              }
              fontSize={badgeSize}
              fontWeight={700}
              className="uppercase tracking-wide"
            >
              {KIND_LABELS[node.kind]}
            </text>
            <text
              x={cx}
              y={cy - (sub ? (full ? 4 : 2) : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={style.text}
              fontSize={labelSize}
              fontWeight={600}
            >
              {label}
            </text>
            {sub && (
              <text
                x={cx}
                y={cy + (full ? 16 : 13)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={style.subtext}
                fontSize={subSize}
              >
                {sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function NodeRoster({
  nodes,
  edges,
}: {
  nodes: OntologyGraphNode[];
  edges: OntologyGraphEdge[];
}) {
  const grouped = useMemo(() => {
    const order: OntologyNodeKind[] = [
      'input',
      'tool',
      'rule',
      'source',
      'model',
      'agent',
      'entity',
      'output',
    ];
    const map = new Map<OntologyNodeKind, OntologyGraphNode[]>();
    for (const n of nodes) {
      const list = map.get(n.kind) ?? [];
      list.push(n);
      map.set(n.kind, list);
    }
    return order
      .filter((k) => map.has(k))
      .map((k) => ({ kind: k, items: map.get(k)! }));
  }, [nodes]);

  return (
    <div className="space-y-4 overflow-y-auto pr-1 text-sm">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
          Active connections
        </div>
        <ul className="mt-2 space-y-1.5 text-xs">
          {edges
            .filter((e) => e.active)
            .map((e, i) => (
              <li
                key={i}
                className="rounded-lg bg-orange-500/10 px-2.5 py-1.5 text-white/80 ring-1 ring-orange-400/20"
              >
                <span className="font-medium text-orange-300">
                  {e.label ?? 'links'}
                </span>
                {' · '}
                {nodes.find((n) => n.id === e.from)?.label ?? e.from}
                {' → '}
                {nodes.find((n) => n.id === e.to)?.label ?? e.to}
              </li>
            ))}
          {edges.filter((e) => e.active).length === 0 && (
            <li className="text-white/40">Run the stage to light up connections.</li>
          )}
        </ul>
      </div>
      {grouped.map(({ kind, items }) => (
        <div key={kind}>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: RCM_PALETTE.nodes[kind].activeStroke }}
            />
            {KIND_LABELS[kind]}
          </div>
          <ul className="mt-2 space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'rounded-lg border px-3 py-2 transition',
                  n.active
                    ? 'border-orange-400/30 bg-orange-500/10 ring-1 ring-orange-400/25'
                    : 'border-white/10 bg-white/[0.03] text-white/55',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{n.label}</span>
                  {n.active && (
                    <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-orange-200">
                      active
                    </span>
                  )}
                </div>
                {n.sublabel && (
                  <div className="mt-0.5 text-xs text-white/45">{n.sublabel}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function OntologyGraphBody({
  graph,
  size,
  hint,
}: {
  graph: StageOntologyGraph;
  size: GraphSize;
  hint?: string;
}) {
  const svgId = useId().replace(/:/g, '');
  const dims = size === 'full' ? { w: 980, h: 520 } : { w: 520, h: 260 };
  const activeCount = graph.nodes.filter((n) => n.active).length;
  const graphKey = `${graph.nodes.length}-${activeCount}-${size}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {size === 'full' && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Move className="h-3.5 w-3.5 text-orange-400" />
          {hint ??
            'Drag any block to rearrange · orange = active for current progress'}
        </div>
      )}
      <div
        className={
          size === 'full'
            ? 'grid min-h-[420px] gap-6 lg:grid-cols-[1fr_280px]'
            : 'min-h-0 flex-1'
        }
      >
        <div className="min-h-0 rounded-xl ring-1 ring-orange-400/15">
          <InteractiveOntologyGraph
            graph={graph}
            width={dims.w}
            height={dims.h}
            size={size}
            svgId={svgId}
            graphKey={graphKey}
          />
        </div>
        {size === 'full' && <NodeRoster nodes={graph.nodes} edges={graph.edges} />}
      </div>
      <GraphLegend
        size={size}
        activeCount={activeCount}
        totalCount={graph.nodes.length}
      />
    </div>
  );
}

export function ReasoningOntologyOverlay({
  graph,
}: {
  graph: StageOntologyGraph;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-xl bg-[#0b1736]/92 p-3 ring-1 ring-orange-400/30 backdrop-blur-md"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-300">
        <Network className="h-3.5 w-3.5" />
        Ontology preview
      </div>
      <OntologyGraphBody graph={graph} size="compact" />
    </motion.div>
  );
}

function OntologyModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ontology-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0b1736]/80 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close ontology graph"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-orange-400/25 bg-[#0b1736] shadow-2xl ring-1 ring-violet-500/20"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                  <Network className="h-4 w-4" />
                  Knowledge graph
                </div>
                <h2
                  id="ontology-modal-title"
                  className="mt-1 text-xl font-semibold text-white"
                >
                  {title}
                </h2>
                <p className="mt-1 text-sm text-white/55">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function StageOntologyModal({
  open,
  onClose,
  stage,
  visibleStepCount,
  runStatus,
  isDone,
}: {
  open: boolean;
  onClose: () => void;
  stage: StageData;
  visibleStepCount: number;
  runStatus: StageRunStatus;
  isDone: boolean;
}) {
  const graph = buildStageOntologyGraph(stage, {
    visibleStepCount,
    runStatus,
    isDone,
  });

  return (
    <OntologyModalShell
      open={open}
      onClose={onClose}
      title={stage.name}
      subtitle={`${stage.agentName} · Stage subgraph · Zep-style RCM ontology`}
    >
      <OntologyGraphBody graph={graph} size="full" />
      {stage.reasoning.length > 0 && (
        <footer className="shrink-0 border-t border-white/10 px-0 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
            Reasoning steps
          </div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stage.reasoning.map((step, i) => (
              <li
                key={i}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs transition',
                  i < visibleStepCount
                    ? 'bg-orange-500/10 text-white ring-1 ring-orange-400/25'
                    : 'bg-white/[0.04] text-white/50',
                )}
              >
                <div>{step.text}</div>
                {step.detail && (
                  <div className="mt-1 text-white/45">{step.detail}</div>
                )}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </OntologyModalShell>
  );
}

export function CaseOntologyModal({
  open,
  onClose,
  case_,
  highlightStage,
}: {
  open: boolean;
  onClose: () => void;
  case_: RcmCase;
  highlightStage?: StageId;
}) {
  const graph = buildCaseOntologyGraph(case_, { highlightStage });
  const summary = caseOntologySummary(case_);

  return (
    <OntologyModalShell
      open={open}
      onClose={onClose}
      title={summary.label}
      subtitle={`${summary.encounterId} · ${summary.entityCount} entities · ${summary.stageCount} stages · ${summary.description}`}
    >
      <OntologyGraphBody
        graph={graph}
        size="full"
        hint="Full encounter knowledge graph — 9 agent stages + grounded RCM entities"
      />
    </OntologyModalShell>
  );
}

export function OntologyLinkButton({
  onClick,
  compact,
  label = 'Ontology',
}: {
  onClick: () => void;
  compact?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 font-medium text-violet-300 transition hover:text-orange-300 hover:underline',
        compact ? 'text-[10px]' : 'text-xs',
      )}
    >
      <Network className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </button>
  );
}
