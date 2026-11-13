/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার টেবিল কলাম ডেফিনিশন (Garments Enterprise Order Columns)
 *
 * সিটিও স্যারের স্পেসিফিকেশন অনুসারী ১০টি কোর ফিল্ড প্রদর্শন:
 * Company, Buyer, Style, Job No., Brand, Season, Order Qty, UOM, Ship Date, Dealing Merchant
 *
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { ColumnDef } from '@tanstack/react-table';
import { Eye, Calendar, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Order } from '@/types/order';

export const statusVariantMap: Record<
  Order['status'],
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  PENDING_DESIGN: 'warning',
  DESIGN_APPROVED: 'primary',
  IN_PRODUCTION: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const statusLabelMap: Record<Order['status'], string> = {
  PENDING_DESIGN: 'Pending Design',
  DESIGN_APPROVED: 'Approved',
  IN_PRODUCTION: 'In Production',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function getOrderColumns(
  onViewOrder: (order: Order) => void
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'job_no',
      header: 'JOB NO. & UNIT',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer block">
              {order.job_no || order.po_number}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate block max-w-[140px]" title={order.company}>
              {order.company || 'Denim Solutions Ltd.'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'buyer_name',
      header: 'BUYER & BRAND',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
              {order.buyer_name}
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {order.brand || 'Main Brand'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'style_code',
      header: 'STYLE & SEASON',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100">
              {order.style_code}
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {order.season || 'Standard Season'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'total_quantity',
      header: 'ORDER QTY',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {order.total_quantity.toLocaleString()}
            </span>
            <span className="text-[10px] px-1 py-0.2 rounded-sm bg-slate-100 dark:bg-[#1a1c24] text-zinc-500 dark:text-zinc-400 border border-slate-200 dark:border-[#272930] font-medium">
              {order.uom || 'PCS'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'target_delivery_date',
      header: 'SHIP DATE',
      cell: (info) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <Calendar className="w-3 h-3 text-zinc-400" />
          <span>{String(info.getValue())}</span>
        </div>
      ),
    },
    {
      accessorKey: 'dealing_merchant',
      header: 'MERCHANT',
      cell: (info) => {
        const merchant = String(info.getValue() || 'Unassigned');
        return (
          <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
            <UserCheck className="w-3 h-3 text-zinc-400" />
            <span className="font-medium truncate max-w-[120px]">{merchant}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: (info) => {
        const status = info.getValue() as Order['status'];
        return (
          <Badge variant={statusVariantMap[status]} hasDot className="text-[10px] font-mono py-0.5">
            {statusLabelMap[status] || status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTION',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewOrder(row.original)}
          className="h-7 px-2.5 text-xs border border-slate-200 dark:border-[#272930] hover:bg-slate-100 dark:hover:bg-[#1a1c22] rounded-sm font-mono cursor-pointer"
        >
          <Eye className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
          <span>View</span>
        </Button>
      ),
    },
  ];
}
