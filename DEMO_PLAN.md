# Agentic RCM Demo — Friday Plan

**For:** Rajeev review, Friday May 8
**Owner:** Kanav
**Premise:** Extend the existing **Ford Ontology / Talk2Data ZEP app** into an "Agentic RCM" workspace that delivers Pallavi's spec end-to-end across all three sample encounters, with the ontology graph live in ZEP.

---

## 1. The shape of the demo

Two tabs in one app, sharing login, file ingest, project persistence, and the D3 graph that already exists.

### Tab A — **Ontology Layer (ZEP)**
What Rajeev sees first. Proves the "RCM clinical data ontologies" requirement.

- A single **"RCM Demo"** project is pre-seeded with all 16 source files: the canonical `Health_System_RCM_Ontology.xlsx`, the 3 sample workbooks, 3 clinical narratives (docx), 5 Aetna clinical policies + Pemetrexed bulletin (pdf), Aetna provider manual (pdf), ASA + Commercial fee schedules (docx), Empire rate pages (pdf), NCCN NSCLC guidelines (pdf), `Epic_Aligned_RCM_Sample data.xlsx`, `FAMS_5-3-22.xlsx`, `ATN Enhanced Grouper.xlsx`.
- Gemini infers typed entities from headers + samples and Zep builds the live graph: **Patient → Encounter → Claim → Charge → Code (ICD/CPT/HCPCS/HCC) → Denial → Appeal → ERA → Payment → Balance**, plus **Payer / Plan / Policy / Contract / Provider / Facility**.
- The D3 canvas (already in the app) shows the graph forming. We tune the entity palette + add a "RCM" entity-type filter chip row.
- Right rail uses the existing People/Verify panel — repurposed to verify any auto-extracted **provider NPIs** or **payer aliases**.

### Tab B — **Agentic RCM Cockpit** (new)
Where the storyline lives. Maps 1:1 to the 9 stages in `Agentic RCM storyboard.pptx`.

- Top: encounter selector — **Sample 1 Oncology (Robert A. Chen, denial→appeal→overturn)**, **Sample 2 Inpatient (Sofia A. Ramirez)**, **Sample 3 ASC (ENC-2025-04291)**.
- Middle: horizontal **9-stage pipeline** with AUTO / ASSIST / REVIEW chips matching the storyboard.
- Each stage card shows: **Agent · Key Actions · EHR Data Accessed · Output · KPI Impact** (same five fields the storyboard already uses, so the deck and the demo are visually identical).
- Click a stage → right drawer opens with the **live agent trace**: the Gemini prompt/response, the ontology subgraph it queried in ZEP, and citations back to the exact xlsx cell or PDF page.
- Bottom: **KPI strip** — Clean Claim Rate, Days in A/R, Denial Rate, Net Collections — derived from the three sample workbooks.

---

## 2. Hitting the 3 customer expectations

| Expectation | Where it lives in the demo |
|---|---|
| **AR Follow-Up / Denials Mgmt** | Sample 1 hero flow. Stage 8 drawer shows: claim status (CO-50), classification (clinical, medical-necessity), appeal generation citing Pemetrexed policy + NCCN guidelines + Robert Chen's chart, overturn, $42,101.97 recovered. |
| **Coding / HIM** | Sample 2 deep dive on Stage 6. Coding agent reads `discharge_summary_narrative.docx` → suggests ICD-10 + DRG via the ATN Grouper data → NCCI edits → coder QA score. Sample 3 also exercises CPT/HCPCS for the ASC procedure. |
| **Finance Reconciliation** | Stage 9 drawer on Sample 3. ERA 835 line-by-line match, variance flags vs. ASA/Commercial fee schedules, exceptions queued, contractual adjustment validated. Roll-up tile on the KPI strip aggregates across all three samples. |

---

## 3. What we build vs. reuse

**Reuse from Ford / Talk2Data — zero changes:**

- Login + JWT, project switcher, atomic project persistence
- Multi-format upload + parsers (xlsx / csv / pdf / docx / pptx / md / txt)
- Gemini ontology inference + name resolver
- Row-pack ingest with byte budgeting
- Zep batched ingest, poller, cancel
- D3 force-directed live graph
- Health endpoint, logs tail

**New code — 4 thin additions:**

1. **`backend/agents/`** — 9 small Python modules, one per stage. Each takes (a) the relevant rows from the sample workbook, (b) a focused ontology subgraph from Zep, (c) retrieved policy snippet from the Aetna/NCCN PDFs, and returns a structured `AgentResult` with `actions`, `output`, `citations`, `kpi_delta`, `trace`.
2. **`backend/seed_rcm.py`** — one-shot loader that creates the "RCM Demo" project, uploads the 16 files, kicks the Zep build, and pre-warms the agent caches for Samples 2 & 3 so live demo latency is bounded.
3. **`backend/kpis.py`** — derive Clean Claim Rate, Days in A/R, Denial Rate, Net Collections, Appeal Overturn Rate, $ Recovered from the three workbooks. Exposed at `GET /api/rcm/kpis`.
4. **`frontend/src/rcm/`** — `RcmCockpit.tsx`, `StageCard.tsx`, `AgentTraceDrawer.tsx`, `KpiStrip.tsx`, `EncounterSelect.tsx`. New route `/rcm`. Reuses existing topbar, project switcher, theme tokens.

That's it. No new infra, no new database, same auth.

---

## 4. The hero moment (Sample 1 walkthrough)

Robert A. Chen, Stage IV NSCLC, EGFR L858R+, Aetna Commercial PPO, Cycle 2 Carboplatin + Pemetrexed.

1. **Stage 01 Registration** (AUTO) — agent reconciles ADT feed against patient master, flags one missing field, auto-fills.
2. **Stage 02 Eligibility** (AUTO) — 270/271 returns active, $4,500 deductible met, $250 OOP remaining.
3. **Stage 03 Prior Auth** (AUTO submission) — **initial PA denied**. Agent retrieves Pemetrexed CPB #0687, matches Chen's EGFR+ status, auto-drafts appeal letter, resubmits.
4. **Stage 04 CDI** (ASSIST) — agent finds gap: documentation supports HCC for metastatic disease that wasn't captured. Drafts physician query.
5. **Stage 05 Charge Capture** (AUTO) — BSA-dose verified for Carboplatin 620mg, no missing charges.
6. **Stage 06 Coding** (ASSIST) — ICD-10 C34.11, J9305 + J9045, modifier JW for waste, NCCI edits clean.
7. **Stage 07 Claims** (AUTO) — 837P scrubbed, 13/13 edits passed, transmitted, 999/277 ACK'd.
8. **Stage 08 Denial Mgmt** (REVIEW) — **HERO**. Aetna returns CO-50 medical necessity. Agent classifies as clinical/policy-driven, retrieves NCCN NSCLC v5.2026 + Pemetrexed CPB + Chen's chart, drafts 4-paragraph appeal with citations, overturned 04/04/2025, **$42,101.97 recovered**. Feedback loop pushes a new prevention rule into the rule engine: "EGFR+ NSCLC → attach NCCN citation on first submission."
9. **Stage 09 Payment & Collections** (AUTO) — ERA 835 matched, contractual adjustment validated against Commercial fee schedule, $3,710.20 patient balance routed to financial navigator with two propensity-scored outreach options.

Samples 2 & 3 run the same pipeline but happy-path, ~30 seconds each.

---

## 5. Schedule (today is Mon May 4; demo Fri May 8)

| Day | Work | Done = |
|---|---|---|
| **Mon (today)** | Confirm this plan. Stand up the Ford app locally, point it at a fresh ZEP project, run `seed_rcm.py` against all 16 files. Verify ontology graph visualizes well; tune entity palette. | "RCM Demo" project exists in ZEP with a clean graph. |
| **Tue** | Scaffold `frontend/src/rcm/` route + the 9-stage pipeline UI + encounter selector + stage card layout (no live agents yet, mocked traces). | Click-through skeleton matching the storyboard layout. |
| **Wed** | Implement the 9 backend agents. Wire Sample 1 end-to-end with **real** Gemini calls and real ontology subgraph retrieval. Build the appeal letter generator. | Sample 1 hero flow works live. |
| **Thu** | Sample 2 + Sample 3 runs (cached for speed). KPI strip live. Polish. Two rehearsals. | All three encounters runnable, KPI strip populated, demo script written. |
| **Fri AM** | Buffer + final dry run with you. | Ready for Rajeev. |

---

## 6. Risks + mitigations

- **ZEP ingest size** — `Health_System_RCM_Ontology.xlsx` is 1,500 rows; the existing row-pack ingest already handles this with byte budgeting. No change needed.
- **Gemini latency per stage** — 5–15s live. Mitigate by caching Sample 2 & 3 traces during seed; only Sample 1 runs fully live for the hero moment.
- **Aetna PDFs are big** — index once at seed time, simple BM25 retrieval per stage. Skip full RAG for v1.
- **Branding** — ZEP app currently says "Ford". Need a 30-min reskin pass to "NTT DATA · Agentic RCM". Logo + 2 color tokens.
- **Static credentials** — `ford / ford2026` is fine for an internal demo; flag for change before any external exposure.

---

## 7. Open questions for Pallavi

1. Reskin to **NTT DATA** branding, or leave neutral for the first draft?
2. Synthetic data only, or do we need to wire to a real Epic sandbox? (Assumed synthetic.)
3. Demo length target? (Assumed ~20 min: 5 ontology, 12 Sample 1, 3 Samples 2+3 + KPI roll-up.)
4. Is the appeal letter PDF generation a must-have for Friday, or "nice to have"?

---

## 8. File-to-stage cross-reference (so nothing's wasted)

| File | Used by |
|---|---|
| `Health_System_RCM_Ontology.xlsx` | Tab A (canonical schema seed for the graph) |
| `Sample 1/RCM_Oncology_Denial_Appeal_Demo.xlsx` | Tab B Sample 1 — every stage |
| `Sample 1/oncology_Chart.docx` | Stages 04 (CDI), 06 (Coding), 08 (Appeal) |
| `Sample 2/RCM_Demo_Inpatient_Stay.xlsx` | Tab B Sample 2 |
| `Sample 2/discharge_summary_narrative.docx` | Stages 04 (CDI), 06 (Coding) |
| `Sample 3/RCM_Outpatient_ASC_Demo.xlsx` | Tab B Sample 3 |
| `Sample 3/outpatient_encounter_clinical_narrative_expanded.docx` | Stages 04 (CDI), 06 (Coding) |
| `Aetna/Clinical policies/*.pdf` (5) | Stage 03 PA + Stage 08 Appeal retrieval |
| `Pemetrexed Products...pdf` | Stage 08 Sample 1 hero appeal citation |
| `nscl.pdf` (NCCN NSCLC v5.2026) | Stage 08 Sample 1 hero appeal citation |
| `office_manual_hcp.pdf` | Stage 03 PA workflow rules |
| `ASA_Eff08-01-2022_FINAL.docx` | Stage 09 contractual adjustment validation |
| `Commercial_Eff08-01-2022_FINAL.docx` | Stage 09 contractual adjustment validation |
| `Empire Amd Rate Pages Nov 2016.pdf` | Stage 09 historical rate reference |
| `Epic_Aligned_RCM_Sample data.xlsx` | Tab A graph fill (synthetic Epic backbone) |
| `FAMS_5-3-22.xlsx` | KPI strip historical baseline (denial trends) |
| `ATN Enhanced Grouper.xlsx` | Stage 06 DRG suggestions for Sample 2 |

Every file in the folder has a job.
