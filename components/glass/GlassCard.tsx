import { cn } from '@/lib/utils';
import * as React from 'react';

type Variant = 'default' | 'strong' | 'orange' | 'blue';

const variantClass: Record<Variant, string> = {
  default: 'glass',
  strong: 'glass-strong',
  orange: 'glass-orange',
  blue: 'glass-blue',
};

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  interactive?: boolean;
  glow?: 'orange' | 'blue' | 'none';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { className, variant = 'default', interactive, glow = 'none', ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          variantClass[variant],
          interactive &&
            'cursor-pointer hover:-translate-y-0.5 hover:bg-white/[0.08] hover:border-white/20',
          glow === 'orange' && 'glow-orange',
          glow === 'blue' && 'glow-blue',
          className,
        )}
        {...props}
      />
    );
  },
);
