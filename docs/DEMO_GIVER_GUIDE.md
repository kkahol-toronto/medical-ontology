# Demo Giver Guide — Neurostack Agentic RCM

> **Live URL:** https://main.d22hp05xqwvydi.amplifyapp.com  
> **Local:** http://localhost:3030 (`npm run dev -- -p 3030`)  
> **Runtime:** 22–28 minutes full walkthrough · modular (any section stands alone)  
> **Audience:** Healthcare RCM, finance, UM/clinical ops, and IT leadership

---

## What you are showing

Nine AI agents execute the full revenue cycle on top of an EHR — eligibility through collections — on **four real demo encounters**:

| Case | Patient | Payer | Story |
|------|---------|-------|-------|
| **Oncology** (hero) | Mr. Chen | Aetna | CO-50 denial → AI appeal → overturn in 6 days |
| **Inpatient** | Mary Patel | BCBS-TX | Clean ICU stay · DRG 291 · full PCS coding |
| **ASC** | — | Empire BCBS | Clean arthroscopy · first-pass · 4 days to payment |
| **Behavioral Health** (new) | Jordan M. Ellis | UHC | CO-50 + BH-LOS-06 · 8-day acute psych · $10,673 appeal recovery |

Plus: **portfolio analytics**, **NIRA voice/text**, and a **Zep-style knowledge graph** for the BH case.

---

## Pre-flight (5 minutes before the meeting)

1. Open https://main.d22hp05xqwvydi.amplifyapp.com — confirm landing page loads with **4 case cards** and KPI strip says **4 cases**.
2. Tap the **orange orb** (bottom-right) → NIRA dock opens. Switch to **Voice** → confirm brief `ws connected`. Close dock.
3. Pre-open tabs (fast switching):
   - `/case/oncology` — hero case
   - `/views/analytics` — CFO view
   - `/views/behavioral-health` — knowledge graph (optional highlight)
   - `/case/behavioralHealth?stage=denial` — BH agent console at denial stage
4. Have these NIRA phrases ready:
   - *"Walk me through the oncology denial."*
   - *"Tell me about the behavioral health appeal."*
   - *"Compare denial rates between United and Medicare."*

---

## Recommended demo flow

### 1 · Landing & pitch (2 min) — `/`

**Say:**
> "We rebuilt revenue cycle as nine specialised AI agents on top of your EHR. Every recommendation is grounded in your contracts, clinical policies, and patient data — and you can talk to it through NIRA."

**Point at:**
- Headline KPIs (now **4 cases**, ~$105k+ billed portfolio)
- Swim lane — nine RCM stages (AUTO / ASSIST / REVIEW bands)
- **Four case cards** — note BH as the new acute psychiatry denial appeal

**Click:** Oncology card (or "Start with the oncology hero case")

---

### 2 · Oncology hero case (8 min) — `/case/oncology`

Use the existing deep walkthrough in [DEMO_SCRIPT.md](../DEMO_SCRIPT.md) sections 2–3. Hit these beats:

1. **Agent console layout** — timeline · work surface · orchestration rail
2. **Prior Authorization** — real-time portal probe, EDI 278, NCCN + payer CPB contradiction (*smoking gun*)
3. **Coding** — explainability per code, editable overrides
4. **Denial → Appeal → Payment** — AI Appeal Agent timeline, overturn, ERA posting
5. **Collections** — propensity-to-pay model (FICO, income, personalised plan tiers)

**Optional:** Patient summary (`/case/oncology/summary`) — one-page brief for a denials manager.

---

### 3 · Analytics (3 min) — `/views/analytics`

**Say:**
> "This is what the CFO sees — portfolio-wide, drill-through to encounter level."

Walk: 10-card KPI strip → trends by health plan → AR aging → denial root causes with AI recommendations → click a case card to expand inline benchmark table.

---

### 4 · Behavioral Health case (5 min) — two stops

#### A · Agent console — `/case/behavioralHealth?stage=denial`

**Say:**
> "Fourth case: acute inpatient psychiatry. UnitedHealthcare denied days 6–8 on CO-50 plus their proprietary BH-LOS-06 continued-stay code — $10,673 at risk."

**Show:**
- **Denial stage** — CO-50 / BH-LOS-06, insufficient continued-stay documentation
- **Appeal stage** — AI Appeal Agent cites LOCUS Level 6, ASAM Level 4, daily C-SSRS/MSE trend, command hallucinations, PHP ruled unsafe
- **Top nav → Behavioral Health** or link to ontology view

**Key clinical facts (memorise):**
- Jordan M. Ellis, 38, severe MDD with psychotic features, PHQ-9 **24**, C-SSRS **High** at admission
- 8-day stay (05/06–05/14/2026), Lakeshore Behavioral Health Center, Columbus OH
- Auth UHC-BH-IP-2026-77419 — partial extension days 4–5, full stay validated post-appeal
- **100% overturn** · paid 06/02/2026

#### B · Knowledge graph — `/views/behavioral-health`

**Say:**
> "This is a Zep-style ontology — 1,000 entities and 2,200+ relationships linking the patient, encounter, diagnoses, LOCUS/ASAM criteria, payer policies, and every piece of appeal evidence."

**Demo steps:**
1. Confirm header KPIs: billed · denied · recovered · days to payment
2. Graph loads with **Focus neighborhood** ON (default)
3. **Search** `appeal` → click **AI Appeal — Days 6–8 Overturn**
4. Point at the focused subgraph — if hub node shows "Showing 35 of 717 connections", explain: *"Hub nodes cap at 36 most important relations; full list is in the Relations panel."*
5. Click a **policy section** node (orange) → read the **Summary** in the right panel (now full paragraphs, not one-liners)
6. Click a relation in the panel to jump nodes — show graph recenters
7. Toggle **Focus neighborhood** off to show full graph hairball, then back on

**Deep links to bookmark:**
- `/views/behavioral-health?node=bh_denial_co50` — denial node
- `/views/behavioral-health?node=bh_appeal_2026` — appeal hub
- `/views/behavioral-health?node=bh_encounter_0417` — encounter

---

### 5 · NIRA conversational demo (2–3 min)

Tap orange orb.

**Voice mode:**
1. *"Walk me through the oncology denial."*
2. *"Tell me about the behavioral health case."*
3. *"Why was Jordan Ellis's claim denied?"*

**Text mode:**
- *"Compare denial rates between United and Medicare."*
- *"What LOCUS level did the BH patient require?"*

**Say:**
> "Same data layer the UI uses — voice via Azure Voice Live, reasoning via Bedrock Claude with automatic model fallback."

---

### 6 · Quick tour of other cases (2 min)

- **`/case/inpatient`** — DRG 291, ICD-10-PCS, clean claim
- **`/case/asc`** — boring on purpose: first-pass, 4 days to payment

---

### 7 · Close (1 min) — back to `/`

Four punch lines:
1. Nine agents, four encounter types, one platform
2. Grounded in NCCN, payer CPBs, LOCUS/ASAM, and your ledger
3. AWS-native EU hosting + conversational NIRA
4. Bolt on top of your EHR — AR team becomes an exception team

**Hand-off:** Live URL + GitHub repo link from README.

---

## Timing cheat sheet

| Segment | Minutes | Can skip if short on time? |
|---------|---------|---------------------------|
| Landing pitch | 2 | No |
| Oncology hero | 8 | Trim PA panel to E only |
| Analytics | 3 | Yes — show KPI strip only |
| BH console + graph | 5 | Console only (3 min) |
| NIRA | 2–3 | Text-only if voice fails |
| Other cases | 2 | Yes |
| Close | 1 | No |

---

## When something goes wrong

| Symptom | What to say | Fix |
|---------|-------------|-----|
| NIRA voice `ws connect failed` | "Voice reconnects automatically — same answer in text." | Switch to **Type** tab |
| Bedrock throttles | "Watch the model badge fall back live." | Point at badge, continue |
| Graph is a solid orange blob | "That's the full 1,000-node view — I'll focus one entity." | Enable **Focus neighborhood**, click a specific node |
| Hub node "Showing X of Y connections" | "High-connection nodes cap at 36 priority relations — full list in Relations panel." | Use Relations panel to navigate |
| Summary panel looks empty | Click a different node; refresh page | |
| Live AI toggle slow | "Lambda cold start — production is sub-100ms warm." | Move on, return later |

---

## Live AI toggle (optional power demo)

Top-right **Live AI** on any case console:
- **Appeal letter** streams from Bedrock (Denial stage)
- **Comprehend Medical** extracts entities live (CDI stage)
- **NIRA** uses real voice + Bedrock text

If AWS/Azure credentials are missing in the environment, agents fall back to scripted replay gracefully.

---

## One-paragraph email takeaway (paste after the meeting)

> We demonstrated Neurostack Agentic RCM across four encounters: Stage IV NSCLC denial overturned in 6 days; clean inpatient DRG/PCS coding; ASC first-pass payment; and a new behavioral health acute psychiatry case where UHC denied days 6–8 (CO-50 + BH-LOS-06) and the AI appeal recovered $10,673. We showed portfolio analytics, a 1,000-node Zep-style knowledge graph linking clinical evidence to payer policy, and NIRA — voice and streaming text against the same data layer. Live: https://main.d22hp05xqwvydi.amplifyapp.com

---

## Related docs

- [DEMO_SCRIPT.md](../DEMO_SCRIPT.md) — detailed oncology panel-by-panel script
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Amplify deploy runbook for CI/CD team
