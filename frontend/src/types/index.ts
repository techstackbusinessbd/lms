/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * কোর টাইপস্ক্রিপ্ট টাইপ ডেফিনিশনস
 */

// সিস্টেম হেলথ রেসপন্স টাইপ
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'offline';
  environment: string;
  timestamp: string;
  database_target: string;
  services: {
    fastapi: string;
    database: string;
    docker_runtime: string;
  };
}

// ২০টি Jeanologia মেশিনের লাইভ কানেক্টিভিটি স্ট্যাটাস
export type MachineOperationalState = 'idle' | 'engraving' | 'error' | 'offline';

export interface LaserMachineInfo {
  id: string;
  code: string;
  name: string;
  ip_address: string;
  status: MachineOperationalState;
  active_job_id?: string;
  last_heartbeat: string;
  total_scans_today: number;
}

// ৮টি ধারাবাহিক কাজের ধাপের আইডেন্টিফায়ার
export type WorkflowStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkflowStepSummary {
  step: WorkflowStepNumber;
  title: string;
  route: string;
  badgeCount?: number;
  isTouchOptimized: boolean;
}
