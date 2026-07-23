import type { BhOntologyNode } from './bh-ontology-types';

const CASE_CONTEXT =
  'Jordan M. Ellis (ENC-BH-2026-0417) - 8-day acute inpatient psychiatry stay - UHC CO-50 / BH-LOS-06 denial appeal';

function withContext(parts: string[]): string {
  return parts.filter(Boolean).join(' ');
}

function cleanPolicyExcerpt(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Expand terse ontology summaries for the detail panel and tooltips. */
export function enrichNodeSummary(node: BhOntologyNode): string {
  const raw = cleanPolicyExcerpt(node.summary);
  if (raw.length >= 140 && !raw.startsWith('#')) {
    return raw;
  }

  const attrs = node.attributes;
  const label = node.label;

  switch (node.category) {
    case 'Patient':
      return withContext([
        raw,
        label + ' is the demo patient for the behavioral health RCM case.',
        'Presentation included severe MDD with psychotic features, active suicidal ideation with plan, and command hallucinations requiring ASAM Level 4 / LOCUS Level 6 inpatient care.',
      ]);

    case 'Encounter':
      return withContext([
        raw,
        label + ' spans 05/06-05/14/2026 at Lakeshore Behavioral Health Center.',
        'UnitedHealthcare initially denied days 6-8 for insufficient continued-stay documentation; the AI appeal overturned $10,672.50 on 05/28/2026.',
      ]);

    case 'Denial':
      return withContext([
        raw,
        label + ' is the payer adjustment that triggered the first-level appeal.',
        'Root cause: payer could not verify that PHP or lower level of care was unsafe for days 6-8 despite daily MSE, C-SSRS, and observation logs.',
      ]);

    case 'Appeal':
      return withContext([
        raw,
        label + ' packages LOCUS/ASAM mapping, clinical chronology, and policy citations into a medical-necessity argument.',
        'Bedrock Appeal Agent drafted the letter; Dr. Maya Patel attested; UHC overturned and paid on replacement claim.',
      ]);

    case 'Policy':
    case 'PolicySection':
      return withContext([
        raw.length > 60 ? raw : '',
        label + ' is payer or clinical policy grounding for behavioral health level-of-care decisions.',
        attrs.citation ? 'Source: ' + String(attrs.citation) + '.' : '',
        attrs.clause_type
          ? String(attrs.clause_type) +
            ' clause ' +
            String(attrs.index ?? '') +
            ' defines medical-necessity rules cited in the appeal to justify continued inpatient stay.'
          : '',
        attrs.policy_slug || attrs.chunk_index
          ? 'Excerpt ' +
            String(attrs.chunk_index ?? '') +
            ' from ' +
            String(attrs.policy_slug ?? 'BH policy corpus') +
            ' - used to rebut BH-LOS-06.'
          : '',
        'Context: ' + CASE_CONTEXT + '.',
      ]);

    case 'Agent':
      return withContext([
        label + ' is an agentic RCM worker in the BH demo pipeline.',
        raw,
        'It contributed to eligibility, coding, claim submission, denial triage, appeal drafting, or payment posting for this encounter.',
      ]);

    case 'LevelOfCare':
      return withContext([
        label + ' describes where psychiatric treatment can safely occur along the ASAM or LOCUS continuum.',
        raw,
        'Jordan M. Ellis required ASAM Level 4 / LOCUS Level 6 through day 7; PHP (LOCUS 4) was ruled unsafe due to living alone and medication nonadherence.',
      ]);

    case 'Assessment':
      return withContext([
        label + ' is clinical documentation from the inpatient chart.',
        raw,
        attrs.day ? 'Captured on inpatient day ' + String(attrs.day) + '.' : '',
        attrs.risk_level ? 'C-SSRS risk: ' + String(attrs.risk_level) + '.' : '',
        attrs.level ? 'Observation level: ' + String(attrs.level) + '.' : '',
        attrs.domain && attrs.shift
          ? String(attrs.domain) +
            ' finding on day ' +
            String(attrs.day) +
            ' ' +
            String(attrs.shift) +
            ' shift - supports continued-stay medical necessity when day >= 6.'
          : '',
        attrs.session && attrs.topic
          ? 'Group session ' +
            String(attrs.session) +
            ' focused on ' +
            String(attrs.topic) +
            '; billed under rev code 0914.'
          : '',
        'Findings were bundled into the appeal packet to counter the BH-LOS-06 denial.',
      ]);

    case 'ClinicalCriteria':
      if (node.type === 'AppealEvidenceAtom') {
        return withContext([
          'Appeal evidence - ' + raw + '.',
          'Day ' + String(attrs.day ?? '') + ' inpatient documentation for Jordan M. Ellis.',
          'This atom was extracted from nursing notes, MSE, or risk assessments and cited to prove continued acute care was required.',
        ]);
      }
      if (node.type === 'AppealDocument') {
        return withContext([
          label + ' is a component of the first-level appeal packet submitted to UnitedHealthcare.',
          raw,
          'Assembled by the AI Appeal Agent and attested by the attending psychiatrist.',
        ]);
      }
      if (node.type === 'UMEvent') {
        return withContext([
          label + ' - utilization management milestone on ' + String(attrs.date ?? 'the admission timeline') + '.',
          raw,
          attrs.status ? 'UM status: ' + String(attrs.status) + '.' : '',
        ]);
      }
      return withContext([
        label + ' states a medical-necessity criterion for continued inpatient psychiatric care.',
        raw,
        'Referenced in the appeal to justify days 6-8 that UHC initially denied.',
      ]);

    case 'Diagnosis':
      return withContext([
        label + ' - ' + String(attrs.description ?? raw) + '.',
        'Principal or secondary ICD-10-CM diagnosis on the 837I claim and appeal clinical summary.',
        node.type === 'DSM5TRCrosswalk'
          ? 'DSM-5-TR crosswalk variant ' +
            String(attrs.variant ?? '') +
            ' links psychiatric nomenclature to billing codes.'
          : '',
      ]);

    case 'Symptom':
      return withContext([
        label + ' was an active clinical finding during the admission.',
        raw,
        'Documented in MSE and nursing notes; cited as evidence that lower levels of care were unsafe.',
      ]);

    case 'Provider':
      return withContext([
        label + ' (' + String(attrs.role ?? node.type) + ') participated in care or RCM workflow for this case.',
        raw,
      ]);

    case 'Claim':
    case 'Charge':
    case 'Payment':
      return withContext([
        label + ' - revenue cycle artifact for the behavioral health encounter.',
        raw,
        attrs.amount != null ? 'Amount: $' + Number(attrs.amount).toLocaleString() + '.' : '',
        attrs.denied === 'yes'
          ? 'This line was initially denied under BH-LOS-06 and recovered on appeal.'
          : '',
      ]);

    case 'Code':
      return withContext([
        label + ' (' + String(attrs.kind ?? node.type) + ' code).',
        raw,
        'Used on the institutional claim, ERA, or denial reason mapping for this demo.',
      ]);

    case 'RCMStage':
      return withContext([
        label + ' - stage in the agentic RCM pipeline for ENC-BH-2026-0417.',
        raw,
        attrs.parent_stage ? 'Substep within ' + String(attrs.parent_stage) + '.' : '',
      ]);

    case 'Facility':
    case 'Payer':
      return withContext([raw, label + ' is a key entity in the BH denial appeal scenario.']);

    default:
      return raw.length >= 40 ? raw : withContext([label, raw, 'Context: ' + CASE_CONTEXT + '.']);
  }
}
