/**
 * অ্যাডমিন প্যানেল ২-লেভেল সাইডবার নেভিগেশন (Modern 2-Level Industrial Dark Sidebar)
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
            'w-full h-8 px-2.5 rounded-sm flex items-center justify-between text-xs font-medium transition-colors select-none',
            isChildActive
              ? 'text-zinc-100 bg-zinc-800/80 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <GroupIcon className={cn('w-3.5 h-3.5 shrink-0', isChildActive ? 'text-blue-500' : 'text-zinc-400')} />
            <span className="truncate">{group.name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {group.badge && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                {group.badge}
              </span>
            )}
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-zinc-400 transition-transform duration-200',
                isOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </div>
        </button>

        {/* লেভেল ২ সাব-মেনু কন্টেইনার (গাছপালা স্টাইল ট্রিলিন) */}
        {isOpen && (
          <div className="ml-4.5 pl-2.5 my-0.5 border-l border-zinc-800 space-y-0.5 animate-fadeIn">
            {group.children.map((subItem) => {
              const SubIcon = subItem.icon;
              const isActive = currentPath === subItem.id;

              return (
                <button
                  key={subItem.id}
                  type="button"
                  onClick={() => onNavigate(subItem.id)}
                  className={cn(
                    'w-full h-7 px-2 rounded-sm flex items-center justify-between text-[11px] transition-all select-none',
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 font-medium'
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
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500'
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
    <aside className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between select-none shrink-0 transition-colors">
      {/* ১. সাইডবার টপ ব্র্যান্ডিং */}
      <div>
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-zinc-100">
                  Denim LACS
                </span>
                <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded-sm bg-blue-950 text-blue-400 border border-blue-800">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">Laser Control Fleet</p>
            </div>
          </div>
        </div>

        {/* ২. ২-লেভেল নেভিগেশন স্ক্রোল এরিয়া */}
        <div className="px-3 py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          {/* ওভারভিউ ড্যাশবোর্ড লিঙ্ক (লেভেল ১ ডিরেক্ট) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Monitoring
              </span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className={cn(
                'w-full h-8 px-2.5 rounded-sm flex items-center gap-2 text-xs font-medium transition-all',
                currentPath === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Fleet Overview</span>
            </button>
          </div>

          {/* সেকশন ১: প্রোডাকশন অপারেশনস (২-লেভেল ড্রপডাউন) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Production & Fleet
              </span>
            </div>
            <div className="space-y-1">
              {renderParentMenu(workflowGroup)}
              {renderParentMenu(fleetGroup)}
            </div>
          </div>

          {/* সেকশন ২: সিস্টেম ম্যানেজমেন্ট (২-লেভেল ড্রপডাউন) */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                System
              </span>
            </div>
            <div className="space-y-1">{renderParentMenu(adminGroup)}</div>
          </div>
        </div>
      </div>

      {/* ৩. সাইডবার বটম ইউজার প্রোফাইল কার্ড */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-sm bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-100 truncate">
                {user?.full_name || 'System User'}
              </p>
              <p className="text-[10px] font-mono text-zinc-400 truncate">
                {user?.role?.display_name || 'Operator'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-sm text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
