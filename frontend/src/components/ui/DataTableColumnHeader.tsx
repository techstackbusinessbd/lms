/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ডেটাটেবিল কলাম হেডার কম্পোনেন্ট (DataTable Column Header)
 *
 * TanStack Table v8 এর কলাম সর্টিং লজিক এবং ভিজ্যুয়াল ইন্ডিকেটর পরিচালনা করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>): React.JSX.Element {
  // যদি কলামে সর্টিং নিষ্ক্রিয় থাকে, সাধারণ টেক্সট রেন্ডার করা
  if (!column.getCanSort()) {
    return (
      <div className={cn('text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 select-none', className)}>
        {title}
      </div>
    );
  }

  const isSorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(isSorted === 'asc')}
      className={cn(
        'group flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider select-none text-left transition-colors cursor-pointer',
        isSorted
          ? 'text-blue-600 dark:text-blue-400 font-bold'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
        className
      )}
      title={`Click to sort by ${title}`}
    >
      <span>{title}</span>
      <span className="p-0.5 rounded-xs transition-transform">
        {isSorted === 'desc' ? (
          <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        ) : isSorted === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        ) : (
          <ArrowUpDown className="w-3 h-3 text-zinc-400/70 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 shrink-0" />
        )}
      </span>
    </button>
  );
}

