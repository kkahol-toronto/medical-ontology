'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAGE_ORDER } from '@/data/cases';
import type { RcmCase, StageData, StageId } from '@/lib/types';

export type StageStatus = 'queued' | 'running' | 'done' | 'exception';

export interface StageRunState {
  status: StageStatus;
  currentStepIndex: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface RunnerState {
  activeStage: StageId | null;
  stages: Record<StageId, StageRunState>;
  exceptions: Array<{ stage: StageId; reason: string; resolution: string }>;
  isRunning: boolean;
  isAutoplay: boolean;
}

const initialStages = (case_: RcmCase): Record<StageId, StageRunState> => {
  const o = {} as Record<StageId, StageRunState>;
  for (const s of STAGE_ORDER) {
    o[s] = { status: 'queued', currentStepIndex: 0 };
  }
  return o;
};

const REASONING_STEP_MS = 700;
const STAGE_GAP_MS = 350;

/**
 * Hook that scripts the 9-stage agent run for a case. Each agent's
 * reasoning steps stream out at REASONING_STEP_MS, marking exceptions
 * as they fire. The denial stage on the oncology case is auto-marked
 * exception until the appeal flow completes.
 */
export function useAgentRunner(case_: RcmCase) {
  const [state, setState] = useState<RunnerState>(() => ({
    activeStage: null,
    stages: initialStages(case_),
    exceptions: [],
    isRunning: false,
    isAutoplay: false,
  }));

  const cancelRef = useRef(false);

  const stageSequence = useMemo(() => STAGE_ORDER, []);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setState({
      activeStage: null,
      stages: initialStages(case_),
      exceptions: [],
      isRunning: false,
      isAutoplay: false,
    });
  }, [case_]);

  const runStage = useCallback(
    async (stageId: StageId) => {
      cancelRef.current = false;
      const stageData: StageData = case_.stages[stageId];
      const stepCount = stageData.reasoning.length;
      setState((s) => ({
        ...s,
        activeStage: stageId,
        isRunning: true,
        stages: {
          ...s.stages,
          [stageId]: {
            ...s.stages[stageId],
            status: 'running',
            currentStepIndex: 0,
            startedAt: Date.now(),
          },
        },
      }));
      for (let i = 0; i < stepCount; i++) {
        if (cancelRef.current) return;
        await new Promise((r) => setTimeout(r, REASONING_STEP_MS));
        if (cancelRef.current) return;
        setState((s) => ({
          ...s,
          stages: {
            ...s.stages,
            [stageId]: { ...s.stages[stageId], currentStepIndex: i + 1 },
          },
        }));
      }
      const isException = !!stageData.exception;
      setState((s) => ({
        ...s,
        stages: {
          ...s.stages,
          [stageId]: {
            ...s.stages[stageId],
            status: isException ? 'exception' : 'done',
            finishedAt: Date.now(),
          },
        },
        exceptions: isException
          ? [
              ...s.exceptions.filter((e) => e.stage !== stageId),
              {
                stage: stageId,
                reason: stageData.exception!.reason,
                resolution: stageData.exception!.resolution,
              },
            ]
          : s.exceptions,
        isRunning: false,
      }));
    },
    [case_],
  );

  const runAll = useCallback(async () => {
    cancelRef.current = false;
    setState((s) => ({ ...s, isAutoplay: true }));
    for (const stageId of stageSequence) {
      if (cancelRef.current) {
        setState((s) => ({ ...s, isAutoplay: false, isRunning: false }));
        return;
      }
      await runStage(stageId);
      await new Promise((r) => setTimeout(r, STAGE_GAP_MS));
    }
    setState((s) => ({ ...s, isAutoplay: false }));
  }, [runStage, stageSequence]);

  const runNext = useCallback(async () => {
    const next = stageSequence.find(
      (id) => state.stages[id].status === 'queued',
    );
    if (next) await runStage(next);
  }, [state.stages, runStage, stageSequence]);

  // resolve a flagged exception (used by the appeal letter flow)
  const resolveException = useCallback((stageId: StageId) => {
    setState((s) => ({
      ...s,
      stages: {
        ...s.stages,
        [stageId]: { ...s.stages[stageId], status: 'done' },
      },
    }));
  }, []);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return { state, runStage, runAll, runNext, reset, resolveException };
}
