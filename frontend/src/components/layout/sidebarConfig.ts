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
  Database,
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
    { id: 'order-entry', name: 'Order Entry', stepNum: 'S1', icon: Layers },
    { id: 'laser-design', name: 'Laser Design', stepNum: 'S2', icon: FileCode },
    { id: 'qr-print', name: 'QR Print', stepNum: 'S3', icon: QrCode },
    { id: 'qr-attach', name: 'QR Attach', stepNum: 'S4', icon: CheckSquare },
    { id: 'body-intake', name: 'Body Intake', stepNum: 'S5', icon: Truck },
    { id: 'emark-ready', name: 'eMark Ready', stepNum: 'S6', icon: Cpu },
    { id: 'production', name: 'Production', stepNum: 'S7', icon: Flame },
    { id: 'qc-audit', name: 'QC Audit', stepNum: 'S8', icon: CheckCircle2 },
  ],
};

// ২-লেভেল মেনু গ্রুপ ২: লেজার মেশিন ম্যানেজমেন্ট
export const fleetGroup: ParentMenuItem = {
  id: 'fleet',
  name: 'Laser Machines',
  icon: Radio,
  badge: '20 Tables',
  children: [
    { id: 'machine-fleet', name: 'Machine Fleet', icon: Radio },
    { id: 'edge-agents', name: 'Edge Agents', icon: Server },
  ],
};

// ২-লেভেল মেনু গ্রুপ ৩: অ্যাডমিনিস্ট্রেশন
export const adminGroup: ParentMenuItem = {
  id: 'admin',
  name: 'Administration',
  icon: Settings,
  children: [
    { id: 'master-data', name: 'Master Data', icon: Database },
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ],
};
