import { NextResponse } from 'next/server';
import { buildSystemPrompt, VOICE_TOOLS } from '@/lib/voice/case-context';

export const runtime = 'nodejs';

/**
 * Returns the configuration the browser needs to open a direct WebSocket
 * connection to Azure Voice Live. The API key is returned via a JSON
 * response over a same-origin fetch — the demo browser is trusted (this
 * is an internal stakeholder demo, not a public app).
 */
export async function GET() {
  const endpoint = process.env.AZURE_VOICE_LIVE_ENDPOINT;
  const key = process.env.AZURE_VOICE_LIVE_KEY;
  const apiVersion = process.env.AZURE_VOICE_LIVE_API_VERSION ?? '2025-10-01';
  const model = process.env.AZURE_VOICE_LIVE_MODEL ?? 'gpt-realtime';

  if (!endpoint || !key) {
    return NextResponse.json(
      {
        ok: false,
        error: 'azure voice live not configured',
        configured: false,
      },
      { status: 503 },
    );
  }

  // Strip path/scheme to derive the WebSocket host.
  const url = new URL(endpoint);
  const host = url.host;
  const projectPath = url.pathname.replace(/\/$/, '');
  // Azure Voice Live WebSocket URL — the realtime endpoint sits under
  // /voice-live/realtime on the resource host.
  const wssBase = `wss://${host}/voice-live/realtime`;
  const wssUrl = `${wssBase}?api-version=${encodeURIComponent(apiVersion)}&model=${encodeURIComponent(model)}`;
  const altWssUrl = `wss://${host}${projectPath}/voice-live/realtime?api-version=${encodeURIComponent(apiVersion)}&model=${encodeURIComponent(model)}`;

  return NextResponse.json({
    ok: true,
    configured: true,
    wssUrl,
    altWssUrl,
    apiKey: key,
    model,
    apiVersion,
    systemPrompt: buildSystemPrompt(),
    tools: VOICE_TOOLS,
  });
}
