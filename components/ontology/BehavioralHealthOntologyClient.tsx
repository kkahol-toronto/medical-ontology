'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ZepOntologyExplorer = dynamic(
  () =>
    import('@/components/ontology/ZepOntologyExplorer').then((m) => ({
      default: m.ZepOntologyExplorer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-white/10 bg-[#060d1a]/80 text-white/50">
        Loading ontology graph…
      </div>
    ),
  },
);

export function BehavioralHealthOntologyClient({
  className,
}: {
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-white/10 bg-[#060d1a]/80 text-white/50">
          Loading ontology graph…
        </div>
      }
    >
      <ZepOntologyExplorer className={className} />
    </Suspense>
  );
}
