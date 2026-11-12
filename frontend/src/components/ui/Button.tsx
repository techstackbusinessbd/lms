/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল বাটন কম্পোনেন্ট (Master Button Component)
 * ফ্যাক্টরি ট্যাবলেট ও ডেস্কটপের জন্য কাস্টমাইজড টাচ-ফ্রেন্ডলি বাটন
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// বাটনের ভিজ্যুয়াল ভ্যারিয়েন্ট ও সাইজ কনফিগারেশন
export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-600/30',
        secondary:
          'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-800 border border-slate-300 dark:border-slate-700',
        danger:
          'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-xs shadow-rose-600/30',
        success:
          'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-xs shadow-emerald-600/30',
        outline:
          'border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
        ghost:
          'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
      },
      size: {
        sm: 'h-9 px-3 text-xs rounded-sm',
        default: 'h-11 px-4 text-sm rounded-sm',
        lg: 'h-12 px-6 text-base rounded-sm touch-target', // রুল ১৮ মেনে শপ-ফ্লোর ট্যাবলেটের জন্য ৪৮px সাইজ
        icon: 'h-11 w-11 rounded-sm p-0',
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
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

