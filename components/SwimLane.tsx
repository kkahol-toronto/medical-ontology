'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  HeartPulse,
  Pill,
  Send,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { STAGE_ORDER, STAGE_TITLE } from '@/data/cases';
import type { AiMode, StageId } from '@/lib/types';
import { cn } from '@/lib/utils';

const STAGE_ICON: Record<StageId, ComponentType<{ className?: string }>> = {
  registration: UserPlus,
  eligibility: ClipboardCheck,
  priorAuth: ShieldAlert,
  cdi: Brain,
  charge: Pill,
  coding: FileCheck2,
  claim: Send,
  denial: HeartPulse,
  payment: CreditCard,
};

const STAGE_MODE: Record<StageId, AiMode> = {
  registration: 'AUTO',
  eligibility: 'AUTO',
  priorAuth: 'AUTO',
  cdi: 'ASSIST',
  charge: 'AUTO',
  coding: 'ASSIST',
  claim: 'AUTO',
  denial: 'REVIEW',
  payment: 'AUTO',
};

const MODE_STYLE: Record<AiMode, string> = {
  AUTO: 'text-blue-300 border-blue-400/30 bg-blue-400/10',
  ASSIST: 'text-violet-300 border-violet-400/30 bg-violet-400/10',
  REVIEW: 'text-orange-300 border-orange-400/40 bg-orange-400/15',
};

export function SwimLane() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            End-to-end agentic workflow
          </div>
          <div className="mt-1 text-lg text-white/85">
            9 stages — eligibility through collections
          </div>
        </div>
        <div className="hidden gap-3 text-[11px] uppercase tracking-wider text-white/40 sm:flex">
          <Legend dot="bg-blue-400" label="Auto" />
          <Legend dot="bg-violet-400" label="Assist" />
          <Legend dot="bg-orange-400" label="Review" />
          <Activity className="ml-2 h-4 w-4 text-white/30" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-9">
        {STAGE_ORDER.map((stage, i) => {
          const Icon = STAGE_ICON[stage];
          const mode = STAGE_MODE[stage];
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass relative flex flex-col gap-2 rounded-xl p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-white/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                    MODE_STYLE[mode],
                  )}
                >
                  {mode}
                </span>
              </div>
              <Icon className="h-5 w-5 text-white/80" />
              <div className="text-[12px] font-medium leading-tight text-white">
                {STAGE_TITLE[stage]}
              </div>
              {stage === 'denial' && (
                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-orange-400 shadow-[0_0_10px_rgb(255_122_26_/_0.8)]" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', dot)} />
      {label}
    </span>
  );
}
