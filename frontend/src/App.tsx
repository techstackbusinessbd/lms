/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল অ্যাপ্লিকেশন কম্পোনেন্ট - অথেনটিকেশন গেট ও অ্যাডমিন প্যানেল রাউটার
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/Dashboard';

function AppContent(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
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

  // পেজ টাইটেল ম্যাপিং
  const pageTitles: Record<string, string> = {
    dashboard: 'Fleet Overview',
    'step-1': 'Step 1: Order Entry & Size Breakdown',
    'step-2': 'Step 2: Laser Recipe Vault (.jean5)',
    'step-3': 'Step 3: QR Code Generation & Printing',
    'step-4': 'Step 4: QR Code Attachment (Assembly)',
    'step-5': 'Step 5: Laser Body Intake & Chalan',
    'step-6': 'Step 6: eMark Auto-Ready at Machine',
    'step-7': 'Step 7: Production & Live OEE Counting',
    'step-8': 'Step 8: QC Audit & Lot Handover',
    machines: 'Laser Machines Fleet (M01-M20)',
    users: 'Users & Roles Management (RBAC)',
    settings: 'System Configuration',
  };

  return (
    <AdminLayout
      pageTitle={pageTitles[currentPath] || 'Admin Console'}
      currentPath={currentPath}
      onNavigate={setCurrentPath}
    >
      {currentPath === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs">
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
