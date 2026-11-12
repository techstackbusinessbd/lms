/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ফ্রন্টএন্ড Vite কনফিগারেশন ফাইল
 * React 19, Tailwind CSS v4 এবং ডকার হট-রিলোড সাপোর্ট
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // পরম পাথ এলিয়াস (@/ pointing to src/)
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // ডকার উইন্ডোজ মাউন্টে লাইভ হট-রিলোড সক্রিয় রাখার জন্য পোলিং কনফিগারেশন
      usePolling: true,
      interval: 100,
    },
    proxy: {
      // সেন্ট্রাল ফাস্টএপিআই ব্যাকএন্ড প্রক্সি
      '/api': {
        target: 'http://lacs-dev-backend:8000',
        changeOrigin: true,
      },
    },
  },
});

