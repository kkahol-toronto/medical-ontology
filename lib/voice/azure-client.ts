import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  float32ToPcm16,
  pcm16ToFloat32,
  resample,
  VOICE_SAMPLE_RATE,
} from './audio';

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

export class AzureVoiceClient {
  private ws: WebSocket | null = null;
  private cfg: VoiceSessionConfig | null = null;
  private events: VoiceClientEvents;
  private mic: MediaStream | null = null;
  private micCtx: AudioContext | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private playCtx: AudioContext | null = null;
  private playQueueTime = 0;
  private listening = false;

  constructor(events: VoiceClientEvents) {
    this.events = events;
  }

  async connect(cfg: VoiceSessionConfig) {
    this.cfg = cfg;
    this.events.onStatusChange('connecting');
    await this.openSocket(cfg.wssUrl, cfg.altWssUrl);
  }

  private openSocket(primary: string, fallback?: string) {
    return new Promise<void>((resolve, reject) => {
      const tryOnce = (url: string, isFallback: boolean) => {
        const proto = `openai-insecure-api-key.${this.cfg!.apiKey}`;
        let ws: WebSocket;
        try {
          ws = new WebSocket(url, [proto, 'realtime']);
        } catch (e) {
          reject(e);
          return;
        }
        let opened = false;
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
            this.events.onError(
              'WebSocket connection to Azure Voice Live failed.',
            );
            reject(new Error('ws connect failed'));
          }
        };
        ws.onclose = () => {
          if (this.listening) this.stopListening();
          this.events.onStatusChange('idle');
        };
        ws.onmessage = (ev) => this.handleMessage(ev);
      };
      tryOnce(primary, false);
    });
  }

  private sendSessionUpdate() {
    if (!this.ws || !this.cfg) return;
    this.ws.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: this.cfg.systemPrompt,
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          tools: this.cfg.tools,
          tool_choice: 'auto',
          temperature: 0.7,
        },
      }),
    );
  }

  private async ensurePlayContext() {
    if (this.playCtx) return this.playCtx;
    const Ctor = (window.AudioContext ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext) as typeof AudioContext;
    this.playCtx = new Ctor({ sampleRate: VOICE_SAMPLE_RATE });
    this.playQueueTime = this.playCtx.currentTime;
    return this.playCtx;
  }

  async startListening() {
    if (this.listening || !this.ws) return;
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      this.events.onError(
        'Microphone permission denied — switch to Type mode to keep chatting.',
      );
      return;
    }
    const Ctor = (window.AudioContext ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext) as typeof AudioContext;
    this.micCtx = new Ctor();
    const source = this.micCtx.createMediaStreamSource(this.mic);
    const proc = this.micCtx.createScriptProcessor(4096, 1, 1);
    this.micProcessor = proc;
    proc.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const resampled = resample(
        input,
        e.inputBuffer.sampleRate,
        VOICE_SAMPLE_RATE,
      );
      // Level meter for waveform
      let peak = 0;
      for (let i = 0; i < resampled.length; i++) {
        const v = Math.abs(resampled[i]);
        if (v > peak) peak = v;
      }
      this.events.onLevel(peak);
      const pcm = float32ToPcm16(resampled);
      const b64 = arrayBufferToBase64(pcm);
      this.ws?.send(
        JSON.stringify({ type: 'input_audio_buffer.append', audio: b64 }),
      );
    };
    source.connect(proc);
    proc.connect(this.micCtx.destination);
    this.listening = true;
    this.events.onStatusChange('listening');
  }

  stopListening() {
    if (!this.listening) return;
    this.listening = false;
    try {
      this.micProcessor?.disconnect();
    } catch {
      // ignore
    }
    try {
      this.micCtx?.close();
    } catch {
      // ignore
    }
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    this.micCtx = null;
    this.micProcessor = null;
    this.events.onLevel(0);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      this.ws.send(JSON.stringify({ type: 'response.create' }));
    }
    this.events.onStatusChange('thinking');
  }

  /** Send a text message — useful for the type-mode fallback inside the dock. */
  sendText(text: string) {
    if (!this.ws) return;
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

  /** Send tool result back to model. */
  sendToolResult(callId: string, output: unknown) {
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

  close() {
    this.stopListening();
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    try {
      this.playCtx?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.playCtx = null;
  }

  private async handleMessage(ev: MessageEvent) {
    let msg: RealtimeMessage | null = null;
    if (typeof ev.data === 'string') {
      try {
        msg = JSON.parse(ev.data) as RealtimeMessage;
      } catch {
        return;
      }
    } else {
      return;
    }
    if (!msg) return;
    switch (msg.type) {
      case 'response.audio.delta':
        if (msg.delta) await this.queueAudio(msg.delta);
        break;
      case 'response.audio_transcript.delta':
        if (msg.delta) this.events.onAssistantTranscript(msg.delta, false);
        break;
      case 'response.audio_transcript.done':
        if (msg.transcript)
          this.events.onAssistantTranscript(msg.transcript, true);
        break;
      case 'response.text.delta':
        if (msg.delta) this.events.onAssistantTranscript(msg.delta, false);
        break;
      case 'response.text.done':
        if (msg.text) this.events.onAssistantTranscript(msg.text, true);
        break;
      case 'conversation.item.input_audio_transcription.delta':
        if (msg.delta) this.events.onUserTranscript(msg.delta, false);
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (msg.transcript) this.events.onUserTranscript(msg.transcript, true);
        break;
      case 'response.function_call_arguments.delta':
        // streaming tool args — we wait for done
        break;
      case 'response.function_call_arguments.done':
        if (msg.call_id && msg.name) {
          this.events.onToolCall(msg.name, msg.arguments ?? '{}');
          // dispatch tool call to server
          fetch('/api/voice/tool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: msg.name,
              args: JSON.parse(msg.arguments ?? '{}'),
            }),
          })
            .then((r) => r.json())
            .then((j) => this.sendToolResult(msg!.call_id!, j.result))
            .catch((e) => this.events.onError(String(e)));
        }
        break;
      case 'response.output_item.done':
        if (msg.item?.type === 'function_call' && msg.item.call_id && msg.item.name) {
          this.events.onToolCall(msg.item.name, msg.item.arguments ?? '{}');
          fetch('/api/voice/tool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: msg.item.name,
              args: JSON.parse(msg.item.arguments ?? '{}'),
            }),
          })
            .then((r) => r.json())
            .then((j) => this.sendToolResult(msg!.item!.call_id!, j.result))
            .catch((e) => this.events.onError(String(e)));
        }
        break;
      case 'response.done':
        this.events.onStatusChange(this.listening ? 'listening' : 'ready');
        break;
      case 'response.created':
      case 'response.in_progress':
        this.events.onStatusChange('speaking');
        break;
      case 'session.created':
      case 'session.updated':
        // ready
        break;
      case 'error':
        this.events.onError(msg.error?.message ?? 'Azure error');
        this.events.onStatusChange('error');
        break;
      default:
        // unhandled events ignored
        break;
    }
  }

  private async queueAudio(b64: string) {
    const ctx = await this.ensurePlayContext();
    const buf = base64ToArrayBuffer(b64);
    const f32 = pcm16ToFloat32(buf);
    const audioBuffer = ctx.createBuffer(1, f32.length, VOICE_SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(f32);
    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    if (this.playQueueTime < ctx.currentTime) this.playQueueTime = ctx.currentTime;
    src.start(this.playQueueTime);
    this.playQueueTime += audioBuffer.duration;
  }
}
