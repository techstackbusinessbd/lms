/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইজ ম্যাট্রিক্স ফাইল স্লট কম্পোনেন্ট (Size Matrix File Slot)
 *
 * নির্দিষ্ট সাইজ ও প্লেসমেন্টের জন্য ফাইল আপলোড, ডিসপ্লে, প্রিভিউ ও ডিলিট পরিচালনার ইনলাইন সেল।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useRef } from 'react';
import { Upload, FileCode, Image as ImageIcon, Eye, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BodyPlacement, LaserDesignFile } from '@/types/design';
import { uploadDesignFile, deleteDesignFile } from '@/services/designApi';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selected: File) => {
    setIsUploading(true);
    try {
      const uploaded = await uploadDesignFile(designId, {
        file: selected,
        size_code: sizeCode,
        placement,
      });
      onFileUploaded(uploaded);
    } catch {
      // হ্যান্ডলিং
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
    return (
      <div
        className="flex items-center justify-between gap-1.5 p-1.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-5 h-5 rounded-sm flex items-center justify-center shrink-0 ${
            isImage ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
          }`}>
            {isImage ? <ImageIcon className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
          </div>
          <span className="truncate max-w-[120px] font-semibold text-zinc-800 dark:text-zinc-200" title={file.original_filename}>
            {file.original_filename}
          </span>
          <span className="text-[10px] text-zinc-400">({(file.file_size_bytes / 1024).toFixed(0)}K)</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
              className={`h-5 w-5 p-0 text-rose-500 hover:text-rose-700 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
              title="Remove File"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLocked) {
    return <span className="text-zinc-400 font-mono text-[11px] italic">— Empty —</span>;
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
      }}
      className="border border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 rounded-sm py-1.5 px-2 text-center text-xs font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jean5,.jean,.png,.jpg,.jpeg,.webp,.bmp,image/*"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        className="hidden"
      />
      {isUploading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
      ) : (
        <Upload className="w-3 h-3 text-zinc-400" />
      )}
      <span className="text-[11px]">{isUploading ? 'Uploading...' : '+ Attach File'}</span>
    </div>
  );
};
