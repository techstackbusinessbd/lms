/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইজ ম্যাপিং ম্যাট্রিক্স কলাম ডেফিনিশন (Size Mapping Matrix Columns)
 *
 * TanStack Table v8 ভিত্তিক সাইজ রো এবং ইনলাইন স্লট কলাম আর্কিটেকচার।
 * রুল ১৬ (2px Corner Radius), রুল ২৩ (DataTable) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { ColumnDef } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { LaserDesignFile } from '@/types/design';
import { MatrixFileSlot } from './MatrixFileSlot';

export interface SizeMatrixRow {
  size_code: string;
  front_file?: LaserDesignFile;
  back_file?: LaserDesignFile;
  mockup_file?: LaserDesignFile;
  status: 'COMPLETE' | 'PARTIAL' | 'EMPTY';
}

interface MatrixColumnOptions {
  designId: string;
  isLocked: boolean;
  onFileUploaded: (file: LaserDesignFile) => void;
  onFileDeleted: (fileId: string) => void;
  onPreviewImage: (file: LaserDesignFile) => void;
  onRemoveSize?: (sizeCode: string) => void;
}

export function getSizeMatrixColumns(
  options: MatrixColumnOptions
): ColumnDef<SizeMatrixRow>[] {
  const { designId, isLocked, onFileUploaded, onFileDeleted, onPreviewImage, onRemoveSize } = options;

  return [
    {
      accessorKey: 'size_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="SIZE" />,
      size: 80,
      cell: ({ row }) => {
        const hasFiles = Boolean(
          row.original.front_file || row.original.back_file || row.original.mockup_file
        );
        return (
          <div className="flex items-center gap-1.5 group">
            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-sm bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 inline-block min-w-10 text-center shadow-2xs">
              {row.original.size_code}
            </span>
            {!isLocked && !hasFiles && onRemoveSize && (
              <button
                type="button"
                onClick={() => onRemoveSize(row.original.size_code)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 transition-opacity p-0.5 rounded-sm"
                title={`Remove size ${row.original.size_code}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      id: 'front_body',
      header: 'FRONT BODY (.jean5 / IMG)',
      size: 280,
      cell: ({ row }) => (
        <MatrixFileSlot
          designId={designId}
          sizeCode={row.original.size_code}
          placement="FRONT"
          file={row.original.front_file}
          isLocked={isLocked}
          onFileUploaded={onFileUploaded}
          onFileDeleted={onFileDeleted}
          onPreviewImage={onPreviewImage}
        />
      ),
    },
    {
      id: 'back_body',
      header: 'BACK BODY (.jean5 / IMG)',
      size: 280,
      cell: ({ row }) => (
        <MatrixFileSlot
          designId={designId}
          sizeCode={row.original.size_code}
          placement="BACK"
          file={row.original.back_file}
          isLocked={isLocked}
          onFileUploaded={onFileUploaded}
          onFileDeleted={onFileDeleted}
          onPreviewImage={onPreviewImage}
        />
      ),
    },
    {
      id: 'wash_mockup',
      header: 'WASH MOCKUP / SKETCH',
      size: 250,
      cell: ({ row }) => (
        <MatrixFileSlot
          designId={designId}
          sizeCode={row.original.size_code}
          placement="PANEL"
          file={row.original.mockup_file}
          isLocked={isLocked}
          onFileUploaded={onFileUploaded}
          onFileDeleted={onFileDeleted}
          onPreviewImage={onPreviewImage}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="STATUS" />,
      size: 90,
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'COMPLETE') {
          return (
            <Badge variant="success" className="text-[10px] font-mono py-0.5">
              Ready
            </Badge>
          );
        }
        if (s === 'PARTIAL') {
          return (
            <Badge variant="warning" className="text-[10px] font-mono py-0.5">
              Partial
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-[10px] font-mono py-0.5 text-zinc-400">
            Pending
          </Badge>
        );
      },
    },
  ];
}
