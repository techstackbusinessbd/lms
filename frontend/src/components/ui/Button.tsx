/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল বাটন কম্পোনেন্ট (Master Button Component)
 * ডিপ চারকোল ও ক্লাসিক ডেনিম ব্লু থিম (#2563eb)
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// বাটনের ভিজ্যুয়াল ভ্যারিয়েন্ট ও সাইজ কনফিগারেশন
export const buttonVariants = cva(
  'inline-flex flex-row flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-xs shadow-blue-600/25',
        secondary:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
        danger:
          'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-xs shadow-rose-600/25',
        success:
          'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-xs shadow-emerald-600/25',
        outline:
          'border border-slate-200 dark:border-[#22242c] bg-white dark:bg-[#121317] text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#1a1c22] hover:text-zinc-900 dark:hover:text-white shadow-2xs',
        ghost:
          'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs rounded-sm',
        default: 'h-10 px-4 text-sm rounded-sm',
        lg: 'h-12 px-6 text-base rounded-sm touch-target', // রুল ১৮ মেনে শপ-ফ্লোর ট্যাবলেটের জন্য ৪৮px সাইজ
        icon: 'h-8 w-8 rounded-sm p-0',
        'icon-lg': 'h-12 w-12 rounded-sm p-0 touch-target',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="inline-flex items-center shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex items-center shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
