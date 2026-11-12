/**
 * টাচ-ফ্রেন্ডলি সেন্ট্রাল লগইন স্ক্রিন (Neat & Clean Login Screen)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * রুল ১৮ (Neat, Clean & Zero Clutter) এবং রুল ১৬ (2px Corner Radius) মেনে তৈরি পরিচ্ছন্ন লগইন পেজ।
 * অফিস ক্রেডেনশিয়াল এবং শপ-ফ্লোর Quick-PIN এর জন্য মার্জিত ও দ্রুত ইন্টারফেস।
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
        setGeneralError('Unable to connect to authentication server.');
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
        setGeneralError('Unable to connect to authentication server.');
      }
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* থিম টগল (টপ-রাইট) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* লোগো ও হেডার */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-10 h-10 rounded-sm bg-blue-600 flex items-center justify-center text-white mb-2.5 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Denim LACS
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Laser Automation & Control System
          </p>
        </div>

        {/* নিট ও ক্লিন প্রধান কার্ড */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs p-5">
          {/* সেগমেন্টেড পিল ট্যাব কন্ট্রোল */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-sm mb-4">
            <button
              type="button"
              onClick={() => handleTabChange('office')}
              className={cn(
                'flex-1 py-1.5 text-xs rounded-sm flex items-center justify-center gap-1.5 transition-all',
                activeTab === 'office'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
              )}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Office</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('floor')}
              className={cn(
                'flex-1 py-1.5 text-xs rounded-sm flex items-center justify-center gap-1.5 transition-all',
                activeTab === 'floor'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
              )}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Floor PIN</span>
            </button>
          </div>

          {/* জেনারেল এরর ব্যানার */}
          {generalError && (
            <div className="mb-3.5 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-sm flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-fadeIn">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-tight">{generalError}</span>
            </div>
          )}

          {/* ১. অফিস লগইন ফর্ম */}
          {activeTab === 'office' && (
            <form noValidate onSubmit={handleOfficeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoComplete="username"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="username or email"
                    disabled={isLoading}
                    className={cn(
                      'w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800/80 border rounded-sm outline-none transition-all placeholder:text-zinc-400',
                      fieldErrors.username_or_email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-zinc-200 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500'
                    )}
                  />
                </div>
                {fieldErrors.username_or_email && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.username_or_email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={cn(
                      'w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800/80 border rounded-sm outline-none transition-all placeholder:text-zinc-400',
                      fieldErrors.password
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-zinc-200 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500'
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
                className="w-full mt-1.5 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-sm shadow-2xs transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
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
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="Badge ID / RFID (Optional)"
                  disabled={isLoading}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-sm outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-zinc-400"
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
    </div>
  );
};
