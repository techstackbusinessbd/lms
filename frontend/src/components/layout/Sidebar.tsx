/**
 * অ্যাডমিন প্যানেল সাইডবার নেভিগেশন (Modern Industrial Admin Sidebar)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ৮টি ধারাবাহিক কাজের ধাপ ও সিস্টেম অ্যাডমিনিস্ট্রেশনের কম্প্যাক্ট ও মার্জিত সাইডবার।
 * রুল ১৬ (2px Corner Radius) এবং রুল ১৮ (Zero Clutter) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import {
  Layers,
  HardDrive,
  QrCode,
  CheckSquare,
  Truck,
  Cpu,
  Activity,
  CheckCircle2,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  // ৮টি ধারাবাহিক কাজের ধাপ
  const workflowSteps = [
    { id: 'step-1', name: 'Order Entry', stepNum: '1', icon: Layers },
    { id: 'step-2', name: 'Laser Vault', stepNum: '2', icon: HardDrive },
    { id: 'step-3', name: 'QR Generate', stepNum: '3', icon: QrCode },
    { id: 'step-4', name: 'QR Attach', stepNum: '4', icon: CheckSquare },
    { id: 'step-5', name: 'Body Intake', stepNum: '5', icon: Truck },
    { id: 'step-6', name: 'eMark Ready', stepNum: '6', icon: Cpu },
    { id: 'step-7', name: 'Live Fleet', stepNum: '7', icon: Activity },
    { id: 'step-8', name: 'QC Audit', stepNum: '8', icon: CheckCircle2 },
  ];

  // অ্যাডমিনিস্ট্রেশন মেনু
  const adminMenuItems = [
    { id: 'machines', name: 'Laser Machines (M01-M20)', icon: Radio },
    { id: 'users', name: 'Users & Roles (RBAC)', icon: Users },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between select-none shrink-0 transition-colors">
      {/* ১. সাইডবার টপ ব্র্যান্ডিং */}
      <div>
        <div className="h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  Denim LACS
                </span>
                <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">Laser Control Fleet</p>
            </div>
          </div>
        </div>

        {/* ২. নেভিগেশন স্ক্রোল এরিয়া */}
        <div className="px-3 py-3 space-y-5 overflow-y-auto max-h-[calc(100vh-125px)]">
          {/* ওভারভিউ ড্যাশবোর্ড লিঙ্ক */}
          <div>
            <button
              onClick={() => onNavigate('dashboard')}
              className={cn(
                'w-full h-8 px-2.5 rounded-sm flex items-center gap-2 text-xs font-medium transition-all',
                currentPath === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Fleet Overview</span>
            </button>
          </div>

          {/* সেকশন ১: দ্য লকড ৮-স্টেপ চেইন */}
          <div>
            <div className="px-2 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Workflow Chain (8 Steps)
              </span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-medium">
                8/8 Locked
              </span>
            </div>
            <div className="space-y-0.5">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                const isActive = currentPath === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => onNavigate(step.id)}
                    className={cn(
                      'w-full h-8 px-2.5 rounded-sm flex items-center justify-between text-xs transition-all',
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{step.name}</span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-mono px-1 rounded-sm border shrink-0',
                        isActive
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      )}
                    >
                      S{step.stepNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* সেকশন ২: সিস্টেম ম্যানেজমেন্ট */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Administration
              </span>
            </div>
            <div className="space-y-0.5">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'w-full h-8 px-2.5 rounded-sm flex items-center gap-2 text-xs transition-all',
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ৩. সাইডবার বটম ইউজার প্রোফাইল কার্ড */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-sm bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.full_name || 'System User'}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                {user?.role?.display_name || 'Operator'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-sm text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
