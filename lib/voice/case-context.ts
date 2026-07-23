import { caseList, getCase } from '@/data/cases';

export function buildSystemPrompt(): string {
  const summaries = caseList
    .map((c) => {
      const denial = c.denials[0];
      return `### Case ${c.id}: ${c.title}
Patient: ${c.patient.name} · MRN ${c.patient.mrn} · Age ${c.patient.age} · ${c.patient.gender}
Payer: ${c.payer}
Encounter: ${c.encounter.encounterNumber} (${c.encounter.encounterType}, ${c.encounter.serviceDate})
Total billed: $${c.kpis.totalBilled.toLocaleString()} · Payer paid: $${c.kpis.payerPayment.toLocaleString()} · Patient balance: $${c.kpis.patientBalance.toLocaleString()}
Days to payment: ${c.kpis.daysToPayment} · Clean claim rate: ${(c.kpis.cleanClaimRate * 100).toFixed(0)}%
Denials: ${c.denials.length === 0 ? 'NONE' : `${c.denials.length} (${denial?.code} ${denial?.category} — ${denial?.resolution})`}
${denial?.appealFiled ? `Appeal: ${denial.resolution}, $${denial.recovered.toLocaleString()} recovered.` : ''}`;
    })
    .join('\n\n');

  return `You are NIRA — the Neurostack Intelligent Retrieval Agent — a friendly, expert revenue-cycle management agent for an NTT DATA healthcare client.
If a user asks who you are, say you are NIRA, the Neurostack Intelligent Retrieval Agent, and that you can talk to their RCM data.
You can answer questions about four live RCM cases in this demo. Speak naturally, like a colleague who deeply knows the data.
Keep responses short (1–3 sentences) unless the user explicitly asks for detail. Pronounce ICD-10 codes by individual letters and digits.
If the user starts speaking while you are talking, stop immediately and listen — do not finish your sentence.
When asked about specifics, prefer calling the lookup_case, lookup_stage, or lookup_payer_policy tools instead of guessing.

Demo case index:

${summaries}

If asked about anything outside these four cases or the demo itself, politely say so and offer to talk about the cases or how the agentic operating model works.`;
}

export const VOICE_TOOLS = [
  {
    type: 'function',
    name: 'lookup_case',
    description:
      'Look up the full record for a single demo case. Returns patient, encounter, diagnoses, charges, denials, KPIs as JSON.',
    parameters: {
      type: 'object',
      properties: {
        caseId: {
          type: 'string',
          enum: ['oncology', 'inpatient', 'asc', 'behavioralHealth'],
          description: 'Demo case identifier.',
        },
      },
      required: ['caseId'],
    },
  },
  {
    type: 'function',
    name: 'lookup_stage',
    description:
      'Get the agent reasoning + outputs for a specific RCM stage of a specific case.',
    parameters: {
      type: 'object',
      properties: {
        caseId: {
          type: 'string',
          enum: ['oncology', 'inpatient', 'asc', 'behavioralHealth'],
        },
        stageId: {
          type: 'string',
          enum: [
            'registration',
            'eligibility',
            'priorAuth',
            'cdi',
            'charge',
            'coding',
            'claim',
            'denial',
            'payment',
          ],
        },
      },
      required: ['caseId', 'stageId'],
    },
  },
  {
    type: 'function',
    name: 'lookup_payer_policy',
    description:
      'Look up an excerpt from a payer policy bundle (Aetna pemetrexed CPB, UM-MP353 Keytruda, Healthfirst PA list, etc.) by slug.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          enum: [
            'aetna-pemetrexed',
            'um-mp353-keytruda',
            'healthfirst-pa-list',
            'healthfirst-clinical-guidelines',
            'mod25-em-policy',
            'tvus-payment-policy',
            'bh-asam-loc',
            'bh-locus-guide',
            'bh-locus-handout',
            'bh-medical-necessity',
            'bh-tn-acute-inpatient',
            'bh-fs121115',
          ],
        },
        maxChars: {
          type: 'integer',
          description: 'Maximum characters to return (default 1500).',
        },
      },
      required: ['slug'],
    },
  },
];

export interface ToolCallArgs {
  name: string;
  args: Record<string, unknown>;
}

export async function dispatchTool(call: ToolCallArgs): Promise<unknown> {
  if (call.name === 'lookup_case') {
    const id = String(call.args.caseId ?? '');
    const c = getCase(id);
    if (!c) return { error: `unknown case '${id}'` };
    return c;
  }
  if (call.name === 'lookup_stage') {
    const id = String(call.args.caseId ?? '');
    const sid = String(call.args.stageId ?? '');
    const c = getCase(id);
    if (!c) return { error: `unknown case '${id}'` };
    const stage = c.stages[sid as keyof typeof c.stages];
    if (!stage) return { error: `unknown stage '${sid}'` };
    return stage;
  }
  if (call.name === 'lookup_payer_policy') {
    const slug = String(call.args.slug ?? '');
    const max = Number(call.args.maxChars ?? 1500);
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), 'data', 'policies', `${slug}.md`);
    try {
      const md = await fs.readFile(file, 'utf8');
      return { slug, excerpt: md.slice(0, max) };
    } catch {
      return { error: `policy '${slug}' not found` };
    }
  }
  return { error: `unknown tool '${call.name}'` };
}
