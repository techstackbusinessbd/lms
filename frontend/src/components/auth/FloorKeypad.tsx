/**
 * শপ-ফ্লোর টাচ-অপ্টিমাইজড নিউমেরিক কিপ্যাড (Premium Floor Touch Keypad)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * প্রিমিয়াম ইন্ডাস্ট্রিয়াল লুক: গ্লোয়িং sapphire/denim ডটস ও টেক্সটাইল টাচ কিপ্যাড।
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
    <div className="w-full select-none space-y-3">
      {/* প্রিমিয়াম পিন অ্যাপারচার ডটস */}
      <div className="flex justify-center items-center gap-3 py-3 px-4 bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-sm">
        {Array.from({ length: maxDigits }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <div
              key={index}
              className={cn(
                'w-3.5 h-3.5 rounded-full transition-all duration-200',
                isFilled
                  ? 'bg-blue-600 border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.6)] scale-110'
                  : 'bg-zinc-200 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700/80'
              )}
            />
          );
        })}
      </div>

      {/* প্রিমিয়াম ৩x৪ নিউমেরিক গ্রিড (৪৮px টাচ স্ট্যান্ডার্ড) */}
      <div className="grid grid-cols-3 gap-1.5">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => handleDigitClick(digit)}
            className="h-12 flex items-center justify-center text-lg font-bold font-mono text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-750 border border-zinc-200/90 dark:border-zinc-700/60 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-[0.97] active:border-blue-500 active:bg-blue-50/50 dark:active:bg-blue-950/30 transition-all disabled:opacity-40"
          >
            {digit}
          </button>
        ))}

        {/* ক্লিয়ার (C) বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleClear}
          title="Clear PIN"
          className="h-12 flex items-center justify-center text-xs font-mono font-semibold uppercase text-zinc-400 hover:text-red-500 bg-zinc-50/60 dark:bg-zinc-850/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80 rounded-sm active:scale-[0.97] transition-all disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* ডিজিট ০ */}
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => handleDigitClick('0')}
          className="h-12 flex items-center justify-center text-lg font-bold font-mono text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-750 border border-zinc-200/90 dark:border-zinc-700/60 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-[0.97] active:border-blue-500 active:bg-blue-50/50 dark:active:bg-blue-950/30 transition-all disabled:opacity-40"
        >
          0
        </button>

        {/* ব্যাকস্পেস বাটন */}
        <button
          type="button"
          disabled={disabled || isLoading || pin.length === 0}
          onClick={handleBackspace}
          title="Backspace"
          className="h-12 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-850/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80 rounded-sm active:scale-[0.97] transition-all disabled:opacity-30"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* প্রিমিয়াম সাবমিট বাটন */}
      <button
        type="button"
        disabled={disabled || isLoading || pin.length < 4}
        onClick={onSubmit}
        className="w-full mt-2 h-10 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-sm shadow-xs transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>VERIFY & ENTER</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
