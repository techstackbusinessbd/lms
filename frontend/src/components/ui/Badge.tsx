/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * স্ট্যাটাস ব্যাজ কম্পোনেন্ট (Master Badge Component)
 * অর্ডার, কিউসি এবং মেশিন স্ট্যাটাস প্রদর্শনের জন্য হাই-ভিজিবিলিটি ব্যাজ
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium border transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-slate-800 text-slate-200 border-slate-700',
        primary:
          'bg-indigo-950/80 text-indigo-300 border-indigo-800',
        success:
          'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        warning:
          'bg-amber-950/80 text-amber-300 border-amber-800',
        danger:
          'bg-rose-950/80 text-rose-300 border-rose-800',
        outline:
          'bg-transparent text-slate-300 border-slate-700',
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
    default: 'bg-slate-400',
    primary: 'bg-indigo-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    outline: 'bg-slate-400',
  };

  const currentVariant = variant || 'default';
  const dotColor = dotColorMap[currentVariant] || 'bg-slate-400';

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

