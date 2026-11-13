/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার এন্ট্রি ও পিও ম্যানেজমেন্ট পোর্টাল (Order Management Portal - Step 1)
 *
 * রুল ১৬ (2px Corner Radius & Dual Theme), রুল ২৩ (TanStack Table & Server-Side Validation)
 * এবং রুল ০৪ (<300 Lines) মেনে মডুলার আর্কিটেকচারে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/DataTableShell';
import { getOrders } from '@/services/orderApi';
import { Order, OrderFilterParams } from '@/types/order';
import { getOrderColumns } from '@/components/orders/orderColumns';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderToolbar } from '@/components/orders/OrderToolbar';
import { OrderCreateModal } from '@/components/orders/OrderCreateModal';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // মডাল স্টেট
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // অর্ডার লোড করার এসিঙ্ক ফাংশন
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: OrderFilterParams = {
        page: currentPage,
        page_size: 15,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      };
      const data = await getOrders(params);
      setOrders(data.items);
      setTotalOrders(data.total);
      setTotalPages(data.total_pages);
    } catch {
      // হ্যান্ডলিং
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // স্ট্যাটাসভিত্তিক কাউন্ট ম্যাপ
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // TanStack Table কলাম ডেফিনিশন (মেমোয়াইজড)
  const columns = useMemo(
    () => getOrderColumns((order) => setSelectedOrder(order)),
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* ১. পেজ হেডার ও প্রাইমারি অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Garments Purchase Orders
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {totalOrders} POs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              Step 1: Production Order Entry &amp; Recipe Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders()}
            disabled={isLoading}
            className="h-8 px-2.5 text-xs font-mono"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1.5 text-[11px]">Sync</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 px-3 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* ২. এক্সিকিউটিভ কেপিআই সারসংক্ষেপ স্ট্রিপ */}
      <OrderStats orders={orders} totalCount={totalOrders} />

      {/* ৩. ইউনিফাইড ফিল্টার ও সার্চ টুলবার */}
      <OrderToolbar
        activeStatus={statusFilter}
        onSelectStatus={(statusId) => {
          setStatusFilter(statusId);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        totalOrders={totalOrders}
        statusCounts={statusCounts}
      />

      {/* ৪. TanStack Table ডাটা ডিসপ্লে কার্ড */}
      <div className="relative overflow-hidden bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50/90 dark:bg-[#15171e]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[11px] font-mono py-2.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Syncing Orders with Database...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-sm bg-slate-100 dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930] flex items-center justify-center text-zinc-400 mb-2.5">
                      <FilterX className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                      No Matching Orders
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                      No purchase orders match your active search or filter.
                    </p>
                    {(searchQuery || statusFilter !== 'ALL') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="mt-3 h-7 text-xs font-mono"
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedOrder(row.original)}
                  className="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-[#151720] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ৫. ইন্ডাস্ট্রিয়াল পেজিনেশন ফুটার */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200/90 dark:border-[#1f2127] bg-slate-50/50 dark:bg-[#0f1013] text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <span>
            Showing {orders.length} of {totalOrders} orders
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              <span>Previous</span>
            </Button>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 px-1">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ক্রিয়েট অর্ডার মডাল */}
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={() => {
          loadOrders();
        }}
      />

      {/* অর্ডার ডিটেইলস ও অ্যাকশন মডাল */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdated={(updated) => {
          setSelectedOrder(updated);
          loadOrders();
        }}
        onDeleted={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
      />
    </div>
  );
};
