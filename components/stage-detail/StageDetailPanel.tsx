'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileText,
  Info,
  Loader2,
  Pencil,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn, formatCurrency } from '@/lib/utils';
import type {
  CalloutTone,
  CdiQuery,
  CodingItem,
  KpiItem,
  KeyValueRow,
  MedRecordSection,
  StageDetail,
  StageSection,
  TimelineItem,
  ArPriorityRow,
} from '@/lib/types';

interface Props {
  detail: StageDetail;
}

export function StageDetailPanel({ detail }: Props) {
  return (
    <div className="space-y-5">
      {detail.intro && (
        <p className="text-[13.5px] leading-relaxed text-white/75">
          {detail.intro}
        </p>
      )}
      {detail.sections.map((sec, i) => (
        <SectionRenderer key={i} section={sec} />
      ))}
    </div>
  );
}

function SectionRenderer({ section }: { section: StageSection }) {
  switch (section.kind) {
    case 'kpis':
      return <KpiStrip items={section.items} />;
    case 'keyValues':
      return <KeyValuesPanel title={section.title} rows={section.rows} />;
    case 'table':
      return (
        <TablePanel
          title={section.title}
          columns={section.columns}
          rows={section.rows}
          footer={section.footer}
        />
      );
    case 'timeline':
      return <TimelinePanel title={section.title} events={section.events} />;
    case 'edi':
      return (
        <EdiPanel
          title={section.title}
          transaction={section.transaction}
          segments={section.segments}
        />
      );
    case 'json':
      return <JsonPanel title={section.title} payload={section.payload} />;
    case 'medicalRecord':
      return <MedRecordPanel title={section.title} sections={section.sections} />;
    case 'cdiQueries':
      return <CdiPanel title={section.title} queries={section.queries} />;
    case 'coding':
      return <CodingPanel title={section.title} codes={section.codes} />;
    case 'policyCitation':
      return (
        <PolicyPanel
          title={section.title}
          source={section.source}
          quote={section.quote}
          pageRef={section.pageRef}
        />
      );
    case 'callout':
      return (
        <Callout
          tone={section.tone}
          title={section.title}
          body={section.body}
        />
      );
    case 'arPriority':
      return <ArPriorityPanel title={section.title} rows={section.rows} />;
    default: {
      // Exhaustive check
      const _never: never = section;
      void _never;
      return null;
    }
  }
}

// =====================================================================
// Section renderers
// =====================================================================

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
      {children}
    </h3>
  );
}

function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <GlassCard className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-5">
      {items.map((k, i) => (
        <div key={i} className="space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            {k.label}
          </div>
          <div className="text-xl font-bold text-white">{k.value}</div>
          {k.sub && <div className="text-[11px] text-white/55">{k.sub}</div>}
        </div>
      ))}
    </GlassCard>
  );
}

function KeyValuesPanel({
  title,
  rows,
}: {
  title?: string;
  rows: KeyValueRow[];
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className={cn(
              'flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5',
              r.emphasis && 'rounded-md bg-orange-500/10 px-2 ring-1 ring-orange-400/30',
            )}
          >
            <dt className="text-xs uppercase tracking-wider text-white/50">
              {r.label}
            </dt>
            <dd
              className={cn(
                'text-right text-[13px] text-white',
                r.emphasis && 'font-semibold text-orange-100',
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
}

function TablePanel({
  title,
  columns,
  rows,
  footer,
}: {
  title?: string;
  columns: string[];
  rows: (string | number)[][];
  footer?: string;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-max text-[12px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10.5px] uppercase tracking-wider text-white/50">
              {columns.map((c, i) => (
                <th key={i} className="px-2 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-white/5 text-white/85 hover:bg-white/[0.03]"
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-2">
                    {typeof cell === 'number' ? formatNumber(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="rounded-md bg-white/[0.04] px-3 py-2 text-[12px] text-white/70">
          {footer}
        </div>
      )}
    </GlassCard>
  );
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 100 && Number.isInteger(n) === false) {
    return formatCurrency(n);
  }
  return n.toLocaleString();
}

function TimelinePanel({
  title,
  events,
}: {
  title?: string;
  events: TimelineItem[];
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <ol className="space-y-3">
        {events.map((ev, i) => {
          const tone =
            ev.status === 'fail'
              ? 'border-rose-400/40 bg-rose-500/10'
              : ev.status === 'progress'
                ? 'border-blue-400/40 bg-blue-500/10'
                : ev.status === 'success'
                  ? 'border-emerald-400/30 bg-emerald-500/5'
                  : 'border-white/10 bg-white/[0.03]';
          const Icon =
            ev.status === 'fail'
              ? XCircle
              : ev.status === 'progress'
                ? Loader2
                : ev.status === 'success'
                  ? CheckCircle2
                  : Circle;
          return (
            <li
              key={i}
              className={cn(
                'flex gap-3 rounded-xl border p-3 text-[12.5px]',
                tone,
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  ev.status === 'fail' && 'text-rose-300',
                  ev.status === 'progress' && 'animate-spin text-blue-300',
                  ev.status === 'success' && 'text-emerald-300',
                  !ev.status && 'text-white/40',
                )}
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-white">{ev.label}</div>
                  <div className="text-[11px] text-white/55">{ev.date}</div>
                </div>
                {ev.detail && (
                  <div className="text-white/70">{ev.detail}</div>
                )}
                {(ev.agent || ev.ms) && (
                  <div className="text-[10.5px] uppercase tracking-wider text-white/40">
                    {ev.agent}
                    {ev.agent && ev.ms ? ' · ' : ''}
                    {ev.ms ? `${ev.ms}ms` : ''}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}

function EdiPanel({
  title,
  transaction,
  segments,
}: {
  title?: string;
  transaction?: string;
  segments: string[];
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        {title && <PanelTitle>{title}</PanelTitle>}
        {transaction && (
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-blue-200 ring-1 ring-blue-400/40">
            EDI {transaction}
          </span>
        )}
      </div>
      <pre className="max-h-[420px] overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[11.5px] leading-relaxed text-emerald-100/90 ring-1 ring-emerald-400/15">
        {segments.join('\n')}
      </pre>
    </GlassCard>
  );
}

function JsonPanel({ title, payload }: { title?: string; payload: unknown }) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <pre className="max-h-[420px] overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[11.5px] leading-relaxed text-cyan-100/90 ring-1 ring-cyan-400/15">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </GlassCard>
  );
}

function MedRecordPanel({
  title,
  sections,
}: {
  title?: string;
  sections: MedRecordSection[];
}) {
  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-300" />
        {title && <PanelTitle>{title}</PanelTitle>}
      </div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-orange-200">
                {s.heading}
              </div>
              {s.flags && s.flags.length > 0 && (
                <div className="flex gap-1">
                  {s.flags.map((f, fi) => (
                    <span
                      key={fi}
                      className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9.5px] uppercase tracking-wider text-orange-100 ring-1 ring-orange-400/40"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/85">
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function CdiPanel({
  title,
  queries,
}: {
  title?: string;
  queries: CdiQuery[];
}) {
  const [answered, setAnswered] = useState<Record<string, string>>({});
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-300" />
        {title && <PanelTitle>{title}</PanelTitle>}
      </div>
      <div className="space-y-3">
        {queries.map((q) => {
          const picked = answered[q.id];
          const status = picked ? 'answered' : (q.status ?? 'pending');
          return (
            <div
              key={q.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-white/50">
                  {q.id}
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9.5px] uppercase tracking-wider',
                    status === 'pending' &&
                      'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40',
                    status === 'answered' &&
                      'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40',
                    status === 'resolved' &&
                      'bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/40',
                  )}
                >
                  {status}
                </span>
              </div>
              <div className="mb-3 text-[13px] font-medium text-white">
                {q.question}
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const active = picked === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setAnswered((prev) => ({ ...prev, [q.id]: opt }))
                      }
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-[12px] transition-colors',
                        active
                          ? 'border-orange-400/60 bg-orange-500/20 text-orange-50'
                          : 'border-white/15 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]',
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-lg bg-blue-500/[0.08] p-3 text-[11.5px] text-blue-100/85 ring-1 ring-blue-400/25">
                <span className="font-semibold uppercase tracking-wider text-blue-200">
                  Rationale:{' '}
                </span>
                {q.rationale}
              </div>
              {q.physician && (
                <div className="mt-2 text-[10.5px] uppercase tracking-wider text-white/45">
                  Sent to: {q.physician}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function CodingPanel({
  title,
  codes,
}: {
  title?: string;
  codes: CodingItem[];
}) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <div className="space-y-2">
        {codes.map((c, i) => {
          const editing = c.code in edits;
          return (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 font-mono text-[12px] font-semibold text-blue-100 ring-1 ring-blue-400/40">
                  {c.code}
                </span>
                {c.modifier && (
                  <span className="rounded-md bg-orange-500/15 px-1.5 py-0.5 font-mono text-[11px] text-orange-200 ring-1 ring-orange-400/30">
                    mod {c.modifier}
                  </span>
                )}
                <span className="flex-1 text-[13px] text-white">
                  {c.description}
                </span>
                {c.type && (
                  <span className="text-[10.5px] uppercase tracking-wider text-white/45">
                    {c.type}
                  </span>
                )}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    c.confidence >= 0.95
                      ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
                      : c.confidence >= 0.85
                        ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30'
                        : 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/30',
                  )}
                >
                  {(c.confidence * 100).toFixed(1)}%
                </span>
                {c.editable && (
                  <button
                    type="button"
                    aria-label="Edit code"
                    onClick={() =>
                      setEdits((prev) => {
                        const next = { ...prev };
                        if (c.code in next) {
                          delete next[c.code];
                        } else {
                          next[c.code] = c.code;
                        }
                        return next;
                      })
                    }
                    className="rounded-md p-1 text-white/55 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-2 rounded-lg bg-black/25 p-2.5 text-[11.5px] italic leading-relaxed text-white/70 ring-1 ring-white/10">
                <span className="font-semibold not-italic uppercase tracking-wider text-white/55">
                  Source · explainability:{' '}
                </span>
                "{c.sourceText}"
              </div>
              {editing && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={edits[c.code]}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [c.code]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-md bg-black/30 px-2 py-1 font-mono text-[12px] text-white ring-1 ring-orange-400/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEdits((prev) => {
                        const next = { ...prev };
                        delete next[c.code];
                        return next;
                      })
                    }
                    className="rounded-md bg-orange-500/30 px-2 py-1 text-[11px] text-white hover:bg-orange-500/50"
                  >
                    Save override
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function PolicyPanel({
  title,
  source,
  quote,
  pageRef,
}: {
  title?: string;
  source: string;
  quote: string;
  pageRef?: string;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 text-[13px] text-blue-50/90">
        <div className="mb-2 flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-blue-200">
          <FileText className="h-3.5 w-3.5" />
          {source}
          {pageRef && <span className="text-blue-300">· {pageRef}</span>}
        </div>
        <blockquote className="border-l-2 border-blue-400/60 pl-3 italic leading-relaxed text-white/90">
          "{quote}"
        </blockquote>
      </div>
    </GlassCard>
  );
}

function Callout({
  tone,
  title,
  body,
}: {
  tone: CalloutTone;
  title: string;
  body: string;
}) {
  const styles = {
    info: { ring: 'ring-blue-400/40', bg: 'bg-blue-500/10', icon: Info, color: 'text-blue-200' },
    warn: { ring: 'ring-amber-400/40', bg: 'bg-amber-500/10', icon: AlertTriangle, color: 'text-amber-200' },
    success: { ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10', icon: CheckCircle2, color: 'text-emerald-200' },
    danger: { ring: 'ring-rose-400/40', bg: 'bg-rose-500/10', icon: XCircle, color: 'text-rose-200' },
  }[tone];
  const Icon = styles.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl p-4 ring-1',
        styles.ring,
        styles.bg,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', styles.color)} />
      <div className="space-y-1">
        <div className={cn('text-sm font-semibold', styles.color)}>{title}</div>
        <div className="text-[12.5px] leading-relaxed text-white/80">{body}</div>
      </div>
    </div>
  );
}

function ArPriorityPanel({
  title,
  rows,
}: {
  title?: string;
  rows: ArPriorityRow[];
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      {title && <PanelTitle>{title}</PanelTitle>}
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-max text-[12px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10.5px] uppercase tracking-wider text-white/50">
              <th className="px-2 py-2">Account</th>
              <th className="px-2 py-2">Patient</th>
              <th className="px-2 py-2">Payer</th>
              <th className="px-2 py-2 text-right">Balance</th>
              <th className="px-2 py-2 text-right">Days AR</th>
              <th className="px-2 py-2 text-right">Propensity</th>
              <th className="px-2 py-2">Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/5 text-white/85">
                <td className="px-2 py-2 font-mono text-[11px]">{r.account}</td>
                <td className="px-2 py-2">{r.patient}</td>
                <td className="px-2 py-2">{r.payer}</td>
                <td className="px-2 py-2 text-right font-medium text-white">
                  {formatCurrency(r.balance)}
                </td>
                <td className="px-2 py-2 text-right">{r.daysAR}</td>
                <td className="px-2 py-2 text-right">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                      r.propensity >= 0.7
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : r.propensity >= 0.4
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'bg-rose-500/20 text-rose-200',
                    )}
                  >
                    {(r.propensity * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-2 py-2 text-white/80">
                  {r.recommendedAction}
                  {r.paymentPlan && (
                    <div className="text-[10.5px] uppercase tracking-wider text-orange-200/80">
                      Plan: {r.paymentPlan}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
