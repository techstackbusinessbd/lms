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
import { Eye } from 'lucide-react';
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

export function getOrderColumns(
  onViewOrder: (order: Order) => void
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'job_no',
      header: 'JOB NO.',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
              {order.job_no || order.po_number}
            </span>
            {order.company && (
              <span className="text-[10px] text-zinc-400 font-mono block">
                {order.company}
              </span>
            )}
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
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {order.buyer_name}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
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
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {order.style_code}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
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
          <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
            {order.total_quantity.toLocaleString()} {order.uom || 'PCS'}
          </span>
        );
      },
    },
    {
      accessorKey: 'target_delivery_date',
      header: 'SHIP DATE',
      cell: (info) => (
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {String(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'dealing_merchant',
      header: 'DEALING MERCHANT',
      cell: (info) => (
        <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
          {String(info.getValue() || 'Unassigned')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: (info) => {
        const status = info.getValue() as Order['status'];
        return (
          <Badge variant={statusVariantMap[status]} hasDot>
            {status}
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
          className="h-7 px-2 text-xs"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span>View</span>
        </Button>
      ),
    },
  ];
}
