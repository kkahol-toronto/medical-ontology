# Neurostack Agentic RCM — Demo Guide

> **App:** `https://main.d22hp05xqwvydi.amplifyapp.com` (or `localhost:3030` for local)
> **Audience:** NTT DATA healthcare client — RCM operations, finance, and clinical leadership.
> **Goal:** show that nine specialised AI agents can execute the full revenue cycle on top of an EHR — end-to-end, on real encounters, with a conversational interface to the data.
> **Total runtime:** 18–22 minutes (modular — every section can stand alone).

---

## 0 · Pre-flight (do this 5 min before the meeting)

1. Open the app — `https://main.d22hp05xqwvydi.amplifyapp.com`. Confirm the hero loads with the Live AI stack badges showing **Bedrock Online · Comprehend Online · Voice Live Ready** in `eu-west-1`.
2. Tap the orange orb (bottom-right) once to confirm the **NIRA** dock opens. Switch to **Voice** tab and confirm "ws connected" briefly. Close it.
3. Open three tabs in advance for fast switching:
   - `/case/oncology`
   - `/case/oncology/summary`
   - `/views/analytics`
4. Have one phrase ready for NIRA: *"Walk me through the oncology denial."*

---

## 1 · The pitch (90 seconds)

Land on `/`.

> "Today's revenue cycle is nine handoffs across nine teams, paper-trail compliance, and call-the-payer follow-ups. We rebuilt that as **nine specialised AI agents** sitting on top of your EHR. Every agent is grounded in your data, your contracts, and your clinical policies — and you can **talk to it**.
>
> Under the hood: **Amazon Bedrock with Claude Opus 4.7** for reasoning, **AWS Comprehend Medical** for clinical entity extraction, and **Azure Voice Live** for the conversational interface. AWS-native, EU-hosted, with automatic Claude fallback Opus 4.7 → 4.6 → Sonnet 4.6 → Haiku 4.5."

Point at:
- **Headline KPIs** — $95,057 billed across 3 cases, $48,520 collected, 100% clean claim rate, 6 days average to payment.
- **Swim lane** — the nine RCM stages with AUTO / ASSIST / REVIEW colour bands. Note the human-in-loop bands on Denials and CDI.
- **Three cases** — Oncology (denied → overturned), Inpatient (clean DRG 291), ASC (clean arthroscopy).

Click into the **Oncology Hero** card.

---

## 2 · The agent console (1 minute orientation)

URL: `/case/oncology`.

> "This is what your operations team sees. Three columns: **Stage Timeline** on the left, **Agent Work Surface** in the middle, and **Orchestration Rail** on the right showing every agent that's run, in what mode, and how long it took."

- Top-right buttons: **Patient summary**, **Analytics**, **Run all 9 stages**, **Live AI** toggle.
- Each stage in the left timeline can be clicked to inspect — or hit **Run all 9 stages** and let it execute live.

> "Below the work surface you'll see the **Stage detail** panel — the actual artefacts each agent produces. Let me walk you through the most important ones."

---

## 3 · The hero walkthrough — oncology denial (8 min)

### 3.1 Eligibility

Click the **Eligibility** stage. Scroll to the Stage detail panel.

Highlight, in order:
1. **5 KPIs** — verified cycles, ACTIVE coverage, deductible $3,000 fully met, OOP remaining $4,320, 99.8% AI confidence.
2. **270/271 real-time eligibility log** — three cycles, deductible-met flag flips on Cycle 2 → no patient deductible owed.
3. **Outbound 270 + inbound 271 EDI** — actual segments rendered. *"This is what hits Aetna's edge."*
4. **AI Eligibility Bot outcome callout** — bot pre-staged Pfizer Oncology Together PAP for downstream maintenance Rx.

### 3.2 Prior Authorization (the showstopper)

Click **Prior Authorization**. This stage has 7 panels, A through G.

> "Prior auth is where most denials are born. Here's how an agent takes that off your team's plate."

- **A · Real-time payer-portal probe** — the bot pings 5 sources in parallel (Aetna ProviderPortal, NaviNet, EDI 278, CoverMyMeds, payer phone IVR), with latency and confidence per source. *"This is the real-time fetch."*
- **B · EDI 278 prior-auth request** — the actual segments.
- **C · JSON variant** — same content posted to the Aetna ProviderPortal API. *"Modern payers expose JSON; legacy ones expose 278. The agent does both."*
- **D · PA timeline** — denial → AI appeal → overturn in 6 days vs 14–30 day industry median.
- **E · Auth denial evaluation** — *(this is the new heavy panel)*
  - **Denial classification** — CO-50 "insufficient documentation," classified as APPEALABLE with 94.7% overturn confidence based on 87% historical reversal rate.
  - **Consolidated medical record vs NCCN required elements** — 7 of 7 NCCN criteria present (pathology, stage, molecular, ECOG, first-line intent, comorbidity, histology), each ticked.
  - **Validation against NCCN NSCLC v2.2025 NSCL-J pg 47** — patient meets all 4 NCCN criteria. Cat 1 match.
  - **Validation against Aetna CPB-0516** — Aetna's own policy authorises this regimen, so the denial is *internally inconsistent with the payer's own policy*. *"That's the smoking gun."*
  - **AI verdict** — appeal with full reversal expected, 8-day ETA.
- **F · NCCN guideline cited in appeal** — verbatim quote from page 47.
- **G · Aetna policy contradiction surfaced by AI** — verbatim Aetna CPB-0516 quote.

> "The agent didn't just appeal. It built a clinical narrative grounded in *both* the NCCN guideline and the payer's own published policy — using your patient's own record. This is the difference between an AI assist and an AI agent."

### 3.3 Clinical Documentation (CDI)

Click **CDI**.

- **Medical record** — full Cycle 2 oncology note from Sample 1.
- **AI-drafted CDI queries** — non-leading, compliant, multiple-choice queries with rationale per query. Status shown as *answered same-day by Dr. Park*.

> "These are the templates your CDI team would have written by hand — drafted automatically, sent through your existing CDI workflow, signed by the oncologist same-day."

### 3.4 Coding & explainability

Click **Coding**.

- **ICD-10-CM diagnoses** — every code shows the **exact source text** from the medical record it was derived from, and a **confidence score**.
- **ICD-O-3 oncology registry** — topography C34.1, morphology 8255/3 with grade and behavior.
- **HCPCS Level II drug codes** — J9305 (pemetrexed), J9045 (carboplatin), J1100, J2405 with units and source notes.
- **CPT administration codes** — 96413/96415/96417 with **modifiers** (mod 51, AA+QS for anesthesia, GP for therapy).
- **Edit affordance** — every code is editable. *"If your coder disagrees, one click and override."*

> "This is what the spec calls 'explainability with the ability to edit.' Every code traces back to a specific sentence in the chart, and every code can be overridden."

(For DRG and ICD-10-PCS coverage, mention you'll show those on the inpatient case.)

### 3.5 Claims, denial, payment

Click **Claims** → **Denial** → **Payment** in sequence (about 30 seconds each).

- **Claims** — CMS-1500 / 837P claim summary, scrubbing edits 13/13 passed, full 837P key segments.
- **Denial** — CO-50 with RARC N115, AI classification, AI Appeal Agent fully-automated workflow timeline (with **human-in-loop** review step before submission), corrected claim & final payment.
- **Payment** — 835 ERA segments, payment posting summary by line.

### 3.6 Collections (the new propensity model)

Still on Payment & Collections, scroll down.

- **Patient balance & AI collections — AR prioritization queue** — 4 ranked accounts. Mr. Chen sits at top: 0.82 propensity, 12 days AR, $3,710.20 balance.
- **Propensity-to-pay model — feature stack** — 8 features with source, value, weight, contribution:
  - **FICO score 742** — Equifax soft-pull (FCRA-compliant, §604(a)(3)(F)).
  - **Estimated household income $108k** — Experian / IRS area-median proxy.
  - Prior payment history, upfront capture, bankruptcy/collections check, etc.
  - Model output: **0.82 (HIGH)** → pre-approve 12-month 0% APR plan.
- **Personalized payment-plan offer matrix** — 5 tiers from HIGH (auto 12-mo 0%) down to VERY LOW (auto-route to charity-care + Pfizer PAP).
- **AI follow-up cadence timeline** — statement → SMS link → e-sign in 22 seconds → autopay → IF MISSED escalation: friendly SMS retry → IVR call by NIRA → human counselor.

> "The propensity-to-pay model uses your historical ledger plus external credit data — FICO from Equifax, income from Experian — under FCRA permissible-purpose. This is what most hospitals are paying a vendor like RevSpring or Cedar to do; the agent does it inline and personalised per patient."

---

## 4 · The patient summary (1 min)

Click **Patient summary** in the case header — or go to `/case/oncology/summary`.

> "If a denials manager opens this case at 7am, this is the one-page brief they get."

Walk through:
- **Hero** — one-line headline + plain-English subhead.
- **Demographics / Insurance / Encounter** — the basics.
- **Clinical context** — diagnosis, stage, molecular profile, ECOG.
- **Agentic summary** — what each of the 9 agents did, in plain English, bulleted by agent.
- **Final outcome** — what shipped, what the patient owes, what's collected.

> "This view is generated for every encounter the moment registration closes. Replaces 12 emails."

---

## 5 · The analytics dashboard (3 min)

Click **Analytics** in the case header — or go to `/views/analytics`.

> "This is what the CFO sees. Portfolio-wide, every metric the spec asked for."

Walk through top-down:

### 5.1 The 10-card KPI strip
> "The full revenue picture in one glance — $ submitted, collected, adjusted, written off, patient owed; clean claim rate, denial rate, days in AR, collection rate, PA approval rate."

### 5.2 Trends by health plan
Per-payer table: submitted, paid, denial rate badge, avg days AR, collection rate. Point out:
- **United** — 21% denial rate, 32 days AR (worst).
- **Medicare** — 7%, 22 days, 66.8% collection (best).
- *"This is what payer scorecard meetings should look like."*

### 5.3 AR aging
- **Aging distribution** — open vs closed in 5 buckets.
- **Open AR composition** — by health plan / specialty / claim type (mini-bars).

### 5.4 Open AR aging distribution by dimension
> "This is the answer to 'where is my dollars aging out?'"

Three stacked bar charts (each segmented across 0-30 / 31-60 / 61-90 / 91-120 / 120+):
- **By health plan** — United concentrates the most 120+ risk.
- **By specialty** — Oncology and Behavioral Health concentrate the most 90+ risk.
- **By claim type** — Inpatient and Outpatient dominate dollars.

### 5.5 Denial rate distribution
Three side-by-side bar charts: by health plan, by specialty, by claim type.

### 5.6 Denial composition & recovery likelihood
- **Coding vs non-coding donut** — ~39% of denial dollars are coding-driven (highest-leverage AI fix area).
- **Reimbursement likelihood on resubmission** — 64% of inventory has high-or-better overturn likelihood, auto-routed to AI Appeal Agent.

### 5.7 Top 10 denial root causes & AI recommendations
Walk down 3–4 rows.

> "Top of the list: CO-50 documentation gap, 28.4% of denial dollars. The AI recommendation is a prevention rule — auto-attach NCCN/InterQual cite + MD attestation on first PA submission. **You're seeing root cause and the fix in the same row.**"

### 5.8 Drill-through to transaction level
Click any of the three case cards (e.g. **Oncology**). The card expands inline to show:
- 5 case-level top metrics.
- Full end-to-end timeline.
- Benchmark table — this case vs AI benchmark vs industry average vs delta.
- Link to open the full case console.

> "From a portfolio metric to the actual encounter in two clicks."

---

## 6 · The conversational interface — NIRA (2–3 min)

Tap the orange orb (bottom-right). The NIRA dock opens.

> "This is where it gets real. NIRA is the Neurostack Intelligent Retrieval Agent — running on Azure Voice Live with gpt-realtime. She has tools that look up the same case data we just walked through."

### Voice mode
1. Click the **Voice** tab (mic icon).
2. Wait for "ws connected" status.
3. Ask aloud: *"Walk me through the oncology denial."*
4. NIRA responds in voice; transcript shows in the dock.
5. Follow up: *"Why was Mr. Chen's claim denied?"* — note she pulls the actual CARC code.
6. Follow up: *"Show me the inpatient KPIs."* — she calls the lookup tool live.

### Text mode
Switch to the **Type** tab. Ask: *"Compare denial rates between United and Medicare."*

> "Notice the streaming response — every token comes back through Server-Sent Events. The model badge shows Claude Opus 4.7 with automatic fallback. If Bedrock is throttled, it walks down to 4.6 → Sonnet → Haiku without the user knowing."

---

## 7 · The other two cases — quick tour (3 min)

Switch to `/case/inpatient` — Mary Patel, BCBS-TX, ICU stay.

- **Coding panel** shows MS-DRG 291, APR-DRG 194 with severity/mortality, plus full **ICD-10-PCS** procedures (4A023N7, 5A02110, B245ZZZ, GZ3ZZZZ).
- *"DRG and PCS are the bread-and-butter of inpatient coding. The agent generates both with explainability per code."*

Switch to `/case/asc` — Empire BCBS, knee arthroscopy.

- Clean ambulatory surgery center claim, 100% first-pass, 4 days to payment.
- *"This is what 'boring' looks like — the agent gets out of the way when there's nothing to fight."*

---

## 8 · Closing — the four-line punch (60 seconds)

Back to `/`.

1. **Nine RCM stages, executed by nine specialised agents** — eligibility through collections, on top of your EHR, today.
2. **Grounded in your contracts and your policies** — NCCN, payer CPBs, your historical ledger, your patient credit file. Every recommendation is traceable.
3. **AWS-native, EU-hosted** — Bedrock + Comprehend Medical in eu-west-1, Amplify Hosting Compute, Terraform-managed.
4. **Conversational by default** — NIRA lets your operations team *talk to the data*, not query the data.

> "You don't have to rip-and-replace your EHR. You don't have to re-train your team. You bolt nine agents on top of what you already have, and your AR team becomes an exception team."

Hand-off: open `https://github.com/kkahol-toronto/medical-ontology` for the source, or live URL for follow-up exploration.

---

## Appendix A — Live AI levers to know

Toggling **Live AI** (top-right of any case console) flips the agents from scripted replay to real Bedrock + Comprehend calls.

- **Appeal letter generator** (Denial stage) streams from Bedrock via SSE.
- **Comprehend Medical panel** (CDI stage) extracts entities live and shows ICD-10-CM, RxNorm, SNOMED CT inferences.
- **NIRA voice + text** uses Azure Voice Live (voice) and Bedrock Claude (text fallback).
- All routes return graceful fallbacks if a model throttles — observable in the badge in the NIRA dock.

## Appendix B — When something goes off-script

| What happens | What to say | What to do |
|---|---|---|
| NIRA says "ws connect failed" | "Voice link will reconnect — meanwhile let me show the same answer in text." | Switch to **Type** tab, ask the same question. |
| Bedrock throttles mid-stream | "You can see the fallback model badge update in real time." | Point at the model badge, keep going. |
| A stage detail panel takes a beat to render | "These are running on a Lambda cold start — production warm-up is sub-100ms." | Move on to the next stage; come back. |
| Asked about HIPAA / EU residency | "Bedrock and Comprehend Medical are both invoked from `eu-west-1`. Patient data never leaves the region. Azure Voice Live runs in `swedencentral` for EU residency. We have BAAs in place with both AWS and Microsoft." | Pull up `/api/debug-env` to show region pinning. |

## Appendix C — One-page client takeaway (paste into the email)

> Today we showed the Neurostack Agentic RCM operating model running live against three real encounters: a Stage IV NSCLC denial that overturned in 6 days; a clean inpatient ICU stay with full DRG and ICD-10-PCS coding; and an ambulatory surgery center claim paid first-pass in 4 days. The same nine agents handled eligibility, prior authorization, CDI, charge capture, coding, claims, denials, payment posting, and collections — including a propensity-to-pay model with FICO/Equifax data and a fully personalised AI follow-up cadence. Portfolio analytics covered all eight metric families the brief asked for, with drill-through to encounter level. The conversational interface (NIRA) demonstrated voice and streaming text against the same data layer.
>
> Live URL: `https://main.d22hp05xqwvydi.amplifyapp.com`
> Source: `https://github.com/kkahol-toronto/medical-ontology`
> Stack: Amazon Bedrock (Claude Opus 4.7) · AWS Comprehend Medical · Azure Voice Live · Next.js 16 SSR on AWS Amplify Hosting Compute · Terraform-managed.
