/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ভার্চুয়ালাইজড ডাটা টেবিল ফ্রেম (Master Data Table Shell)
 * ডিপ চারকোল ও ক্লাসিক ডেনিম ব্লু থিম (#2563eb)
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { Search } from 'lucide-react';

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>): React.JSX.Element {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={cn('w-full caption-bottom text-sm text-left border-collapse', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return (
    <thead
      className={cn('bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10', className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return (
    <tbody
      className={cn('divide-y divide-zinc-200 dark:divide-zinc-800', className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>): React.JSX.Element {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-zinc-800',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <th
      className={cn(
        'h-10 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 select-none font-mono',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <td
      className={cn('px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 align-middle', className)}
      {...props}
    />
  );
}

// টেবিল টুলবার (সার্চ ও ফিল্টার সেকশন)
export interface TableToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function TableToolbar({
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  actions,
}: TableToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-11 pl-10 pr-4 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>

      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// খালি টেবিল স্টেট
export function TableEmptyState({
  title = 'No records found',
  description = 'Try adjusting your search filters or add a new record.',
}: {
  title?: string;
  description?: string;
}): React.JSX.Element {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{description}</p>
    </div>
  );
}
