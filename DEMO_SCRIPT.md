# Neurostack Agentic RCM — Demo Script (≈ 18 minutes)

> Audience: NTT DATA healthcare client, RCM operations + finance leadership. Goal: show how an AWS-native agentic operating model executes the nine RCM stages end-to-end across three real encounters, with a live conversational interface.

## 0 · Pre-flight (1 min, before the meeting)

- Run `npm run dev` and open `http://localhost:3030/`.
- Confirm the **Live AI stack** badges in the hero are green (Bedrock Online · Comprehend Online · Voice Live Ready).
- Tap the orange voice orb (bottom-right) once to confirm the dock opens. Close it.
- Verify the headline KPIs render real numbers (Total billed $95,057, etc.).

## 1 · Operating model overview (2 min)

Land on `/`. Walk through:

1. **Tagline** — "Neurostack brings RCM to autonomous." Nine specialised agents over the EHR. Powered by Amazon Bedrock (Claude Opus 4.7), AWS Comprehend Medical, Azure Voice Live.
2. **Live AI stack** card — region `eu-west-1`, fallback policy from Opus 4.7 → Opus 4.6 → Sonnet 4.6 → Haiku 4.5.
3. **Swim lane** — nine RCM stages and their AI mode (AUTO / ASSIST / REVIEW). The denied stage (Denial Mgmt) is REVIEW because we keep humans in the loop on the highest-impact moments.
4. **Three case cards** — oncology hero (denied → overturned), inpatient (clean DRG 291), ASC (clean knee scope). Click into the Oncology Hero card.

## 2 · Hero case walk-through — Oncology denial (8 min)

URL: `/case/oncology`.

1. Show the three-column **Agent Console**: Stage Timeline (left) · Work Surface (centre) · Orchestration Rail (right).
2. Click **Run all 9 stages**. As stages auto-advance, narrate:
   - **Registration → Eligibility → Prior Auth**: AUTO agents execute the 270/271 dance, validate Aetna PPO eligibility, draft the prior auth packet for carbo+pem.
   - **CDI** (ASSIST): clinical documentation gap surfaced — EGFR L858R mentioned, not coded. CDI query Z13.6.
   - **Charge Capture → Coding** (AUTO/ASSIST): chemo admin codes 96413/96415/96417 + J9045/J9305 priced at contracted rates.
   - **Claims**: 837P submitted clean.
   - **Denial Mgmt** (REVIEW): claim hits CO-50 / N390 — medical necessity denial. The agent flags exception.
3. Stop on the **Denial Management** stage. Walk through the AI Denial Engine reasoning:
   - Root cause classification: clinical (medical necessity) — not administrative.
   - Pattern: same payer overturned 87% of similar EGFR-mutated NSCLC denials.
   - Bedrock Claude Opus 4.7 drafted the appeal letter citing NCCN NSCL-K p.1, Aetna Pemetrexed CPB §III, EGFR L858R, T3N2M1b staging, J91.0 pleural mets, UM-MP353 precedent.
4. Scroll to **AI Appeal Letter panel** (orange glass). Toggle **Live AI ON** and click **Generate appeal letter**.
   - Real-time SSE stream from Bedrock starts. The model badge updates if Opus 4.7 is throttled and the system falls back to Opus 4.6 / Sonnet 4.6 (tell the client this fallback is automatic and transparent).
   - When the letter completes, point out the citations come straight from the policy bundles in `data/policies/`.
5. Click into the **CDI** stage and run the **Comprehend Medical · Live extraction** panel. Real `DetectEntitiesV2 + InferICD10CM + InferRxNorm + InferSNOMEDCT` calls return 25 entities and 24 ontology hits over the chart narrative. Show the C34.90/C78.2/Z15.09 mappings with confidence scores.

## 3 · Three customer demos (5 min)

Show each customer view at the page level — these are exactly the three deliverables in the spec:

1. **AR / Denials** (`/views/ar-denials`)
   - Live denial inventory across all three encounters: 3 denials touched, 100% overturn rate, $45k recovered, AR days 19.
   - CO-50 oncology denial (overturned), CO-4 inpatient modifier (reversed), N30 inpatient provider info (reversed).
   - Walk the next-best-action workflow card.
2. **Coding / HIM** (`/views/coding-him`)
   - 24 ICD-10 codes, 7 CPT/HCPCS, $85,056 coded across 3 charts.
   - Click the **Inpatient** tab — DRG 291 with full diagnosis hierarchy and per-line CDI confidence.
   - Mention Comprehend Medical wires into the case console for live entity extraction.
3. **Finance Reconciliation** (`/views/finance-recon`)
   - 100% line-level match rate across the 835 ledger.
   - $95,057 billed → $36,615 contractual adj → $53,022 paid → $4,155 patient.
   - Close-process automation card: GL posting, variance threshold, contract validation, accruals, SOX log.

## 4 · Talk to your data — Voice agent (2 min)

Open the orange voice orb (bottom-right) anywhere in the app. Two modes:

- **Voice mode** — Azure Voice Live (`gpt-realtime`, eastus2 endpoint). Tap **Connect**, then **Talk**. Try:
  > "Walk me through the oncology denial."  
  > "Why was Mr Chen's claim denied and how much did we recover?"  
  > "Compare the inpatient and ASC encounters by patient balance."

  The agent calls the `lookup_case`, `lookup_stage`, and `lookup_payer_policy` tools server-side — its answers are grounded in the same fixtures the UI renders.

- **Type mode** — same agent, text-only, served by Bedrock Claude (with the model fallback chain). Useful when the room mic is bad or you want a quick lookup mid-meeting.

> Tip: if the dev environment has no Azure key configured, the orb shows a `setup` chip and the dock opens in Type mode. The text chat still uses real Bedrock.

## 5 · Wrap (1 min) — talking points

- **Agentic, not just generative** — every stage has a named agent, declared mode (AUTO / ASSIST / REVIEW), audit trail, and KPI delta.
- **AWS-native** — Bedrock Claude Opus 4.7 (1M-token context) for reasoning + drafting; Comprehend Medical for clinical NLP; Textract for OCR (mocked in this demo); HIPAA + SOX + OIG controls baked in.
- **Hybrid execution** — scripted replay for stable demos, **Live AI** toggle for moments that benefit from real-time generation.
- **Operating model, not a pilot** — KPIs are the contract: clean claim rate, denial overturn rate, days to payment, net collection rate. Each agent is governed against those KPIs.

---

## Quick troubleshooting

| Symptom                                                | Fix                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Bedrock "Too many requests"                            | Wait 30–60 s; the system already auto-falls back through the Claude family.  |
| Voice mode "WebSocket connection failed"               | Use Type mode; check `AZURE_VOICE_LIVE_ENDPOINT` & `_KEY` in `.env`.         |
| Comprehend Medical `not configured`                    | Set `ENABLE_COMPREHEND_MEDICAL=true` and re-export AWS credentials.          |
| Stages stuck on `queued`                               | Click **Reset**, then **Run all 9 stages**.                                  |
| Empty assistant bubble after sending text              | Check terminal log — most likely Bedrock throttle returning `ok:false`.      |

## URL map

| Page              | URL                          |
| ----------------- | ---------------------------- |
| Operating model   | `/`                          |
| Oncology hero     | `/case/oncology`             |
| Inpatient case    | `/case/inpatient`            |
| ASC case          | `/case/asc`                  |
| AR / Denials      | `/views/ar-denials`          |
| Coding / HIM      | `/views/coding-him`          |
| Finance Recon     | `/views/finance-recon`       |
| Bedrock SSE       | `POST /api/ai/bedrock/appeal`|
| Comprehend NER    | `POST /api/ai/comprehend`    |
| Voice session cfg | `GET /api/voice/session`     |
| Voice tool router | `POST /api/voice/tool`       |
| Voice text chat   | `POST /api/voice/chat`       |
| Env debug         | `GET /api/debug-env`         |
