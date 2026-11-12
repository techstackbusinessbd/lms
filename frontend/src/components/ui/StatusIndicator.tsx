/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার মেশিন লাইভ স্ট্যাটাস ইন্ডিকেটর (Status Indicator Component)
 * ২০টি Jeanologia মেশিনের হার্টবিট ও রিয়েলটাইম কাজের অবস্থা প্রদর্শনের জন্য
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { MachineOperationalState } from '@/types';

export interface StatusIndicatorProps {
  state: MachineOperationalState;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({
  state,
  showLabel = true,
  className,
  size = 'md',
}: StatusIndicatorProps): React.JSX.Element {
  // স্ট্যাটাস কালার ও টেক্সট কনফিগারেশন
  const stateConfig: Record<
    MachineOperationalState,
    { dotColor: string; pingColor: string; label: string; textColor: string }
  > = {
    engraving: {
      dotColor: 'bg-indigo-500',
      pingColor: 'bg-indigo-400',
      label: 'Engraving',
      textColor: 'text-indigo-400',
    },
    idle: {
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      label: 'Table Ready',
      textColor: 'text-emerald-400',
    },
    error: {
      dotColor: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      label: 'Alarm / Error',
      textColor: 'text-rose-400',
    },
    offline: {
      dotColor: 'bg-slate-500',
      pingColor: 'bg-slate-400',
      label: 'Disconnected',
      textColor: 'text-slate-400',
    },
  };

  const current = stateConfig[state] || stateConfig.offline;

  // সাইজ স্কেল
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <span className="relative flex items-center justify-center">
        {state !== 'offline' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              current.pingColor
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeClasses[size],
            current.dotColor
          )}
        />
      </span>

      {showLabel && (
        <span className={cn('text-xs font-medium', current.textColor)}>
          {current.label}
        </span>
      )}
    </div>
  );
}
