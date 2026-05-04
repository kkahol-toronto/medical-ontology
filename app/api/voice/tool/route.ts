import { NextResponse } from 'next/server';
import { dispatchTool } from '@/lib/voice/case-context';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { name?: string; args?: Record<string, unknown> };
  try {
    body = (await req.json()) as { name?: string; args?: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  if (!body.name) {
    return NextResponse.json({ error: 'missing name' }, { status: 400 });
  }
  const result = await dispatchTool({ name: body.name, args: body.args ?? {} });
  return NextResponse.json({ ok: true, result });
}
