# Neurostack — Agentic RCM Demo

Interactive demonstration of an autonomous Revenue Cycle Management operating model for an NTT DATA healthcare client. Nine specialised agents covering Patient Registration → Payment & Collections, executing on top of an EHR, powered by **Amazon Bedrock (Claude Opus 4.7)**, **AWS Comprehend Medical**, and an **Azure Voice Live** conversational agent.

Three real-feeling encounters drive the demo:

- **Oncology Infusion · Aetna** — hero case, denied + overturned via AI Appeal Agent.
- **Inpatient Stay · Medicare** — DRG 291 (CHF + MCC), AI-prevented coding denials.
- **Outpatient ASC · BCBS-TX** — clean knee scope, 100% denial prevention.

## Prerequisites

- Node.js ≥ 20
- AWS account with Bedrock + Comprehend Medical access in `eu-west-1`
- Azure Voice Live resource (optional — text-mode chat works without it)

## Setup

```bash
npm install
cp .env.example .env
# fill in AWS_*, BEDROCK_MODEL_ID, ENABLE_COMPREHEND_MEDICAL,
#         AZURE_VOICE_LIVE_ENDPOINT/KEY/API_VERSION/MODEL
npm run dev
# open http://localhost:3030
```

## Environment variables

| Variable                       | Purpose                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS programmatic credentials.                                                                             |
| `AWS_REGION`                   | Defaults to `eu-west-1`. Bedrock + Comprehend endpoints use this.                                                        |
| `BEDROCK_MODEL_ID`             | `eu.anthropic.claude-opus-4-7` (cross-region inference profile). Falls back automatically to Opus 4.6 / Sonnet 4.6.       |
| `ENABLE_COMPREHEND_MEDICAL`    | `true` enables real Comprehend Medical calls; otherwise the panel reports "not configured".                              |
| `AZURE_VOICE_LIVE_ENDPOINT`    | e.g. `https://<resource>.services.ai.azure.com/api/projects/<project>`                                                   |
| `AZURE_VOICE_LIVE_KEY`         | Voice Live API key.                                                                                                       |
| `AZURE_VOICE_LIVE_API_VERSION` | `2025-10-01`                                                                                                              |
| `AZURE_VOICE_LIVE_MODEL`       | `gpt-realtime`                                                                                                            |

## Architecture

| Layer            | Tech                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router) · React 19 · TypeScript                       |
| Styling          | Tailwind CSS v4 · custom glassmorphic theme · Framer Motion           |
| Reasoning LLM    | Bedrock Anthropic Claude Opus 4.7 (1M context) + auto-fallback chain  |
| Clinical NLP     | AWS Comprehend Medical (`DetectEntitiesV2`, `InferICD10CM`, `InferRxNorm`, `InferSNOMEDCT`) |
| Voice agent      | Azure Voice Live (`gpt-realtime`) over WebSocket, with Bedrock text-chat fallback |
| Streaming        | Server-Sent Events for the appeal-letter generator                   |
| Demo data        | Hand-curated TypeScript fixtures in `data/cases/*`                    |
| Policy bundles   | Markdown extracted from PDF policies into `data/policies/*`           |

## Code map

```
app/
├── page.tsx                   Operating-model landing
├── case/[id]/page.tsx         3-column Agent Console per case
├── views/
│   ├── ar-denials/            AR & denials customer view
│   ├── coding-him/            Coding / HIM customer view
│   └── finance-recon/         Finance reconciliation customer view
└── api/
    ├── ai/bedrock/appeal/     SSE — appeal letter generator
    ├── ai/comprehend/         POST — Comprehend Medical entity extraction
    ├── voice/session/         GET — Azure Voice Live session config
    ├── voice/tool/            POST — voice agent tool dispatcher
    ├── voice/chat/            POST — text chat (Bedrock)
    └── debug-env/             GET — env var inspection

components/
├── glass/                     GlassCard, GlassButton, Aurora background
├── voice/                     VoiceDock, Waveform
├── CaseConsole.tsx            Case console orchestrator
├── StageTimeline.tsx          Stage timeline (left rail)
├── AgentWorkSurface.tsx       Stage detail + reasoning trace
├── OrchestrationRail.tsx      Right rail (KPIs + audit)
├── AppealLetterPanel.tsx      Hero appeal-letter generator (SSE)
├── ComprehendMedicalPanel.tsx Live Comprehend Medical extraction
├── CodingExplorer.tsx         Coding / HIM workspace
├── SwimLane.tsx               9-stage swim lane on the landing page
├── KpiTile.tsx                KPI tile component
└── CaseCard.tsx               Case-card component

lib/
├── aws/bedrock.ts             Bedrock client + auto-fallback model chain
├── aws/comprehend-medical.ts  Comprehend Medical client
├── voice/azure-client.ts      Browser WebSocket client for Voice Live
├── voice/audio.ts             PCM16 ↔ Float32 conversion + resampling
├── voice/case-context.ts      System prompt + tool definitions for the agent
├── agents/runner.ts           useAgentRunner hook (replay state machine)
├── types.ts                   RcmCase / DenialEvent / etc.
└── utils.ts                   cn, formatCurrency, formatPercent, sleep

data/
├── cases/{oncology,inpatient,asc}.ts   typed case fixtures
└── policies/*.md                       extracted payer policies

scripts/
├── extract-policies.ts        PDF → Markdown extractor
└── probe-bedrock.mjs          Bedrock model availability probe
```

## Demo

See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the full ~18-minute walkthrough.
