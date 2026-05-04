# RCM Docs Inventory

**Purpose:** Structured catalog of all files in `/docs/` for demo planning. Organized by data type, use case, and sample scenarios.

---

## 1. ONTOLOGY SPECIFICATION (Canonical Schema)

### Health_System_RCM_Ontology.xlsx
Master data model defining the complete RCM claim lifecycle entity relationships.

**Sheet: RCM_Ontology_Master** (1,500 rows)
- Complete claim-to-payment journey with 29 columns
- Columns: Patient_ID, Encounter_ID, Claim_ID, Payer, Plan_Type, Eligibility_Status, Eligibility_Verification_Date, Service_Date, Department, Primary_ICD10_Code, Primary_ICD10_Description, Secondary_ICD10_Code, Secondary_ICD10_Description, CPT_Code, CPT_Description, HCPCS_Code, HCPCS_Description, Charge_Amount, Claim_Submission_Date, Denial_Code, Denial_Category, Denial_Subcategory, Resubmission_Count, Final_Claim_Status, Insurance_Paid, Patient_Responsibility, Outstanding_Amount, Collection_Status, Days_in_AR
- Sample data: Oncology, Emergency, Radiology departments; multiple payers (Aetna, Medicaid, Medicare); denial reasons (Timely Filing, Medical Necessity); AR aging 8-163 days

**Sheet: Ontology_Concept_Dictionary** (21 rows)
- Reference taxonomy mapping code systems to parent concepts
- Columns: Domain, Concept_Type, Code_System, Code, Description, Parent_Concept
- Examples: ICD-10 diagnoses (I10=Hypertension, E11.9=Type 2 Diabetes, J18.9=Pneumonia), Parent categories (Disease, Procedure, Service)

---

## 2. SAMPLE CASE WORKBOOKS (3 Scenario Demos)

### Sample 1/RCM_Oncology_Denial_Appeal_Demo.xlsx
**Use Case:** Chemotherapy infusion claim with denial and AI-driven appeal overturn

**Sheets (9 total):**
1. Patient Summary – Demographics, clinical overview, MRN
2. Oncology ICD & Codes – ICD-10-CM diagnosis codes, ICD-O-3, HCPCS, HCC risk codes, SNOMED
3. Eligibility & Pre-Auth – Payer verification, prior authorization denial scenario, overturn documentation
4. Charge Capture – Cycle 2 – Itemized oncology infusion charges (03/18/2025 service date)
5. Claim Scrub & Submission – EDI 837P claim validation and submission checks
6. Denial Appeal & Resolution – AI appeal workflow, full supporting documentation
7. Adjudication & Payment – Payer adjudication, ERA 835 remittance, payment posting (post-appeal)
8. Patient Balance & Comms – Patient responsibility calculation, financial navigation, billing statements
9. AI Analytics Dashboard – Denial rate, appeal success %, recovery %, performance KPIs

### Sample 2/RCM_Demo_Inpatient_Stay.xlsx
**Use Case:** Hospital admission with full end-to-end revenue cycle

**Sheets (9 total):**
1. Patient Summary – Inpatient demographics and clinical overview
2. Eligibility & Pre-Auth – Pre-admission verification, authorization
3. Clinical Doc & Coding – CDI (Clinical Documentation Improvement), ICD-10/CPT coding
4. Charge Capture – Itemized hospital bill (room, supplies, procedures, medications)
5. Claim Scrub & Submission – EDI 837I validation
6. Adjudication & Remittance – Payer adjudication, ERA 835 processing, payment posting
7. Denials Management – AI denial prevention, detection, resolution workflow
8. Patient Balance & Collections – Patient statements, collection status, payment plans
9. AI Analytics Dashboard – Inpatient encounter performance, denial metrics, AR days

### Sample 3/RCM_Outpatient_ASC_Demo.xlsx
**Use Case:** Ambulatory Surgery Center (ASC) outpatient procedure with full cycle

**Sheets (10 total):**
1. Patient Summary – ASC patient demographics, procedure overview
2. Eligibility & Benefits – Payer eligibility check, benefits investigation
3. Prior Auth & Pre-Reg – Prior authorization approval, patient pre-registration
4. Clinical Doc & Coding – Surgical documentation, procedure codes (CPT, HCPCS)
5. Charge Capture – Itemized ASC bill (facility, surgeon, supplies, anesthesia)
6. Claim Scrub & Submission – EDI 837P validation for ASC claim
7. Adjudication & Payment – Payer adjudication, ERA 835, payment posting
8. Denials Management – AI prevention, detection, resolution for outpatient claims
9. Patient Balance & Collections – Co-pay, co-insurance, deductible tracking, collections
10. AI Analytics Dashboard – Outpatient encounter KPIs, denial % by payer, recovery trends

---

## 3. SAMPLE CASE CLINICAL NARRATIVES

### Sample 1/oncology_Chart.docx
**Patient:** Robert A. Chen (MRN-472)  
**Case Type:** Outpatient chemotherapy infusion  
**Purpose:** Medical necessity documentation and clinical evidence for AI-driven oncology denial appeal demo. Supports Samples 1 workbook.

### Sample 2/discharge_summary_narrative.docx
**Patient:** Sofia A. Ramirez (age 39)  
**Case Type:** Inpatient hospital discharge  
**Purpose:** Comprehensive discharge summary with clinical documentation for inpatient RCM cycle. Supports Sample 2 workbook.

### Sample 3/outpatient_encounter_clinical_narrative_expanded.docx
**Encounter:** ENC-2025-04291, Austin Ambulatory Surgery Center, Service Date 04/08/2025  
**Case Type:** Outpatient surgical encounter  
**Purpose:** Expanded clinical narrative (detailed for medical coding validation and appeals support). Supports Sample 3 workbook.

---

## 4. PAYER CONTRACTS & RATE SHEETS

### ASA_Eff08-01-2022_Recd_08-08-2022_FINAL.docx
**Payer:** American Society of Anesthesiologists (ASA)  
**Effective Date:** 08/01/2022  
**File Size:** 103 KB  
**Pages:** 15  
**Content:** Services and Compensation Schedule defining covered anesthesia procedures, fee schedules, and billing rules  
**Format Note:** Legacy .doc (OLE2) format; created by Dominic DePiano, last saved Pallavi Kotru 05/01/2026

### Commercial_Eff08-01-2022_Recd_08-08-2022_FINAL.docx
**Payer:** Commercial Plan (contracted)  
**Effective Date:** 08/01/2022  
**File Size:** 101 KB  
**Pages:** 15  
**Content:** Services and Compensation Schedule for commercial plan provider network; fee schedules and covered services  
**Format Note:** Legacy .doc (OLE2) format; created by Dominic DePiano, last saved Pallavi Kotru 05/01/2026

### Empire Amd Rate Pages November 2016.pdf
**Payer:** Empire BlueCross BlueShield  
**Date:** November 2016  
**Content:** Rate amendments and adjustment pages (historical reference for rate trend analysis)

---

## 5. CLINICAL POLICIES & PROVIDER MANUAL

### Aetna Clinical Policies (5 PDFs in Aetna/Clinical policies/)

1. **Abatacept (Orencia) - Medical Clinical Policy Bulletins**
   - TNF (Tumor Necrosis Factor) inhibitor drug  
   - Coverage criteria, medical necessity thresholds for biologic therapy

2. **Brain Natriuretic Peptide Testing - Medical Clinical Policy Bulletins**
   - BNP diagnostic test coverage policy  
   - Medical necessity criteria for heart failure diagnosis

3. **Knee Braces - Medical Clinical Policy Bulletins**
   - Orthopedic device coverage policy  
   - Medical necessity criteria for brace approval

4. **Therapeutic Drug Monitoring of Anti-Tumor Necrosis Factor Blocking Agents**
   - Drug monitoring protocol for TNF inhibitors  
   - Frequency and medical necessity for therapeutic drug monitoring (TDM)

5. **Tracheostomy Supplies - Medical Clinical Policy Bulletins**
   - Respiratory care supplies and equipment  
   - Coverage rules for tracheostomy tube supplies

### Pemetrexed Products - Medical Clinical Policy Bulletins _ Aetna.pdf
**Drug:** Pemetrexed (chemotherapy agent)  
**Content:** Medical Clinical Policy Bulletin #0687  
- Indication-specific coverage (e.g., non-small-cell lung cancer)
- CPT/HCPCS code approval matrix  
- Prior authorization requirements  
- Medical necessity documentation requirements  
**Use Case:** Oncology denial appeal reference (covers drug approval criteria)

### Aetna/Provider manual/office_manual_hcp.pdf
**Purpose:** Aetna provider network manual (HCP = Healthcare Provider)  
**Content Sections:**
- Provider credentialing and contract terms
- Claims submission procedures and timelines
- Prior authorization request process
- Network resources and contact information
- Claim denial reasons and appeals process
**Use Case:** Provider operational reference for RCM staff training

---

## 6. OTHER REFERENCE DATA

### FAMS_5-3-22.xlsx
**Name:** Facility and Medical Services claims database  
**Date:** May 3, 2022  
**File Size:** 1.4 MB  
**Format:** Legacy Excel (OLE2); created by Kevin Bussolini, last saved Pallavi Kotru 05/01/2026  
**Expected Content:** Facility-level claims with diagnosis, procedure codes, charges, payments, and claim status  
**Use Case:** Claims analytics, payer/department/procedure trending, sample data for demo datasets

### 07-01-22_ATN_Enhanced_Grouper_Information.xlsx
**Name:** ATN (Allscripts) DRG/Case-Mix Grouper Output  
**Date:** July 1, 2022  
**File Size:** 463 KB  
**Format:** Legacy Excel (OLE2); created by Donna Barnes (01/30/2014), last saved Pallavi Kotru 05/01/2026  
**Expected Content:**
- ICD-10 diagnosis code to DRG (Diagnosis Related Group) mapping
- Severity of Illness (SOI) and Risk of Mortality (ROM) assignments
- Hospital reimbursement group assignments
- Case-mix index (CMI) calculations
**Use Case:** Inpatient reimbursement calculations, DRG validation, hospital billing reference

### Epic_Aligned_RCM_Sample data.xlsx
**Name:** Synthetic Epic EHR export aligned to RCM data model  
**Format:** Modern Excel (.xlsx)  
**Sheets (8 total, 1,200 rows each):**
1. PATIENT – Demographics, insurance, DOB, status
2. ENCOUNTER – Encounter ID, type (inpatient/outpatient), dates, department
3. DIAGNOSIS – ICD-10 codes, descriptions, principal/secondary flags
4. PROCEDURE – CPT/HCPCS codes, descriptions, units, charges
5. HSP_ACCOUNT – Hospital account (charge master link)
6. CLAIM – Claim ID, submission dates, payer, status
7. DENIAL – Denial reason codes, categories, appeal status
8. PAYMENT – Payment amounts, dates, payer remittance reference
**Use Case:** Test/demo data representing Epic EHR workflow to RCM claim submission

### nscl.pdf
**Full Name:** NCCN Guidelines for Squamous Cell Lung Cancer (NSCL)  
**Version:** v5.2026 (dated 03/13/2026)  
**Source:** National Comprehensive Cancer Network (NCCN)  
**Content:** Evidence-based clinical management guidelines for squamous cell lung cancer staging, chemotherapy regimens, treatment algorithms  
**Use Case:** Clinical evidence base for oncology denial appeals; justification for Pemetrexed and other chemotherapy treatments (Sample 1 oncology case)

---

## 7. ARCHIVE FILES (Not Extracted)

### Empire.7z
**Format:** 7-Zip compressed archive  
**Estimated Content:** Empire BlueCross BlueShield payer data (likely rate sheets, clinical policies, or claims samples)  
**Status:** Not unpacked; referenced for future analysis

### Aetna.zip
**Format:** ZIP archive  
**Status:** Already extracted to `Aetna/` folder  
**Extracted Contents:**
- `Aetna/Clinical policies/` (5 policy PDFs listed above)
- `Aetna/Provider manual/office_manual_hcp.pdf`

---

## Summary by Use Case

| File | Purpose | Demo Scenario | Key Content | Rows/Sheets |
|------|---------|---------------|-------------|-------------|
| **Health_System_RCM_Ontology.xlsx** | Canonical RCM schema | Schema reference | Claim lifecycle, code taxonomy | 1,500 + 21 |
| **RCM_Oncology_Denial_Appeal_Demo.xlsx** | Chemotherapy claim + appeal | Oncology denial/overturn | 9 process sheets, full cycle | 45-56 rows/sheet |
| **RCM_Demo_Inpatient_Stay.xlsx** | Hospital admission | Inpatient admission/discharge | 9 process sheets, full cycle | 19-49 rows/sheet |
| **RCM_Outpatient_ASC_Demo.xlsx** | Ambulatory surgery | Outpatient procedure | 10 process sheets, full cycle | 18-52 rows/sheet |
| **oncology_Chart.docx** | Medical documentation | Oncology case support | Patient Robert A. Chen narrative | 1 patient |
| **discharge_summary_narrative.docx** | Hospital discharge | Inpatient case support | Patient Sofia A. Ramirez narrative | 1 patient |
| **outpatient_encounter_clinical_narrative_expanded.docx** | Surgical encounter | Outpatient case support | Encounter ENC-2025-04291 | 1 encounter |
| **ASA_Eff08-01-2022_FINAL.docx** | Anesthesia rate schedule | Contract reference | Fee schedules, covered services | 15 pages |
| **Commercial_Eff08-01-2022_FINAL.docx** | Commercial rate schedule | Contract reference | Fee schedules, covered services | 15 pages |
| **Empire Amd Rate Pages Nov 2016.pdf** | Empire rate amendments | Historical reference | Rate adjustments | N/A |
| **Aetna clinical policies (5 PDFs)** | Drug/device approval | Medical necessity justification | Coverage criteria, indications | 5 policies |
| **Pemetrexed Products...pdf** | Chemotherapy drug policy | Oncology reference | Pemetrexed indications, CPT approval | 1 policy |
| **office_manual_hcp.pdf** | Aetna provider manual | Staff training reference | Claims, auth, appeal procedures | N/A |
| **FAMS_5-3-22.xlsx** | Claims database | Analytics/test data | Facility-level claims | ~1000+ rows |
| **ATN_Enhanced_Grouper.xlsx** | DRG grouper output | Billing reference | ICD-10 → DRG mapping, SOI/ROM | ~1000+ rows |
| **Epic_Aligned_RCM_Sample data.xlsx** | EHR/RCM test data | Demo/integration testing | 8 tables: patient, claim, denial, payment | 1,200 rows/sheet |
| **nscl.pdf** | NCCN lung cancer guidelines | Oncology justification | Staging, treatment algorithms | N/A |
| **Empire.7z** | Compressed payer data | Archive (not extracted) | TBD | N/A |
| **Aetna.zip** | Extracted payer folder | Archive (extracted) | Clinical policies + provider manual | N/A |

---

## Key Findings for Demo Planning

1. **Three Complete Sample Scenarios:** Oncology (denial/appeal), Inpatient (admission), Outpatient ASC (procedure) — each with 9-10 process worksheets and supporting clinical narratives
2. **Canonical Ontology:** 1,500-row master dataset + concept dictionary provide schema reference
3. **Clinical Support:** 3 patient narratives + 5 Aetna policies + NCCN guidelines + Pemetrexed policy for medical necessity demos
4. **Payer Contracts:** ASA and Commercial rate schedules (effective 08/01/2022) for billing/collections demos
5. **EHR/Claims Sample Data:** Epic-aligned dataset (8 tables, 1,200 rows each) + FAMS facility claims for analytics/integration demos
6. **Format Note:** Older files (ASA, Commercial, FAMS, ATN Grouper) are in legacy Excel/Word formats (OLE2); newer sample workbooks are modern .xlsx

---

**Inventory Date:** May 4, 2026  
**Total Files:** 24 (excluding archive contents)  
**Total Size:** ~3.4 MB (uncompressed)
