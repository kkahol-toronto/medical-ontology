import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { caseList } from '@/data/cases';
import { GlassCard } from '@/components/glass/GlassCard';
import { KpiTile } from '@/components/KpiTile';
import { formatCurrency } from '@/lib/utils';

export default function FinanceReconPage() {
  const cases = caseList;
  const totals = cases.reduce(
    (acc, c) => {
      acc.billed += c.kpis.totalBilled;
      acc.paid += c.kpis.payerPayment;
      acc.patient += c.kpis.patientBalance;
      acc.allowed += c.adjudication.reduce((s, a) => s + a.allowed, 0);
      acc.adjustments += c.adjudication.reduce(
        (s, a) => s + (a.billed - a.allowed),
        0,
      );
      return acc;
    },
    { billed: 0, allowed: 0, paid: 0, patient: 0, adjustments: 0 },
  );

  const ledger = cases.flatMap((c) =>
    c.adjudication.map((a, i) => ({
      caseId: c.id,
      caseTitle: c.title,
      lineKey: `${c.id}-${i}`,
      ...a,
    })),
  );

  const variances = ledger.filter(
    (l) => Math.abs(l.paid - l.allowed) > 1,
  );
  const matchRate = ledger.length
    ? ((ledger.length - variances.length) / ledger.length) * 100
    : 0;

  return (
    <div className="space-y-8 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Customer demo · Finance
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Reconciliation & Close Process
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Charge → 837 → 835 ERA → posted cash. The reconciliation agent
            matches every line against contracted rates, surfaces variances,
            and routes exceptions to the close-process queue.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {matchRate.toFixed(1)}% line-level match rate
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-5">
        <KpiTile label="Total billed" value={formatCurrency(totals.billed)} />
        <KpiTile label="Contractual adj." value={formatCurrency(totals.adjustments)} accent="orange" />
        <KpiTile label="Payer paid" value={formatCurrency(totals.paid)} accent="blue" />
        <KpiTile label="Patient balance" value={formatCurrency(totals.patient)} />
        <KpiTile label="Variance" value={formatCurrency(Math.abs(totals.allowed - totals.paid))} trend="all reconciled" trendDir="down" />
      </div>

      <GlassCard className="p-0">
        <div className="border-b border-white/5 p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Adjudication ledger
          </div>
          <h2 className="mt-1 text-lg font-semibold text-white">
            835 ERA — line-level reconciliation
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-white/45">
              <tr>
                <Th>Case</Th>
                <Th>HCPCS</Th>
                <Th>Description</Th>
                <Th className="text-right">Billed</Th>
                <Th className="text-right">Allowed</Th>
                <Th className="text-right">Paid</Th>
                <Th className="text-right">Patient</Th>
                <Th>Status</Th>
                <Th>Open</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledger.map((l) => {
                const matched = Math.abs(l.paid - l.allowed) <= 1;
                return (
                  <tr key={l.lineKey} className="hover:bg-white/[0.02]">
                    <Td>
                      <div className="text-[12.5px] text-white/85">
                        {l.caseTitle}
                      </div>
                      <div className="text-[10.5px] uppercase tracking-wider text-white/40">
                        {l.caseId}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-[11.5px] text-orange-200">
                        {l.hcpcs ?? l.line}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-[12px] text-white/85">
                        {l.description}
                      </span>
                    </Td>
                    <Td className="text-right font-mono text-[11.5px]">
                      {formatCurrency(l.billed)}
                    </Td>
                    <Td className="text-right font-mono text-[11.5px]">
                      {formatCurrency(l.allowed)}
                    </Td>
                    <Td className="text-right font-mono text-[11.5px] text-emerald-200">
                      {formatCurrency(l.paid)}
                    </Td>
                    <Td className="text-right font-mono text-[11.5px]">
                      {formatCurrency(l.patientResp ?? 0)}
                    </Td>
                    <Td>
                      <span
                        className={
                          matched
                            ? 'rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10.5px] text-emerald-200 ring-1 ring-emerald-400/30'
                            : 'rounded-full bg-orange-500/20 px-2 py-0.5 text-[10.5px] text-orange-200 ring-1 ring-orange-400/30'
                        }
                      >
                        {matched ? 'Matched' : 'Variance'}
                      </span>
                    </Td>
                    <Td>
                      <Link
                        href={`/case/${l.caseId}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200"
                      >
                        Open <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard variant="blue" className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-blue-200">
            <Wallet className="h-3 w-3" />
            Close process automation
          </div>
          <h3 className="text-lg font-semibold text-white">
            Daily / monthly close pack
          </h3>
          <ul className="space-y-1.5 text-sm text-white/75">
            <li>· Auto-post 835 cash to GL with payer-specific account mapping.</li>
            <li>· Variance threshold check (±$1) — auto-resolve or flag.</li>
            <li>· Contract rate validation against payer fee schedule bundles.</li>
            <li>· Month-end accruals + bad-debt reserve recommendations.</li>
            <li>· SOX-aligned audit log per posting + approver.</li>
          </ul>
        </GlassCard>

        <GlassCard variant="orange" className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-orange-200">
            <CheckCircle2 className="h-3 w-3" />
            Exception queue
          </div>
          <h3 className="text-lg font-semibold text-white">Active exceptions</h3>
          {variances.length === 0 ? (
            <p className="text-sm text-white/75">
              All lines matched within tolerance — close ready.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-white/75">
              {variances.map((l) => (
                <li key={l.lineKey}>
                  {l.caseTitle} · {l.hcpcs ?? l.line} · variance{' '}
                  {formatCurrency(Math.abs(l.paid - l.allowed))}
                </li>
              ))}
            </ul>
          )}
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
