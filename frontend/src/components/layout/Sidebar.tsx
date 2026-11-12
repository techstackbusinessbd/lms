/**
 * অ্যাডমিন প্যানেল ২-লেভেল সাইডবার নেভিগেশন (Executive 2-Level Industrial Dark Sidebar)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * হায়ারার্কিকাল ড্রপডাউন/অ্যাকর্ডিয়ন ২-লেভেল মেনু ফ্রেমওয়ার্ক।
 * রুল ১৬ (2px Corner Radius), রুল ১৮ (Zero Clutter) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect } from 'react';
import { Cpu, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import {
  workflowGroup,
  fleetGroup,
  adminGroup,
  ParentMenuItem,
} from './sidebarConfig';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  // ড্রপডাউন ওপেন/ক্লোজ স্টেট (লেভেল ১ মেনু টগল)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    workflow: true, // ডিফল্ট ওপেন
    fleet: false,
    admin: false,
  });

  // অ্যাক্টিভ পাথের ওপর ভিত্তি করে স্বয়ংক্রিয় প্যারেন্ট ড্রপডাউন ওপেন রাখা
  useEffect(() => {
    if (workflowGroup.children.some((c) => c.id === currentPath)) {
      setOpenMenus((prev) => ({ ...prev, workflow: true }));
    } else if (fleetGroup.children.some((c) => c.id === currentPath)) {
      setOpenMenus((prev) => ({ ...prev, fleet: true }));
    } else if (adminGroup.children.some((c) => c.id === currentPath)) {
      setOpenMenus((prev) => ({ ...prev, admin: true }));
    }
  }, [currentPath]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // ২-লেভেল প্যারেন্ট মেনু রেন্ডারার
  const renderParentMenu = (group: ParentMenuItem) => {
    const isOpen = !!openMenus[group.id];
    const isChildActive = group.children.some((child) => child.id === currentPath);
    const GroupIcon = group.icon;

    return (
      <div key={group.id} className="space-y-0.5">
        {/* লেভেল ১ প্যারেন্ট বাটন */}
        <button
          type="button"
          onClick={() => toggleMenu(group.id)}
          className={cn(
            'w-full h-8 px-2.5 rounded-sm flex items-center justify-between text-xs font-medium transition-all select-none cursor-pointer',
            isChildActive
              ? 'text-zinc-100 bg-[#161820] font-semibold border-l-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1c23]'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <GroupIcon className={cn('w-3.5 h-3.5 shrink-0', isChildActive ? 'text-blue-400' : 'text-zinc-500')} />
            <span className="truncate">{group.name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {group.badge && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-sm bg-[#1b1d24] text-zinc-400 border border-[#272930]">
                {group.badge}
              </span>
            )}
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-zinc-500 transition-transform duration-200',
                isOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </div>
        </button>

        {/* লেভেল ২ সাব-মেনু কন্টেইনার (গাছপালা স্টাইল ট্রিলিন) */}
        {isOpen && (
          <div className="ml-4.5 pl-2.5 my-0.5 border-l border-[#1f2127] space-y-0.5">
            {group.children.map((subItem) => {
              const SubIcon = subItem.icon;
              const isActive = currentPath === subItem.id;

              return (
                <button
                  key={subItem.id}
                  type="button"
                  onClick={() => onNavigate(subItem.id)}
                  className={cn(
                    'w-full h-7 px-2 rounded-sm flex items-center justify-between text-[11px] transition-all select-none cursor-pointer',
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1c23] font-normal'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {SubIcon && <SubIcon className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{subItem.name}</span>
                  </div>

                  {subItem.stepNum && (
                    <span
                      className={cn(
                        'text-[9px] font-mono px-1 rounded-sm border shrink-0',
                        isActive
                          ? 'border-white/30 bg-white/10 text-white font-semibold'
                          : 'border-[#272930] bg-[#121317] text-zinc-500'
                      )}
                    >
                      {subItem.stepNum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 h-screen bg-[#0f1013] border-r border-[#1f2127] flex flex-col justify-between select-none shrink-0 transition-colors">
      {/* ১. সাইডবার টপ ব্র্যান্ডিং */}
      <div>
        <div className="h-14 px-4 border-b border-[#1f2127] flex items-center justify-between bg-[#0f1013]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-blue-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-zinc-100">
                  Denim LACS
                </span>
                <span className="text-[10px] font-mono font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 rounded-sm">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-tight">Laser Control Fleet</p>
            </div>
          </div>
        </div>

        {/* ২. ২-লেভেল নেভিগেশন স্ক্রোল এরিয়া */}
        <div className="px-3 py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          {/* ওভারভিউ ড্যাশবোর্ড লিঙ্ক (লেভেল ১ ডিরেক্ট) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                Overview
              </span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className={cn(
                'w-full h-8 px-2.5 rounded-sm flex items-center gap-2 text-xs font-medium transition-all cursor-pointer',
                currentPath === 'dashboard'
                  ? 'bg-blue-600 text-white font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-zinc-400 hover:bg-[#1a1c23] hover:text-zinc-100'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* সেকশন ১: অপারেশনস (২-লেভেল ড্রপডাউন) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                Operations
              </span>
            </div>
            <div className="space-y-1">
              {renderParentMenu(workflowGroup)}
              {renderParentMenu(fleetGroup)}
            </div>
          </div>

          {/* সেকশন ২: সিস্টেম অ্যাডমিনিস্ট্রেশন (২-লেভেল ড্রপডাউন) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                Administration
              </span>
            </div>
            <div className="space-y-1">{renderParentMenu(adminGroup)}</div>
          </div>
        </div>
      </div>

      {/* ৩. সাইডবার বটম ইউজার প্রোফাইল কার্ড */}
      <div className="p-3 border-t border-[#1f2127] bg-[#090a0d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-7 h-7 rounded-sm bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#090a0d] shadow-[0_0_6px_#10b981]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-100 truncate">
                {user?.full_name || 'System User'}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {user?.role?.display_name || 'Operator'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
