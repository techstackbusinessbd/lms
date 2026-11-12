/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইডবার নেভিগেশন কনফিগারেশন (Sidebar 2-Level Menu Structure)
 * 
 * রুল ০৪ (<300 Lines) মেনে ডেটা ও ভিউ লজিক আলাদা করা হয়েছে।
 */

import React from 'react';
import {
  Layers,
  HardDrive,
  QrCode,
  CheckSquare,
  Truck,
  Cpu,
  Activity,
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

// ২-লেভেল মেনু গ্রুপ ১: দ্য লকড ৮-স্টেপ ওয়ার্কফ্লো চেইন
export const workflowGroup: ParentMenuItem = {
  id: 'workflow',
  name: 'Workflow Chain',
  icon: Layers,
  badge: '8 Steps',
  children: [
    { id: 'step-1', name: 'Order Entry', stepNum: 'S1', icon: Layers },
    { id: 'step-2', name: 'Laser Vault', stepNum: 'S2', icon: HardDrive },
    { id: 'step-3', name: 'QR Generate', stepNum: 'S3', icon: QrCode },
    { id: 'step-4', name: 'QR Attach', stepNum: 'S4', icon: CheckSquare },
    { id: 'step-5', name: 'Body Intake', stepNum: 'S5', icon: Truck },
    { id: 'step-6', name: 'eMark Ready', stepNum: 'S6', icon: Cpu },
    { id: 'step-7', name: 'Live Fleet', stepNum: 'S7', icon: Activity },
    { id: 'step-8', name: 'QC Audit', stepNum: 'S8', icon: CheckCircle2 },
  ],
};

// ২-লেভেল মেনু গ্রুপ ২: লেজার ফ্লিট ও মেশিন ম্যানেজমেন্ট
export const fleetGroup: ParentMenuItem = {
  id: 'fleet',
  name: 'Laser Fleet',
  icon: Radio,
  badge: '20 Tables',
  children: [
    { id: 'machines', name: '20 Flat Tables (M01-M20)', icon: Radio },
    { id: 'machine-agents', name: 'IPC Edge Agents', icon: Server },
  ],
};

// ২-লেভেল মেনু গ্রুপ ৩: সিস্টেম অ্যাডমিনিস্ট্রেশন
export const adminGroup: ParentMenuItem = {
  id: 'admin',
  name: 'System Admin',
  icon: Settings,
  children: [
    { id: 'users', name: 'Users & Roles (RBAC)', icon: Users },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ],
};

