import { NextResponse } from 'next/server';
import { getCase } from '@/data/cases';
import {
  analyseClinicalText,
  comprehendConfigured,
} from '@/lib/aws/comprehend-medical';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { caseId?: string; text?: string };
  try {
    body = (await req.json()) as { caseId?: string; text?: string };
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  let text = body.text;
  if (!text && body.caseId) {
    const c = getCase(body.caseId);
    if (!c) return NextResponse.json({ error: 'unknown case' }, { status: 404 });
    text = c.clinicalNarrative;
  }
  if (!text) {
    return NextResponse.json({ error: 'missing text' }, { status: 400 });
  }
  if (!comprehendConfigured()) {
    return NextResponse.json(
      { error: 'comprehend medical not configured' },
      { status: 503 },
    );
  }

  try {
    const result = await analyseClinicalText(text);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message ?? 'comprehend medical failed',
      },
      { status: 502 },
    );
  }
}
