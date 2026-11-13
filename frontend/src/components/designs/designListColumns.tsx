/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন মাস্টার তালিকা কলাম ডেফিনিশন (Laser Design Master List Columns)
 *
 * TanStack Table v8 ভিত্তিক স্টাইল ও রেসিপি তালিকা।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { ColumnDef } from '@tanstack/react-table';
import { Layers, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { LaserDesign } from '@/types/design';

export function getLaserDesignListColumns(
  onOpenMapping: (design: LaserDesign) => void
): ColumnDef<LaserDesign>[] {
  return [
    {
      accessorKey: 'style_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="STYLE & RECIPE" />,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {d.style_code}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-sm bg-slate-100 dark:bg-[#1a1c24] text-zinc-600 dark:text-zinc-300 border border-slate-200 dark:border-[#272930]">
                  Rev v{d.version}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate max-w-xs">{d.recipe_name}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'mapped_files_summary',
      header: 'MAPPED FILES',
      cell: ({ row }) => {
        const files = row.original.files || [];
        const uniqueSizes = Array.from(new Set(files.map((f) => f.size_code)));
        if (files.length === 0) {
          return <span className="text-zinc-400 text-xs font-mono italic">0 files mapped</span>;
        }
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>{files.length} file(s)</span>
              <span className="text-zinc-400 text-[10px]">({uniqueSizes.length} sizes)</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {uniqueSizes.slice(0, 5).map((sz) => (
                <span key={sz} className="text-[9px] font-mono px-1 py-0.2 rounded-sm bg-slate-100 dark:bg-[#1e2028] text-zinc-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                  {sz}
                </span>
              ))}
              {uniqueSizes.length > 5 && (
                <span className="text-[9px] font-mono text-zinc-400">+{uniqueSizes.length - 5}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="STATUS" />,
      cell: ({ row }) => {
        const isLocked = row.original.is_locked;
        return (
          <Badge variant={isLocked ? 'success' : 'warning'} hasDot className="text-[10px] font-mono py-0.5">
            {isLocked ? 'Floor Locked' : 'Draft Editing'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="LAST UPDATED" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{new Date(row.original.updated_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'ACTION',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenMapping(row.original)}
          className="h-7 text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700"
        >
          <span>Open Matrix</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      ),
    },
  ];
}
