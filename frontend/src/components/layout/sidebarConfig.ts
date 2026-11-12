/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইডবার নেভিগেশন কনফিগারেশন (Sidebar 2-Level Menu Structure)
 * 
 * সহজ, প্রফেশনাল ও ইন্ডাস্ট্রিয়াল পরিমিত নামকরণ (রুল ১৮ - Zero Clutter)।
 * রুল ০৪ (<300 Lines) মেনে ডেটা ও ভিউ লজিক আলাদা রাখা হয়েছে।
 */

import React from 'react';
import {
  Layers,
  FileCode,
  QrCode,
  CheckSquare,
  Truck,
  Cpu,
  Flame,
  CheckCircle2,
  Users,
  Settings,
  Radio,
  Server,
} from 'lucide-react';

export interface SubMenuItem {
  id: string;
  name: string;
  stepNum?: string;
  icon?: React.ElementType;
}

export interface ParentMenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: string;
  children: SubMenuItem[];
}

// ২-লেভেল মেনু গ্রুপ ১: দ্য লকড ৮-স্টেপ লেজার ওয়ার্কফ্লো
export const workflowGroup: ParentMenuItem = {
  id: 'workflow',
  name: 'Laser Workflow',
  icon: Layers,
  badge: '8 Steps',
  children: [
    { id: 'step-1', name: 'Order Entry', stepNum: 'S1', icon: Layers },
    { id: 'step-2', name: 'Laser Design', stepNum: 'S2', icon: FileCode },
    { id: 'step-3', name: 'QR Print', stepNum: 'S3', icon: QrCode },
    { id: 'step-4', name: 'QR Attach', stepNum: 'S4', icon: CheckSquare },
    { id: 'step-5', name: 'Body Intake', stepNum: 'S5', icon: Truck },
    { id: 'step-6', name: 'eMark Ready', stepNum: 'S6', icon: Cpu },
    { id: 'step-7', name: 'Production', stepNum: 'S7', icon: Flame },
    { id: 'step-8', name: 'QC Audit', stepNum: 'S8', icon: CheckCircle2 },
  ],
};

// ২-লেভেল মেনু গ্রুপ ২: লেজার মেশিন ম্যানেজমেন্ট
export const fleetGroup: ParentMenuItem = {
  id: 'fleet',
  name: 'Laser Machines',
  icon: Radio,
  badge: '20 Tables',
  children: [
    { id: 'machines', name: 'Machine Fleet', icon: Radio },
    { id: 'machine-agents', name: 'Edge Agents', icon: Server },
  ],
};

// ২-লেভেল মেনু গ্রুপ ৩: অ্যাডমিনিস্ট্রেশন
export const adminGroup: ParentMenuItem = {
  id: 'admin',
  name: 'Administration',
  icon: Settings,
  children: [
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ],
};
