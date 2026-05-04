'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RcmCase } from '@/lib/types';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn, formatCurrency } from '@/lib/utils';

interface Props {
  cases: RcmCase[];
}

export function CodingExplorer({ cases }: Props) {
  const [activeId, setActiveId] = useState<string>(cases[0]?.id ?? '');
  const active = cases.find((c) => c.id === activeId) ?? cases[0];
  if (!active) return null;
  const charges = active.charges;

  return (
    <GlassCard className="space-y-5 p-0">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 px-2 pt-2">
        {cases.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveId(c.id)}
            className={cn(
              'rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors',
              activeId === c.id
                ? 'bg-white/[0.06] text-white ring-1 ring-white/10'
                : 'text-white/55 hover:text-white',
            )}
          >
            {c.shortTitle}
          </button>
        ))}
      </div>

      <div className="space-y-6 p-6">
        <header>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            {active.encounter.encounterType} · {active.encounter.serviceDate} ·{' '}
            {active.payer}
          </div>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {active.patient.name} · MRN {active.patient.mrn}
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-white/65">
            {active.encounter.facility}
            {active.encounter.attending ? ` · ${active.encounter.attending}` : ''}
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <section>
            <SectionHeader title="ICD-10 diagnoses" />
            <ul className="space-y-1.5">
              {active.diagnoses.map((d) => (
                <li
                  key={`${d.code}-${d.seq}`}
                  className="flex items-baseline gap-3 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/5"
                >
                  <span className="font-mono text-sm font-semibold text-orange-200">
                    {d.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-white/85">
                      {d.description}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-wider text-white/40">
                      {d.type}
                      {d.poa ? ` · POA ${d.poa}` : ''}
                      {d.hcc ? ` · HCC ${d.hcc}` : ''}
                    </div>
                  </div>
                  {d.cdiFlag && (
                    <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] uppercase text-orange-200 ring-1 ring-orange-400/30">
                      CDI flag
                    </span>
                  )}
                  {typeof d.aiConfidence === 'number' && (
                    <span className="font-mono text-[10px] text-white/45">
                      {(d.aiConfidence * 100).toFixed(0)}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeader title="CPT / HCPCS procedures" />
            <ul className="space-y-1.5">
              {active.procedures.map((p) => (
                <li
                  key={`${p.code}-${p.seq}`}
                  className="flex items-baseline gap-3 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/5"
                >
                  <span className="font-mono text-sm font-semibold text-blue-200">
                    {p.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-white/85">
                      {p.description}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-wider text-white/40">
                      qty {p.units ?? 1}
                      {p.modifier ? ` · mod ${p.modifier}` : ''}
                    </div>
                  </div>
                  {typeof p.charge === 'number' && (
                    <span className="font-mono text-[11px] text-white/60">
                      {formatCurrency(p.charge)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <SectionHeader title="Charge lines" />
          <div className="overflow-x-auto rounded-xl bg-black/20 ring-1 ring-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-3 py-2">Line</th>
                  <th className="px-3 py-2">HCPCS</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Unit</th>
                  <th className="px-3 py-2 text-right">Units</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">Rev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {charges.map((c, i) => (
                  <tr key={`${c.line}-${i}`} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-mono text-[11px] text-white/55">
                      {c.line}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11.5px] text-orange-200">
                      {c.hcpcs ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-[12.5px] text-white/85">
                      {c.description}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11.5px]">
                      {typeof c.unitCharge === 'number'
                        ? formatCurrency(c.unitCharge)
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11.5px]">
                      {c.units ?? 1}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11.5px] text-white">
                      {formatCurrency(c.totalCharge)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-white/55">
                      {c.revCode ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-blue-500/10 p-4 text-xs text-blue-100 ring-1 ring-blue-400/30"
        >
          Tip: open the case console to run a live AWS Comprehend Medical
          extraction over this chart and see the entities, ICD-10, RxNorm and
          SNOMED concepts overlaid in real time.
        </motion.div>
      </div>
    </GlassCard>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
      {title}
    </div>
  );
}
