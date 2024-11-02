import React, { useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { OrderWithUserInfo, ReviewCreate } from "../../api/post";
import CancelOrderModal from "./CancelOrderModal";
import ReviewModal from "./ReviewModal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

interface OrderActionButtonsProps {
  order: OrderWithUserInfo;
  isMyOrders: boolean;
  activeTab: string;
  tab: string;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  order,
  isMyOrders,
  activeTab,
  tab,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { cancelOrder, updateOrderStatus, createOrderReview } = useProductContext();
  const navigate = useNavigate();

  // Status options for shop orders
  const nextStatus: { [key: string]: string } = {
    Pending: "Delivering",
    Delivering: "Completed",
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      await cancelOrder(order._id, reason, activeTab === "My Orders", tab);
      setSelectedReason("");
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(order._id, nextStatus[order.status], tab);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReviews = async (
    reviews: ReviewCreate[]
  ) => {
    try {
      await createOrderReview(order._id, reviews);
    } catch (error) {
      console.error("Error submitting reviews:", error);
    }
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedReason("");
  };

  if (order.status === "Pending" && isMyOrders) {
    return (
      <>
        <button
          onClick={() => setIsCancelModalOpen(true)}
          className="btn btn-error btn-sm text-xs"
        >
          Cancel Order
        </button>
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          onClose={closeCancelModal}
          onCancel={handleCancelOrder}
          selectedReason={selectedReason}
          onReasonChange={setSelectedReason}
          isSeller={!isMyOrders}
        />
      </>
    );
  }

  if (order.status === "Completed" && !order.isReviewed && isMyOrders) {
    return (
      <>
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="btn btn-accent btn-sm text-xs"
        >
          Review Order
        </button>
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleSubmitReviews}
          orderId={order._id}
        />
      </>
    );
  }

  if (!isMyOrders) {
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

  return null;
};

export default OrderActionButtons;
