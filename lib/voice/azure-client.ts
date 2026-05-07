/**
 * Realtime voice client — direct browser ↔ Azure Voice Live.
 *
 * Architecture is ported from the Kenzo / RetailDayDemo voice engine,
 * adapted for the RCM project where the browser talks straight to Azure
 * (no backend proxy → we have to use the JSON+base64 wire format that
 * Azure's Realtime API requires).
 *
 * Why this iteration is faster + more stable than the previous one:
 *
 *   1. Mic capture runs on an AudioWorklet (audio thread), not on a
 *      ScriptProcessorNode (main thread). This is the single biggest
 *      Windows / Chrome perf win — ScriptProcessor competes with React
 *      renders, layout and paint and stutters under load.
 *
 *   2. The worklet processor is inlined as a Blob URL so we don't have
 *      to serve a separate /public/worklets/*.js file. Same trick as
 *      Kenzo — works in any deployment with zero extra plumbing.
 *
 *   3. The mic + AudioContext + worklet are pre-warmed at connect()
 *      time. Toggling the "Talk" button just flips an `enabled` flag
 *      in the worklet, so it's instant — no getUserMedia round-trip,
 *      no AudioContext creation, no worklet (re)registration.
 *
 *   4. Barge-in is hard: on `input_audio_buffer.speech_started` we
 *      stop every queued audio source, reset the play cursor, and tell
 *      Azure to cancel the current response. We also expose a public
 *      bargeIn() so the UI can cut NIRA off the moment the user starts
 *      typing.
 *
 *   5. Language is locked with whisper `language: 'en'` plus an
 *      explicit "always reply in English" line in the system prompt
 *      to prevent the noise → bogus-Korean-transcript → Korean-reply
 *      drift loop.
 */

import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  pcm16ToFloat32,
  VOICE_SAMPLE_RATE,
} from './audio';
import { DEFAULT_LANGUAGE_CODE, getLanguage } from './languages';

export interface VoiceSessionConfig {
  wssUrl: string;
  altWssUrl?: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  tools: Array<Record<string, unknown>>;
}

export type VoiceClientStatus =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'error';

export interface VoiceClientEvents {
  onStatusChange: (s: VoiceClientStatus) => void;
  onUserTranscript: (delta: string, final: boolean) => void;
  onAssistantTranscript: (delta: string, final: boolean) => void;
  onError: (msg: string) => void;
  onLevel: (level: number) => void;
  onToolCall: (name: string, argsJson: string) => void;
}

interface ResponseOutputItem {
  id?: string;
  call_id?: string;
  type?: string;
  name?: string;
  arguments?: string;
  role?: string;
  content?: Array<{ type?: string; text?: string; transcript?: string }>;
}

interface RealtimeMessage {
  type: string;
  delta?: string;
  audio?: string;
  text?: string;
  transcript?: string;
  item?: ResponseOutputItem;
  response?: { output?: ResponseOutputItem[] };
  call_id?: string;
  arguments?: string;
  name?: string;
  error?: { message?: string; type?: string };
}

const VOICE_CHUNK_MS = 60;

/**
 * AudioWorklet processor — runs on the audio thread. Two postMessage
 * channels back to the main thread:
 *   { type: 'level', level: 0..1 }                 ~20Hz
 *   { type: 'pcm',   buffer: Int16Array.buffer }   when buffer fills
 */
const WORKLET_SOURCE = `
class NiraCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = (options && options.processorOptions) || {};
    this.targetRate = opts.targetSampleRate || 24000;
    this.chunkMs = opts.chunkMs || ${VOICE_CHUNK_MS};
    // Capture at the device sample rate, then resample to targetRate
    // before posting. Linear interpolation is good enough for speech.
    this.ratio = sampleRate / this.targetRate;
    this.frameSize = Math.max(256, Math.floor(sampleRate * (this.chunkMs / 1000)));
    this.queue = [];
    this.queueLen = 0;
    this.lastLevelPost = 0;
    this.peakSinceLastPost = 0;
    this.enabled = false;
    this.port.onmessage = (e) => {
      const d = e.data || {};
      if (d.type === 'enable') this.enabled = !!d.value;
    };
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];
    let peak = 0;
    for (let i = 0; i < ch.length; i++) {
      const v = ch[i] < 0 ? -ch[i] : ch[i];
      if (v > peak) peak = v;
    }
    if (peak > this.peakSinceLastPost) this.peakSinceLastPost = peak;
    if (currentTime - this.lastLevelPost > 0.05) {
      this.port.postMessage({ type: 'level', level: this.peakSinceLastPost });
      this.peakSinceLastPost = 0;
      this.lastLevelPost = currentTime;
    }
    if (!this.enabled) return true;
    this.queue.push(new Float32Array(ch));
    this.queueLen += ch.length;
    while (this.queueLen >= this.frameSize) {
      const frame = new Float32Array(this.frameSize);
      let copied = 0;
      while (copied < this.frameSize) {
        const head = this.queue[0];
        const need = this.frameSize - copied;
        if (head.length <= need) {
          frame.set(head, copied);
          copied += head.length;
          this.queue.shift();
        } else {
          frame.set(head.subarray(0, need), copied);
          this.queue[0] = head.subarray(need);
          copied += need;
        }
      }
      this.queueLen -= this.frameSize;
      const outLen = Math.floor(this.frameSize / this.ratio);
      const pcm = new Int16Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const t = i * this.ratio;
        const i0 = Math.floor(t);
        const i1 = i0 + 1 < this.frameSize ? i0 + 1 : i0;
        const frac = t - i0;
        let s = frame[i0] * (1 - frac) + frame[i1] * frac;
        if (s > 1) s = 1; else if (s < -1) s = -1;
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage({ type: 'pcm', buffer: pcm.buffer }, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor('nira-capture', NiraCaptureProcessor);
`;

interface MicMessage {
  type?: string;
  level?: number;
  buffer?: ArrayBuffer;
}

export class AzureVoiceClient {
  private events: VoiceClientEvents;
  private cfg: VoiceSessionConfig | null = null;
  private ws: WebSocket | null = null;

  // Shared AudioContext for both mic capture and TTS playback.
  // Must use a single context to avoid cross-context scheduling drift.
  private ctx: AudioContext | null = null;
  private workletRegistered = false;

  // Mic graph (pre-acquired at connect time).
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private silentSink: GainNode | null = null;

  // Playback graph.
  private playGain: GainNode | null = null;
  private playQueueTime = 0;
  private playingSources = new Set<AudioBufferSourceNode>();

  private listening = false;
  private destroyed = false;
  private assistantSpeaking = false;
  private bargedThisTurn = false;
  // null = auto-detect; whisper omits the language hint and the
  // assistant is told to mirror the user. A real code locks both ends.
  private languageCode: string | null = DEFAULT_LANGUAGE_CODE;

  constructor(events: VoiceClientEvents) {
    this.events = events;
  }

  // ------------------------------------------------------------------
  // Connection
  // ------------------------------------------------------------------
  async connect(cfg: VoiceSessionConfig): Promise<void> {
    this.cfg = cfg;
    this.events.onStatusChange('connecting');
    // Open the socket and pre-acquire the mic in parallel so the
    // "Talk" button is instant the moment we're ready.
    const micPromise = this.preAcquireMic().catch((err: unknown) => {
      // Mic permission failure is non-fatal at connect time — user
      // can still hear NIRA, and we'll surface the error if they
      // actually try to talk.
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[voice] mic pre-acquire failed:', msg);
    });
    await this.openSocket(cfg.wssUrl, cfg.altWssUrl);
    await micPromise;
  }

  private openSocket(primary: string, fallback?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tryOnce = (url: string, isFallback: boolean) => {
        let ws: WebSocket;
        try {
          ws = new WebSocket(url, ['realtime']);
        } catch (e) {
          reject(e);
          return;
        }
        let opened = false;
        let closeInfo = '';
        ws.binaryType = 'arraybuffer';
        ws.onopen = () => {
          opened = true;
          this.ws = ws;
          this.sendSessionUpdate();
          this.events.onStatusChange('ready');
          resolve();
        };
        ws.onerror = () => {
          if (!opened && !isFallback && fallback) {
            tryOnce(fallback, true);
          } else if (!opened) {
            this.events.onStatusChange('error');
            const detail = closeInfo ? ` (${closeInfo})` : '';
            this.events.onError(
              `Voice agent could not connect${detail}. Try Type mode while we look at the Azure config.`,
            );
            reject(new Error('ws connect failed' + detail));
          }
        };
        ws.onclose = (evt) => {
          if (!opened) {
            closeInfo = `code ${evt.code}${evt.reason ? `: ${evt.reason}` : ''}`;
          }
          if (this.listening) this.disableMic();
          this.assistantSpeaking = false;
          this.events.onStatusChange('idle');
        };
        ws.onmessage = (ev) => this.handleSocketMessage(ev);
      };
      tryOnce(primary, false);
    });
  }

  private sendSessionUpdate(): void {
    if (!this.ws || !this.cfg) return;
    const lang = getLanguage(this.languageCode);
    // Build the language directive that gets appended to the base
    // system prompt. With a language pinned we tell NIRA to refuse
    // to switch; with auto-detect we tell her to mirror the user.
    const langDirective = lang
      ? `\n\nLANGUAGE: Always speak and reply in ${lang.name} (${lang.native}). If you hear another language or unclear audio, assume it was background noise and politely ask the user to repeat in ${lang.name}. Never switch language mid-reply.`
      : `\n\nLANGUAGE: Auto-detect mode. Detect the language the user is speaking and reply in the same language. If unsure, default to English.`;
    const transcription: Record<string, unknown> = { model: 'whisper-1' };
    if (lang) transcription.language = lang.code;
    this.ws.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: this.cfg.systemPrompt + langDirective,
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          // When `language` is pinned, whisper won't hallucinate Korean
          // on background noise. In auto-detect mode it picks per
          // utterance — accept the trade-off the user explicitly chose.
          input_audio_transcription: transcription,
          turn_detection: {
            type: 'server_vad',
            threshold: 0.55,
            prefix_padding_ms: 250,
            silence_duration_ms: 550,
            create_response: true,
            // Tells server VAD to cut the assistant off when the user
            // starts talking. Audio-side cleanup happens locally too.
            interrupt_response: true,
          },
          tools: this.cfg.tools,
          tool_choice: 'auto',
          temperature: 0.7,
        },
      }),
    );
  }

  /** Change the active language. Pass `null` for auto-detect. Safe to
   *  call mid-session — re-issues a session.update so the next turn
   *  uses the new pin. Returns immediately; takes effect on the
   *  upstream side within a few hundred ms. */
  setLanguage(code: string | null): void {
    this.languageCode = code;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSessionUpdate();
    }
  }

  getLanguage(): string | null {
    return this.languageCode;
  }

  // ------------------------------------------------------------------
  // Audio context + mic pre-acquire
  // ------------------------------------------------------------------
  private async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctor = (window.AudioContext ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext) as typeof AudioContext;
      this.ctx = new Ctor({
        sampleRate: VOICE_SAMPLE_RATE,
        latencyHint: 'interactive',
      });
      this.playGain = this.ctx.createGain();
      this.playGain.gain.value = 1;
      this.playGain.connect(this.ctx.destination);
      this.playQueueTime = this.ctx.currentTime;
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return this.ctx;
  }

  private async preAcquireMic(): Promise<void> {
    if (this.mediaStream && this.workletNode) return;
    const ctx = await this.ensureContext();
    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Hint at the target sample rate. Browser may ignore but it
          // shaves a resample step when honored (Chromium does honor it
          // on most platforms).
          sampleRate: VOICE_SAMPLE_RATE,
        },
      });
    }
    if (!this.workletRegistered) {
      const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      try {
        await ctx.audioWorklet.addModule(url);
        this.workletRegistered = true;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (!this.sourceNode) {
      this.sourceNode = ctx.createMediaStreamSource(this.mediaStream);
    }
    if (!this.workletNode) {
      const node = new AudioWorkletNode(ctx, 'nira-capture', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          targetSampleRate: VOICE_SAMPLE_RATE,
          chunkMs: VOICE_CHUNK_MS,
        },
      });
      // Worklets only run when their output is connected somewhere in
      // the graph. We route through a silent gain → destination so the
      // user never hears their own mic.
      const silent = ctx.createGain();
      silent.gain.value = 0;
      this.sourceNode.connect(node);
      node.connect(silent);
      silent.connect(ctx.destination);
      node.port.onmessage = (e: MessageEvent<MicMessage>) =>
        this.handleMicMessage(e.data);
      this.workletNode = node;
      this.silentSink = silent;
    }
  }

  private handleMicMessage(d: MicMessage | undefined): void {
    if (!d) return;
    if (d.type === 'level' && typeof d.level === 'number') {
      this.events.onLevel(d.level);
      return;
    }
    if (d.type === 'pcm' && d.buffer && this.ws?.readyState === WebSocket.OPEN) {
      // Don't ship audio when not actively listening (worklet is
      // disabled in that case anyway, but this is a cheap belt+braces).
      if (!this.listening) return;
      const b64 = arrayBufferToBase64(d.buffer);
      this.ws.send(
        JSON.stringify({ type: 'input_audio_buffer.append', audio: b64 }),
      );
    }
  }

  // ------------------------------------------------------------------
  // Public mic toggle (now instant — just flips a flag in the worklet)
  // ------------------------------------------------------------------
  async startListening(): Promise<void> {
    if (this.listening) return;
    if (!this.workletNode) {
      try {
        await this.preAcquireMic();
      } catch {
        this.events.onError(
          'Microphone permission denied — switch to Type mode to keep chatting.',
        );
        return;
      }
    }
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
    this.listening = true;
    this.workletNode?.port.postMessage({ type: 'enable', value: true });
    this.events.onStatusChange('listening');
  }

  stopListening(): void {
    this.disableMic();
    this.events.onLevel(0);
    // Server VAD already commits + creates the response on end-of-speech.
    // Don't double-trigger.
    this.events.onStatusChange(this.assistantSpeaking ? 'speaking' : 'ready');
  }

  private disableMic(): void {
    this.listening = false;
    this.workletNode?.port.postMessage({ type: 'enable', value: false });
  }

  // ------------------------------------------------------------------
  // Barge-in (interruption)
  // ------------------------------------------------------------------
  /** Hard-stop everything the assistant is saying right now and tell
   *  Azure to abandon the current response. Safe to call from the UI
   *  (e.g. when the user starts typing in text mode). */
  bargeIn(): void {
    this.stopAllPlayback();
    if (this.assistantSpeaking && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'response.cancel' }));
      } catch {
        // ignore
      }
    }
    this.assistantSpeaking = false;
    this.bargedThisTurn = true;
  }

  private stopAllPlayback(): void {
    if (this.playGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.playGain.gain.cancelScheduledValues(now);
        this.playGain.gain.setValueAtTime(this.playGain.gain.value, now);
        this.playGain.gain.linearRampToValueAtTime(0, now + 0.03);
        this.playGain.gain.setValueAtTime(1, now + 0.06);
      } catch {
        // ignore
      }
    }
    for (const src of this.playingSources) {
      try {
        src.stop();
      } catch {
        // ignore
      }
      try {
        src.disconnect();
      } catch {
        // ignore
      }
    }
    this.playingSources.clear();
    if (this.ctx) this.playQueueTime = this.ctx.currentTime;
  }

  // ------------------------------------------------------------------
  // Outgoing helpers
  // ------------------------------------------------------------------
  /** Send a text message — used by the type-mode fallback. */
  sendText(text: string): void {
    if (!this.ws) return;
    this.bargeIn();
    this.ws.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      }),
    );
    this.ws.send(JSON.stringify({ type: 'response.create' }));
    this.events.onStatusChange('thinking');
  }

  sendToolResult(callId: string, output: unknown): void {
    if (!this.ws) return;
    this.ws.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: typeof output === 'string' ? output : JSON.stringify(output),
        },
      }),
    );
    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  close(): void {
    this.destroyed = true;
    this.disableMic();
    this.stopAllPlayback();
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
      } catch {
        // ignore
      }
      this.workletNode = null;
    }
    if (this.silentSink) {
      try {
        this.silentSink.disconnect();
      } catch {
        // ignore
      }
      this.silentSink = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.playGain = null;
      this.playQueueTime = 0;
    }
    this.assistantSpeaking = false;
  }

  // ------------------------------------------------------------------
  // Server message handling
  // ------------------------------------------------------------------
  private handleSocketMessage(ev: MessageEvent): void {
    if (typeof ev.data !== 'string') return;
    let msg: RealtimeMessage;
    try {
      msg = JSON.parse(ev.data) as RealtimeMessage;
    } catch {
      return;
    }
    switch (msg.type) {
      case 'input_audio_buffer.speech_started':
        // The instant the server detects the user started talking,
        // cut the assistant off everywhere — local audio queue,
        // upstream response, status indicator.
        this.stopAllPlayback();
        if (this.assistantSpeaking && this.ws?.readyState === WebSocket.OPEN) {
          try {
            this.ws.send(JSON.stringify({ type: 'response.cancel' }));
          } catch {
            // ignore
          }
        }
        this.assistantSpeaking = false;
        this.bargedThisTurn = true;
        if (this.listening) this.events.onStatusChange('listening');
        return;

      case 'input_audio_buffer.speech_stopped':
      case 'input_audio_buffer.committed':
        if (this.listening) this.events.onStatusChange('thinking');
        return;

      case 'response.audio.delta':
      case 'response.output_audio.delta':
        if (msg.delta) void this.scheduleAudioChunk(msg.delta);
        return;

      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta':
      case 'response.text.delta':
      case 'response.output_text.delta':
        if (msg.delta) this.events.onAssistantTranscript(msg.delta, false);
        return;

      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done':
      case 'response.text.done':
      case 'response.output_text.done': {
        const text = msg.transcript ?? msg.text;
        if (text) this.events.onAssistantTranscript(text, true);
        return;
      }

      case 'conversation.item.input_audio_transcription.delta':
        if (msg.delta) this.events.onUserTranscript(msg.delta, false);
        return;

      case 'conversation.item.input_audio_transcription.completed':
        if (msg.transcript) this.events.onUserTranscript(msg.transcript, true);
        return;

      case 'response.function_call_arguments.done':
        if (msg.call_id && msg.name) {
          this.events.onToolCall(msg.name, msg.arguments ?? '{}');
          this.dispatchToolCall(msg.call_id, msg.name, msg.arguments ?? '{}');
        }
        return;

      case 'response.output_item.done':
        if (msg.item?.type === 'function_call' && msg.item.call_id && msg.item.name) {
          this.events.onToolCall(msg.item.name, msg.item.arguments ?? '{}');
          this.dispatchToolCall(
            msg.item.call_id,
            msg.item.name,
            msg.item.arguments ?? '{}',
          );
        }
        return;

      case 'response.created':
      case 'response.in_progress':
        this.assistantSpeaking = true;
        this.bargedThisTurn = false;
        this.events.onStatusChange('speaking');
        return;

      case 'response.done':
      case 'response.cancelled':
      case 'response.canceled':
        this.assistantSpeaking = false;
        this.events.onStatusChange(this.listening ? 'listening' : 'ready');
        return;

      case 'session.created':
      case 'session.updated':
        // already 'ready' from openSocket
        return;

      case 'error': {
        const text = msg.error?.message ?? 'Azure error';
        // These two are noise — they fire if we cancel + replace fast,
        // which happens on every barge-in. Silently ignore.
        const lower = text.toLowerCase();
        if (
          lower.includes('active response in progress') ||
          lower.includes('buffer too small') ||
          lower.includes('no active response')
        ) {
          return;
        }
        this.events.onError(text);
        this.events.onStatusChange('error');
        return;
      }

      default:
        return;
    }
  }

  private dispatchToolCall(callId: string, name: string, argsJson: string): void {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(argsJson) as Record<string, unknown>;
    } catch {
      // ignore
    }
    fetch('/api/voice/tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, args }),
    })
      .then((r) => r.json())
      .then((j) => this.sendToolResult(callId, j.result))
      .catch((e) => this.events.onError(String(e)));
  }

  private async scheduleAudioChunk(b64: string): Promise<void> {
    if (this.destroyed) return;
    // If we just barged in, drop any straggler audio chunks that were
    // already in flight from the cancelled response.
    if (this.bargedThisTurn) return;
    const ctx = await this.ensureContext();
    const buf = base64ToArrayBuffer(b64);
    if (buf.byteLength === 0) return;
    const f32 = pcm16ToFloat32(buf);
    const audioBuffer = ctx.createBuffer(1, f32.length, VOICE_SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(f32);

    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(this.playGain ?? ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now + 0.005, this.playQueueTime);
    src.start(startAt);
    this.playQueueTime = startAt + audioBuffer.duration;
    this.playingSources.add(src);
    src.onended = () => {
      this.playingSources.delete(src);
      try {
        src.disconnect();
      } catch {
        // ignore
      }
    };
  }
}
