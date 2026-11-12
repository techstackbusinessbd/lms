/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * প্রিমিয়াম স্ট্যাটাস ব্যাজ কম্পোনেন্ট (Executive Aura Badge Component)
 * ডিপ চারকোল ও সিগনেচার সেফায়ার ব্লু থিম
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-mono font-medium border select-none transition-colors tracking-tight',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80',
        primary:
          'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25 shadow-xs shadow-blue-500/5',
        success:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 shadow-xs shadow-emerald-500/5',
        warning:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 shadow-xs shadow-amber-500/5',
        danger:
          'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 shadow-xs shadow-rose-500/5',
        outline:
          'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  hasDot?: boolean;
}

export function Badge({
  className,
  variant,
  hasDot = false,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  // ডট কালার ম্যাপিং
  const dotColorMap: Record<string, string> = {
    default: 'bg-zinc-400',
    primary: 'bg-blue-500 shadow-[0_0_6px_#3b82f6]',
    success: 'bg-emerald-500 shadow-[0_0_6px_#10b981]',
    warning: 'bg-amber-500 shadow-[0_0_6px_#f59e0b]',
    danger: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]',
    outline: 'bg-zinc-400',
  };

  const currentVariant = variant || 'default';
  const dotColor = dotColorMap[currentVariant] || 'bg-zinc-400';

  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {hasDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotColor)}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
