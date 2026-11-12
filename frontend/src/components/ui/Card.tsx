/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * কন্টেইনার কার্ড কম্পোনেন্ট (Master Card Component)
 * একীভূত লেআউট ও নিট-এন্ড-ক্লিন ভিজ্যুয়াল স্ট্রাকচার (রুল ১৬ ও ১৮ মেনে)
 */

import React from 'react';
import { cn } from '@/utils/cn';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-sm overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 border-b border-slate-800/60', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return (
    <p
      className={cn('text-xs text-slate-400', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={cn('p-5', className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex items-center justify-between p-4 border-t border-slate-800/60 bg-slate-950/40', className)}
      {...props}
    />
  );
}
