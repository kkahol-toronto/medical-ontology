'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const glassButton = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_8px_24px_rgb(255_122_26_/_0.4)] hover:shadow-[0_12px_32px_rgb(255_122_26_/_0.55)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-orange-500/60',
        glass:
          'glass text-white hover:bg-white/[0.1] hover:border-white/25 focus-visible:ring-blue-400/60',
        blue: 'glass-blue text-white hover:border-blue-300/50 focus-visible:ring-blue-400/60',
        ghost:
          'text-white/70 hover:text-white hover:bg-white/[0.06] focus-visible:ring-white/20',
        danger:
          'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_8px_24px_rgb(239_68_68_/_0.4)] hover:-translate-y-0.5 focus-visible:ring-red-400/60',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButton> {
  asChild?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    { className, variant, size, asChild = false, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(glassButton({ variant, size }), className)}
        {...props}
      />
    );
  },
);
