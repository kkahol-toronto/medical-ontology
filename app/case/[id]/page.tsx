import { notFound } from 'next/navigation';
import { CaseConsole } from '@/components/CaseConsole';
import { caseList, getCase } from '@/data/cases';
import type { StageId } from '@/lib/types';

const STAGE_IDS: StageId[] = [
  'registration',
  'eligibility',
  'priorAuth',
  'cdi',
  'charge',
  'coding',
  'claim',
  'denial',
  'payment',
];

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const { id } = await params;
  const { stage } = await searchParams;
  const c = getCase(id);
  if (!c) notFound();

  const initialStage =
    stage && STAGE_IDS.includes(stage as StageId)
      ? (stage as StageId)
      : undefined;

  return <CaseConsole case={c} initialStage={initialStage} />;
}

export function generateStaticParams() {
  return caseList.map((c) => ({ id: c.id }));
}
