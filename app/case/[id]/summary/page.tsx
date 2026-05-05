import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GlassCard } from '@/components/glass/GlassCard';
import { caseList, getCase } from '@/data/cases';
import type { KeyValueRow, PatientSummary } from '@/lib/types';
import { cn } from '@/lib/utils';

export default async function PatientSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getCase(id);
  if (!c || !c.patientSummary) notFound();
  const ps = c.patientSummary;

  return (
    <div className="space-y-6 pt-2">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/case/${c.id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/45 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {c.shortTitle} agent console
          </Link>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Patient summary · {c.payer}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-white">
            {ps.hero.headline}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/65">
            {ps.hero.subhead}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <KvCard title="Patient demographics" rows={ps.demographics} />
        <KvCard title="Insurance" rows={ps.insurance} />
        <KvCard title="Encounter" rows={ps.encounter} />
        {ps.clinical && (
          <KvCard
            title="Clinical context"
            rows={ps.clinical}
            className="xl:col-span-3"
          />
        )}
      </div>

      <AgentSummary ps={ps} />
      <FinalOutcome ps={ps} />
    </div>
  );
}

function KvCard({
  title,
  rows,
  className,
}: {
  title: string;
  rows: KeyValueRow[];
  className?: string;
}) {
  return (
    <GlassCard className={cn('space-y-3 p-5', className)}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className={cn(
              'flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5',
              r.emphasis &&
                'rounded-md bg-orange-500/10 px-2 ring-1 ring-orange-400/30',
            )}
          >
            <dt className="text-xs uppercase tracking-wider text-white/50">
              {r.label}
            </dt>
            <dd
              className={cn(
                'text-right text-[13px] text-white',
                r.emphasis && 'font-semibold text-orange-100',
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
}

function AgentSummary({ ps }: { ps: PatientSummary }) {
  return (
    <GlassCard className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Agentic RCM summary
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-white/45">
          What every agent did on this encounter
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ps.agentSummary.map((g, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="text-[12px] font-semibold uppercase tracking-wider text-orange-200">
              {g.agent}
            </div>
            <ul className="space-y-1.5 text-[13px] text-white/85">
              {g.bullets.map((b, bi) => (
                <li key={bi} className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-orange-300" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function FinalOutcome({ ps }: { ps: PatientSummary }) {
  return (
    <GlassCard variant="strong" className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Final outcome</h2>
        <span className="text-[10px] uppercase tracking-wider text-emerald-300">
          Encounter complete
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {ps.finalOutcome.map((r, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] p-3',
              r.emphasis && 'border-orange-400/40 bg-orange-500/10',
            )}
          >
            <dt className="text-[10.5px] uppercase tracking-wider text-white/55">
              {r.label}
            </dt>
            <dd
              className={cn(
                'text-base font-semibold text-white',
                r.emphasis && 'text-orange-100',
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
}

export function generateStaticParams() {
  return caseList
    .filter((c) => c.patientSummary)
    .map((c) => ({ id: c.id }));
}
