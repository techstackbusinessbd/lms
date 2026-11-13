/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার সিলেক্ট / ড্রপডাউন কম্পোনেন্ট (Master Select Component)
 *
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none font-mono"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'w-full h-10 px-3 pr-8 rounded-sm bg-white dark:bg-[#121317] border text-xs text-zinc-900 dark:text-zinc-100',
              'font-mono appearance-none transition-colors duration-150 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-950',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-[#22242c]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-zinc-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-[#1a1c22] text-zinc-900 dark:text-zinc-100"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-2.5 flex items-center pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-500 mt-1 font-mono">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
