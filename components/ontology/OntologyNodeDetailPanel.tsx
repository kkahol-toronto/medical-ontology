'use client';

import { Pencil, Tag, X } from 'lucide-react';
import type { BhOntologyNode } from '@/lib/ontology/bh-ontology-types';
import { BH_CATEGORY_COLORS } from '@/lib/ontology/bh-ontology-types';
import { getNodeRelations } from '@/lib/ontology/bh-ontology-loader';
import { enrichNodeSummary } from '@/lib/ontology/bh-summary-enricher';
import { cn } from '@/lib/utils';

interface Props {
  node: BhOntologyNode;
  onClose: () => void;
  onRelationClick?: (targetId: string) => void;
  demoRename?: (label: string) => void;
}

export function OntologyNodeDetailPanel({ node, onClose, onRelationClick, demoRename }: Props) {
  const relations = getNodeRelations(node.id);
  const color = BH_CATEGORY_COLORS[node.category] ?? '#94a3b8';
  const summary = enrichNodeSummary(node);

  return (
    <aside className="flex h-full w-[min(100%,440px)] shrink-0 flex-col border-l border-white/10 bg-[#0a1224]/95 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
        <div className="min-w-0">
          <span className="inline-flex rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            Node
          </span>
          <h2 className="mt-2 text-lg font-semibold leading-snug text-white">{node.label}</h2>
          <p className="mt-1 font-mono text-[11px] text-white/40">{node.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={() => demoRename?.(node.label)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          <Pencil className="h-3 w-3" />
          Rename
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          <Tag className="h-3 w-3" />
          Change category
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-white/45">Type</div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-base text-white">{node.type}</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/50">
              {node.category}
            </span>
          </div>
        </section>

        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-white/45">Summary</div>
          <p className="mt-3 text-[15px] leading-7 text-white/88">{summary}</p>
        </section>

        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-white/45">Attributes</div>
          <dl className="mt-3 space-y-2.5">
            {Object.entries(node.attributes).length === 0 ? (
              <dd className="text-sm text-white/40">—</dd>
            ) : (
              Object.entries(node.attributes).map(([key, val]) => (
                <div key={key} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                  <dt className="font-mono text-white/50">{key}</dt>
                  <dd className="text-right text-white/85">{val === null ? 'null' : String(val)}</dd>
                </div>
              ))
            )}
          </dl>
        </section>

        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-white/45">Relations</div>
          <ul className="mt-3 space-y-2">
            {relations.length === 0 ? (
              <li className="text-sm text-white/40">No relations</li>
            ) : (
              relations.map((r) => (
                <li key={`${r.relation}-${r.targetId}-${r.direction}`}>
                  <button
                    type="button"
                    onClick={() => onRelationClick?.(r.targetId)}
                    className={cn(
                      'w-full rounded-lg bg-white/[0.04] px-3 py-2 text-left transition-colors',
                      onRelationClick && 'hover:bg-orange-500/10 hover:ring-1 hover:ring-orange-400/30',
                    )}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wide text-orange-300/90">
                      {r.relation}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              BH_CATEGORY_COLORS[r.targetCategory] ?? '#94a3b8',
                          }}
                        />
                        <span className="truncate text-[15px] text-white/90">{r.targetLabel}</span>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider',
                          'bg-white/10 text-white/45',
                        )}
                      >
                        {r.targetCategory}
                      </span>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-white/45">UUID</div>
          <p className="mt-2 break-all font-mono text-xs text-white/40">{node.uuid}</p>
        </section>
      </div>
    </aside>
  );
}
