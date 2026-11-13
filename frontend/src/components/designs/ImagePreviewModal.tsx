/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার আর্টওয়ার্ক ও মকআপ ইমেজ প্রিভিউ মডাল (Image Preview Modal)
 *
 * আপলোডকৃত লেজার স্কেচ ও ওয়াশ এফেক্ট ইমেজের হাই-রেজোলিউশন লাইটবক্স প্রিভিউ।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect } from 'react';
import { Eye, Download, AlertCircle, Loader2 } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LaserDesignFile } from '@/types/design';
import { fetchDesignFileBlob } from '@/services/designApi';

interface ImagePreviewModalProps {
  isOpen: boolean;
  file: LaserDesignFile | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  file,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchDesignFileBlob(file.id)
      .then((url) => {
        if (isMounted) {
          setBlobUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load preview');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, file]);

  if (!file) return null;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="truncate max-w-md">{file.original_filename}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="primary" className="text-[10px] font-mono">
                {file.file_format}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                Size {file.size_code}
              </Badge>
            </div>
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-3">
          {/* ইমেজ ভিউয়ার এরিয়া */}
          <div className="relative min-h-64 max-h-[60vh] flex items-center justify-center bg-slate-950/5 dark:bg-black/30 border border-slate-200 dark:border-[#272930] rounded-sm overflow-hidden p-2">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-xs font-mono text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading high-res preview...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : blobUrl ? (
              <img
                src={blobUrl}
                alt={file.original_filename}
                className="max-h-[56vh] max-w-full object-contain rounded-sm shadow-xs"
              />
            ) : null}
          </div>

          {/* মেটাডেটা ফুটনোট */}
          <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200/80 dark:border-[#272930] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
            <div>
              Placement: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{file.placement}</span> • Size: {(file.file_size_bytes / 1024).toFixed(1)} KB
            </div>
            <div className="text-[10px] text-zinc-400">
              SHA: {file.file_hash_sha256.slice(0, 16)}...
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-mono">
            Close
          </Button>
          {blobUrl && (
            <a href={blobUrl} download={file.original_filename} className="inline-block">
              <Button variant="primary" size="sm" className="text-xs font-mono">
                <Download className="w-3.5 h-3.5 mr-1" />
                Download Image
              </Button>
            </a>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
