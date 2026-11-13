/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইজ ম্যাট্রিক্স ফাইল স্লট কম্পোনেন্ট (Size Matrix File Slot)
 *
 * নির্দিষ্ট সাইজ ও প্লেসমেন্টের জন্য ফাইল আপলোড, ডিসপ্লে, প্রিভিউ, প্যারামিটার ও ডিলিট ইনলাইন সেল।
 * রুল: লক থাকলে অপারেটর প্যারামিটার এডিট করতে পারবে না; আনলক থাকলে এডিট করতে পারবে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useRef } from 'react';
import { Upload, FileCode, Image as ImageIcon, Eye, X, Loader2, SlidersHorizontal, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BodyPlacement, LaserDesignFile } from '@/types/design';
import { uploadDesignFile, deleteDesignFile } from '@/services/designApi';
import { FileParametersModal } from './FileParametersModal';

interface MatrixFileSlotProps {
  designId: string;
  sizeCode: string;
  placement: BodyPlacement;
  file?: LaserDesignFile;
  isLocked: boolean;
  onFileUploaded: (file: LaserDesignFile) => void;
  onFileDeleted: (fileId: string) => void;
  onPreviewImage: (file: LaserDesignFile) => void;
}

export const MatrixFileSlot: React.FC<MatrixFileSlotProps> = ({
  designId,
  sizeCode,
  placement,
  file,
  isLocked,
  onFileUploaded,
  onFileDeleted,
  onPreviewImage,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selected: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const uploaded = await uploadDesignFile(designId, {
        file: selected,
        size_code: sizeCode,
        placement,
      });
      onFileUploaded(uploaded);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file || isLocked) return;
    try {
      await deleteDesignFile(file.id);
      onFileDeleted(file.id);
    } catch {
      // হ্যান্ডলিং
    }
  };

  const isImage = file && ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP'].includes(file.file_format.toUpperCase());

  if (file) {
    const hasParams = file.power_percentage !== null && file.power_percentage !== undefined;

    return (
      <>
        <div
          className="flex items-center justify-between gap-1.5 p-1.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono group transition-colors hover:border-slate-300 dark:hover:border-zinc-700"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-5 h-5 rounded-sm flex items-center justify-center shrink-0 ${
                isImage
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              }`}
            >
              {isImage ? <ImageIcon className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
            </div>

            <span
              className="text-[9px] uppercase px-1 py-0.2 rounded-sm font-semibold shrink-0 bg-slate-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {file.file_format}
            </span>

            <span
              className="truncate max-w-[130px] sm:max-w-[160px] font-semibold text-zinc-800 dark:text-zinc-200"
              title={file.original_filename}
            >
              {file.original_filename}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* প্যারামিটার বাটন / ব্যাজ */}
            {!isImage && (
              <button
                type="button"
                onClick={() => setIsParamModalOpen(true)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-sm transition-colors border ${
                  isLocked
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-pointer'
                    : hasParams
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:border-blue-400'
                    : 'border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-blue-500'
                }`}
                title={
                  isLocked
                    ? 'Locked by Designer (Operator editing disabled)'
                    : 'Edit Laser Parameters (Power, Speed, Cycle Time)'
                }
              >
                {isLocked ? (
                  <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                ) : (
                  <SlidersHorizontal className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>{hasParams ? `P:${file.power_percentage}%` : 'Params'}</span>
              </button>
            )}

            {isImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreviewImage(file)}
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700"
                title="Preview Image"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            {!isLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className={`h-5 w-5 p-0 text-rose-500 hover:text-rose-700 ${
                  isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                }`}
                title="Remove File"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* প্যারামিটার এডিটিং মডাল */}
        <FileParametersModal
          isOpen={isParamModalOpen}
          designId={designId}
          file={file}
          isLocked={isLocked}
          onClose={() => setIsParamModalOpen(false)}
          onParametersUpdated={(updated) => onFileUploaded(updated)}
        />
      </>
    );
  }

  if (isLocked) {
    return (
      <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px] italic px-2">
        — Empty —
      </span>
    );
  }

  return (
    <div className="relative">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
        }}
        className="border border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 rounded-sm py-1.5 px-2.5 text-center text-xs font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jean5,.jean,.png,.jpg,.jpeg,.webp,.bmp,image/*"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="hidden"
        />
        {isUploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
        ) : (
          <Upload className="w-3 h-3 text-zinc-400" />
        )}
        <span className="text-[11px]">
          {isUploading ? 'Uploading...' : `+ Attach ${placement === 'FRONT' ? 'Front' : placement === 'BACK' ? 'Back' : 'Mockup'}`}
        </span>
      </div>
      {errorMsg && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-rose-500 font-mono truncate max-w-full">
          {errorMsg}
        </span>
      )}
    </div>
  );
};
