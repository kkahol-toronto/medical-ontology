import Link from 'next/link';
import { ArrowUpRight, Brain, FileText, ShieldAlert } from 'lucide-react';
import { caseList, rollupKpis } from '@/data/cases';
import { GlassCard } from '@/components/glass/GlassCard';
import { KpiTile } from '@/components/KpiTile';
import { formatCurrency } from '@/lib/utils';

export default function ArDenialsPage() {
  const k = rollupKpis();
  const cases = caseList;
  const denialRows = cases.flatMap((c) =>
    c.denials.map((d) => ({
      ...d,
      caseId: c.id,
      caseTitle: c.title,
      patient: c.patient.name,
      casePayer: c.payer,
    })),
  );
  const overturnedDollars = denialRows.reduce(
    (sum, d) => sum + (d.recovered ?? 0),
    0,
  );

  return (
    <div className="space-y-8 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Customer demo · Revenue Cycle
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">
            AR Follow-up & Denials Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Live view of every claim in the workbook, agent-classified denial
            root cause, current resolution status, and dollars recovered after
            the AI Appeal Agent reworks the case.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2 text-xs text-orange-200 ring-1 ring-orange-400/30">
          <Brain className="h-3.5 w-3.5" />
          Powered by Claude Opus 4.7 + Aetna policy bundles
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Denials touched" value={String(denialRows.length)} accent="orange" />
        <KpiTile label="Overturn rate" value="100%" trend="AI-led appeals" trendDir="up" />
        <KpiTile label="$ recovered" value={formatCurrency(overturnedDollars)} accent="orange" />
        <KpiTile label="Net AR days" value={`${k.avgDaysToPayment.toFixed(1)}d`} trend="all cases" trendDir="down" />
      </div>

      <GlassCard className="p-0">
        <div className="border-b border-white/5 p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Denial inventory
          </div>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Live claim-level denial board
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-white/45">
              <tr>
                <Th>Claim</Th>
                <Th>Patient</Th>
                <Th>Payer</Th>
                <Th>Code</Th>
                <Th>Category</Th>
                <Th className="text-right">Billed</Th>
                <Th>Status</Th>
                <Th className="text-right">Recovered</Th>
                <Th>Open</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {denialRows.map((d, i) => (
                <tr key={`${d.caseId}-${i}`} className="hover:bg-white/[0.02]">
                  <Td>
                    <span className="font-mono text-[12px] text-white/85">
                      {d.claimNumber}
                    </span>
                  </Td>
                  <Td>{d.patient}</Td>
                  <Td>{d.casePayer}</Td>
                  <Td>
                    <span className="font-mono text-[11px] text-orange-200">
                      {d.code}
                    </span>
                  </Td>
                  <Td>{d.category}</Td>
                  <Td className="text-right font-mono text-[12px]">
                    {formatCurrency(d.denied)}
                  </Td>
                  <Td>
                    <StatusPill resolution={d.resolution} />
                  </Td>
                  <Td className="text-right font-mono text-[12px] text-emerald-200">
                    {d.recovered > 0 ? formatCurrency(d.recovered) : '—'}
                  </Td>
                  <Td>
                    <Link
                      href={`/case/${d.caseId}`}
                      className="inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200"
                    >
                      Open <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard variant="orange" className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-orange-200">
            <ShieldAlert className="h-3 w-3" />
            Hero exception
          </div>
          <h3 className="text-lg font-semibold text-white">
            CO-50 / N390 — Aetna oncology medical necessity
          </h3>
          <p className="text-sm text-white/75">
            Mr. Robert A. Chen · Stage IV NSCLC · $42,101.97 denied. Claude Opus
            4.7 + Comprehend Medical classified as documentation gap (not a
            policy denial), then Bedrock drafted the overturn letter citing the
            Aetna Pemetrexed CPB and the UM-MP353 Keytruda precedent.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
            <span className="rounded-md bg-white/10 px-2 py-0.5">
              Outcome: OVERTURNED
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-200 ring-1 ring-emerald-400/30">
              $21,050.99 recovered
            </span>
          </div>
          <Link
            href="/case/oncology"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-orange-300 hover:text-orange-200"
          >
            Walk the hero appeal <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>

        <GlassCard variant="blue" className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-blue-200">
            <FileText className="h-3 w-3" />
            Action queue
          </div>
          <h3 className="text-lg font-semibold text-white">
            Next-best-action workflow
          </h3>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-white/75">
            <li>
              Pull 835 ERA + denial code → classify root cause (clinical vs
              administrative).
            </li>
            <li>Draft appeal letter with payer-policy citations.</li>
            <li>Route human-in-loop reviewer for sign-off.</li>
            <li>
              Submit corrected claim or appeal packet via 837/837i / payer
              portal.
            </li>
            <li>Reconcile remit on overturn, post adjustment.</li>
          </ol>
        </GlassCard>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 ${className ?? ''}`}>{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className ?? ''}`}>{children}</td>;
}

function StatusPill({ resolution }: { resolution: string }) {
  const lower = resolution.toLowerCase();
  let cls =
    'bg-white/10 text-white/70 ring-1 ring-white/15';
  if (lower.includes('overturn'))
    cls = 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30';
  else if (lower.includes('paid'))
    cls = 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/30';
  else if (lower.includes('reversed'))
    cls = 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30';
  return (
    <span
      className={`inline-flex max-w-[260px] items-center rounded-full px-2 py-0.5 text-[11px] ${cls}`}
    >
      {resolution.length > 60 ? `${resolution.slice(0, 60)}…` : resolution}
    </span>
  );
}
