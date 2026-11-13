/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * স্মার্ট বাল্ক ফাইল ড্রপজোন (Smart Bulk File Dropzone)
 *
 * একাধিক সাইজের ফাইল ড্র্যাগ-এন্ড-ড্রপ করলে ফাইলের নাম থেকে স্বয়ংক্রিয় সাইজ ও প্লেসমেন্ট ডিটেক্ট করে
 * সার্ভারে আপলোড ও ম্যাপিং সম্পন্ন করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { BodyPlacement, LaserDesignFile } from '@/types/design';
import { uploadDesignFile } from '@/services/designApi';

interface BulkDropzoneProps {
  designId: string;
  isLocked: boolean;
  onBatchUploaded: (files: LaserDesignFile[]) => void;
}

export function parseFilenameMetadata(filename: string): { size: string; placement: BodyPlacement } {
  const lower = filename.toLowerCase();

  // ১. সাইজ ডিটেকশন (e.g. 28, 30, 32, 34, 36, 38, 40, ALL)
  const sizeMatch = lower.match(/(?:sz|size|_|-|\b)(2[6-9]|3[0-9]|4[0-4]|all)\b/i);
  const size = sizeMatch ? sizeMatch[1].toUpperCase() : '32';

  // ২. প্লেসমেন্ট ডিটেকশন (FRONT, BACK, PANEL/MOCKUP)
  let placement: BodyPlacement = 'FRONT';
  if (lower.includes('back') || lower.includes('_b_') || lower.includes('_b.') || lower.includes('-b.')) {
    placement = 'BACK';
  } else if (lower.includes('panel') || lower.includes('mockup') || lower.includes('sketch') || lower.includes('wash')) {
    placement = 'PANEL';
  }

  return { size, placement };
}

export const BulkDropzone: React.FC<BulkDropzoneProps> = ({
  designId,
  isLocked,
  onBatchUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    if (isLocked || files.length === 0) return;
    setIsProcessing(true);
    setStatusMsg(`Processing ${files.length} file(s)...`);
    setErrorMsg(null);

    const uploadedList: LaserDesignFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { size, placement } = parseFilenameMetadata(file.name);
      setStatusMsg(`Uploading ${i + 1}/${files.length}: ${file.name} ➔ Sz ${size} (${placement})...`);

      try {
        const res = await uploadDesignFile(designId, {
          file,
          size_code: size,
          placement,
        });
        uploadedList.push(res);
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message || 'Upload failed'}`);
      }
    }

    setIsProcessing(false);
    if (uploadedList.length > 0) {
      onBatchUploaded(uploadedList);
      setStatusMsg(`Successfully matched & uploaded ${uploadedList.length} design file(s)!`);
      setTimeout(() => setStatusMsg(null), 5000);
    }
    if (errors.length > 0) {
      setErrorMsg(`Failed ${errors.length} file(s). Check format (.jean5, .jean, .png, .jpg).`);
    }
  };

  if (isLocked) return null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
      }}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-slate-200 dark:border-[#272930] hover:border-blue-400 bg-white dark:bg-[#121317]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jean5,.jean,.png,.jpg,.jpeg,.webp,.bmp,image/*"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                Bulk Size Auto-Matcher
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Smart Parse
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Drag &amp; drop all design files here at once (.jean5, .jean, .png) — auto-matches sizes 28, 30, 32...
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
