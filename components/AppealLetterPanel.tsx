'use client';

import { motion } from 'framer-motion';
import { FileText, Loader2, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import type { StageRunState } from '@/lib/agents/runner';
import type { RcmCase } from '@/lib/types';
import { cn } from '@/lib/utils';

const SCRIPTED_LETTER = `**APPEAL OF CLAIM DENIAL — CO-50 / N390**

Aetna Claims Appeals  
PO Box 14463 · Lexington, KY 40512  
RE: Robert A. Chen · Member AET-PPO-8821047-IL  
Claim AET-CLM-2025-0318-ONC · Service Date 03/18/2025

To the Aetna Medical Director,

I am writing on behalf of Mr. Robert A. Chen to formally appeal the denial of cycle 2 of his planned 6-cycle carboplatin + pemetrexed regimen, citing CO-50 "not medically necessary." The medical record fully supports first-line use of this combination in the setting of EGFR-mutated stage IV non-squamous NSCLC.

**Clinical justification:**

1. *Disease characterisation.* Stage IV T3N2M1b malignant neoplasm of the right upper lobe (ICD-10 C34.11) with documented pleural metastatic involvement (J91.0). Pathology confirmed adenocarcinoma; molecular profile EGFR exon 21 L858R positive, ALK negative, PD-L1 expression 35%.

2. *Performance status.* ECOG 1, indicating preserved functional reserve and appropriateness for active systemic therapy.

3. *Regimen selection — first-line.* Per **NCCN Guidelines NSCL-K, page 1**, first-line treatment of advanced/metastatic non-squamous NSCLC includes carboplatin + pemetrexed for patients with adequate performance status and non-squamous histology, regardless of EGFR mutation status when targeted therapy is deferred.

4. *Aetna Clinical Policy Bulletin — Pemetrexed Products.* §III medical necessity criteria are satisfied: (a) histology non-squamous, (b) advanced/metastatic disease, (c) adequate performance status, (d) life expectancy >3 months. The patient meets all four criteria explicitly.

5. *Cross-policy precedent.* Aetna's UM-MP353 (pembrolizumab) demonstrates the payer's pattern of approving first-line oncology biologics in advanced NSCLC where standard documentation is met. The clinical bar applied to UM-MP353 is materially analogous to the bar for pemetrexed and is fully met here.

For these reasons, the original CO-50 determination should be **overturned** and the corrected claim authorised at the contracted PPO rate. Supporting documentation is attached: pathology report, CT staging, molecular results, ECOG assessment, and the operative chemotherapy order.

Respectfully,  
**Mei-Ling Park, MD** — Thoracic Oncology  
Chicago Oncology & Infusion Partners · NPI 4819203746`;

interface Props {
  case_: RcmCase;
  runState: StageRunState;
}

type LiveState = 'idle' | 'streaming' | 'done';

export function AppealLetterPanel({ case_, runState }: Props) {
  const [liveAi, setLiveAi] = useState(false);
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<LiveState>('idle');
  const [source, setSource] = useState<'scripted' | 'bedrock' | null>(null);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const enabled = runState.status === 'done' || runState.status === 'exception';

  // reset when stage replays
  useEffect(() => {
    if (runState.status === 'queued' || runState.status === 'running') {
      setDraft('');
      setState('idle');
      setSource(null);
      setModelLabel(null);
    }
  }, [runState.status]);

  function prettyModel(id: string): string {
    if (id.includes('opus-4-7')) return 'Claude Opus 4.7';
    if (id.includes('opus-4-6')) return 'Claude Opus 4.6';
    if (id.includes('opus-4-5')) return 'Claude Opus 4.5';
    if (id.includes('sonnet-4-6')) return 'Claude Sonnet 4.6';
    if (id.includes('sonnet-4-5')) return 'Claude Sonnet 4.5';
    if (id.includes('haiku-4-5')) return 'Claude Haiku 4.5';
    return id;
  }

  async function generate() {
    setDraft('');
    setState('streaming');
    if (liveAi) {
      // Bedrock streaming endpoint will be wired in the next step.
      try {
        const res = await fetch('/api/ai/bedrock/appeal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: case_.id }),
        });
        if (!res.ok || !res.body) throw new Error('bedrock unavailable');
        setSource('bedrock');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        let buffer = '';
        const handleEvents = () => {
          let idx: number;
          while ((idx = buffer.indexOf('\n\n')) >= 0) {
            const event = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of event.split('\n')) {
              if (!line.startsWith('data:')) continue;
              const json = line.slice(5).trim();
              if (!json || json === '[DONE]') continue;
              try {
                const parsed = JSON.parse(json) as {
                  delta?: string;
                  done?: boolean;
                  model?: string;
                  event?: string;
                  error?: string;
                };
                if (parsed.error) throw new Error(parsed.error);
                if (
                  (parsed.event === 'start' || parsed.event === 'model') &&
                  parsed.model
                ) {
                  setModelLabel(prettyModel(parsed.model));
                }
                if (parsed.delta) {
                  acc += parsed.delta;
                  setDraft(acc);
                }
                if (parsed.done && parsed.model) {
                  setModelLabel(prettyModel(parsed.model));
                }
              } catch (e) {
                if (e instanceof Error && e.message) throw e;
              }
            }
          }
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          handleEvents();
        }
        buffer += decoder.decode();
        handleEvents();
        setState('done');
        return;
      } catch {
        // fall through to scripted on any error
      }
    }
    setSource('scripted');
    let i = 0;
    const total = SCRIPTED_LETTER.length;
    const tick = () => {
      const next = Math.min(total, i + Math.ceil(Math.random() * 18 + 6));
      setDraft(SCRIPTED_LETTER.slice(0, next));
      i = next;
      if (next < total) {
        setTimeout(tick, 32);
      } else {
        setState('done');
      }
    };
    tick();
  }

  return (
    <GlassCard variant="orange" glow="orange" className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-200">
            <Sparkles className="h-3.5 w-3.5" />
            Hero moment · AI Appeal Letter
          </div>
          <h3 className="mt-1 text-xl font-semibold text-white">
            Draft the overturn letter from clinical evidence + Aetna policy
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-white/70">
            The agent will cite NCCN NSCL-K, the Aetna Pemetrexed Clinical
            Policy Bulletin, the patient&apos;s EGFR L858R molecular profile,
            ECOG 1 status, T3N2M1b staging, pleural metastatic disease, and
            the analogous UM-MP353 Keytruda precedent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs text-white/80 ring-1 ring-white/10 hover:ring-orange-400/40">
            <Zap className={cn('h-3.5 w-3.5', liveAi ? 'text-orange-400' : 'text-white/40')} />
            <span>Live AI</span>
            <span
              role="switch"
              aria-checked={liveAi}
              onClick={() => setLiveAi((v) => !v)}
              className={cn(
                'relative inline-block h-4 w-7 cursor-pointer rounded-full transition-colors',
                liveAi ? 'bg-orange-500' : 'bg-white/15',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
                  liveAi ? 'translate-x-3.5' : 'translate-x-0.5',
                )}
              />
            </span>
          </label>
          <GlassButton
            variant="primary"
            size="md"
            onClick={generate}
            disabled={!enabled || state === 'streaming'}
          >
            {state === 'streaming' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {state === 'done' ? 'Regenerate' : 'Generate appeal letter'}
              </>
            )}
          </GlassButton>
        </div>
      </div>

      {(state !== 'idle' || draft) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-black/30 p-5 ring-1 ring-white/10"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
              <FileText className="h-3 w-3" />
              Appeal letter draft
            </div>
            {source && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                  source === 'bedrock'
                    ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-400/40'
                    : 'bg-white/10 text-white/60',
                )}
              >
                {source === 'bedrock'
                  ? `AWS Bedrock · ${modelLabel ?? 'Claude'}`
                  : 'Scripted'}
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-white/85">
            {draft}
            {state === 'streaming' && (
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-orange-400 align-middle" />
            )}
          </pre>
        </motion.div>
      )}

      {!enabled && state === 'idle' && (
        <div className="text-xs text-white/55">
          Run the Denial Management agent first — the appeal letter generator
          unlocks once the agent has classified the denial.
        </div>
      )}
    </GlassCard>
  );
}
