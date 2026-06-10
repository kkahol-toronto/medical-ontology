'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import {
  OntologyLinkButton,
  ReasoningOntologyOverlay,
  StageOntologyModal,
} from '@/components/ontology/ReasoningOntologyGraph';
import type { StageRunState } from '@/lib/agents/runner';
import { buildStageOntologyGraph } from '@/lib/ontology/stageOntologyGraph';
import type { StageData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  stage: StageData;
  runState: StageRunState;
  rightSlot?: React.ReactNode;
}

export function AgentWorkSurface({ stage, runState, rightSlot }: Props) {
  const [showOntology, setShowOntology] = useState(false);
  const [ontologyModalOpen, setOntologyModalOpen] = useState(false);
  const visibleSteps = stage.reasoning.slice(0, runState.currentStepIndex);
  const isRunning = runState.status === 'running';
  const isDone =
    runState.status === 'done' || runState.status === 'exception';
  const visibleStepCount = Math.max(
    runState.currentStepIndex,
    visibleSteps.length,
  );

  const stageGraph = useMemo(
    () =>
      buildStageOntologyGraph(stage, {
        visibleStepCount,
        runStatus: runState.status,
        isDone,
      }),
    [stage, visibleStepCount, runState.status, isDone],
  );

  return (
    <GlassCard variant="strong" className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
            <span>{stage.agentName}</span>
            {stage.awsService && (
              <span className="rounded-md bg-orange-500/15 px-1.5 py-0.5 text-[9px] text-orange-300">
                {stage.awsService === 'Bedrock'
                  ? 'AWS Bedrock'
                  : 'AWS Comprehend Medical'}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {stage.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ModeBadge mode={stage.mode} />
          <StatusBadge status={runState.status} />
          <OntologyLinkButton onClick={() => setOntologyModalOpen(true)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        {/* Inputs */}
        <Panel title="Inputs">
          <ul className="space-y-3 text-sm">
            {stage.inputs.map((inp) => (
              <li key={inp.label}>
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  {inp.label}
                </div>
                <div className="mt-0.5 text-white/85">{inp.value}</div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Reasoning trace — hover reveals ontology subgraph */}
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              Reasoning trace
            </span>
          }
          accent
        >
          <div
            className="relative min-h-[160px]"
            onMouseEnter={() => setShowOntology(true)}
            onMouseLeave={() => setShowOntology(false)}
            onFocus={() => setShowOntology(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setShowOntology(false);
              }
            }}
            tabIndex={0}
            role="region"
            aria-label="Reasoning trace — hover for ontology preview"
          >
            <div
              className={cn(
                'space-y-2.5 pb-1 transition-opacity duration-200',
                showOntology ? 'pointer-events-none opacity-15' : 'opacity-100',
              )}
            >
              <AnimatePresence>
                {visibleSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 text-sm"
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/80" />
                    <div>
                      <div className="text-white/90">{step.text}</div>
                      {step.detail && (
                        <div className="mt-1 rounded-md bg-black/20 px-2 py-1 font-mono text-[11px] leading-snug text-white/55">
                          {step.detail}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isRunning && visibleSteps.length < stage.reasoning.length && (
                <div className="flex items-center gap-2 text-sm text-blue-300/80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>thinking…</span>
                </div>
              )}
              {runState.status === 'queued' && (
                <div className="text-sm text-white/40">
                  Press <kbd className="rounded bg-white/10 px-1 text-xs">Run agent</kbd> to start.
                </div>
              )}
            </div>
            <AnimatePresence>
              {showOntology && (
                <ReasoningOntologyOverlay graph={stageGraph} />
              )}
            </AnimatePresence>
          </div>
        </Panel>

        {/* Outputs */}
        <Panel title="Outputs">
          {isDone ? (
            <ul className="space-y-3 text-sm">
              {stage.outputs.map((out) => (
                <li key={out.label}>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">
                    {out.label}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5',
                      out.emphasis
                        ? 'text-orange-300 font-mono font-semibold'
                        : 'text-white/85',
                    )}
                  >
                    {out.value}
                  </div>
                </li>
              ))}
              {stage.kpiDeltas && stage.kpiDeltas.length > 0 && (
                <li className="border-t border-white/5 pt-3">
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider text-white/40">
                    KPI delta
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.kpiDeltas.map((d) => (
                      <span
                        key={d.label}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs',
                          d.positive === false
                            ? 'bg-orange-500/15 text-orange-200'
                            : 'bg-emerald-400/15 text-emerald-200',
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {d.label}: {d.value}
                      </span>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          ) : (
            <div className="text-sm text-white/40">
              Outputs will appear when the agent completes.
            </div>
          )}
        </Panel>
      </div>

      {rightSlot}

      <StageOntologyModal
        open={ontologyModalOpen}
        onClose={() => setOntologyModalOpen(false)}
        stage={stage}
        visibleStepCount={visibleStepCount}
        runStatus={runState.status}
        isDone={isDone}
      />
    </GlassCard>
  );
}

function Panel({
  title,
  children,
  accent,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 ring-1',
        accent
          ? 'bg-black/20 ring-orange-400/20'
          : 'bg-white/[0.03] ring-white/[0.06]',
      )}
    >
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
        {title}
      </div>
      {children}
    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        mode === 'AUTO' && 'bg-blue-400/15 text-blue-300',
        mode === 'ASSIST' && 'bg-violet-400/15 text-violet-300',
        mode === 'REVIEW' && 'bg-orange-400/20 text-orange-300',
      )}
    >
      {mode}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    queued: { label: 'Queued', cls: 'bg-white/10 text-white/55' },
    running: {
      label: 'Running',
      cls: 'bg-blue-400/20 text-blue-200 ring-1 ring-blue-400/40',
    },
    done: {
      label: 'Complete',
      cls: 'bg-emerald-400/20 text-emerald-200',
    },
    exception: {
      label: 'Exception',
      cls: 'bg-orange-400/20 text-orange-200 ring-1 ring-orange-400/40',
    },
  };
  const m = map[status] ?? map.queued;
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}
