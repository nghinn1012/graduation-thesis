// components/OrderActionButtons.tsx
import React, { useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { OrderWithUserInfo } from '../../api/post';
import CancelOrderModal from "./CancelOrderModal";
import { useAuthContext } from '../../hooks/useAuthContext';

interface OrderActionButtonsProps {
  order: OrderWithUserInfo;
  isMyOrders: boolean;
  activeTab: string;
  tab: string;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({ order, isMyOrders, activeTab, tab }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cancelOrder, updateOrderStatus } = useProductContext();
  const { account } = useAuthContext();

  // Status options for shop orders
  const nextStatus: { [key: string]: string } = {
    'Pending': 'Delivering',
    'Delivering': 'Completed'
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      await cancelOrder(order._id, reason, activeTab === "My Orders", tab);
      setSelectedReason('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(order._id, nextStatus[order.status], tab);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReason('');
  };

  if (isMyOrders) {
    return order.status === 'Pending' ? (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-error btn-sm text-xs"
        >
          Cancel Order
        </button>
        <CancelOrderModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCancel={handleCancelOrder}
          selectedReason={selectedReason}
          onReasonChange={setSelectedReason}
        />
      </>
    ) : null;
  } else {
    return nextStatus[order.status] ? (
      <button
        onClick={handleStatusUpdate}
        disabled={isUpdating}
        className="btn btn-primary btn-sm text-xs"
      >
        {isUpdating ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          `Mark as ${nextStatus[order.status]}`
        )}
      </button>
    ) : null;
  }
};

export default OrderActionButtons;
