import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

let _client: BedrockRuntimeClient | null = null;

/**
 * Build a Bedrock client. We let the AWS SDK resolve credentials via its
 * default provider chain so the same code works in:
 *  - local dev   (AWS_ACCESS_KEY_ID / SECRET in .env)
 *  - Amplify     (Lambda role injected via AWS_LAMBDA_RUNTIME_API)
 *  - EC2 / ECS   (instance / task role)
 *  - SSO / CLI   (~/.aws/credentials)
 */
export function bedrockClient() {
  if (_client) return _client;
  const region = process.env.AWS_REGION ?? 'eu-west-1';
  _client = new BedrockRuntimeClient({ region });
  return _client;
}

export const DEFAULT_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? 'eu.anthropic.claude-opus-4-7';

/**
 * If the primary model is throttled or rejected we automatically retry
 * down this list. All of these are Anthropic flagship-tier in eu-west-1
 * cross-region inference profiles. Opus 4.7 has very tight TPM quotas
 * on first activation — Opus 4.6 / Sonnet 4.6 are excellent fallbacks
 * for letter drafting at far higher throughput.
 */
export const FALLBACK_MODEL_IDS = [
  'eu.anthropic.claude-opus-4-6-v1',
  'eu.anthropic.claude-sonnet-4-6',
  'eu.anthropic.claude-sonnet-4-5-20250929-v1:0',
];

const RETRYABLE_ERROR_PATTERNS = [
  /too many tokens/i,
  /throttl/i,
  /rate.?limit/i,
  /quota/i,
];

function isRetryable(err: unknown): boolean {
  const msg = (err as Error)?.message ?? '';
  return RETRYABLE_ERROR_PATTERNS.some((re) => re.test(msg));
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InvokeArgs {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  modelId?: string;
}

export interface StreamClaudeOptions extends InvokeArgs {
  /** Optional callback invoked once per attempt with the model id used. */
  onModel?: (modelId: string) => void;
}

async function* streamSingleModel(
  modelId: string,
  args: InvokeArgs,
): AsyncIterable<string> {
  const client = bedrockClient();
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: args.maxTokens ?? 1500,
    temperature: args.temperature ?? 0.2,
    system: args.system,
    messages: args.messages.map((m) => ({
      role: m.role,
      content: [{ type: 'text', text: m.content }],
    })),
  };
  const cmd = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  });
  const resp = await client.send(cmd);
  if (!resp.body) return;
  const decoder = new TextDecoder();
  for await (const event of resp.body) {
    const chunk = event.chunk?.bytes;
    if (!chunk) continue;
    try {
      const parsed = JSON.parse(decoder.decode(chunk)) as
        | { type: 'content_block_delta'; delta: { type: string; text?: string } }
        | { type: 'message_start' | 'message_delta' | 'message_stop' | 'content_block_start' | 'content_block_stop' };
      if (
        parsed.type === 'content_block_delta' &&
        parsed.delta.type === 'text_delta' &&
        parsed.delta.text
      ) {
        yield parsed.delta.text;
      }
    } catch {
      // ignore malformed chunks
    }
  }
}

/**
 * Invoke Bedrock with the Anthropic Claude Messages API and stream
 * the text deltas back as an async iterable of strings. Automatically
 * falls back to the next model in FALLBACK_MODEL_IDS on retryable
 * errors (throttling, quota, etc.) BEFORE any deltas have been emitted.
 */
export async function* streamClaude(
  args: StreamClaudeOptions,
): AsyncIterable<string> {
  const candidates = [
    args.modelId ?? DEFAULT_MODEL_ID,
    ...FALLBACK_MODEL_IDS.filter((m) => m !== (args.modelId ?? DEFAULT_MODEL_ID)),
  ];
  let lastErr: unknown = null;
  for (const modelId of candidates) {
    const iterable = streamSingleModel(modelId, args);
    const iterator = iterable[Symbol.asyncIterator]();
    try {
      // Probe the first chunk. If the model fails fast (throttle, etc.)
      // we can safely retry against the next fallback model. Once we
      // start emitting deltas we commit to that model.
      const first = await iterator.next();
      args.onModel?.(modelId);
      if (first.done) return;
      yield first.value;
      while (true) {
        const next = await iterator.next();
        if (next.done) return;
        yield next.value;
      }
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err)) throw err;
      continue;
    }
  }
  if (lastErr) throw lastErr;
}

/**
 * Bedrock is "configured" if either explicit creds are present (dev) or
 * we are running inside an AWS execution context that supplies them via
 * the SDK provider chain (Lambda / ECS / EC2). We use the presence of
 * AWS_LAMBDA_FUNCTION_NAME / AWS_EXECUTION_ENV as a strong signal.
 */
export function bedrockConfigured() {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return true;
  }
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI,
  );
}
