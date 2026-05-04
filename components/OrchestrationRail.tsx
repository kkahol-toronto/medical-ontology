'use client';

import { ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import type { RunnerState } from '@/lib/agents/runner';
import type { RcmCase } from '@/lib/types';

export function OrchestrationRail({
  case_,
  state,
}: {
  case_: RcmCase;
  state: RunnerState;
}) {
  const completed = Object.values(state.stages).filter(
    (s) => s.status === 'done',
  ).length;
  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Orchestration
        </div>
        <div className="mt-2 text-sm text-white/85">
          Agent Router · SLA monitor
        </div>
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">
            Progress
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-500 transition-all duration-500"
                style={{ width: `${(completed / 9) * 100}%` }}
              />
            </div>
            <div className="font-mono text-xs text-white/70">{completed}/9</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
          Exception queue
        </div>
        <div className="mt-3 space-y-2">
          {state.exceptions.length === 0 ? (
            <div className="text-xs text-white/40">No exceptions raised.</div>
          ) : (
            state.exceptions.map((e, i) => (
              <div
                key={i}
                className="rounded-lg bg-orange-500/10 p-2.5 text-xs ring-1 ring-orange-400/30"
              >
                <div className="font-semibold text-orange-200">
                  Stage {e.stage}
                </div>
                <div className="mt-1 text-orange-100/80">{e.reason}</div>
                <div className="mt-1.5 flex items-start gap-1 text-emerald-300/80">
                  <RefreshCw className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{e.resolution}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Audit & compliance
        </div>
        <ul className="mt-3 space-y-1.5 text-xs text-white/65">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            HIPAA — PHI logged & encrypted
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            CMS — claim format validated (837I/P)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            OIG — no exclusion-list matches
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Bedrock prompts cached · Claude Opus 4.7
          </li>
        </ul>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Encounter
        </div>
        <div className="mt-2 space-y-2 text-xs text-white/70">
          <Row label="Patient" value={case_.patient.name} />
          <Row label="MRN" value={case_.patient.mrn} mono />
          <Row label="Encounter" value={case_.encounter.encounterNumber} mono />
          <Row label="Service date" value={case_.encounter.serviceDate} />
          <Row label="Payer" value={case_.payer} />
        </div>
      </GlassCard>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-white/40">{label}</span>
      <span className={mono ? 'font-mono text-white/85' : 'text-white/85'}>
        {value}
      </span>
    </div>
  );
}
