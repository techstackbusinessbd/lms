/**
 * টাচ-ফ্রেন্ডলি সেন্ট্রাল লগইন স্ক্রিন (Touch-Friendly Login Screen)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * অফিস ইউজার (Merchandiser, Designer, Admin) এবং ফ্লোর অপারেটরদের
 * দ্রুত ও সুরক্ষিত প্রবেশের জন্য ডুয়াল-মোড (পাসওয়ার্ড ও টাচ Quick-PIN) ইন্টারফেস প্রদান করে।
 * রুল ২৩ মেনে সম্পূর্ণ সার্ভার-সাইড ভ্যালিডেশন এবং ২px শার্প কর্নার রেডিয়াস ডিজাইন।
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

  // ট্যাব স্টেট
  const [activeTab, setActiveTab] = useState<LoginTab>('office');

  // অফিস লগইন ফিল্ডস
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // ফ্লোর লগইন ফিল্ডস
  const [pin, setPin] = useState('');
  const [badgeId, setBadgeId] = useState('');

  // লোডিং ও এরর স্টেট
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

  // ১. অফিস পাসওয়ার্ড লগইন সাবমিট
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
        setGeneralError('Network error: Unable to connect to authentication server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ২. ফ্লোর কুইক-পিন লগইন সাবমিট
  const handleFloorSubmit = async () => {
    clearErrors();
    if (pin.length < 4) {
      setGeneralError('Please enter at least 4 digits for Quick-PIN.');
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
        setGeneralError('Network error: Unable to connect to authentication server.');
      }
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* থিম টগল বাটন (টপ-রাইট) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* লোগো ও হেডার */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-blue-600 text-white mb-3 shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Denim Laser Automation & Control
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Jeanologia Flat Conveyor Fleet (M01-M20)
          </p>
        </div>

        {/* প্রধান লগইন কার্ড */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-sm overflow-hidden">
          {/* ডুয়াল মোড ট্যাব সুইচ */}
          <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => handleTabChange('office')}
              className={cn(
                'py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all',
                activeTab === 'office'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <UserIcon className="w-4 h-4" />
              <span>Office Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('floor')}
              className={cn(
                'py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all',
                activeTab === 'floor'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <KeyRound className="w-4 h-4" />
              <span>Floor Quick-PIN</span>
            </button>
          </div>

          <div className="p-6">
            {/* জেনারেল এরর ব্যানার */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-sm flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{generalError}</span>
              </div>
            )}

            {/* ট্যাব ১: অফিস ইউজার লগইন (পাসওয়ার্ড ভিত্তিক) */}
            {activeTab === 'office' && (
              <form noValidate onSubmit={handleOfficeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Username or Factory Email
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. tanvir.merch"
                      disabled={isLoading}
                      className={cn(
                        'w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-800 border rounded-sm outline-none transition-all placeholder:text-zinc-400',
                        fieldErrors.username_or_email
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500'
                      )}
                    />
                  </div>
                  {fieldErrors.username_or_email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {fieldErrors.username_or_email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={cn(
                        'w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-800 border rounded-sm outline-none transition-all placeholder:text-zinc-400',
                        fieldErrors.password
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-blue-600 dark:focus:border-blue-500'
                      )}
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-10 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-sm shadow-xs transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ট্যাব ২: শপ-ফ্লোর কুইক-পিন লগইন (টাচ কিপ্যাড) */}
            {activeTab === 'floor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Employee Badge / RFID (Optional)
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="Scan Badge or Enter Username"
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-sm outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-zinc-400"
                  />
                  {fieldErrors.badge_id_or_username && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {fieldErrors.badge_id_or_username}
                    </p>
                  )}
                </div>

                {/* টাচ কিপ্যাড কম্পোনেন্ট */}
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

          {/* ফুটার নোট */}
          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Gigabit Local LAN • Offline-First Sub-200ms Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
