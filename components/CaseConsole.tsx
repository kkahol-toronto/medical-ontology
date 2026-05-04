'use client';

import { Pause, Play, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AgentWorkSurface } from '@/components/AgentWorkSurface';
import { AppealLetterPanel } from '@/components/AppealLetterPanel';
import { ComprehendMedicalPanel } from '@/components/ComprehendMedicalPanel';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { OrchestrationRail } from '@/components/OrchestrationRail';
import { StageTimeline } from '@/components/StageTimeline';
import { STAGE_NUMBER, STAGE_TITLE } from '@/data/cases';
import { useAgentRunner } from '@/lib/agents/runner';
import type { RcmCase, StageId } from '@/lib/types';

export function CaseConsole({ case: c }: { case: RcmCase }) {
  const [selectedStage, setSelectedStage] = useState<StageId>('registration');
  const { state, runStage, runAll, runNext, reset } = useAgentRunner(c);
  const stage = c.stages[selectedStage];
  const runState = state.stages[selectedStage];

  const isHero = c.id === 'oncology' && selectedStage === 'denial';
  const isCdi = selectedStage === 'cdi';

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Agent console · {c.payer}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-white">{c.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{c.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GlassButton
            variant="primary"
            size="md"
            onClick={runAll}
            disabled={state.isRunning || state.isAutoplay}
          >
            {state.isAutoplay ? (
              <>
                <Pause className="h-4 w-4" />
                Auto-running…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run all 9 stages
              </>
            )}
          </GlassButton>
          <GlassButton
            variant="glass"
            size="md"
            onClick={runNext}
            disabled={state.isRunning}
          >
            <SkipForward className="h-4 w-4" />
            Run next
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="md"
            onClick={() => {
              reset();
              setSelectedStage('registration');
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </GlassButton>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left: stage timeline */}
        <GlassCard className="p-3 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2 flex items-baseline justify-between px-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Stages
            </span>
            <span className="font-mono text-[10px] text-white/40">
              {STAGE_NUMBER[selectedStage]} {STAGE_TITLE[selectedStage]}
            </span>
          </div>
          <StageTimeline
            case_={c}
            state={state}
            onSelectStage={setSelectedStage}
            selectedStage={selectedStage}
          />
        </GlassCard>

        {/* Center: work surface */}
        <div className="space-y-5">
          <AgentWorkSurface
            stage={stage}
            runState={runState}
            rightSlot={
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-white/55">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                  <span>
                    {runState.status === 'queued'
                      ? 'Agent ready'
                      : runState.status === 'running'
                        ? 'Streaming reasoning trace'
                        : runState.status === 'exception'
                          ? 'Exception flagged — see right rail'
                          : 'Stage complete · ready for next agent'}
                  </span>
                </div>
                <GlassButton
                  variant="blue"
                  size="sm"
                  onClick={() => runStage(selectedStage)}
                  disabled={state.isRunning}
                >
                  Replay this stage
                </GlassButton>
              </div>
            }
          />
          {isCdi && <ComprehendMedicalPanel case_={c} runState={runState} />}
          {isHero && <AppealLetterPanel case_={c} runState={runState} />}
        </div>

        {/* Right: orchestration */}
        <OrchestrationRail case_={c} state={state} />
      </div>
    </div>
  );
}
