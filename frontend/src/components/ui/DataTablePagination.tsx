/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ডেটাটেবিল পেজিনেশন কন্ট্রোল (DataTable Pagination Component)
 *
 * TanStack Table v8 এর পেজ নেভিগেশন ও পেজ সাইজ সিলেকশন পরিচালনা করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './Button';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  currentCount: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  currentCount,
  pageSizeOptions = [10, 15, 25, 50, 100],
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + currentCount - (currentCount > 0 ? 1 : 0), totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200/90 dark:border-[#1f2127] bg-slate-50/50 dark:bg-[#0f1013] text-xs font-mono text-zinc-500 dark:text-zinc-400 select-none">
      {/* বাম পাশ: রেকর্ড সংখ্যা প্রদর্শন ও পেজ সাইজ ড্রপডাউন */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-zinc-800 dark:text-zinc-200">{startItem}-{endItem}</strong> of{' '}
          <strong className="text-zinc-800 dark:text-zinc-200">{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="h-6 px-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm font-mono text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-600 transition-colors"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ডান পাশ: পেজ বাটন ও পেজ কাউন্টার */}
      <div className="flex items-center gap-1">
        {/* প্রথম পেজ */}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(1)}
          className="h-7 w-7 p-0 flex items-center justify-center rounded-sm"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>

        {/* পূর্ববর্তী পেজ */}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="h-7 px-2.5 text-xs font-mono flex-nowrap whitespace-nowrap rounded-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Previous</span>
        </Button>

        {/* বর্তমান পেজ / মোট পেজ */}
        <span className="px-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-mono whitespace-nowrap">
          {currentPage} / {totalPages || 1}
        </span>

        {/* পরবর্তী পেজ */}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-7 px-2.5 text-xs font-mono flex-nowrap whitespace-nowrap rounded-sm"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </Button>

        {/* শেষ পেজ */}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(totalPages)}
          className="h-7 w-7 p-0 flex items-center justify-center rounded-sm"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

