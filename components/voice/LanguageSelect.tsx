'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, getLanguage, searchLanguages } from '@/lib/voice/languages';
import { cn } from '@/lib/utils';

interface LanguageSelectProps {
  value: string | null;
  onChange: (code: string | null) => void;
  className?: string;
}

/**
 * Compact searchable language picker for the voice dock header.
 *
 * Visible state is a small pill showing the active language code (e.g.
 * `EN`) or the globe icon when in auto-detect mode. Clicking it opens
 * a popover with a search box and the language list.
 */
export function LanguageSelect({
  value,
  onChange,
  className,
}: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const active = useMemo(() => getLanguage(value), [value]);
  const filtered = useMemo(() => searchLanguages(query), [query]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      // Focus the search box on open. setTimeout lets the popover paint
      // before we move focus so the autofocus doesn't fight the
      // entrance animation.
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
    setQuery('');
    return undefined;
  }, [open]);

  const label = active ? active.code.toUpperCase() : 'AUTO';

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={active ? `Language: ${active.name}` : 'Language: Auto-detect'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors',
          'bg-white/[0.06] text-white/80 ring-1 ring-white/10 hover:bg-white/[0.12] hover:text-white',
        )}
      >
        {active ? (
          <span className="font-mono">{label}</span>
        ) : (
          <>
            <Globe className="h-3 w-3" />
            <span>Auto</span>
          </>
        )}
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-[#0b1736]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              <LanguageRow
                label="Auto-detect"
                sublabel="Whisper picks per utterance"
                code={null}
                selected={value === null}
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              />
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-white/40">
                  No matches
                </div>
              ) : (
                filtered.map((l) => (
                  <LanguageRow
                    key={l.code}
                    label={l.name}
                    sublabel={l.native !== l.name ? l.native : undefined}
                    code={l.code}
                    selected={value === l.code}
                    onSelect={() => {
                      onChange(l.code);
                      setOpen(false);
                    }}
                  />
                ))
              )}
              {filtered.length > 0 && filtered.length === LANGUAGES.length && (
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-white/30">
                  {LANGUAGES.length} languages
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LanguageRow({
  label,
  sublabel,
  code,
  selected,
  onSelect,
}: {
  label: string;
  sublabel?: string;
  code: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] transition-colors',
        selected
          ? 'bg-orange-500/15 text-orange-100'
          : 'text-white/80 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <span className="flex flex-1 items-center gap-2 truncate">
        <span className="truncate">{label}</span>
        {sublabel && (
          <span className="truncate text-[11px] text-white/40">{sublabel}</span>
        )}
      </span>
      <span className="flex items-center gap-2">
        {code && (
          <span className="font-mono text-[10px] uppercase text-white/40">
            {code}
          </span>
        )}
        {selected && <Check className="h-3.5 w-3.5 text-orange-300" />}
      </span>
    </button>
  );
}
