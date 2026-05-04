import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env'), 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
  if (m) process.env[m[1]] ??= m[2];
}

async function probe(modelId) {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 60,
    temperature: 0.1,
    messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply only with the single word: pong' }] }],
  };
  const cmd = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  });
  const t0 = Date.now();
  try {
    const resp = await client.send(cmd);
    let text = '';
    for await (const ev of resp.body ?? []) {
      const c = ev.chunk?.bytes;
      if (!c) continue;
      const p = JSON.parse(new TextDecoder().decode(c));
      if (p.type === 'content_block_delta' && p.delta?.text) text += p.delta.text;
    }
    return { ok: true, modelId, ms: Date.now() - t0, text: text.trim() };
  } catch (e) {
    return { ok: false, modelId, error: String(e.message || e) };
  }
}

const candidates = [
  'eu.anthropic.claude-opus-4-7',
  'eu.anthropic.claude-opus-4-6-v1',
  'eu.anthropic.claude-sonnet-4-6',
  'eu.anthropic.claude-sonnet-4-5-20250929-v1:0',
  'eu.anthropic.claude-haiku-4-5-20251001-v1:0',
];

for (const m of candidates) {
  const r = await probe(m);
  console.log(JSON.stringify(r));
  await new Promise(r => setTimeout(r, 1500));
}
