/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল অ্যাপ্লিকেশন কম্পোনেন্ট - ফ্রন্টএন্ড স্কেলিটন (Phase 0 Baseline)
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Wifi, 
  Layers, 
  QrCode, 
  CheckSquare, 
  Truck, 
  HardDrive 
} from 'lucide-react';
import { SystemHealth } from './types';

export default function App(): React.JSX.Element {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // সেন্ট্রাল ব্যাকএন্ডের হেলথচেক সংযোগ পর্যবেক্ষণ
  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await fetch('/api/v1/health');
        if (response.ok) {
          const data: SystemHealth = await response.json();
          setHealth(data);
        } else {
          setHealth(null);
        }
      } catch {
        // ডকার নেটওয়ার্কে সরাসরি বা অফলাইন ফলব্যাক
        setHealth(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ১. টপ নেভিগেশন বার (Top Industrial Navigation) */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Denim LACS
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Jeanologia Laser Automation & Control System (20 Flat Conveyor Tables)
            </p>
          </div>
        </div>

        {/* ডানদিকের স্ট্যাটাস ব্যাজসমূহ */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">Local LAN (Offline-First)</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-300">&lt;200ms Latency SLA</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${health ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-xs font-medium text-slate-300">
              {isLoading ? 'Connecting...' : health ? 'System Online' : 'Standby Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* ২. মূল ড্যাশবোর্ড কন্টেইনার (Main Content) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* আর্কিটেকচারাল পরিচিতি কার্ড */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">
              Frontend Architecture Initialized
            </h2>
            <p className="text-sm text-slate-400">
              React 19 + Vite 6 + Tailwind CSS v4 + shadcn/ui Foundation Active.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              RFC 9562 UUIDv7 Active
            </span>
            <span className="text-xs px-3 py-1.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              PostgreSQL 16 Engine
            </span>
          </div>
        </div>

        {/* ৩. ৮টি কাজের ধাপের রিয়েলটাইম গ্রিড (The 8-Step Workflow Overview) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              Production Workflow Chain (8 Steps)
            </h3>
            <span className="text-xs text-slate-400">
              Locked Sequence • Zero Operator Misguidance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 'Step 1', name: 'Order Entry', icon: Layers, desc: 'Buyer, PO & Size Ratio', role: 'Merchandiser' },
              { step: 'Step 2', name: 'Laser Vault', icon: HardDrive, desc: '.jean5 Recipe Lock', role: 'Designer' },
              { step: 'Step 3', name: 'QR Printing', icon: QrCode, desc: 'ZPL Thermal Stickers', role: 'Cutting / Swing' },
              { step: 'Step 4', name: 'QR Attach', icon: CheckSquare, desc: 'Front-Back Side Join', role: 'Assembly' },
              { step: 'Step 5', name: 'Laser Intake', icon: Truck, desc: 'Chalan & Trolley Scan', role: 'Receiver' },
              { step: 'Step 6', name: 'eMark Ready', icon: Cpu, desc: 'Auto-Load in <200ms', role: 'Edge Agent' },
              { step: 'Step 7', name: 'Production', icon: Activity, desc: 'Live Counting & OEE', role: '20 Tables' },
              { step: 'Step 8', name: 'QC Audit', icon: CheckCircle2, desc: 'Quality Sign-off', role: 'Inspector' },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {item.step}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Sequence #{index + 1}</span>
                    <span className="text-emerald-400">Locked</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ৪. ফুটার (Industrial Baseline Footer) */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        Denim Laser Automation & Control System • 20 Jeanologia Flat Conveyor Tables • 100% Offline-First LAN
      </footer>
    </div>
  );
}
