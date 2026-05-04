import { NextResponse } from 'next/server';
import { bedrockConfigured, streamClaude } from '@/lib/aws/bedrock';
import { buildSystemPrompt } from '@/lib/voice/case-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface Body {
  messages: ChatTurn[];
}

function encode(payload: object) {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'missing messages' }, { status: 400 });
  }
  if (!bedrockConfigured()) {
    return NextResponse.json({ error: 'bedrock not configured' }, { status: 503 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let usedModel = '';
      try {
        // Initial heartbeat so the browser flushes its SSE buffer immediately.
        controller.enqueue(encode({ event: 'open' }));
        for await (const delta of streamClaude({
          system: buildSystemPrompt(),
          messages: body.messages.slice(-12),
          maxTokens: 600,
          temperature: 0.4,
          onModel: (m) => {
            if (m !== usedModel) {
              usedModel = m;
              controller.enqueue(encode({ event: 'model', model: m }));
            }
          },
        })) {
          controller.enqueue(encode({ delta }));
        }
        controller.enqueue(encode({ event: 'done', model: usedModel }));
      } catch (err) {
        controller.enqueue(
          encode({ error: (err as Error).message ?? 'chat failed' }),
        );
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
