/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার বিস্তারিত ও অ্যাকশন মডাল (Order Details & Action Modal)
 *
 * অর্ডারের সম্পূর্ণ মেটাডাটা প্রদর্শন, স্ট্যাটাস ট্রানজিশন এবং সফট-ডিলিট পরিচালনা করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Loader2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { updateOrderStatus, deleteOrder } from '@/services/orderApi';
import { Order } from '@/types/order';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updated: Order) => void;
  onDeleted: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
  onDeleted,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!order) return null;

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(order.id, selectedStatus);
      onStatusUpdated(updated);
      setSelectedStatus('');
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrder(order.id);
      onDeleted(order.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      alert('Failed to delete order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusVariantMap: Record<Order['status'], 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    PENDING_DESIGN: 'warning',
    DESIGN_APPROVED: 'primary',
    IN_PRODUCTION: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <div className="flex items-center justify-between pr-6">
            <ModalTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Purchase Order: {order.po_number}</span>
            </ModalTitle>
            <Badge variant={statusVariantMap[order.status]} hasDot>
              {order.status}
            </Badge>
          </div>
          <ModalDescription>
            Created on {new Date(order.created_at).toLocaleDateString()} • Revision Rev {order.current_revision}
          </ModalDescription>
        </ModalHeader>

        {/* অর্ডার মূল মেটাডাটা গ্রিড */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-[#15171d] rounded-sm border border-slate-200/80 dark:border-[#22252e]">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Buyer</span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{order.buyer_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Style Code</span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{order.style_code}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total Quantity</span>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">{order.total_quantity.toLocaleString()} pcs</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Wash Reference</span>
            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{order.wash_reference}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Delivery Date</span>
            <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200">{order.target_delivery_date}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Priority</span>
            <Badge variant={order.priority === 'URGENT' ? 'danger' : order.priority === 'HIGH' ? 'warning' : 'default'} className="mt-0.5">
              {order.priority}
            </Badge>
          </div>
        </div>

        {order.style_name && (
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Style Description: </span>
            {order.style_name}
          </div>
        )}

        {order.fabric_description && (
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Fabric Composition: </span>
            {order.fabric_description}
          </div>
        )}

        {order.notes && (
          <div className="p-3 bg-zinc-50 dark:bg-[#121318] rounded-sm border border-zinc-200 dark:border-[#22252e] text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">Production Notes:</span>
            <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {/* স্ট্যাটাস আপডেট কন্ট্রোল */}
        <div className="p-3.5 rounded-sm border border-slate-200/80 dark:border-[#22252e] bg-white dark:bg-[#16181f] space-y-2">
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Lifecycle Status Transition
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus || order.status}
              onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
              className="flex-1 h-9 px-3 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
            >
              <option value="PENDING_DESIGN">PENDING_DESIGN (Pending Laser Vault)</option>
              <option value="DESIGN_APPROVED">DESIGN_APPROVED (Recipe Locked)</option>
              <option value="IN_PRODUCTION">IN_PRODUCTION (On Flat Conveyors)</option>
              <option value="COMPLETED">COMPLETED (All Units Passed)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStatusChange}
              disabled={isUpdatingStatus || !selectedStatus || selectedStatus === order.status}
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>Apply</span>
            </Button>
          </div>
        </div>

        {/* সফট ডিলিট কনফার্মেশন */}
        {showDeleteConfirm ? (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Are you sure you want to soft-delete this PO?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
              </Button>
            </div>
          </div>
        ) : null}

        <ModalFooter>
          {!showDeleteConfirm && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 mr-auto"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Delete Order</span>
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
