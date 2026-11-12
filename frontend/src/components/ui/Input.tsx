/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল ইনপুট ফিল্ড কম্পোনেন্ট (Master Input Component)
 * হাই-কনট্রাস্ট এবং কিউআর কোড স্ক্যানার ও টাচ-ফ্রেন্ডলি ইনপুট
 */

import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isTouchOptimized?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isTouchOptimized = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-300 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'w-full rounded-lg bg-slate-900 border text-slate-100 placeholder:text-slate-500',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-950',
              // সাইজিং: শপ-ফ্লোর ট্যাবলেটের জন্য ৪৮px (h-12) নতুবা স্ট্যান্ডার্ড ৪৪px (h-11)
              isTouchOptimized ? 'h-12 text-base px-4 touch-target' : 'h-11 text-sm px-3.5',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-700',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-400 mt-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-400 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
