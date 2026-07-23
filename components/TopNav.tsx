'use client';

import { Activity, BarChart3, Brain, FileText, LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Operating Model', icon: LayoutDashboard },
  { href: '/views/behavioral-health', label: 'Behavioral Health', icon: Brain },
  { href: '/views/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/views/ar-denials', label: 'AR / Denials', icon: Activity },
  { href: '/views/coding-him', label: 'Coding / HIM', icon: FileText },
  { href: '/views/finance-recon', label: 'Finance Recon', icon: Sparkles },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 px-6 pt-4 lg:px-10">
      <div className="glass-strong mx-auto flex h-14 max-w-[1380px] items-center justify-between rounded-2xl px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_16px_rgb(255_122_26_/_0.5)]">
              <span className="font-bold text-white">N</span>
            </div>
            <div
              className="absolute inset-0 -z-10 rounded-xl opacity-60 blur-md"
              style={{ background: '#ff7a1a' }}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-white">
              Neurostack
            </span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-white/40 sm:inline">
              Agentic RCM
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all',
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 shadow-[0_0_8px_rgb(255_122_26_/_0.7)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/50 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live demo
          </span>
        </div>
      </div>
    </header>
  );
}
