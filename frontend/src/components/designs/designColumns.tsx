/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ফাইল টেবিল কলাম ডেফিনিশন (Design Files DataTable Columns)
 *
 * TanStack Table v8 ভিত্তিক সাইজ ম্যাপিং ও ফাইল মেটাডেটা কলাম।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { ColumnDef } from '@tanstack/react-table';
import { FileCode, Zap, Clock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { LaserDesignFile } from '@/types/design';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getDesignFileColumns(): ColumnDef<LaserDesignFile>[] {
  return [
    {
      accessorKey: 'size_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="SIZE" />,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
          {row.original.size_code}
        </span>
      ),
    },
    {
      accessorKey: 'placement',
      header: ({ column }) => <DataTableColumnHeader column={column} title="PLACEMENT" />,
      cell: ({ row }) => {
        const placement = row.original.placement;
        const variant =
          placement === 'FRONT' ? 'primary' : placement === 'BACK' ? 'default' : 'warning';
        return (
          <Badge variant={variant} className="text-[10px] font-mono py-0.5">
            {placement === 'FRONT'
              ? 'Front Body'
              : placement === 'BACK'
              ? 'Back Body'
              : 'Cut Panel'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'original_filename',
      header: ({ column }) => <DataTableColumnHeader column={column} title="RECIPE FILE" />,
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-slate-100 dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930] flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileCode className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]" title={file.original_filename}>
                {file.original_filename}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                <span>{file.file_format}</span>
                <span>•</span>
                <span>{formatBytes(file.file_size_bytes)}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'file_hash_sha256',
      header: ({ column }) => <DataTableColumnHeader column={column} title="SHA-256 HASH" />,
      cell: ({ row }) => {
        const hash = row.original.file_hash_sha256;
        return (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400" title={hash}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{hash.slice(0, 10)}...{hash.slice(-8)}</span>
          </div>
        );
      },
    },
    {
      id: 'laser_parameters',
      header: 'LASER PARAMETERS',
      cell: ({ row }) => {
        const f = row.original;
        return (
          <div className="flex items-center gap-3 font-mono text-xs">
            {f.power_percentage !== null && f.power_percentage !== undefined ? (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px]" title="Laser Power Cap">
                <Zap className="w-3 h-3" />
                <span>{f.power_percentage}%</span>
              </span>
            ) : null}
            {f.speed_percentage !== null && f.speed_percentage !== undefined ? (
              <span className="text-blue-600 dark:text-blue-400 text-[11px]" title="Laser Speed Cap">
                Spd: {f.speed_percentage}%
              </span>
            ) : null}
            {f.cycle_time_estimate_sec !== null && f.cycle_time_estimate_sec !== undefined ? (
              <span className="flex items-center gap-1 text-zinc-500 text-[11px]" title="Cycle Time Estimate">
                <Clock className="w-3 h-3" />
                <span>{f.cycle_time_estimate_sec}s</span>
              </span>
            ) : null}
            {f.power_percentage == null && f.speed_percentage == null && f.cycle_time_estimate_sec == null && (
              <span className="text-zinc-400 text-[11px]">eMark Defaults</span>
            )}
          </div>
        );
      },
    },
  ];
}
