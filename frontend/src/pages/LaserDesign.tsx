/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ও স্টাইল ম্যাপিং পোর্টাল (Laser Design Vault Portal)
 *
 * অর্ডার ম্যানেজমেন্টের অনুরূপ মাস্টার-ডিটেইল আর্কিটেকচার।
 * রুল ২৩ (TanStack Table & Server Validation), রুল ১৬ (2px Corner Radius)
 * এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vault, Plus, RefreshCw, Search, Layers, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getDesigns } from '@/services/designApi';
import { LaserDesign, LaserDesignFilterParams } from '@/types/design';
import { getLaserDesignListColumns } from '@/components/designs/designListColumns';
import { DesignMappingModal } from '@/components/designs/DesignMappingModal';

export const LaserDesignPage: React.FC = () => {
  const [designs, setDesigns] = useState<LaserDesign[]>([]);
  const [totalDesigns, setTotalDesigns] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // মডাল স্টেট
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<LaserDesign | null>(null);

  // ডিজাইন তালিকা লোড
  const loadDesigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: LaserDesignFilterParams = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      };
      const data = await getDesigns(params);
      setDesigns(data.items);
      setTotalDesigns(data.total);
      setTotalPages(data.total_pages);
    } catch {
      // হ্যান্ডলিং
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  // স্ট্যাটাস পরিসংখ্যান
  const stats = useMemo(() => {
    const locked = designs.filter((d) => d.is_locked).length;
    const draft = designs.filter((d) => !d.is_locked).length;
    return { locked, draft, total: totalDesigns };
  }, [designs, totalDesigns]);

  const handleOpenNewMapping = () => {
    setSelectedDesign(null);
    setIsMappingModalOpen(true);
  };

  const handleOpenExistingMapping = (design: LaserDesign) => {
    setSelectedDesign(design);
    setIsMappingModalOpen(true);
  };

  // TanStack Table কলামস
  const columns = useMemo(
    () => getLaserDesignListColumns((design) => handleOpenExistingMapping(design)),
    []
  );

  return (
    <div className="space-y-4">
      {/* ১. পেজ হেডার ও প্রাইমারি অ্যাকশন */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Vault className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Laser Design Vault
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {totalDesigns} Mapped Styles
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Jeanologia eMark (.jean5) Size Recipe &amp; Artwork Authoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDesigns} disabled={isLoading} className="h-8 font-mono text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenNewMapping} className="h-8 font-mono text-xs shadow-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Design Mapping</span>
          </Button>
        </div>
      </div>

      {/* ২. স্ট্যাটস কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase">Total Mapped Styles</p>
            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">{stats.total}</p>
          </div>
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase">Floor Locked</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.locked}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase">Draft Authoring</p>
            <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{stats.draft}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      {/* ৩. টুলবার: সার্চ ও ফিল্টারিং */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs">
        <div className="w-full sm:w-72 relative">
          <Input
            placeholder="Search style or recipe..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 pl-8 text-xs font-mono"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-40">
            <Select
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'LOCKED', label: 'Floor Locked' },
                { value: 'DRAFT', label: 'Draft Authoring' },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="h-8 text-xs font-mono"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ৪. TanStack Table v8 ভার্চুয়ালাইজড মাস্টার গ্রিড (রুল ২৩) */}
      <DataTable
        columns={columns}
        data={designs}
        isLoading={isLoading}
        emptyTitle="No Laser Designs Found"
        emptyDescription="Click '+ New Design Mapping' to author .jean5 size recipe files for your garment styles."
        emptyAction={
          <Button variant="primary" size="sm" onClick={handleOpenNewMapping} className="h-7 text-xs font-mono">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Map First Style</span>
          </Button>
        }
        pageIndex={currentPage}
        pageSize={pageSize}
        totalCount={totalDesigns}
        pageCount={totalPages}
        onPageChange={(p: number) => setCurrentPage(p)}
        onPageSizeChange={(s: number) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* ৫. সাইজ ম্যাট্রিক্স ইন্টারেক্টিভ ম্যাপিং মডাল */}
      <DesignMappingModal
        isOpen={isMappingModalOpen}
        initialDesign={selectedDesign}
        onClose={() => {
          setIsMappingModalOpen(false);
          setSelectedDesign(null);
        }}
        onSaved={loadDesigns}
      />
    </div>
  );
};
