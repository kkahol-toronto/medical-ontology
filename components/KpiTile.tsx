import { TrendingDown, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';

interface KpiTileProps {
  label: string;
  value: string;
  trend?: string;
  trendDir?: 'up' | 'down' | 'neutral';
  accent?: 'orange' | 'blue' | 'none';
}

export function KpiTile({
  label,
  value,
  trend,
  trendDir = 'up',
  accent = 'none',
}: KpiTileProps) {
  return (
    <GlassCard
      variant={accent === 'none' ? 'default' : accent}
      className="p-5"
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold text-white">
        {value}
      </div>
      {trend && (
        <div
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs',
            trendDir === 'up' && 'text-emerald-300',
            trendDir === 'down' && 'text-orange-300',
            trendDir === 'neutral' && 'text-white/50',
          )}
        >
          {trendDir === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
          {trendDir === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
          {trend}
        </div>
      )}
    </GlassCard>
  );
}
