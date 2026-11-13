/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল অ্যাপ্লিকেশন কম্পোনেন্ট - অথেনটিকেশন গেট ও এইচটিএমএল৫ ইউআরএল রাউটার
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';

// ব্রাউজারের পাথ থেকে রুট কি (Key) এক্সট্রাক্ট করা
function getPathFromUrl(): string {
  if (typeof window === 'undefined') return 'dashboard';
  const cleanPath = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!cleanPath || cleanPath === 'login') return 'dashboard';
  return cleanPath;
}

function AppContent(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(getPathFromUrl);

  // ব্রাউজার ব্যাক/ফরওয়ার্ড বাটন (popstate) ইভেন্ট লিসেনার
  useEffect(() => {
    const handlePopState = () => {
      const path = getPathFromUrl();
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ইউআরএল সিঙ্ক এবং অথেনটিকেশন স্টেট হ্যান্ডলিং
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // যদি ইউজার লগইন না করা থাকে এবং URL /login না হয়, তবে /login-এ রিডাইরেক্ট
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    } else {
      // যদি ইউজার লগইন করা থাকে এবং URL /login বা রুট / হয়, তবে /dashboard বা সিলেক্টেড পাথে নিয়ে যাওয়া
      if (window.location.pathname === '/login' || window.location.pathname === '/') {
        window.history.replaceState(null, '', `/${currentPath}`);
      }
    }
  }, [isAuthenticated, isLoading, currentPath]);

  // নেভিগেশন হ্যান্ডলার (স্টেট ও ব্রাউজার অ্যাড্রেস বার উভয়ই সিঙ্ক হবে)
  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
    const targetUrl = path === 'dashboard' ? '/dashboard' : `/${path}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090a0d] text-zinc-900 dark:text-zinc-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
          Initializing Denim LACS Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // পেজ টাইটেল ম্যাপিং (মেনু নামের সাথে শতভাগ সম্পর্কিত নামকরণ)
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    'order-entry': 'Order Entry',
    orders: 'Order Entry',
    'step-1': 'Order Entry',
    'laser-design': 'Laser Design',
    'qr-print': 'QR Print',
    'qr-attach': 'QR Attach',
    'body-intake': 'Body Intake',
    'emark-ready': 'eMark Ready',
    production: 'Production',
    'qc-audit': 'QC Audit',
    'machine-fleet': 'Machine Fleet',
    machines: 'Machine Fleet',
    'edge-agents': 'Edge Agents',
    'machine-agents': 'Edge Agents',
    users: 'Users & Roles',
    settings: 'Settings',
  };

  return (
    <AdminLayout
      pageTitle={pageTitles[currentPath] || 'Admin Console'}
      currentPath={currentPath}
      onNavigate={handleNavigate}
    >
      {currentPath === 'dashboard' ? (
        <Dashboard />
      ) : currentPath === 'order-entry' || currentPath === 'orders' || currentPath === 'step-1' ? (
        <Orders />
      ) : (
        <div className="p-8 text-center bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {pageTitles[currentPath]}
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Scheduled for development in upcoming micro-steps per STEP_TRACKER.md.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
