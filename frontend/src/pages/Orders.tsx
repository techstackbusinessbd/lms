/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার এন্ট্রি ও পিও ম্যানেজমেন্ট পোর্টাল (Order Management Portal - Step 1)
 *
 * রুল ১৬ (2px Corner Radius & Dual Theme), রুল ২৩ (TanStack Table & Server-Side Validation)
 * এবং রুল ০৪ (<300 Lines) মেনে মডুলার আর্কিটেকচারে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
  TableEmptyState,
} from '@/components/ui/DataTableShell';
import { getOrders } from '@/services/orderApi';
import { Order, OrderFilterParams } from '@/types/order';
import { getOrderColumns } from '@/components/orders/orderColumns';
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

  // স্ট্যাটাস ফিল্টার পিলস
  const statusTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'PENDING_DESIGN', label: 'Pending Design' },
    { id: 'DESIGN_APPROVED', label: 'Approved' },
    { id: 'IN_PRODUCTION', label: 'In Production' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  // TanStack Table কলাম ডেফিনিশন (এক্সটার্নাল ফাইল থেকে মেমোয়াইজড)
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
    <div className="space-y-3.5">
      {/* ১. হেডার ও অ্যাকশন বার */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
            Orders
          </h1>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {totalOrders}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders()}
            disabled={isLoading}
            className="h-8 px-2.5 text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 px-3 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* ২. সেগমেন্টেড স্ট্যাটাস ফিল্টার পিলস ও সার্চ বার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center p-0.5 rounded-sm bg-slate-100 dark:bg-[#0c0d11] border border-slate-200/80 dark:border-[#1f2127] overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-[#1c1d23] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Job No, style, buyer, company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9 pl-9 pr-3 rounded-sm bg-white dark:bg-[#121317] border border-slate-200 dark:border-[#1f2127] text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* ৩. TanStack Table ডাটা ডিসপ্লে */}
      <div className="bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableEmptyState
                    title="No orders found"
                    description="No orders match your search or filter criteria."
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* পেজিনেশন ফুটার */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#1f2127] text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <span>
            Showing {orders.length} of {totalOrders} orders
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Previous</span>
            </Button>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-7 px-2"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ৪. ক্রিয়েট অর্ডার মডাল */}
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={() => {
          loadOrders();
        }}
      />

      {/* ৫. অর্ডার ডিটেইলস ও অ্যাকশন মডাল */}
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
