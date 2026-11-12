/**
 * প্রিমিয়াম সেন্ট্রাল লগইন স্ক্রিন (Enterprise Premium Login Screen)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * রুল ১৬ (2px Corner Radius & Dual Theme), রুল ১৮ (Zero Clutter) এবং
 * রুল ২৩ (Pydantic v2 Server-Side Validation) মেনে প্রস্তুতকৃত হাই-এন্ড ইন্ডাস্ট্রিয়াল ইউআই।
 */

import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  KeyRound,
  ShieldAlert,
  Sun,
  Moon,
  ArrowRight,
  Loader2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginWithPassword, loginWithQuickPin, AuthApiError } from '@/services/authApi';
import { useTheme } from '@/hooks/useTheme';
import { FloorKeypad } from '@/components/auth/FloorKeypad';
import { cn } from '@/utils/cn';

type LoginTab = 'office' | 'floor';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<LoginTab>('office');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [badgeId, setBadgeId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setGeneralError(null);
    setFieldErrors({});
  };

  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    clearErrors();
  };

  const handleOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const response = await loginWithPassword({
        username_or_email: usernameOrEmail,
        password: password,
      });
      login(response);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setGeneralError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setGeneralError('Authentication server unreachable. Please verify local LAN.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFloorSubmit = async () => {
    clearErrors();
    if (pin.length < 4) {
      setGeneralError('Please enter at least 4 digits for PIN.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await loginWithQuickPin({
        pin: pin,
        badge_id_or_username: badgeId.trim() || undefined,
      });
      login(response);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setGeneralError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setGeneralError('Authentication server unreachable. Please verify local LAN.');
      }
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden select-none transition-colors">
      {/* ১. হাই-এন্ড ব্যাকগ্রাউন্ড ডট-ম্যাট্রিক্স ও অ্যাম্বিয়েন্ট ব্লু গ্লো */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute w-[480px] h-[480px] -top-24 left-1/2 -translate-x-1/2 bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* ২. থিম টগল (টপ-রাইট) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-sm border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-2xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </div>

      {/* ৩. প্রিমিয়াম কার্ড কন্টেইনার */}
      <div className="relative z-10 w-full max-w-[380px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-sm shadow-xl shadow-zinc-950/5 dark:shadow-black/50 p-6 transition-all">
        {/* টপ স্পেকুলার গ্লো লাইন */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-500/80 to-transparent pointer-events-none" />

        {/* ব্র্যান্ড হেডার */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white mb-2.5 shadow-md shadow-blue-600/25 ring-1 ring-white/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Denim LACS
            </h1>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 tracking-wider">
              ENTERPRISE
            </span>
          </div>
        </div>

        {/* সেগমেন্টেড পিল সুইচ (Modern Pill Tab) */}
        <div className="flex p-1 bg-zinc-100/90 dark:bg-zinc-800/80 rounded-sm mb-4 border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => handleTabChange('office')}
            className={cn(
              'flex-1 py-1.5 text-xs rounded-sm flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'office'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium'
            )}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Office Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('floor')}
            className={cn(
              'flex-1 py-1.5 text-xs rounded-sm flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'floor'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium'
            )}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Floor Quick-PIN</span>
          </button>
        </div>

        {/* এরর ব্যানার */}
        {generalError && (
          <div className="mb-3.5 p-2.5 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-sm flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-fadeIn">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-tight">{generalError}</span>
          </div>
        )}

        {/* ১. অফিস লগইন ফর্ম */}
        {activeTab === 'office' && (
          <form noValidate onSubmit={handleOfficeSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="username or email"
                  disabled={isLoading}
                  className={cn(
                    'w-full pl-8.5 pr-3 py-2 text-xs bg-zinc-50/60 dark:bg-zinc-950/60 border rounded-sm outline-none transition-all placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-900',
                    fieldErrors.username_or_email
                      ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/20'
                  )}
                />
              </div>
              {fieldErrors.username_or_email && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.username_or_email}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn(
                    'w-full pl-8.5 pr-3 py-2 text-xs bg-zinc-50/60 dark:bg-zinc-950/60 border rounded-sm outline-none transition-all placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-900',
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/20'
                  )}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-10 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 disabled:from-zinc-200 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-850 disabled:text-zinc-400 dark:disabled:text-zinc-600 rounded-sm shadow-[0_1px_3px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:shadow-none active:translate-y-px transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ২. ফ্লোর কুইক-পিন ফর্ম */}
        {activeTab === 'floor' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Badge / RFID Scanner (Optional)
              </label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                placeholder="Scan RFID or enter Badge ID"
                disabled={isLoading}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-sm outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-zinc-400 font-mono"
              />
              {fieldErrors.badge_id_or_username && (
                <p className="mt-1 text-[11px] text-red-500">
                  {fieldErrors.badge_id_or_username}
                </p>
              )}
            </div>

            {/* টাচ কিপ্যাড */}
            <FloorKeypad
              pin={pin}
              onChange={setPin}
              onSubmit={handleFloorSubmit}
              isLoading={isLoading}
              maxDigits={6}
            />
          </div>
        )}
      </div>
    </div>
  );
};
