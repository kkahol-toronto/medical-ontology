'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  HeartPulse,
  Loader2,
  Pill,
  Send,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { STAGE_NUMBER, STAGE_ORDER, STAGE_TITLE } from '@/data/cases';
import type { RunnerState } from '@/lib/agents/runner';
import type { RcmCase, StageId } from '@/lib/types';
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

interface Props {
  case_: RcmCase;
  state: RunnerState;
  onSelectStage: (stage: StageId) => void;
  selectedStage: StageId;
}

export function StageTimeline({
  case_,
  state,
  onSelectStage,
  selectedStage,
}: Props) {
  return (
    <div className="space-y-2">
      {STAGE_ORDER.map((id, i) => {
        const Icon = STAGE_ICON[id];
        const stage = case_.stages[id];
        const status = state.stages[id].status;
        const isSelected = selectedStage === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectStage(id)}
            className={cn(
              'group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all',
              isSelected
                ? 'bg-white/[0.08] ring-1 ring-orange-400/40'
                : 'hover:bg-white/[0.04]',
            )}
          >
            <div className="relative shrink-0">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition-all',
                  status === 'queued' &&
                    'border-white/10 bg-white/[0.03] text-white/40',
                  status === 'running' &&
                    'border-blue-400/40 bg-blue-400/15 text-blue-200 glow-blue',
                  status === 'done' &&
                    'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
                  status === 'exception' &&
                    'border-orange-400/50 bg-orange-400/15 text-orange-200',
                )}
              >
                {status === 'running' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status === 'exception' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div
                  className={cn(
                    'absolute left-1/2 top-9 h-[calc(100%+8px)] w-px -translate-x-1/2',
                    status === 'done' || status === 'exception'
                      ? 'bg-gradient-to-b from-emerald-400/30 to-transparent'
                      : 'bg-white/8',
                  )}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest text-white/40">
                  {STAGE_NUMBER[id]}
                </span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                    stage.mode === 'AUTO' && 'bg-blue-400/15 text-blue-300',
                    stage.mode === 'ASSIST' &&
                      'bg-violet-400/15 text-violet-300',
                    stage.mode === 'REVIEW' &&
                      'bg-orange-400/20 text-orange-300',
                  )}
                >
                  {stage.mode}
                </span>
              </div>
              <div
                className={cn(
                  'mt-0.5 text-[13px] font-medium leading-snug',
                  isSelected ? 'text-white' : 'text-white/85',
                )}
              >
                {STAGE_TITLE[id]}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-white/45">
                {stage.agentName}
              </div>
            </div>
            {status === 'running' && (
              <motion.span
                layoutId="active-pill"
                className="absolute -left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_8px_rgb(255_122_26_/_0.7)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
