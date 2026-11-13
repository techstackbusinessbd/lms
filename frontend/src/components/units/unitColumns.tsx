/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * গার্মেন্ট ইউনিট ও কিউআর ডেটাটেবিল কলাম ডেফিনিশন (TanStack Table v8)
 * 
 * রুল ২৩ (TanStack Table), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Printer, Copy, Check, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { GarmentUnit, GarmentStage } from '@/types/unit';

export const stageBadgeVariantMap: Record<
  GarmentStage,
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  GENERATED: 'default',
  PRINTED: 'primary',
  ATTACHED: 'primary',
  RECEIVED_AT_LASER: 'warning',
  FRONT_DONE: 'warning',
  BACK_DONE: 'warning',
  COMPLETED: 'success',
  QC_PASSED: 'success',
  REJECTED: 'danger',
};

export const stageLabelMap: Record<GarmentStage, string> = {
  GENERATED: 'Generated',
  PRINTED: 'Printed',
  ATTACHED: 'Attached',
  RECEIVED_AT_LASER: 'At Laser Table',
  FRONT_DONE: 'Front Lasered',
  BACK_DONE: 'Back Lasered',
  COMPLETED: 'Completed',
  QC_PASSED: 'QC Passed',
  REJECTED: 'Rejected',
};

interface ColumnActionProps {
  onPreview: (unit: GarmentUnit) => void;
  onPrintSingle: (unit: GarmentUnit) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
}

export function getUnitColumns({
  onPreview,
  onPrintSingle,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
}: ColumnActionProps): ColumnDef<GarmentUnit>[] {
  return [
    {
      id: 'select',
      header: () => (
        <div className="flex items-center justify-center pl-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="w-3.5 h-3.5 rounded-sm border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
            aria-label="Select all units"
          />
        </div>
      ),
      cell: ({ row }) => {
        const isSelected = selectedIds.has(row.original.id);
        return (
          <div className="flex items-center justify-center pl-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(row.original.id)}
              className="w-3.5 h-3.5 rounded-sm border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
              aria-label={`Select unit ${row.original.unit_serial_no}`}
            />
          </div>
        );
      },
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: 'unit_serial_no',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SERIAL NO & PAYLOAD" />
      ),
      cell: ({ row }) => {
        const unit = row.original;
        const [copied, setCopied] = React.useState(false);

        const handleCopy = (e: React.MouseEvent) => {
          e.stopPropagation();
          navigator.clipboard.writeText(unit.unit_serial_no);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        };

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                {unit.unit_serial_no}
              </span>
              <button
                onClick={handleCopy}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-0.5 rounded-sm"
                title="Copy Serial Number"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]" title={unit.qr_code_payload}>
              {unit.qr_code_payload}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'size_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SIZE" />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm font-mono font-bold text-xs bg-slate-100 dark:bg-[#1a1c23] border border-slate-200/80 dark:border-[#282b35] text-zinc-900 dark:text-zinc-100">
          {row.original.size_code}
        </span>
      ),
      size: 70,
    },
    {
      accessorKey: 'production_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TYPE / CUT" />
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block">
              {u.production_type === 'COMPLETE_GARMENT' ? 'Complete Pant' : 'Cut Panel'}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <Scissors className="w-2.5 h-2.5" />
              <span>Cut: {u.cut_no || 'N/A'}</span>
              <span>•</span>
              <span>Bndl: {u.bundle_no || 'N/A'}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'current_stage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="WORKFLOW STAGE" />
      ),
      cell: ({ row }) => {
        const stage = row.original.current_stage;
        return (
          <Badge variant={stageBadgeVariantMap[stage] || 'default'}>
            {stageLabelMap[stage] || stage}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'printed_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="THERMAL PRINT STATUS" />
      ),
      cell: ({ row }) => {
        const isPrinted = !!row.original.printed_at || row.original.current_stage !== 'GENERATED';
        return isPrinted ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
            <Printer className="w-3.5 h-3.5" />
            <span>Printed</span>
          </div>
        ) : (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
            Pending Print
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right pr-2">ACTIONS</div>,
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5 pr-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(unit)}
              className="h-7 px-2 text-xs gap-1 rounded-sm border-slate-200/90 dark:border-[#22252e]"
              title="Preview 50x30mm Sew-in Label Stencil"
            >
              <Eye className="w-3 h-3 text-blue-500" />
              <span>Preview</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPrintSingle(unit)}
              className="h-7 px-2 text-xs gap-1 rounded-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border border-blue-200/50 dark:border-blue-800/40"
              title="Print single ZPL label"
            >
              <Printer className="w-3 h-3" />
              <span>Print</span>
            </Button>
          </div>
        );
      },
      enableSorting: false,
      size: 140,
    },
  ];
}
