/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * স্ট্যাটাস ব্যাজ কম্পোনেন্ট (Master Badge Component)
 * ডিপ চারকোল ও ক্লাসিক ডেনিম ব্লু থিম
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium border transition-colors select-none font-mono',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
        primary:
          'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        success:
          'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        warning:
          'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        danger:
          'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        outline:
          'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
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
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
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
