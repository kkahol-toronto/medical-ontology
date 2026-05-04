import { notFound } from 'next/navigation';
import { CaseConsole } from '@/components/CaseConsole';
import { caseList, getCase } from '@/data/cases';

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getCase(id);
  if (!c) notFound();
  return <CaseConsole case={c} />;
}

export function generateStaticParams() {
  return caseList.map((c) => ({ id: c.id }));
}
