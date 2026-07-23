'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Focus, Layers, Network, Search } from 'lucide-react';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import { OntologyNodeDetailPanel } from '@/components/ontology/OntologyNodeDetailPanel';
import type { BhOntologyNode, ForceGraphLink, ForceGraphNode } from '@/lib/ontology/bh-ontology-types';
import {
  getEgoSubgraph,
  getNeighborIds,
  isLinkInEgo,
  searchNodes,
  toForceGraphData,
} from '@/lib/ontology/bh-ontology-loader';
import { enrichNodeSummary } from '@/lib/ontology/bh-summary-enricher';
import { cn } from '@/lib/utils';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type RenderMode = 'canvas' | 'svg';

interface Props {
  className?: string;
  initialNodeId?: string;
}

export function ZepOntologyExplorer({ className, initialNodeId }: Props) {
  const searchParams = useSearchParams();
  const deepLinkNode = searchParams.get('node') ?? initialNodeId ?? null;

  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkNode);
  const [renderMode, setRenderMode] = useState<RenderMode>('canvas');
  const [focusNeighborhood, setFocusNeighborhood] = useState(true);
  const [search, setSearch] = useState('');
  const [demoLabel, setDemoLabel] = useState<string | null>(null);

  const { nodes: rawNodes, links: allLinks } = useMemo(() => toForceGraphData(), []);
  const nodeById = useMemo(
    () => new Map(rawNodes.map((n) => [n.id, n])),
    [rawNodes],
  );

  const highlightIds = useMemo(() => {
    if (!selectedId) return null;
    return getNeighborIds(selectedId, 1);
  }, [selectedId]);

  /** Focus mode: render capped 1-hop ego network so hub nodes stay readable. */
  const { graphNodes, graphLinks, isFocused, focusTruncated, focusTotalNeighbors } =
    useMemo(() => {
      if (selectedId && focusNeighborhood) {
        const ego = getEgoSubgraph(selectedId, 1, 36);
        return {
          graphNodes: ego.nodes.map((n) => ({
            ...n,
            isSelected: n.id === selectedId,
            isNeighbor: n.id !== selectedId,
          })),
          graphLinks: ego.links,
          isFocused: true,
          focusTruncated: ego.truncated,
          focusTotalNeighbors: ego.totalNeighbors,
        };
      }

      return {
        graphNodes: rawNodes.map((n) => {
          const active = !highlightIds || highlightIds.has(n.id);
          return {
            ...n,
            isSelected: n.id === selectedId,
            isNeighbor: highlightIds ? highlightIds.has(n.id) && n.id !== selectedId : false,
            dimmed: !active,
          };
        }),
        graphLinks: allLinks,
        isFocused: false,
        focusTruncated: false,
        focusTotalNeighbors: 0,
      };
    }, [selectedId, focusNeighborhood, rawNodes, allLinks, highlightIds]);

  const focusSizeScale = useMemo(() => {
    if (!isFocused) return 1;
    const n = graphNodes.length;
    if (n <= 8) return 1;
    if (n <= 16) return 0.72;
    if (n <= 24) return 0.55;
    return 0.42;
  }, [isFocused, graphNodes.length]);

  const showNeighborLabels = isFocused && graphNodes.length <= 12;

  const selectedNode: BhOntologyNode | null = selectedId
    ? (nodeById.get(selectedId) ?? null)
    : null;

  const displayNode =
    selectedNode && demoLabel
      ? { ...selectedNode, label: demoLabel }
      : selectedNode;

  const focusCamera = useCallback(
    (nodeId: string, coords?: { x?: number; y?: number }) => {
      window.setTimeout(() => {
        const g = graphRef.current;
        if (!g) return;
        if (focusNeighborhood) {
          const pad = graphNodes.length > 20 ? 110 : 80;
          g.zoomToFit(500, pad);
          return;
        }
        if (coords?.x != null && coords?.y != null) {
          g.centerAt(coords.x, coords.y, 500);
          g.zoom(3, 500);
        }
      }, focusNeighborhood ? 400 : 100);
    },
    [focusNeighborhood, graphNodes.length],
  );

  useEffect(() => {
    if (!deepLinkNode) return;
    setSelectedId(deepLinkNode);
  }, [deepLinkNode]);

  useEffect(() => {
    if (!selectedId) return;
    focusCamera(selectedId);
  }, [selectedId, focusNeighborhood, graphNodes.length, focusCamera]);

  useEffect(() => {
    const g = graphRef.current;
    if (!g || !isFocused) return;
    const charge = g.d3Force('charge');
    if (charge && typeof charge.strength === 'function') {
      charge.strength(-60 - graphNodes.length * 4);
    }
    const link = g.d3Force('link');
    if (link && typeof link.distance === 'function') {
      link.distance(Math.min(150, 36 + graphNodes.length * 2.8));
    }
    g.d3ReheatSimulation();
  }, [isFocused, graphNodes.length, graphLinks.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width: Math.max(320, width), height: Math.max(400, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => {
      setSelectedId(node.id);
      setDemoLabel(null);
      focusCamera(node.id, { x: node.x, y: node.y });
    },
    [focusCamera],
  );

  const searchResults = useMemo(() => searchNodes(search, 8), [search]);

  const neighborCount = selectedId
    ? focusTruncated
      ? focusTotalNeighbors
      : Math.max(0, (highlightIds?.size ?? 1) - 1)
    : 0;

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-2xl border border-white/10 bg-[#060d1a]/80',
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Network className="h-4 w-4 text-orange-400" />
              {isFocused
                ? `${graphNodes.length} focused · ${graphLinks.length} edges`
                : `${rawNodes.length} nodes · ${allLinks.length} edges`}
            </span>
            {selectedId && (
              <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-xs text-orange-200">
                {focusTruncated
                  ? `Showing ${graphNodes.length - 1} of ${neighborCount} connections`
                  : `${neighborCount} connected entit${neighborCount === 1 ? 'y' : 'ies'}`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFocusNeighborhood((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] uppercase tracking-wider transition-colors',
                focusNeighborhood
                  ? 'border-orange-400/40 bg-orange-500/15 text-orange-200'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
              )}
            >
              <Focus className="h-3 w-3" />
              Focus neighborhood
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes…"
                className="h-8 w-44 rounded-lg border border-white/10 bg-white/5 pl-8 pr-2 text-xs text-white placeholder:text-white/30 focus:border-orange-400/50 focus:outline-none"
              />
              {searchResults.length > 0 && search.trim() && (
                <ul className="absolute right-0 top-full z-20 mt-1 max-h-48 w-64 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1224] py-1 shadow-xl">
                  {searchResults.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                        onClick={() => {
                          setSelectedId(n.id);
                          setSearch('');
                          focusCamera(n.id);
                        }}
                      >
                        <span className="text-white/90">{n.label}</span>
                        <span className="ml-2 text-white/40">{n.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex rounded-lg border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setRenderMode('svg')}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider',
                  renderMode === 'svg' ? 'bg-white/15 text-white' : 'text-white/45',
                )}
              >
                Editor (SVG)
              </button>
              <button
                type="button"
                onClick={() => setRenderMode('canvas')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider',
                  renderMode === 'canvas' ? 'bg-white/15 text-white' : 'text-white/45',
                )}
              >
                <Layers className="h-3 w-3" />
                Canvas LOD
              </button>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative min-h-[420px] flex-1 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,26,0.04),transparent_55%)]"
        >
          {renderMode === 'canvas' ? (
            <ForceGraph2D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={{ nodes: graphNodes, links: graphLinks }}
              nodeId="id"
              linkSource="source"
              linkTarget="target"
              backgroundColor="rgba(0,0,0,0)"
              nodeRelSize={isFocused ? Math.max(2, 6 * focusSizeScale) : 2.5}
              nodeVal={(n) => {
                const node = n as ForceGraphNode & {
                  isSelected?: boolean;
                  isNeighbor?: boolean;
                  dimmed?: boolean;
                };
                if (node.isSelected) return 14 * focusSizeScale;
                if (node.isNeighbor) return 9 * focusSizeScale;
                if (node.dimmed) return 1;
                return 3;
              }}
              nodeColor={(n) => {
                const node = n as ForceGraphNode & {
                  isSelected?: boolean;
                  isNeighbor?: boolean;
                  dimmed?: boolean;
                };
                const base = node.color ?? '#94a3b8';
                if (node.isSelected) return base;
                if (node.isNeighbor) return base;
                if (node.dimmed) return 'rgba(148,163,184,0.15)';
                return base;
              }}
              nodeLabel={(n) => {
                const node = n as ForceGraphNode;
                const summary = enrichNodeSummary(node);
                const preview =
                  summary.length > 220 ? `${summary.slice(0, 218)}…` : summary;
                return `${node.label}\n[${node.category}]\n\n${preview}`;
              }}
              linkColor={(link) => {
                const l = link as ForceGraphLink & {
                  source: string | { id?: string };
                  target: string | { id?: string };
                };
                if (isFocused) return 'rgba(255,122,26,0.75)';
                if (!highlightIds) return 'rgba(255,255,255,0.08)';
                return isLinkInEgo(l, highlightIds)
                  ? 'rgba(255,122,26,0.9)'
                  : 'rgba(255,255,255,0.03)';
              }}
              linkWidth={(link) => {
                const l = link as ForceGraphLink & {
                  source: string | { id?: string };
                  target: string | { id?: string };
                };
                if (isFocused) return 2.5;
                if (!highlightIds) return 0.4;
                return isLinkInEgo(l, highlightIds) ? 2.2 : 0.15;
              }}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkDirectionalParticles={isFocused ? 2 : 0}
              linkDirectionalParticleWidth={2}
              onNodeClick={(n) => handleNodeClick(n as ForceGraphNode)}
              onBackgroundClick={() => {
                setSelectedId(null);
                setDemoLabel(null);
              }}
              cooldownTicks={isFocused ? 60 : 100}
              d3AlphaDecay={0.05}
              d3VelocityDecay={0.4}
              warmupTicks={isFocused ? 20 : 30}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as ForceGraphNode & {
                  isSelected?: boolean;
                  isNeighbor?: boolean;
                  x?: number;
                  y?: number;
                };
                if (!n.isSelected && (!n.isNeighbor || !showNeighborLabels)) return;
                if (globalScale < 0.8 && !n.isSelected) return;
                const label = n.label.length > 28 ? `${n.label.slice(0, 26)}…` : n.label;
                const fontSize = n.isSelected ? 12 / globalScale : 10 / globalScale;
                ctx.font = `${n.isSelected ? '600' : '500'} ${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = n.isSelected
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.72)';
                ctx.fillText(label, n.x ?? 0, (n.y ?? 0) + 8 / globalScale);
              }}
              nodeCanvasObjectMode={(node) => {
                const n = node as ForceGraphNode & {
                  isSelected?: boolean;
                  isNeighbor?: boolean;
                };
                if (n.isSelected) return 'after';
                if (n.isNeighbor && showNeighborLabels) return 'after';
                return undefined;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/50">
              <div>
                <Network className="mx-auto mb-3 h-10 w-10 text-white/20" />
                SVG editor view — switch to Canvas LOD for interactive force graph.
                {selectedNode && (
                  <p className="mt-4 text-white/70">
                    Selected:{' '}
                    <span className="font-mono text-orange-300">{selectedNode.id}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {displayNode && (
        <OntologyNodeDetailPanel
          node={displayNode}
          onClose={() => {
            setSelectedId(null);
            setDemoLabel(null);
          }}
          onRelationClick={(targetId) => {
            setSelectedId(targetId);
            setDemoLabel(null);
            focusCamera(targetId);
          }}
          demoRename={(label) => setDemoLabel(`${label} (demo)`)}
        />
      )}
    </div>
  );
}
