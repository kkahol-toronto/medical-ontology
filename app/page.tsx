import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CaseCard } from '@/components/CaseCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { KpiTile } from '@/components/KpiTile';
import { SwimLane } from '@/components/SwimLane';
import { caseList, rollupKpis } from '@/data/cases';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function HomePage() {
  const k = rollupKpis();
  return (
    <div className="space-y-12 pt-6">
      <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            AI led RCM operating model
          </div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-6xl">
            <span className="text-gradient-mix">Neurostack</span> enabled
            <br />
            Agentic Revenue Cycle
            <br />
            Management.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/70 lg:text-lg">
            Nine specialised agents executing eligibility through collections
            on top of your EHR. Powered by Neurostack Medical and the
            Neurostack Intelligent Retrieval Agent — <span className="font-semibold text-white">NIRA</span> — to talk to your data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GlassButton variant="primary" size="lg" asChild>
              <Link href="/case/oncology">
                Start with the oncology hero case
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassButton>
            <GlassButton variant="glass" size="lg" asChild>
              <Link href="/views/ar-denials">Jump to AR / Denials</Link>
            </GlassButton>
          </div>
        </div>

        <GlassCard variant="strong" className="space-y-5 p-7">
          <div className="text-xs uppercase tracking-[0.18em] text-white/50">
            Live AI stack
          </div>
          <div className="space-y-3">
            <StackRow
              brand="Neurostack"
              name="Neurostack Medical"
              detail="Reasoning · ICD-10 · RxNorm · SNOMED"
              status="Online"
            />
            <StackRow
              brand="Neurostack"
              name="NIRA"
              detail="Neurostack Intelligent Retrieval Agent · voice + text"
              status="Ready"
            />
          </div>
          <div className="rounded-xl bg-white/[0.04] p-4 text-xs text-white/60 leading-relaxed">
            Tap the orange orb at the bottom-right anywhere in the app to
            talk to <span className="font-semibold text-white">NIRA</span> and
            ask questions about any sample case.
          </div>
        </GlassCard>
      </section>

      <SwimLane />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Total billed (4 cases)"
          value={formatCurrency(k.totalBilled, { compact: true })}
          trend="ENC-ONC + ENC-INP + ENC-ASC + ENC-BH"
          trendDir="neutral"
        />
        <KpiTile
          label="Clean claim rate"
          value={formatPercent(k.cleanClaimRate)}
          trend="+12.6 pts vs baseline"
          trendDir="up"
        />
        <KpiTile
          label="Avg days to payment"
          value={`${k.avgDaysToPayment.toFixed(0)}d`}
          trend="−18 days vs baseline"
          trendDir="up"
        />
        <KpiTile
          label="Denial overturn rate"
          value={formatPercent(k.denialOverturnRate)}
          trend="4 of 4 denials overturned"
          trendDir="up"
          accent="orange"
        />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-white">
            Walk a sample encounter end-to-end
          </h2>
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            Pick a case
          </span>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {caseList.map((c, i) => (
            <CaseCard key={c.id} case={c} index={i} />
          ))}
        </div>
      </section>

      <section className="text-center text-xs uppercase tracking-[0.18em] text-white/30">
        Bidirectional FHIR R4 · HL7 · SMART on FHIR · Audit-trailed HIPAA / OIG / CMS
      </section>
    </div>
  );
}

function StackRow({
  brand,
  name,
  detail,
  status,
}: {
  brand: 'AWS' | 'Azure' | 'Neurostack';
  name: string;
  detail: string;
  status: string;
}) {
  const badge =
    brand === 'AWS'
      ? 'bg-orange-500/20 text-orange-300'
      : brand === 'Azure'
        ? 'bg-blue-500/20 text-blue-300'
        : 'bg-gradient-to-br from-orange-500/30 to-blue-500/30 text-white';
  const label = brand === 'Neurostack' ? 'NS' : brand;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${badge}`}
        >
          {label}
        </span>
        <div>
          <div className="text-sm font-medium text-white">{name}</div>
          <div className="text-xs text-white/50">{detail}</div>
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153_/_0.7)]" />
        {status}
      </span>
    </div>
  );
}
