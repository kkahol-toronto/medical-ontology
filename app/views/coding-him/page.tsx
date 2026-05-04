import Link from 'next/link';
import {
  ArrowUpRight,
  Brain,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';
import { caseList } from '@/data/cases';
import { CodingExplorer } from '@/components/CodingExplorer';
import { GlassCard } from '@/components/glass/GlassCard';
import { KpiTile } from '@/components/KpiTile';
import { formatCurrency } from '@/lib/utils';

export default function CodingHimPage() {
  const cases = caseList;
  const totalCharges = cases.reduce(
    (s, c) => s + c.charges.reduce((sa, ch) => sa + ch.totalCharge, 0),
    0,
  );
  const totalDiagnoses = cases.reduce((s, c) => s + c.diagnoses.length, 0);
  const totalProcedures = cases.reduce((s, c) => s + c.procedures.length, 0);

  return (
    <div className="space-y-8 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Customer demo · Coding & HIM
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Chart Review · ICD-10 / CPT / HCPCS Coding Workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Pick a case and inspect the AI-generated coding worksheet:
            diagnosis hierarchy, CPT/HCPCS line items, modifier rationale, and
            CDI queries. Live AWS Comprehend Medical extraction is available
            inside the case console (CDI stage).
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-xs text-blue-200 ring-1 ring-blue-400/30">
          <Brain className="h-3.5 w-3.5" />
          Comprehend Medical · DetectV2 + InferICD10CM + InferRxNorm + InferSNOMEDCT
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Charts coded" value={String(cases.length)} accent="blue" />
        <KpiTile label="ICD-10 codes" value={String(totalDiagnoses)} />
        <KpiTile label="CPT/HCPCS" value={String(totalProcedures)} />
        <KpiTile label="$ coded" value={formatCurrency(totalCharges)} accent="orange" />
      </div>

      <CodingExplorer cases={cases} />

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard variant="blue" className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-blue-200">
            <Stethoscope className="h-3 w-3" />
            CDI agent
          </div>
          <h3 className="text-lg font-semibold text-white">
            Clinical Documentation Improvement
          </h3>
          <p className="text-sm text-white/75">
            CDI extracts NCCN/Aetna-relevant evidence (EGFR L858R, ECOG 1,
            T3N2M1b staging, J91.0 pleural effusion) before coders touch the
            chart. The agent emits a CDI query if any required element is
            missing — e.g. CHF acuity for DRG validation.
          </p>
          <Link
            href="/case/oncology"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Open oncology CDI <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>

        <GlassCard className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
            <ClipboardList className="h-3 w-3" />
            QA controls
          </div>
          <h3 className="text-lg font-semibold text-white">QA + audit trail</h3>
          <ul className="space-y-1.5 text-sm text-white/75">
            <li>· NCCI edits + LCD/NCD enforcement on every claim line.</li>
            <li>
              · Coder confidence score &amp; deterministic fallback when AI
              uncertain.
            </li>
            <li>
              · Versioned reasoning trace: every code change is auditable to a
              policy citation.
            </li>
            <li>· OIG-aligned modifier review (mod 25, mod 59, RT/LT).</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
