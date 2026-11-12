/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মূল অ্যাপ্লিকেশন কম্পোনেন্ট - মাস্টার ইউআই কম্পোনেন্টস শোকেস (Phase 0 Step 0.4)
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  QrCode, 
  CheckSquare, 
  Truck, 
  HardDrive, 
  Activity, 
  CheckCircle2, 
  Info,
  Server,
  RefreshCw
} from 'lucide-react';
import { SystemHealth, LaserMachineInfo } from '@/types';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatusIndicator,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableToolbar
} from '@/components/ui';

export default function App(): React.JSX.Element {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // সেন্ট্রাল ব্যাকএন্ডের হেলথচেক কল
  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/health');
      if (response.ok) {
        const data: SystemHealth = await response.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch {
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // প্রাথমিক স্যাম্পল লেজার মেশিন ফ্লীট ডাটা (২০টি টেবিলের ডেমো ভিউ)
  const sampleMachines: LaserMachineInfo[] = [
    { id: '1', code: 'TBL-01', name: 'Jeanologia Conveyor 01', ip_address: '192.168.1.101', status: 'idle', total_scans_today: 412, last_heartbeat: 'Just now' },
    { id: '2', code: 'TBL-02', name: 'Jeanologia Conveyor 02', ip_address: '192.168.1.102', status: 'engraving', total_scans_today: 389, last_heartbeat: 'Just now' },
    { id: '3', code: 'TBL-03', name: 'Jeanologia Conveyor 03', ip_address: '192.168.1.103', status: 'idle', total_scans_today: 456, last_heartbeat: '1s ago' },
    { id: '4', code: 'TBL-04', name: 'Jeanologia Conveyor 04', ip_address: '192.168.1.104', status: 'idle', total_scans_today: 320, last_heartbeat: 'Just now' },
  ];

  const filteredMachines = sampleMachines.filter((m) =>
    m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ১. টপ নেভিগেশন বার */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Denim LACS
              <Badge variant="primary">v1.0.0</Badge>
            </h1>
            <p className="text-xs text-slate-400">
              Jeanologia Laser Automation & Control System (20 Flat Tables)
            </p>
          </div>
        </div>

        {/* ডানদিকের স্ট্যাটাস ব্যাজ ও অ্যাকশন বাটন */}
        <div className="flex items-center space-x-3">
          <Badge variant="success" hasDot>Local LAN (Offline-First)</Badge>
          <Badge variant="primary">&lt;200ms Latency SLA</Badge>
          <StatusIndicator 
            state={health?.status === 'healthy' ? 'idle' : 'error'} 
            showLabel 
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealth} 
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Sync
          </Button>
        </div>
      </header>

      {/* ২. মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* আর্কিটেকচার সামারি কার্ড */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Master UI Design System Initialized</CardTitle>
                <CardDescription>
                  Atomic components active: Button, Input, Badge, Modal, Card, Table & Status Indicators.
                </CardDescription>
              </div>
              <Modal>
                <ModalTrigger asChild>
                  <Button variant="secondary" size="sm" leftIcon={<Info className="h-4 w-4" />}>
                    Architecture Details
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Core Architecture Specifications</ModalTitle>
                    <ModalDescription>
                      Master parameters locked for 20 Jeanologia flat conveyor laser tables.
                    </ModalDescription>
                  </ModalHeader>
                  <div className="space-y-3 py-2 text-xs text-slate-300">
                    <p>• <strong>Primary Keys:</strong> RFC 9562 UUIDv7 (Time-sorted 128-bit IDs)</p>
                    <p>• <strong>Database:</strong> PostgreSQL 16 + SQLAlchemy 2.0 AsyncIO</p>
                    <p>• <strong>Backend:</strong> Python 3.13 + FastAPI 0.115</p>
                    <p>• <strong>Frontend:</strong> React 19 + TypeScript + Vite 6 + Tailwind CSS v4</p>
                    <p>• <strong>Target SLA:</strong> &lt;200ms Scan-to-Laser execution time</p>
                  </div>
                  <ModalFooter>
                    <ModalClose asChild>
                      <Button variant="primary" size="sm">Close</Button>
                    </ModalClose>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Database Engine</span>
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <Server className="h-3.5 w-3.5" />
                  {health?.services.database === 'connected' ? 'PostgreSQL 16 Connected' : 'Checking...'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Primary Key</span>
                <p className="text-sm font-semibold text-indigo-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  RFC 9562 UUIDv7
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Touch Target</span>
                <p className="text-sm font-semibold text-slate-200 mt-1">48px Industrial Touch</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Network Mode</span>
                <p className="text-sm font-semibold text-slate-200 mt-1">100% Offline LAN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ৩. লেজার টেবিল ফ্লীট টেবিল (TanStack Table Shell ডেমো) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
              Laser Table Fleet Readiness (Sample 4 of 20)
            </h3>
            <Badge variant="outline">20 Jeanologia Flat Tables</Badge>
          </div>

          <TableToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search machine code or name..."
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Machine Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Today's Scans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono font-semibold text-indigo-400">{m.code}</TableCell>
                  <TableCell className="font-medium text-white">{m.name}</TableCell>
                  <TableCell className="font-mono text-slate-400">{m.ip_address}</TableCell>
                  <TableCell>
                    <StatusIndicator state={m.status} showLabel />
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-slate-100">
                    {m.total_scans_today} pcs
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ৪. ৮টি কাজের ধারাবাহিক ধাপের কার্ড */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide mb-3">
            The Locked 8-Step Production Chain
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 'Step 1', name: 'Order Entry', icon: Layers, desc: 'Buyer, PO & Size Ratio', role: 'Merchandiser' },
              { step: 'Step 2', name: 'Laser Vault', icon: HardDrive, desc: '.jean5 Recipe Lock', role: 'Designer' },
              { step: 'Step 3', name: 'QR Printing', icon: QrCode, desc: 'ZPL Thermal Stickers', role: 'Cutting / Swing' },
              { step: 'Step 4', name: 'QR Attach', icon: CheckSquare, desc: 'Front-Back Side Join', role: 'Assembly' },
              { step: 'Step 5', name: 'Laser Intake', icon: Truck, desc: 'Chalan & Trolley Scan', role: 'Receiver' },
              { step: 'Step 6', name: 'eMark Ready', icon: Cpu, desc: 'Auto-Load in <200ms', role: 'Edge Agent' },
              { step: 'Step 7', name: 'Production', icon: Activity, desc: 'Live Counting & OEE', role: '20 Tables' },
              { step: 'Step 8', name: 'QC Audit', icon: CheckCircle2, desc: 'Quality Sign-off', role: 'Inspector' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">{item.step}</span>
                    <Badge variant="default">{item.role}</Badge>
                  </div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <IconComp className="h-4 w-4 text-slate-400" />
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        Denim Laser Automation & Control System • 20 Jeanologia Flat Conveyor Tables • 100% Offline-First LAN
      </footer>
    </div>
  );
}
