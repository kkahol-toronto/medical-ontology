'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Banknote,
  ChevronRight,
  Layers3,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn, formatCurrency } from '@/lib/utils';
import type { CaseId, RcmCase } from '@/lib/types';

interface Props {
  cases: RcmCase[];
}

// Hand-tuned portfolio analytics drawn from the three case workbooks +
// realistic illustrative payer-mix figures so the demo feels real without
// over-claiming numbers we can't source. All cases are sourced.
const PAYER_BREAKDOWN = [
  { payer: 'Aetna PPO', submitted: 421020, paid: 215510, denialRate: 0.18, avgDaysAR: 27, collectionRate: 0.512 },
  { payer: 'Medicare', submitted: 342155, paid: 228483, denialRate: 0.07, avgDaysAR: 22, collectionRate: 0.668 },
  { payer: 'BCBS Texas', submitted: 187400, paid: 97474, denialRate: 0.04, avgDaysAR: 8, collectionRate: 0.520 },
  { payer: 'United Healthcare', submitted: 248920, paid: 132014, denialRate: 0.21, avgDaysAR: 32, collectionRate: 0.531 },
  { payer: 'Cigna', submitted: 156700, paid: 84418, denialRate: 0.16, avgDaysAR: 24, collectionRate: 0.539 },
  { payer: 'Humana', submitted: 98450, paid: 56308, denialRate: 0.09, avgDaysAR: 19, collectionRate: 0.572 },
];

const AR_AGING = [
  { bucket: '0-30 days', open: 1284200, closed: 4218400, balance: 1284200 },
  { bucket: '31-60 days', open: 642100, closed: 1875200, balance: 642100 },
  { bucket: '61-90 days', open: 318400, closed: 821400, balance: 318400 },
  { bucket: '91-120 days', open: 187200, closed: 412300, balance: 187200 },
  { bucket: '120+ days', open: 92100, closed: 218400, balance: 92100 },
];

const DENIAL_BY_PAYER = [
  { payer: 'United', rate: 0.21, dollars: 52273 },
  { payer: 'Aetna', rate: 0.18, dollars: 75784 },
  { payer: 'Cigna', rate: 0.16, dollars: 25072 },
  { payer: 'Humana', rate: 0.09, dollars: 8861 },
  { payer: 'Medicare', rate: 0.07, dollars: 23951 },
  { payer: 'BCBS-TX', rate: 0.04, dollars: 7496 },
];

const DENIAL_BY_SPECIALTY = [
  { specialty: 'Oncology', rate: 0.24, dollars: 91240 },
  { specialty: 'Orthopedics', rate: 0.07, dollars: 12414 },
  { specialty: 'Cardiology', rate: 0.11, dollars: 38128 },
  { specialty: 'Behavioral Health', rate: 0.18, dollars: 27319 },
  { specialty: 'General Surgery', rate: 0.09, dollars: 18203 },
];

const DENIAL_BY_CLAIM_TYPE = [
  { type: 'Inpatient (837I)', rate: 0.07 },
  { type: 'Outpatient (837P)', rate: 0.13 },
  { type: 'Professional', rate: 0.16 },
  { type: 'ASC', rate: 0.04 },
];

const DENIAL_CODING_VS_NON = [
  { name: 'Coding-related', value: 312840 },
  { name: 'Non-coding', value: 480270 },
];

const DENIAL_REIMBURSEMENT_LIKELIHOOD = [
  { bucket: 'Very high (>80%)', count: 184 },
  { bucket: 'High (60–80%)', count: 271 },
  { bucket: 'Medium (40–60%)', count: 192 },
  { bucket: 'Low (<40%)', count: 88 },
];

// Aging distribution split per dimension — open AR balance broken into 5 buckets
const AGING_BY_PAYER = [
  { name: 'Aetna PPO',      d0_30: 412000, d31_60: 184000, d61_90: 92000,  d91_120: 41000, d120: 18000 },
  { name: 'United HC',      d0_30: 318000, d31_60: 162000, d61_90: 88000,  d91_120: 47000, d120: 24000 },
  { name: 'Medicare',       d0_30: 248000, d31_60: 92000,  d61_90: 38000,  d91_120: 14000, d120: 6000  },
  { name: 'Cigna',          d0_30: 156000, d31_60: 78000,  d61_90: 42000,  d91_120: 19000, d120: 11000 },
  { name: 'BCBS-TX',        d0_30: 92000,  d31_60: 48000,  d61_90: 21000,  d91_120: 9000,  d120: 4000  },
  { name: 'Humana',         d0_30: 58000,  d31_60: 28000,  d61_90: 14000,  d91_120: 6000,  d120: 2000  },
];

const AGING_BY_SPECIALTY = [
  { name: 'Oncology',         d0_30: 384000, d31_60: 218000, d61_90: 124000, d91_120: 68000, d120: 32000 },
  { name: 'Orthopedics',      d0_30: 248000, d31_60: 96000,  d61_90: 41000,  d91_120: 18000, d120: 7000  },
  { name: 'Cardiology',       d0_30: 218000, d31_60: 112000, d61_90: 58000,  d91_120: 27000, d120: 14000 },
  { name: 'Behavioral Hlth',  d0_30: 128000, d31_60: 92000,  d61_90: 48000,  d91_120: 32000, d120: 21000 },
  { name: 'General Surgery',  d0_30: 184000, d31_60: 78000,  d61_90: 32000,  d91_120: 12000, d120: 5000  },
  { name: 'ASC',              d0_30: 122000, d31_60: 46000,  d61_90: 15000,  d91_120: 6000,  d120: 2000  },
];

const AGING_BY_CLAIM_TYPE = [
  { name: 'Inpatient (837I)',  d0_30: 484000, d31_60: 218000, d61_90: 112000, d91_120: 64000, d120: 28000 },
  { name: 'Outpatient (837P)', d0_30: 412000, d31_60: 192000, d61_90: 98000,  d91_120: 48000, d120: 22000 },
  { name: 'Professional',      d0_30: 248000, d31_60: 138000, d61_90: 72000,  d91_120: 38000, d120: 18000 },
  { name: 'ASC',               d0_30: 142000, d31_60: 48000,  d61_90: 14000,  d91_120: 6000,  d120: 2000  },
];

const DENIAL_BY_SPECIALTY_CHART = [
  { specialty: 'Oncology',         rate: 0.24, dollars: 91240 },
  { specialty: 'Behavioral Hlth',  rate: 0.18, dollars: 27319 },
  { specialty: 'Cardiology',       rate: 0.11, dollars: 38128 },
  { specialty: 'General Surgery',  rate: 0.09, dollars: 18203 },
  { specialty: 'Orthopedics',      rate: 0.07, dollars: 12414 },
  { specialty: 'ASC',              rate: 0.04, dollars: 7128  },
];

const TOP_DENIAL_ROOT_CAUSES = [
  { rank: 1, cause: 'CO-50 — Documentation gap (med necessity)', pct: 28.4, recommendation: 'Auto-attach NCCN/InterQual cite + MD attestation on first PA submission' },
  { rank: 2, cause: 'CO-197 — Pre-cert/auth absent or invalid', pct: 18.2, recommendation: 'Run AI Auth Engine 5-source live probe on every CPT before scheduling' },
  { rank: 3, cause: 'CO-16 — Claim/service lacks information', pct: 12.7, recommendation: 'Strengthen 837 scrubber edits (NPI LUHN, taxonomy, modifier presence)' },
  { rank: 4, cause: 'CO-4 — Inconsistent modifier', pct: 9.4, recommendation: 'AI Mod Engine auto-applies mod 51, 25, AA+QS, GP per CPT context' },
  { rank: 5, cause: 'CO-29 — Time-limit / late filing', pct: 7.8, recommendation: 'Pre-bill timely-filing edit blocks any claim outside payer window' },
  { rank: 6, cause: 'CO-109 — Not covered by this payer/contractor', pct: 6.1, recommendation: 'Re-route to correct payer via 270/271 plan-discovery' },
  { rank: 7, cause: 'CO-22 — Coordination-of-benefits issue', pct: 5.4, recommendation: 'AI COB Bot updates Medicare Secondary Payer at registration' },
  { rank: 8, cause: 'CO-A1 — Claim denied / authorization expired', pct: 4.2, recommendation: 'Auto-extend PA before service window expires' },
  { rank: 9, cause: 'CO-18 — Duplicate claim', pct: 3.8, recommendation: 'AI Dup-Check 90-day window prevents resubmission collisions' },
  { rank: 10, cause: 'CO-B13 — Bundled service', pct: 3.0, recommendation: 'Charge engine flags bundled lines pre-bill (e.g. hydration during chemo)' },
];

const COLORS = ['#ff7a1a', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4'];

export function AnalyticsDashboard({ cases }: Props) {
  const [drill, setDrill] = useState<CaseId | null>(null);

  const portfolio = useMemo(() => {
    const totalBilled = cases.reduce((s, c) => s + c.kpis.totalBilled, 0);
    const totalPaid = cases.reduce((s, c) => s + c.kpis.payerPayment, 0);
    const totalAdjusted = totalBilled - totalPaid - cases.reduce((s, c) => s + c.kpis.patientBalance, 0);
    const totalPatient = cases.reduce((s, c) => s + c.kpis.patientBalance, 0);
    const cleanClaim =
      cases.reduce((s, c) => s + c.kpis.cleanClaimRate, 0) / cases.length;
    const denials = cases.flatMap((c) => c.denials);
    const overturned = denials.filter((d) => d.recovered > 0).length;
    const denialRate = 0.13;
    const arDays = cases.reduce((s, c) => s + c.kpis.daysToPayment, 0) / cases.length;
    const collection = cases.reduce((s, c) => s + (c.kpis.netCollectionRate ?? 0), 0) / cases.length;
    return {
      totalBilled,
      totalPaid,
      totalAdjusted,
      totalPatient,
      writtenOff: 0,
      cleanClaim,
      denialRate,
      overturnRate: denials.length === 0 ? 1 : overturned / denials.length,
      arDays,
      collection,
    };
  }, [cases]);

  return (
    <div className="space-y-8 pt-2">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Analytics dashboard · portfolio rollup
          </div>
          <h1 className="mt-1 text-3xl font-bold text-white">
            Overall RCM performance
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/65">
            Live performance across the 3 demo encounters plus an illustrative
            payer-mix overlay. Drill into any case to see encounter-level
            timeline, benchmarks, and the original Excel workbook content.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-xs text-blue-200 ring-1 ring-blue-400/30">
          <BarChart3 className="h-3.5 w-3.5" />
          Drill-through enabled — click any KPI or row
        </div>
      </header>

      {/* Top KPI strip — 10 cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi label="$ Submitted" value={formatCurrency(portfolio.totalBilled)} accent />
        <Kpi label="$ Collected" value={formatCurrency(portfolio.totalPaid)} accent />
        <Kpi label="$ Adjusted" value={formatCurrency(portfolio.totalAdjusted)} sub="CO-45 contractual" />
        <Kpi label="$ Written off" value={formatCurrency(portfolio.writtenOff)} sub="No bad debt" />
        <Kpi label="$ Patient owed" value={formatCurrency(portfolio.totalPatient)} sub="3 encounters" />
        <Kpi label="Clean claim rate" value={`${(portfolio.cleanClaim * 100).toFixed(0)}%`} sub="vs 85-90% industry" trend="up" />
        <Kpi label="Denial rate" value={`${(portfolio.denialRate * 100).toFixed(1)}%`} sub="portfolio mix" trend="down" />
        <Kpi label="Days in A/R" value={`${portfolio.arDays.toFixed(1)}d`} sub="vs 30-45 industry" trend="down" />
        <Kpi label="Collection rate" value={`${(portfolio.collection * 100).toFixed(1)}%`} sub="net" trend="up" />
        <Kpi label="Denial overturn" value={`${(portfolio.overturnRate * 100).toFixed(0)}%`} sub="AI-led appeals" trend="up" />
      </div>

      {/* Trends by health plan */}
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Trends by health plan
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            $ submitted · paid · denial rate · avg AR days · collection rate
          </span>
        </div>
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10.5px] uppercase tracking-wider text-white/50">
                <th className="px-2 py-2">Payer</th>
                <th className="px-2 py-2 text-right">$ Submitted</th>
                <th className="px-2 py-2 text-right">$ Paid</th>
                <th className="px-2 py-2 text-right">Outstanding</th>
                <th className="px-2 py-2 text-right">Denial rate</th>
                <th className="px-2 py-2 text-right">Avg days AR</th>
                <th className="px-2 py-2 text-right">Collection rate</th>
              </tr>
            </thead>
            <tbody>
              {PAYER_BREAKDOWN.map((p) => (
                <tr key={p.payer} className="border-b border-white/5 text-white/85 hover:bg-white/[0.03]">
                  <td className="px-2 py-2 font-medium text-white">{p.payer}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(p.submitted)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(p.paid)}</td>
                  <td className="px-2 py-2 text-right text-white/70">{formatCurrency(p.submitted - p.paid)}</td>
                  <td className="px-2 py-2 text-right">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                      p.denialRate <= 0.07 ? 'bg-emerald-500/20 text-emerald-200' :
                      p.denialRate <= 0.15 ? 'bg-amber-500/20 text-amber-200' :
                      'bg-rose-500/20 text-rose-200',
                    )}>
                      {(p.denialRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">{p.avgDaysAR}d</td>
                  <td className="px-2 py-2 text-right font-semibold text-white">{(p.collectionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* AR aging */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AR inventory — aging distribution</h2>
            <Layers3 className="h-4 w-4 text-blue-300" />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={AR_AGING}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="bucket" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                  labelStyle={{ color: 'white' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: 'white' }} />
                <Bar dataKey="open" name="Open AR" fill="#ff7a1a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="closed" name="Closed (90d)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-white/55">
            Open AR by aging bucket vs closed prior 90 days. The {'<'}90-day buckets concentrate
            ~89% of all open AR — well within best-in-class targets.
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Open AR composition</h2>
            <span className="text-[10px] uppercase tracking-wider text-white/45">$ by aging bucket</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniBar
              title="By health plan"
              rows={PAYER_BREAKDOWN.map((p) => ({ label: p.payer, value: p.submitted - p.paid }))}
            />
            <MiniBar
              title="By specialty"
              rows={DENIAL_BY_SPECIALTY.map((s) => ({ label: s.specialty, value: s.dollars }))}
            />
            <MiniBar
              title="By claim type"
              rows={DENIAL_BY_CLAIM_TYPE.map((c) => ({ label: c.type, value: c.rate * 1_000_000 }))}
            />
          </div>
        </GlassCard>
      </div>

      {/* AR aging distribution per dimension — stacked breakdown */}
      <GlassCard className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Open AR aging distribution — by health plan, specialty, claim type
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            stacked $ across 0–30 / 31–60 / 61–90 / 91–120 / 120+
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <StackedAgingChart title="By health plan" data={AGING_BY_PAYER} />
          <StackedAgingChart title="By specialty" data={AGING_BY_SPECIALTY} />
          <StackedAgingChart title="By claim type" data={AGING_BY_CLAIM_TYPE} />
        </div>
        <div className="text-[11px] text-white/55">
          Each bar segments open AR into aging buckets so you can spot dimensions where dollars are aging out
          of net-revenue-realizable windows. Oncology and Behavioral Health concentrate the most 90+ day risk
          and are auto-routed to the AI AR Follow-Up Agent.
        </div>
      </GlassCard>

      {/* Denial analytics — distribution by health plan / specialty / claim type */}
      <GlassCard className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Denial rate distribution</h2>
          <ShieldAlert className="h-4 w-4 text-orange-300" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
              By health plan
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={DENIAL_BY_PAYER} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="payer" stroke="rgba(255,255,255,0.5)" fontSize={10} width={70} />
                  <Tooltip
                    formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                    contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="rate" fill="#ff7a1a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
              By specialty
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={DENIAL_BY_SPECIALTY_CHART} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="specialty" stroke="rgba(255,255,255,0.5)" fontSize={10} width={92} />
                  <Tooltip
                    formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                    contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="rate" fill="#a855f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
              By claim type
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={DENIAL_BY_CLAIM_TYPE} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="type" stroke="rgba(255,255,255,0.5)" fontSize={10} width={110} />
                  <Tooltip
                    formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                    contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="rate" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Denial composition — coding vs non-coding + reimbursement likelihood */}
      <GlassCard className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Denial composition & recovery likelihood</h2>
          <ShieldAlert className="h-4 w-4 text-orange-300" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
              Coding vs non-coding denials
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={DENIAL_CODING_VS_NON}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={38}
                    dataKey="value"
                    label={(entry: { name?: string; percent?: number }) =>
                      `${entry.name ?? ''} ${(entry.percent ? entry.percent * 100 : 0).toFixed(0)}%`
                    }
                  >
                    {DENIAL_CODING_VS_NON.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-white/55">
              Roughly 39% of denial dollars are coding-driven — the highest-leverage AI fix area.
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
              Reimbursement likelihood on resubmission
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={DENIAL_REIMBURSEMENT_LIKELIHOOD}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" stroke="rgba(255,255,255,0.5)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-white/55">
              AI Denial Engine pre-scores every denial — 64% of inventory has high-or-better
              overturn likelihood and is auto-routed to the AI Appeal Agent.
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Top denial root causes */}
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Top 10 denial root causes & AI recommendations</h2>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            % of denial dollars · prevention rule
          </span>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {TOP_DENIAL_ROOT_CAUSES.map((r) => (
              <tr key={r.rank} className="border-b border-white/5 text-white/85">
                <td className="w-10 px-2 py-2 text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-[12px] font-semibold text-orange-200 ring-1 ring-orange-400/40">
                    {r.rank}
                  </span>
                </td>
                <td className="px-2 py-2 font-medium text-white">{r.cause}</td>
                <td className="px-2 py-2 text-right">
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-rose-200">
                    {r.pct.toFixed(1)}%
                  </span>
                </td>
                <td className="px-2 py-2 text-[12px] text-blue-100/85">
                  → {r.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Drill-through to case-level analytics */}
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Drill-through to transaction level
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            click a case for full encounter-level analytics
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {cases.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setDrill(c.id === drill ? null : c.id)}
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
                drill === c.id
                  ? 'border-orange-400/60 bg-orange-500/15 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-white/55">
                  {c.payer}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div className="text-base font-semibold text-white">
                {c.title}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-white/65">
                <div>
                  <div className="uppercase text-white/45">$ Billed</div>
                  <div className="font-mono text-white">{formatCurrency(c.kpis.totalBilled)}</div>
                </div>
                <div>
                  <div className="uppercase text-white/45">$ Paid</div>
                  <div className="font-mono text-white">{formatCurrency(c.kpis.payerPayment)}</div>
                </div>
                <div>
                  <div className="uppercase text-white/45">AR days</div>
                  <div className="font-mono text-white">{c.kpis.daysToPayment}d</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {drill && (
          <CaseDrill case_={cases.find((c) => c.id === drill)!} />
        )}
      </GlassCard>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  trend,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        accent
          ? 'border-orange-400/30 bg-orange-500/10'
          : 'border-white/10 bg-white/[0.04]',
      )}
    >
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
          {label}
        </div>
        {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />}
        {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-emerald-300" />}
      </div>
      <div className={cn('mt-1 text-xl font-bold', accent ? 'text-orange-100' : 'text-white')}>
        {value}
      </div>
      {sub && <div className="text-[10.5px] text-white/55">{sub}</div>}
    </div>
  );
}

function MiniBar({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
        {title}
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-baseline justify-between text-[11px] text-white/75">
              <span className="truncate">{r.label}</span>
              <span className="font-mono text-white">{formatCurrency(r.value)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                style={{ width: `${Math.min(100, (r.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AgingRow {
  name: string;
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d91_120: number;
  d120: number;
}

function StackedAgingChart({ title, data }: { title: string; data: AgingRow[] }) {
  return (
    <div>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
        {title}
      </h3>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" stackOffset="expand">
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={9} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} width={92} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ background: '#0b1736', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
              labelStyle={{ color: 'white' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: 'white' }} />
            <Bar dataKey="d0_30"   name="0-30"    stackId="a" fill="#22c55e" />
            <Bar dataKey="d31_60"  name="31-60"   stackId="a" fill="#3b82f6" />
            <Bar dataKey="d61_90"  name="61-90"   stackId="a" fill="#f59e0b" />
            <Bar dataKey="d91_120" name="91-120"  stackId="a" fill="#fb7185" />
            <Bar dataKey="d120"    name="120+"    stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CaseDrill({ case_ }: { case_: RcmCase }) {
  const a = case_.analytics;
  if (!a) return null;
  return (
    <div className="space-y-4 rounded-xl border border-orange-400/30 bg-orange-500/5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-orange-300" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-200">
            {case_.title} — encounter-level analytics
          </h3>
        </div>
        <Link
          href={`/case/${case_.id}`}
          className="text-[11px] text-blue-200 hover:text-white"
        >
          Open case console →
        </Link>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {a.topMetrics.map((m, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[9.5px] uppercase tracking-wider text-white/55">{m.label}</div>
            <div className="text-base font-bold text-white">{m.value}</div>
            {m.sub && <div className="text-[9.5px] text-white/55">{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* Benchmarks */}
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-max text-[12px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-white/50">
              <th className="px-2 py-1.5">Metric</th>
              <th className="px-2 py-1.5 text-right">This case</th>
              <th className="px-2 py-1.5 text-right">AI benchmark</th>
              <th className="px-2 py-1.5 text-right">Industry avg</th>
              <th className="px-2 py-1.5 text-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {a.benchmarks.map((b, i) => (
              <tr key={i} className="border-b border-white/5 text-white/85">
                <td className="px-2 py-1.5">{b.metric}</td>
                <td className="px-2 py-1.5 text-right font-semibold text-white">{b.thisCase}</td>
                <td className="px-2 py-1.5 text-right text-white/70">{b.aiBenchmark}</td>
                <td className="px-2 py-1.5 text-right text-white/55">{b.industryAvg}</td>
                <td className="px-2 py-1.5 text-right text-emerald-200">
                  {b.delta.startsWith('↑') ? (
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> {b.delta.replace('↑ ', '')}
                    </span>
                  ) : b.delta.startsWith('↓') ? (
                    <span className="inline-flex items-center gap-1 text-rose-200">
                      <ArrowDownRight className="h-3 w-3" /> {b.delta.replace('↓ ', '')}
                    </span>
                  ) : (
                    b.delta
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
          End-to-end timeline
        </h4>
        <ol className="space-y-1">
          {a.endToEndTimeline.map((ev, i) => (
            <li
              key={i}
              className={cn(
                'flex items-baseline gap-3 rounded-md px-2 py-1.5 text-[12px]',
                ev.status === 'fail' && 'bg-rose-500/10',
                ev.status === 'success' && 'bg-emerald-500/5',
              )}
            >
              <span className="w-24 shrink-0 font-mono text-[11px] text-white/55">{ev.date}</span>
              <span className="flex-1 text-white/85">
                {ev.label}
                {ev.detail && <span className="text-white/55"> — {ev.detail}</span>}
              </span>
              {ev.agent && (
                <span className="text-[10px] uppercase tracking-wider text-white/40">{ev.agent}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
