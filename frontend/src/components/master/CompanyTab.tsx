/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * কোম্পানি / ফ্যাক্টরি ইউনিট মাস্টার ট্যাব (Companies Tab)
 * 
 * রুল ২৩ (TanStack Table), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Search, RefreshCw, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { Company } from '@/types/masterData';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '@/services/masterDataApi';
import { MasterFormModal } from './MasterFormModal';

export const CompanyTab: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // মডাল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCompanies({ page, page_size: pageSize, search: search.trim() || undefined });
      setCompanies(res.items);
      setTotal(res.total);
    } catch {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleOpenAdd = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setSelectedCompany(comp);
    setIsModalOpen(true);
  };

  const handleDelete = async (comp: Company) => {
    if (window.confirm(`Are you sure you want to deactivate company '${comp.name}'?`)) {
      await deleteCompany(comp.id);
      loadCompanies();
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedCompany) {
      await updateCompany(selectedCompany.id, formData);
    } else {
      await createCompany(formData);
    }
    loadCompanies();
  };

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="CODE" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            {row.original.code}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="FACTORY / COMPANY NAME" />,
        cell: ({ row }) => (
          <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: ({ column }) => <DataTableColumnHeader column={column} title="LOCATION / ADDRESS" />,
        cell: ({ row }) => (
          <span className="text-xs text-zinc-500 font-mono">
            {row.original.address || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="STATUS" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
        size: 90,
      },
      {
        id: 'actions',
        header: () => <div className="text-right pr-2">ACTIONS</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(row.original)}
              className="h-7 px-2 text-xs rounded-sm"
              title="Edit Company"
            >
              <Edit2 className="w-3 h-3 text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original)}
              className="h-7 px-2 text-xs rounded-sm hover:text-rose-600"
              title="Deactivate Company"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
            </Button>
          </div>
        ),
        size: 90,
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      {/* টুলবার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search factory unit / code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs h-8 pl-8 pr-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs gap-1.5 rounded-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadCompanies} className="h-8 px-2 rounded-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={companies}
        isLoading={isLoading}
        totalCount={total}
        pageCount={Math.ceil(total / pageSize) || 1}
        pageIndex={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Companies Found"
        emptyDescription="Add manufacturing factory units to make them selectable during order entry."
      />

      <MasterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType="company"
        initialData={selectedCompany}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

