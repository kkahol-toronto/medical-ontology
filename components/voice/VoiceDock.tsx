'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { Waveform } from '@/components/voice/Waveform';
import {
  AzureVoiceClient,
  type VoiceClientStatus,
  type VoiceSessionConfig,
} from '@/lib/voice/azure-client';
import { cn } from '@/lib/utils';

interface Bubble {
  id: number;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  partial?: boolean;
  model?: string;
}

type Mode = 'closed' | 'voice' | 'text';

let bubbleId = 0;

export function VoiceDock() {
  const [mode, setMode] = useState<Mode>('closed');
  const [status, setStatus] = useState<VoiceClientStatus>('idle');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textBusy, setTextBusy] = useState(false);
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const [voiceConfigured, setVoiceConfigured] = useState<boolean | null>(null);
  const clientRef = useRef<AzureVoiceClient | null>(null);
  const cfgRef = useRef<VoiceSessionConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastUserBubbleRef = useRef<number | null>(null);
  const lastAssistantBubbleRef = useRef<number | null>(null);

  // Probe configuration on mount so the orb can show "ready" or "setup".
  useEffect(() => {
    let cancelled = false;
    fetch('/api/voice/session')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setVoiceConfigured(Boolean(j?.configured));
      })
      .catch(() => !cancelled && setVoiceConfigured(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [bubbles]);

  function pushBubble(role: Bubble['role'], text: string, partial = false) {
    const id = ++bubbleId;
    setBubbles((prev) => [...prev, { id, role, text, partial }]);
    return id;
  }

  function appendBubble(id: number | null, role: Bubble['role'], delta: string) {
    if (id == null) {
      const newId = pushBubble(role, delta, true);
      if (role === 'user') lastUserBubbleRef.current = newId;
      else if (role === 'assistant') lastAssistantBubbleRef.current = newId;
      return newId;
    }
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text: b.text + delta } : b)),
    );
    return id;
  }

  function finalizeBubble(id: number | null, finalText?: string) {
    if (id == null) return;
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, text: finalText ?? b.text, partial: false }
          : b,
      ),
    );
  }

  // --- Voice mode -----------------------------------------------------
  async function openVoice() {
    setMode('voice');
    setError(null);
    if (clientRef.current && status !== 'idle') return;
    try {
      const sessionRes = await fetch('/api/voice/session');
      const cfg = (await sessionRes.json()) as VoiceSessionConfig & {
        ok: boolean;
        configured: boolean;
        error?: string;
      };
      if (!cfg.configured) {
        setError(cfg.error ?? 'Azure Voice Live not configured.');
        setStatus('error');
        return;
      }
      cfgRef.current = cfg;
      const client = new AzureVoiceClient({
        onStatusChange: (s) => setStatus(s),
        onUserTranscript: (delta, final) => {
          if (final) {
            if (lastUserBubbleRef.current == null) {
              const id = pushBubble('user', delta, false);
              lastUserBubbleRef.current = id;
            } else {
              finalizeBubble(lastUserBubbleRef.current, delta);
            }
            lastUserBubbleRef.current = null;
          } else {
            lastUserBubbleRef.current = appendBubble(
              lastUserBubbleRef.current,
              'user',
              delta,
            );
          }
        },
        onAssistantTranscript: (delta, final) => {
          if (final) {
            if (lastAssistantBubbleRef.current == null) {
              const id = pushBubble('assistant', delta, false);
              lastAssistantBubbleRef.current = id;
            } else {
              finalizeBubble(lastAssistantBubbleRef.current, delta);
            }
            lastAssistantBubbleRef.current = null;
          } else {
            lastAssistantBubbleRef.current = appendBubble(
              lastAssistantBubbleRef.current,
              'assistant',
              delta,
            );
          }
        },
        onLevel: (l) => setLevel(l),
        onError: (msg) => {
          setError(msg);
          setStatus('error');
        },
        onToolCall: (name) => {
          setToolCalls((t) => [...t.slice(-3), name]);
          pushBubble('tool', `Calling ${name}…`);
        },
      });
      clientRef.current = client;
      await client.connect(cfg);
    } catch (e) {
      setError((e as Error).message ?? 'failed to start voice');
      setStatus('error');
    }
  }

  async function toggleListen() {
    if (!clientRef.current) return;
    if (status === 'listening') clientRef.current.stopListening();
    else await clientRef.current.startListening();
  }

  function endCall() {
    clientRef.current?.close();
    clientRef.current = null;
    setStatus('idle');
    setLevel(0);
  }

  // --- Text mode (Bedrock streaming) ----------------------------------
  async function sendText() {
    const trimmed = textInput.trim();
    if (!trimmed || textBusy) return;
    setTextInput('');
    const history = bubbles
      .filter((b) => b.role !== 'tool')
      .map((b) => ({ role: b.role as 'user' | 'assistant', content: b.text }));
    pushBubble('user', trimmed, false);
    setTextBusy(true);
    const aId = pushBubble('assistant', '', true);
    let acc = '';
    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: trimmed }],
        }),
      });
      if (!res.ok || !res.body) {
        let errMsg = `chat failed (${res.status})`;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) errMsg = j.error;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const handleEvents = () => {
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const event = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            try {
              const parsed = JSON.parse(json) as {
                event?: string;
                delta?: string;
                model?: string;
                error?: string;
              };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.event === 'model' && parsed.model) {
                const m = parsed.model;
                setBubbles((prev) =>
                  prev.map((b) =>
                    b.id === aId ? { ...b, model: m } : b,
                  ),
                );
              }
              if (parsed.delta) {
                acc += parsed.delta;
                setBubbles((prev) =>
                  prev.map((b) =>
                    b.id === aId ? { ...b, text: acc, partial: true } : b,
                  ),
                );
              }
            } catch (innerErr) {
              if (innerErr instanceof Error && innerErr.message) throw innerErr;
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
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === aId
            ? { ...b, text: acc || '(no response)', partial: false }
            : b,
        ),
      );
    } catch (e) {
      const raw = (e as Error).message ?? 'chat failed';
      // Prettify common transient errors so the demo doesn't look broken.
      const friendly = /credentials|throttl|too many|rate.?limit/i.test(raw)
        ? "I'm warming up — please ask that again in a second."
        : raw;
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === aId
            ? {
                ...b,
                text: acc
                  ? `${acc}\n\n[stream interrupted: ${friendly}]`
                  : friendly,
                partial: false,
              }
            : b,
        ),
      );
    } finally {
      setTextBusy(false);
    }
  }

  function close() {
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
    setMode('closed');
    setStatus('idle');
  }

  const isOpen = mode !== 'closed';

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="glass-dock pointer-events-auto flex w-[420px] flex-col overflow-hidden rounded-2xl text-sm"
            style={{ height: '600px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_16px_rgb(255_122_26_/_0.5)]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1736]',
                      status === 'idle' && 'bg-white/30',
                      status === 'connecting' && 'animate-pulse bg-blue-400',
                      status === 'ready' && 'bg-emerald-400',
                      status === 'listening' && 'bg-orange-400',
                      status === 'speaking' && 'animate-pulse bg-blue-400',
                      status === 'thinking' && 'animate-pulse bg-violet-400',
                      status === 'error' && 'bg-rose-500',
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    NIRA
                  </div>
                  <div className="text-[10.5px] uppercase tracking-wider text-white/45">
                    {mode === 'voice'
                      ? `Voice · ${status}`
                      : 'Text mode'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="text-white/55 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex items-center gap-1 border-b border-white/5 px-3 py-1.5">
              <ModeTab
                active={mode === 'voice'}
                onClick={openVoice}
                disabled={voiceConfigured === false}
              >
                <Mic className="h-3 w-3" />
                Voice
                {voiceConfigured === false && (
                  <span className="ml-1 rounded bg-white/10 px-1 text-[8px] uppercase">
                    setup
                  </span>
                )}
              </ModeTab>
              <ModeTab
                active={mode === 'text'}
                onClick={() => {
                  if (clientRef.current) {
                    clientRef.current.close();
                    clientRef.current = null;
                  }
                  setMode('text');
                  setStatus('idle');
                  setError(null);
                }}
              >
                <Send className="h-3 w-3" />
                Type
              </ModeTab>
            </div>

            {/* Transcript */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
            >
              {bubbles.length === 0 && (
                <div className="space-y-3 text-xs text-white/70">
                  <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                    Hi, I'm <span className="font-semibold text-white">NIRA</span>. Ask
                    me anything about the three demo cases. Try:
                    <ul className="mt-2 space-y-1 text-white/60">
                      <li>· <em>"Walk me through the oncology denial"</em></li>
                      <li>· <em>"Why was Mr Chen's claim denied?"</em></li>
                      <li>· <em>"Show me the inpatient KPIs"</em></li>
                    </ul>
                  </div>
                  {mode === 'text' && voiceConfigured && (
                    <button
                      type="button"
                      onClick={openVoice}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500/15 px-3 py-2 text-[12px] text-orange-100 ring-1 ring-orange-400/40 hover:bg-orange-500/25"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Or tap to talk to me instead
                    </button>
                  )}
                </div>
              )}
              {bubbles.map((b) => (
                <Bubble key={b.id} bubble={b} />
              ))}
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-200 ring-1 ring-rose-400/30">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {toolCalls.length > 0 && (
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  recent tool calls: {toolCalls.slice(-3).join(', ')}
                </div>
              )}
            </div>

            {/* Footer / input */}
            {mode === 'voice' ? (
              <div className="space-y-3 border-t border-white/5 p-4">
                <div className="rounded-xl bg-black/20 p-3">
                  <Waveform
                    level={level}
                    active={status === 'listening' || status === 'speaking'}
                  />
                </div>
                <div className="flex gap-2">
                  {status === 'idle' || status === 'error' ? (
                    <GlassButton
                      variant="primary"
                      size="md"
                      onClick={openVoice}
                      className="flex-1"
                    >
                      <Mic className="h-4 w-4" />
                      Connect
                    </GlassButton>
                  ) : status === 'connecting' ? (
                    <GlassButton variant="glass" size="md" disabled className="flex-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting…
                    </GlassButton>
                  ) : (
                    <>
                      <GlassButton
                        variant={status === 'listening' ? 'danger' : 'primary'}
                        size="md"
                        onClick={toggleListen}
                        className="flex-1"
                      >
                        {status === 'listening' ? (
                          <>
                            <MicOff className="h-4 w-4" /> Stop
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" /> Talk
                          </>
                        )}
                      </GlassButton>
                      <GlassButton variant="ghost" size="md" onClick={endCall}>
                        <PhoneOff className="h-4 w-4" />
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <form
                className="flex gap-2 border-t border-white/5 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendText();
                }}
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask anything about the cases…"
                  disabled={textBusy}
                  className="flex-1 rounded-xl bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 focus:outline-none focus:ring-orange-400/50"
                />
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!textInput.trim() || textBusy}
                >
                  {textBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </GlassButton>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating orb */}
      <button
        type="button"
        aria-label={isOpen ? 'Close voice agent' : 'Open voice agent'}
        onClick={() => {
          if (isOpen) close();
          else if (voiceConfigured) void openVoice();
          else setMode('text');
        }}
        className={cn(
          'pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300',
          'bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_10px_32px_rgb(255_122_26_/_0.55)]',
          'hover:scale-105 active:scale-95',
        )}
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-orange-500 opacity-60 blur-xl animate-pulse-slow" />
        {status === 'listening' ? (
          <Mic className="h-6 w-6 text-white drop-shadow-[0_2px_8px_rgb(0_0_0_/_0.4)]" />
        ) : status === 'speaking' || status === 'thinking' ? (
          <Sparkles className="h-6 w-6 text-white drop-shadow-[0_2px_8px_rgb(0_0_0_/_0.4)] animate-pulse" />
        ) : (
          <Mic className="h-6 w-6 text-white drop-shadow-[0_2px_8px_rgb(0_0_0_/_0.4)]" />
        )}
        {voiceConfigured !== null && (
          <span
            className={cn(
              'absolute -bottom-1 right-0 h-3 w-3 rounded-full border-2 border-[#0b1736]',
              voiceConfigured ? 'bg-emerald-400' : 'bg-white/30',
            )}
          />
        )}
      </button>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide transition-colors',
        active
          ? 'bg-orange-500/25 text-orange-100 ring-1 ring-orange-400/50'
          : disabled
            ? 'text-white/30 cursor-not-allowed'
            : 'text-white/70 ring-1 ring-white/15 bg-white/[0.04] hover:text-white hover:bg-white/[0.1]',
      )}
    >
      {children}
    </button>
  );
}

function prettyModel(id: string): string {
  if (id.includes('opus-4-7')) return 'Claude Opus 4.7';
  if (id.includes('opus-4-6')) return 'Claude Opus 4.6';
  if (id.includes('opus-4-5')) return 'Claude Opus 4.5';
  if (id.includes('sonnet-4-6')) return 'Claude Sonnet 4.6';
  if (id.includes('sonnet-4-5')) return 'Claude Sonnet 4.5';
  if (id.includes('haiku-4-5')) return 'Claude Haiku 4.5';
  return id;
}

function Bubble({ bubble }: { bubble: Bubble }) {
  if (bubble.role === 'tool') {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-mono text-violet-200 ring-1 ring-violet-400/30">
          <Wrench className="h-3 w-3" />
          {bubble.text}
        </span>
      </div>
    );
  }
  const isUser = bubble.role === 'user';
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isUser ? 'items-end' : 'items-start',
      )}
    >
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug whitespace-pre-wrap',
          isUser
            ? 'bg-orange-500/30 text-white ring-1 ring-orange-400/50'
            : 'bg-white/[0.1] text-white ring-1 ring-white/15',
        )}
      >
        {bubble.text}
        {bubble.partial && (
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-orange-400 align-middle" />
        )}
      </div>
      {!isUser && bubble.model && (
        <span className="px-2 text-[9.5px] uppercase tracking-wider text-white/35">
          {prettyModel(bubble.model)}
        </span>
      )}
    </div>
  );
}
