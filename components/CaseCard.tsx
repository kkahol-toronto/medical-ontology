'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import type { RcmCase } from '@/lib/types';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

export function CaseCard({ case: c, index = 0 }: { case: RcmCase; index?: number }) {
  const accent: 'orange' | 'blue' = c.hero ? 'orange' : 'blue';

  const headlineNumber = c.kpis.appealRecovered
    ? formatCurrency(c.kpis.appealRecovered)
    : formatCurrency(c.kpis.payerPayment);
  const headlineLabel = c.kpis.appealRecovered ? 'Appeal recovered' : 'Payer payment';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
    >
      <Link href={`/case/${c.id}`} className="block">
        <GlassCard
          variant={accent}
          interactive
          glow={accent}
          className={cn('h-full p-6 group', c.hero && 'ring-1 ring-orange-400/30')}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/60">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              {c.shortTitle}
            </span>
            {c.hero && (
              <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-200">
                <Sparkles className="h-3 w-3" />
                Hero
              </span>
            )}
          </div>

          <div className="mt-3 text-xl font-semibold leading-tight text-white">
            {c.title}
          </div>
          <div className="mt-1 text-sm text-white/60">
            {c.patient.name} · {c.patient.age} · {c.encounter.cancerStage ?? c.encounter.encounterType.split('—')[0].trim()}
          </div>

          <p className="mt-4 line-clamp-3 text-sm text-white/70">
            {c.subtitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat label={headlineLabel} value={headlineNumber} highlight={c.hero} />
            <Stat
              label="Days to pay"
              value={`${c.kpis.daysToPayment}d`}
            />
            <Stat
              label="Clean claim"
              value={formatPercent(c.kpis.cleanClaimRate)}
            />
            <Stat
              label="Patient bal"
              value={formatCurrency(c.kpis.patientBalance, { compact: true })}
            />
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-white/50 transition-colors group-hover:text-white/80">
            <span>Open agent console</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-black/20 p-2">
      <div className="text-[9px] uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div
        className={cn(
          'mt-0.5 font-mono text-sm font-semibold',
          highlight ? 'text-orange-300' : 'text-white',
        )}
      >
        {value}
      </div>
    </div>
  );
}
