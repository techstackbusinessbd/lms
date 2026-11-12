/**
 * শপ-ফ্লোর টাচ-অপ্টিমাইজড নিউমেরিক কিপ্যাড (Floor Touch-Optimized Keypad)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ৪-৬ সংখ্যার Quick-PIN দ্রুত ও নির্ভুলভাবে এন্ট্রি করার জন্য পরিচ্ছন্ন ও মিনিমাল কিপ্যাড।
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
    <div className="w-full select-none">
      {/* পিন ডটস ইনডিকেটর (মিনিমাল ও নিট) */}
      <div className="flex justify-center items-center gap-2.5 py-3 mb-1">
        {Array.from({ length: maxDigits }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <div
              key={index}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-150',
                isFilled
                  ? 'bg-blue-600 scale-110 shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700'
              )}
            />
          );
        })}
      </div>

      {/* ৩x৪ কিপ্যাড গ্রিড (৪৮px+ টাচ বাটন) */}
      <div className="grid grid-cols-3 gap-1.5">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => handleDigitClick(digit)}
            className="h-12 flex items-center justify-center text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-sm shadow-2xs active:scale-95 transition-all disabled:opacity-40"
          >
            {digit}
          </button>
        ))}

        {/* ক্লিয়ার বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleClear}
          title="Clear"
          className="h-12 flex items-center justify-center text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-sm active:scale-95 transition-all disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* ডিজিট ০ */}
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => handleDigitClick('0')}
          className="h-12 flex items-center justify-center text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-sm shadow-2xs active:scale-95 transition-all disabled:opacity-40"
        >
          0
        </button>

        {/* ব্যাকস্পেস বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleBackspace}
          title="Backspace"
          className="h-12 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-sm active:scale-95 transition-all disabled:opacity-30"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* সাবমিট বাটন */}
      <button
        type="button"
        disabled={disabled || isLoading || pin.length < 4}
        onClick={onSubmit}
        className="w-full mt-2.5 h-10 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 rounded-sm shadow-xs transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Enter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
};
