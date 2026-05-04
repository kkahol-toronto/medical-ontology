'use client';

import { motion } from 'framer-motion';
import { Brain, Loader2, Pill, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import type { StageRunState } from '@/lib/agents/runner';
import type { RcmCase } from '@/lib/types';
import type {
  ComprehendResult,
  ExtractedEntity,
  ExtractedICD10,
  ExtractedRxNorm,
  ExtractedSNOMED,
} from '@/lib/aws/comprehend-medical';
import { cn } from '@/lib/utils';

const CATEGORY_COLOR: Record<string, string> = {
  MEDICAL_CONDITION: 'bg-orange-500/15 text-orange-200 ring-orange-400/30',
  MEDICATION: 'bg-blue-500/15 text-blue-200 ring-blue-400/30',
  TEST_TREATMENT_PROCEDURE: 'bg-violet-500/15 text-violet-200 ring-violet-400/30',
  ANATOMY: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30',
  PROTECTED_HEALTH_INFORMATION:
    'bg-rose-500/15 text-rose-200 ring-rose-400/30',
  BEHAVIORAL_ENVIRONMENTAL_SOCIAL:
    'bg-yellow-500/15 text-yellow-200 ring-yellow-400/30',
  TIME_EXPRESSION: 'bg-white/10 text-white/70 ring-white/20',
};

interface Props {
  case_: RcmCase;
  runState: StageRunState;
}

export function ComprehendMedicalPanel({ case_, runState }: Props) {
  const [result, setResult] = useState<ComprehendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const enabled =
    runState.status === 'done' || runState.status === 'exception';

  async function run() {
    setErr(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/comprehend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: case_.id }),
      });
      const json = (await res.json()) as
        | (ComprehendResult & { ok: true })
        | { ok: false; error: string };
      if (!('ok' in json) || !json.ok) {
        setErr('error' in json ? json.error : 'extraction failed');
      } else {
        setResult(json);
      }
    } catch (e) {
      setErr((e as Error).message ?? 'extraction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard variant="blue" className="space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-blue-200">
            <Brain className="h-3.5 w-3.5" />
            AWS Comprehend Medical · live extraction
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Extract real ICD-10 / RxNorm / SNOMED from the chart
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-white/65">
            Calls <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]">DetectEntitiesV2</code>,
            <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]"> InferICD10CM</code>,
            <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]"> InferRxNorm</code> &
            <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]"> InferSNOMEDCT</code>{' '}
            in <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]">eu-west-1</code> against
            the patient&apos;s clinical narrative.
          </p>
        </div>
        <GlassButton
          variant="blue"
          size="md"
          onClick={run}
          disabled={!enabled || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting…
            </>
          ) : result ? (
            'Re-extract'
          ) : (
            'Run extraction'
          )}
        </GlassButton>
      </div>

      {err && (
        <div className="rounded-lg bg-orange-500/10 p-3 text-xs text-orange-200 ring-1 ring-orange-400/30">
          {err}
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat
              label="Entities"
              value={result.entities.length}
              hint={`${result.charactersScanned.toLocaleString()} chars`}
            />
            <Stat
              label="ICD-10 / RxNorm / SNOMED"
              value={
                result.icd10.length + result.rxnorm.length + result.snomed.length
              }
              hint="ontology hits"
            />
            <Stat label="API calls" value={4} hint="DetectV2 + 3 Infer*" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ConceptList
              icon={<Stethoscope className="h-4 w-4 text-orange-300" />}
              title="ICD-10-CM (Diagnoses)"
              items={result.icd10.slice(0, 8).map(asConceptRow)}
            />
            <ConceptList
              icon={<Pill className="h-4 w-4 text-blue-300" />}
              title="RxNorm (Medications)"
              items={result.rxnorm.slice(0, 8).map(asRxRow)}
            />
            <ConceptList
              icon={<Brain className="h-4 w-4 text-violet-300" />}
              title="SNOMED-CT"
              items={result.snomed.slice(0, 8).map(asSnomedRow)}
            />
            <EntityCloud entities={result.entities.slice(0, 24)} />
          </div>
        </motion.div>
      )}

      {!enabled && !result && (
        <div className="text-xs text-white/55">
          Run the CDI agent first — Comprehend Medical extraction unlocks once
          the agent is ready.
        </div>
      )}
    </GlassCard>
  );
}

interface Row {
  text: string;
  code: string;
  description: string;
  conceptScore: number;
  detectionScore: number;
}

function asConceptRow(e: ExtractedICD10): Row {
  const top = e.concepts[0];
  return {
    text: e.text,
    code: top?.code ?? '—',
    description: top?.description ?? '—',
    conceptScore: top?.score ?? 0,
    detectionScore: e.score,
  };
}
function asRxRow(e: ExtractedRxNorm): Row {
  const top = e.concepts[0];
  return {
    text: e.text,
    code: top?.code ?? '—',
    description: top?.description ?? '—',
    conceptScore: top?.score ?? 0,
    detectionScore: e.score,
  };
}
function asSnomedRow(e: ExtractedSNOMED): Row {
  const top = e.concepts[0];
  return {
    text: e.text,
    code: top?.code ?? '—',
    description: top?.description ?? '—',
    conceptScore: top?.score ?? 0,
    detectionScore: e.score,
  };
}

function ConceptList({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: Row[];
}) {
  return (
    <div className="rounded-xl bg-black/20 p-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
        {icon}
        {title}
        <span className="ml-auto text-white/30">top {items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-white/40">No matches.</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r, i) => (
            <li
              key={`${r.code}-${i}`}
              className="flex items-baseline justify-between gap-2 text-[12px]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-white/90">{r.text}</div>
                <div className="truncate text-[10.5px] text-white/45">
                  {r.description}
                </div>
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                <span className="font-mono text-[11px] font-semibold text-white">
                  {r.code}
                </span>
                <span className="font-mono text-[10px] text-white/45">
                  {Math.round(r.conceptScore * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EntityCloud({ entities }: { entities: ExtractedEntity[] }) {
  return (
    <div className="rounded-xl bg-black/20 p-4 ring-1 ring-white/5">
      <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/55">
        Detected entities · top {entities.length}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entities.map((e, i) => (
          <span
            key={`${e.text}-${i}`}
            title={`${e.category} · ${e.type} · ${(e.score * 100).toFixed(1)}%`}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] ring-1',
              CATEGORY_COLOR[e.category] ?? 'bg-white/10 text-white/80 ring-white/20',
            )}
          >
            {e.text}
            <span className="font-mono text-[9px] opacity-60">
              {(e.score * 100).toFixed(0)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-white">
        {value}
      </div>
      {hint && <div className="text-[10px] text-white/35">{hint}</div>}
    </div>
  );
}
