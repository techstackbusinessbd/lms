/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার টেবিল কলাম ডেফিনিশন (TanStack Table v8 Columns Definition)
 *
 * রুল ০৪ (<300 Lines) মেনে কলাম রেন্ডারিং লজিক আলাদা ফাইলে সংরক্ষণ।
 * রুল ১৬ (Executive Aura Badges) মেনে ইউআই উপস্থাপন।
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
      accessorKey: 'po_number',
      header: 'PO NUMBER',
      cell: (info) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          {String(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'buyer_name',
      header: 'BUYER & STYLE',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {order.buyer_name}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              {order.style_code} {order.style_name ? `• ${order.style_name}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'wash_reference',
      header: 'WASH REFERENCE',
      cell: (info) => (
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          {String(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'total_quantity',
      header: 'TOTAL UNITS',
      cell: (info) => (
        <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
          {Number(info.getValue()).toLocaleString()} pcs
        </span>
      ),
    },
    {
      accessorKey: 'target_delivery_date',
      header: 'DELIVERY DATE',
      cell: (info) => (
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {String(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'PRIORITY',
      cell: (info) => {
        const val = String(info.getValue());
        return (
          <Badge
            variant={
              val === 'URGENT' ? 'danger' : val === 'HIGH' ? 'warning' : 'default'
            }
          >
            {val}
          </Badge>
        );
      },
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
