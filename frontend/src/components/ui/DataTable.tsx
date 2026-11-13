/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার এন্টারপ্রাইজ ডেটাটেবিল কম্পোনেন্ট (Enterprise TanStack DataTable v8)
 *
 * রুল ২৩: অ্যাপ্লিকেশনে কোনো সাধারণ বা স্ট্যাটিক টেবিল থাকবে না; সমস্ত ডাটা ডিসপ্লেতে
 * TanStack Table v8 ভিত্তিক অ্যাডভান্সড ডেটাটেবিল (সর্ট, পেজিনেশন ও অ্যাকশনসহ) ব্যবহৃত হবে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { RefreshCw, FilterX } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  totalCount?: number;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: TData) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  totalCount,
  pageCount,
  pageIndex = 1,
  pageSize = 15,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'No data matches your active filter or search criteria.',
  emptyAction,
  className,
}: DataTableProps<TData, TValue>): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);

  // TanStack Table ইনস্ট্যান্স কনফিগারেশন (সর্টিং ও কোর রো মডেলসহ)
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent',
        className
      )}
    >
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm text-left border-collapse">
          {/* টেবিল হেডার সেকশন */}
          <thead className="bg-slate-50/90 dark:bg-[#15171e] border-b border-slate-200/90 dark:border-[#1f2127] sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 select-none align-middle"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* টেবিল বডি সেকশন */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#1a1c24]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-xs font-mono text-zinc-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>Loading data from enterprise database...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="py-14 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-sm bg-slate-100 dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930] flex items-center justify-center text-zinc-400 mb-2.5">
                      <FilterX className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                      {emptyTitle}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-sm">
                      {emptyDescription}
                    </p>
                    {emptyAction && <div className="mt-3.5">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'transition-colors hover:bg-blue-50/40 dark:hover:bg-[#151720]',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* পেজিনেশন ফুটার (যদি মোট পেজ বা পেজ চেঞ্জ হ্যান্ডলার থাকে) */}
      {onPageChange && (
        <DataTablePagination
          currentPage={pageIndex}
          totalPages={pageCount ?? 1}
          pageSize={pageSize}
          totalItems={totalCount ?? data.length}
          currentCount={data.length}
          pageSizeOptions={pageSizeOptions}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
