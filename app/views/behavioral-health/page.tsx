import Link from 'next/link';
import { ArrowUpRight, Brain } from 'lucide-react';
import { behavioralHealthCase } from '@/data/cases/behavioral-health';
import { BehavioralHealthOntologyClient } from '@/components/ontology/BehavioralHealthOntologyClient';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { KpiTile } from '@/components/KpiTile';
import { formatCurrency } from '@/lib/utils';

export default function BehavioralHealthPage() {
  const c = behavioralHealthCase;
  const denial = c.denials[0];

  return (
    <div className="space-y-8 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Customer demo · Behavioral Health RCM
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Acute Inpatient Psychiatry · Knowledge Graph
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Zep-style ontology for Jordan M. Ellis (ENC-BH-2026-0417). Explore
            entities, relationships, and policy grounding for the CO-50 + BH-LOS-06
            denial appeal.
          </p>
        </div>
        <GlassButton variant="primary" asChild>
          <Link href="/case/behavioralHealth?stage=denial">
            Open agent console
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </GlassButton>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Total billed"
          value={formatCurrency(c.kpis.totalBilled)}
          trend={c.encounter.encounterNumber}
          trendDir="neutral"
        />
        <KpiTile
          label="Denied (days 6–8)"
          value={formatCurrency(denial?.denied ?? 0)}
          trend={`${denial?.code ?? 'CO-50'}`}
          trendDir="down"
          accent="orange"
        />
        <KpiTile
          label="Appeal recovered"
          value={formatCurrency(c.kpis.appealRecovered ?? 0)}
          trend="100% overturn"
          trendDir="up"
        />
        <KpiTile
          label="Days to payment"
          value={`${c.kpis.daysToPayment}d`}
          trend={`${c.kpis.appealCycleDays ?? 6}d appeal cycle`}
          trendDir="up"
        />
      </section>

      <BehavioralHealthOntologyClient className="h-[70vh] min-h-[480px]" />

      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
            <Brain className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Scenario quick facts</div>
            <p className="mt-1 text-xs text-white/55">
              {c.patient.name} · {c.payer} · {denial?.code} · Auth UHC-BH-IP-2026-77419
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton variant="ghost" size="sm" asChild>
            <Link href="/views/behavioral-health?node=bh_denial_co50">
              Focus denial node
            </Link>
          </GlassButton>
          <GlassButton variant="ghost" size="sm" asChild>
            <Link href="/views/behavioral-health?node=bh_appeal_2026">
              Focus appeal node
            </Link>
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
