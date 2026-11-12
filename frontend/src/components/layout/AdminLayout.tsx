/**
 * অ্যাডমিন প্যানেল মাস্টার লেআউট (Admin Master Layout Shell)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * সাইডবার, হেডার এবং রেসপন্সিভ কন্টেন্ট ভিউপোর্ট ফ্রেমওয়ার্ক।
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle,
  currentPath,
  onNavigate,
}) => {
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkHealth = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        setIsDbConnected(data?.services?.database === 'connected');
      } else {
        setIsDbConnected(false);
      }
    } catch {
      setIsDbConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors">
      {/* বামদিকের ফিক্সড সাইডবার */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* ডানদিকের প্রধান কনটেন্ট এরিয়া */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* টপ হেডার */}
        <Header
          pageTitle={pageTitle}
          isDbConnected={isDbConnected}
          onSync={checkHealth}
          isSyncing={isSyncing}
        />

        {/* স্ক্রলেবল মেইন ভিউপোর্ট */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
