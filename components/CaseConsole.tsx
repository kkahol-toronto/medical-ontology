'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FileSearch,
  Network,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  User,
} from 'lucide-react';
import { AgentWorkSurface } from '@/components/AgentWorkSurface';
import {
  CaseOntologyModal,
  StageOntologyModal,
} from '@/components/ontology/ReasoningOntologyGraph';
import { AppealLetterPanel } from '@/components/AppealLetterPanel';
import { ComprehendMedicalPanel } from '@/components/ComprehendMedicalPanel';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { OrchestrationRail } from '@/components/OrchestrationRail';
import { StageDetailPanel } from '@/components/stage-detail/StageDetailPanel';
import { StageTimeline } from '@/components/StageTimeline';
import { STAGE_NUMBER, STAGE_TITLE } from '@/data/cases';
import { useAgentRunner } from '@/lib/agents/runner';
import type { RcmCase, StageId } from '@/lib/types';

export function CaseConsole({
  case: c,
  initialStage,
}: {
  case: RcmCase;
  initialStage?: StageId;
}) {
  const [selectedStage, setSelectedStage] = useState<StageId>(
    initialStage ?? 'registration',
  );
  const [caseOntologyOpen, setCaseOntologyOpen] = useState(false);
  const [timelineOntologyStage, setTimelineOntologyStage] =
    useState<StageId | null>(null);
  const { state, runStage, runAll, runNext, reset } = useAgentRunner(c);
  const stage = c.stages[selectedStage];
  const runState = state.stages[selectedStage];
  const timelineStage = timelineOntologyStage
    ? c.stages[timelineOntologyStage]
    : null;
  const timelineRunState = timelineOntologyStage
    ? state.stages[timelineOntologyStage]
    : null;

  const isHero =
    (c.id === 'oncology' || c.id === 'behavioralHealth') && selectedStage === 'denial';
  const isCdi = selectedStage === 'cdi';
  const stageDetail = c.stageDetails?.[selectedStage];

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
          <Link href={`/case/${c.id}/summary`}>
            <GlassButton variant="ghost" size="md">
              <User className="h-4 w-4" />
              Patient summary
            </GlassButton>
          </Link>
          <Link href="/views/analytics">
            <GlassButton variant="ghost" size="md">
              <FileSearch className="h-4 w-4" />
              Analytics
            </GlassButton>
          </Link>
          <GlassButton
            variant="ghost"
            size="md"
            onClick={() => setCaseOntologyOpen(true)}
          >
            <Network className="h-4 w-4" />
            Case ontology
          </GlassButton>
          {c.id === 'behavioralHealth' && (
            <Link href="/views/behavioral-health">
              <GlassButton variant="ghost" size="md">
                <Network className="h-4 w-4" />
                Domain ontology
              </GlassButton>
            </Link>
          )}
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
            onOpenStageOntology={(id) => {
              setTimelineOntologyStage(id);
            }}
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

          {/* Rich stage-by-stage detail (data sourced from case Excel workbooks) */}
          {stageDetail && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-200/90">
                  Stage detail · {STAGE_TITLE[selectedStage]}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Sourced from {c.shortTitle} sample workbook
                </span>
              </div>
              <StageDetailPanel detail={stageDetail} />
            </section>
          )}
        </div>

        {/* Right: orchestration */}
        <OrchestrationRail case_={c} state={state} />
      </div>

      <CaseOntologyModal
        open={caseOntologyOpen}
        onClose={() => setCaseOntologyOpen(false)}
        case_={c}
        highlightStage={selectedStage}
      />

      {timelineStage && timelineRunState && timelineOntologyStage && (
        <StageOntologyModal
          open={timelineOntologyStage !== null}
          onClose={() => setTimelineOntologyStage(null)}
          stage={timelineStage}
          visibleStepCount={Math.max(
            timelineRunState.currentStepIndex,
            timelineStage.reasoning.slice(0, timelineRunState.currentStepIndex)
              .length,
          )}
          runStatus={timelineRunState.status}
          isDone={
            timelineRunState.status === 'done' ||
            timelineRunState.status === 'exception'
          }
        />
      )}
    </div>
  );
}
