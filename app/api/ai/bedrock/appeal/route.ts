import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getCase } from '@/data/cases';
import { bedrockConfigured, DEFAULT_MODEL_ID, streamClaude } from '@/lib/aws/bedrock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  caseId: string;
}

const POLICY_ROOT = path.join(process.cwd(), 'data', 'policies');

async function loadPolicy(slug: string): Promise<string> {
  try {
    const md = await fs.readFile(
      path.join(POLICY_ROOT, `${slug}.md`),
      'utf8',
    );
    return md;
  } catch {
    return '';
  }
}

function encodeSse(payload: object) {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function buildOncologyPrompt(
  c: NonNullable<ReturnType<typeof getCase>>,
  denial: NonNullable<ReturnType<typeof getCase>>['denials'][0],
  aetnaPemetrexed: string,
  keytruda: string,
) {
  const dxList = c.diagnoses
    .map((d) => `- ${d.code} (${d.description})${d.notes ? ` — ${d.notes}` : ''}`)
    .join('\n');

  return `## CONTEXT — PATIENT
Name: ${c.patient.name}
DOB: ${c.patient.dob}, Age ${c.patient.age}, ${c.patient.gender}
MRN: ${c.patient.mrn}
Payer: ${c.insurance.primaryPayer} · Member ${c.insurance.memberId}
Encounter: ${c.encounter.encounterNumber} · ${c.encounter.serviceDate} · ${c.encounter.encounterType}
Stage / DRG: ${c.encounter.cancerStage ?? c.encounter.drg ?? '—'}
Attending: ${c.encounter.attending}

## CONTEXT — CLINICAL NARRATIVE
${c.clinicalNarrative}

## CONTEXT — DIAGNOSES
${dxList}

## CONTEXT — DENIAL
Claim ${denial?.claimNumber}
Denial code: ${denial?.code} — ${denial?.category}
Denial reason (verbatim from payer): "${denial?.reason}"
Billed: $${denial?.billed?.toLocaleString()} · Denied: $${denial?.denied?.toLocaleString()}

## REFERENCE POLICY 1 — AETNA PEMETREXED CPB (excerpt)
${aetnaPemetrexed.slice(0, 2200)}

## REFERENCE POLICY 2 — UM-MP353 KEYTRUDA (precedent excerpt)
${keytruda.slice(0, 1200)}

## TASK
Draft a formal appeal letter to the Aetna Medical Director requesting the CO-50 denial be OVERTURNED. The letter must:
1. Open with the claim/member identifiers and the request.
2. Provide a numbered "Clinical justification" section (4–5 points) covering: disease characterisation, performance status, regimen selection rationale citing NCCN, alignment with the Aetna Pemetrexed CPB §III medical necessity criteria, and the analogous UM-MP353 precedent.
3. Quote specific page/section references when citing policies.
4. Close with a respectful overturn request and the attending oncologist's signature block.
5. Output ONLY the letter body in Markdown — no preamble, no commentary.`;
}

function buildBehavioralHealthPrompt(
  c: NonNullable<ReturnType<typeof getCase>>,
  denial: NonNullable<ReturnType<typeof getCase>>['denials'][0],
  asamLoc: string,
  locusGuide: string,
  tnGuide: string,
  medNecessity: string,
) {
  const dxList = c.diagnoses
    .map((d) => `- ${d.code} (${d.description})${d.notes ? ` — ${d.notes}` : ''}`)
    .join('\n');

  return `## CONTEXT — PATIENT
Name: ${c.patient.name}
DOB: ${c.patient.dob}, Age ${c.patient.age}, ${c.patient.gender}
MRN: ${c.patient.mrn}
Payer: ${c.insurance.primaryPayer} · Member ${c.insurance.memberId}
Encounter: ${c.encounter.encounterNumber} · ${c.encounter.serviceDate} · ${c.encounter.encounterType}
Length of stay: ${c.encounter.los ?? 8} days
Attending: ${c.encounter.attending}

## CONTEXT — CLINICAL NARRATIVE
${c.clinicalNarrative}

## CONTEXT — DIAGNOSES
${dxList}

## CONTEXT — DENIAL
Claim ${denial?.claimNumber}
Denial code: ${denial?.code} — ${denial?.category}
Denial reason (verbatim from payer): "${denial?.reason}"
Billed: $${denial?.billed?.toLocaleString()} · Denied: $${denial?.denied?.toLocaleString()}

## REFERENCE POLICY 1 — ASAM LOC CRITERIA (excerpt)
${asamLoc.slice(0, 1800)}

## REFERENCE POLICY 2 — LOCUS UTILIZATION GUIDE (excerpt)
${locusGuide.slice(0, 1200)}

## REFERENCE POLICY 3 — TN BH ACUTE INPATIENT GUIDE (excerpt)
${tnGuide.slice(0, 1200)}

## REFERENCE POLICY 4 — MEDICAL NECESSITY CRITERIA (excerpt)
${medNecessity.slice(0, 1000)}

## TASK
Draft a formal first-level claim appeal letter to UnitedHealthcare requesting overturn of CO-50 + BH-LOS-06 denial for inpatient days 6–8. The letter must:
1. Open with claim/member identifiers and overturn request.
2. Provide numbered "Clinical justification" covering: active suicidal ideation with plan, psychotic symptoms requiring titration, daily C-SSRS/MSE trend days 1–8, why PHP/residential was unsafe, and ASAM Level 4 / LOCUS Level 6 criteria.
3. Cite ASAM, LOCUS, and TN BH acute inpatient guide where applicable.
4. Close with psychiatrist signature block for Dr. Maya Patel, MD.
5. Output ONLY the letter body in Markdown.`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const c = getCase(body.caseId);
  if (!c) {
    return NextResponse.json({ error: 'unknown case' }, { status: 404 });
  }
  if (!bedrockConfigured()) {
    return NextResponse.json(
      { error: 'bedrock not configured (set AWS env vars)' },
      { status: 503 },
    );
  }

  const denial = c.denials[0];
  const system = `You are an expert revenue-cycle management agent drafting a formal appeal letter to a payer to overturn a denied medical claim. You have full access to the patient's clinical record, the payer's coverage policy, and level-of-care criteria. Cite source material precisely and write in a calm, professional tone suitable for the payer's medical director. Output Markdown.`;

  let userPrompt: string;
  if (c.id === 'behavioralHealth') {
    const [asamLoc, locusGuide, tnGuide, medNecessity] = await Promise.all([
      loadPolicy('bh-asam-loc'),
      loadPolicy('bh-locus-guide'),
      loadPolicy('bh-tn-acute-inpatient'),
      loadPolicy('bh-medical-necessity'),
    ]);
    userPrompt = buildBehavioralHealthPrompt(
      c,
      denial,
      asamLoc,
      locusGuide,
      tnGuide,
      medNecessity,
    );
  } else {
    const aetnaPemetrexed = await loadPolicy('aetna-pemetrexed');
    const keytruda = await loadPolicy('um-mp353-keytruda');
    userPrompt = buildOncologyPrompt(c, denial, aetnaPemetrexed, keytruda);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let usedModel = DEFAULT_MODEL_ID;
      try {
        controller.enqueue(
          encodeSse({ event: 'start', model: DEFAULT_MODEL_ID }),
        );
        for await (const delta of streamClaude({
          system,
          messages: [{ role: 'user', content: userPrompt }],
          maxTokens: 1800,
          temperature: 0.2,
          onModel: (m) => {
            if (m !== usedModel) {
              usedModel = m;
              controller.enqueue(encodeSse({ event: 'model', model: m }));
            }
          },
        })) {
          controller.enqueue(encodeSse({ delta }));
        }
        controller.enqueue(encodeSse({ done: true, model: usedModel }));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encodeSse({
            error: (err as Error).message ?? 'bedrock stream failed',
          }),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
