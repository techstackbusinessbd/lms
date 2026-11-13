/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ফাইল আপলোড ও সাইজ ম্যাপিং মডাল (Design File Upload Modal)
 *
 * Jeanologia .jean ও .jean5 ফাইলের ড্র্যাগ-এন্ড-ড্রপ আপলোড ও মেটাডেটা এন্ট্রি।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle, Loader2, X } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadDesignFile, DesignApiError } from '@/services/designApi';
import { BodyPlacement, LaserDesignFile } from '@/types/design';

interface DesignFileUploadModalProps {
  isOpen: boolean;
  designId: string;
  onClose: () => void;
  onFileUploaded: (file: LaserDesignFile) => void;
}

const SIZE_OPTIONS = [
  { value: '28', label: 'Size 28' },
  { value: '30', label: 'Size 30' },
  { value: '32', label: 'Size 32' },
  { value: '34', label: 'Size 34' },
  { value: '36', label: 'Size 36' },
  { value: '38', label: 'Size 38' },
  { value: '40', label: 'Size 40' },
  { value: 'ALL', label: 'All Sizes (Universal)' },
];

const PLACEMENT_OPTIONS = [
  { value: 'FRONT', label: 'Front Body (Complete Garment)' },
  { value: 'BACK', label: 'Back Body (Complete Garment)' },
  { value: 'PANEL', label: 'Cut Panel (Single Step)' },
];

export const DesignFileUploadModal: React.FC<DesignFileUploadModalProps> = ({
  isOpen,
  designId,
  onClose,
  onFileUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sizeCode, setSizeCode] = useState<string>('32');
  const [placement, setPlacement] = useState<BodyPlacement>('FRONT');
  const [powerPercentage, setPowerPercentage] = useState<string>('');
  const [speedPercentage, setSpeedPercentage] = useState<string>('');
  const [cycleTimeSec, setCycleTimeSec] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'jean5' && ext !== 'jean') {
      setError('Invalid file format. Only Jeanologia .jean and .jean5 files are allowed.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop a .jean5 recipe file.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const uploaded = await uploadDesignFile(designId, {
        file: selectedFile,
        size_code: sizeCode,
        placement: placement,
        power_percentage: powerPercentage ? Number(powerPercentage) : undefined,
        speed_percentage: speedPercentage ? Number(speedPercentage) : undefined,
        cycle_time_estimate_sec: cycleTimeSec ? Number(cycleTimeSec) : undefined,
      });

      onFileUploaded(uploaded);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      if (err instanceof DesignApiError) {
        setError(err.message);
      } else {
        setError('Failed to upload file. Please verify network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Upload Laser Recipe (.jean5)</span>
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form id="upload-recipe-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* ড্র্যাগ-এন্ড-ড্রপ ফাইল জোন */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-[#272930] hover:border-blue-400 bg-slate-50/50 dark:bg-[#15171e]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jean5,.jean"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <FileCode className="w-4 h-4" />
                <span className="font-bold truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-[10px] text-zinc-400">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-sm ml-2"
                >
                  <X className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 mx-auto text-zinc-400" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Drag &amp; drop Jeanologia <span className="text-blue-600 font-mono">.jean5</span> file here
                </p>
                <p className="text-[11px] font-mono text-zinc-400">or click to browse from local workstation</p>
              </div>
            )}
          </div>

          {/* সাইজ ও প্লেসমেন্ট রো */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Size *"
              options={SIZE_OPTIONS}
              value={sizeCode}
              onChange={(e) => setSizeCode(e.target.value)}
              required
            />
            <Select
              label="Placement *"
              options={PLACEMENT_OPTIONS}
              value={placement}
              onChange={(e) => setPlacement(e.target.value as BodyPlacement)}
              required
            />
          </div>

          {/* লেজার প্যারামিটার ক্যাপ (অপশনাল) */}
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              label="Power Cap (%)"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 85"
              value={powerPercentage}
              onChange={(e) => setPowerPercentage(e.target.value)}
            />
            <Input
              label="Speed Cap (%)"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 90"
              value={speedPercentage}
              onChange={(e) => setSpeedPercentage(e.target.value)}
            />
            <Input
              label="Cycle Time (s)"
              type="number"
              min={0}
              placeholder="e.g. 42"
              value={cycleTimeSec}
              onChange={(e) => setCycleTimeSec(e.target.value)}
            />
          </div>
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-recipe-form"
            variant="primary"
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Uploading to Vault...</span>
              </>
            ) : (
              'Save & Map File'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
