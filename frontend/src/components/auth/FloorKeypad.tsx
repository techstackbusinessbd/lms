/**
 * শপ-ফ্লোর টাচ-অপ্টিমাইজড নিউমেরিক কিপ্যাড (Floor Touch-Optimized Numeric Keypad)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ২০টি Jeanologia লেজার মেশিনের ফ্লোরে অপারেটরদের গ্লাভস পরিহিত অবস্থায়
 * দ্রুত ও ভুলমুক্তভাবে ৪-৬ ডিজিট Quick-PIN প্রদানের জন্য ৫৬px টাচ বাটন সরবরাহ করে।
 */

import React from 'react';
import { Delete, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FloorKeypadProps {
  pin: string;
  onChange: (pin: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  maxDigits?: number;
  disabled?: boolean;
}

export const FloorKeypad: React.FC<FloorKeypadProps> = ({
  pin,
  onChange,
  onSubmit,
  isLoading = false,
  maxDigits = 6,
  disabled = false,
}) => {
  const handleDigitClick = (digit: string) => {
    if (disabled || isLoading) return;
    if (pin.length < maxDigits) {
      onChange(pin + digit);
    }
  };

  const handleBackspace = () => {
    if (disabled || isLoading) return;
    if (pin.length > 0) {
      onChange(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (disabled || isLoading) return;
    onChange('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      {/* পিন ইনডিকেটর ডিসপ্লে */}
      <div className="flex justify-center items-center gap-2 mb-4 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
        {Array.from({ length: maxDigits }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-full border transition-all duration-150',
                isFilled
                  ? 'bg-blue-600 border-blue-600 scale-110 shadow-sm'
                  : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
              )}
            />
          );
        })}
      </div>

      {/* ৩x৪ নিউমেরিক গ্রিড কিপ্যাড (প্রতিটি বাটন ৫২px+ উচ্চতা) */}
      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => handleDigitClick(digit)}
            className="h-14 flex items-center justify-center text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            {digit}
          </button>
        ))}

        {/* ক্লিয়ার বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleClear}
          title="Clear PIN"
          className="h-14 flex items-center justify-center text-xs font-semibold uppercase text-zinc-500 hover:text-red-500 bg-white dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm active:scale-95 transition-all disabled:opacity-30"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* ডিজিট ০ */}
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => handleDigitClick('0')}
          className="h-14 flex items-center justify-center text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm shadow-xs active:scale-95 transition-all disabled:opacity-50"
        >
          0
        </button>

        {/* ব্যাকস্পেস বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleBackspace}
          title="Backspace"
          className="h-14 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm active:scale-95 transition-all disabled:opacity-30"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* সাবমিট বাটন */}
      <button
        type="button"
        disabled={disabled || isLoading || pin.length < 4}
        onClick={onSubmit}
        className="w-full mt-3 h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 rounded-sm shadow-sm transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying PIN...</span>
          </>
        ) : (
          <>
            <span>Verify & Enter</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
