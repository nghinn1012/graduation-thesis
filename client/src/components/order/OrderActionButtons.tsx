import React, { useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { OrderWithUserInfo, ReviewCreate } from "../../api/post";
import CancelOrderModal from "./CancelOrderModal";
import ReviewModal from "./ReviewModal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useI18nContext } from "../../hooks/useI18nContext";
import { useToastContext } from "../../hooks/useToastContext";

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
  const { cancelOrder, updateOrderStatus, createOrderReview, errorProduct, setErrorProduct } =
    useProductContext();
  const navigate = useNavigate();
  const language = useI18nContext();
  const lang = language.of("OrderSection");
  const { error, success } = useToastContext();

  const nextStatus: { [key: string]: string } = {
    Pending: "Delivering",
    Delivering: "Completed",
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      const result = await cancelOrder(order._id, reason, activeTab === "My Orders", tab);
      if (result) {
        success(lang("cancel-order-success"));
      } else {
        error(lang("cancel-order-fail"));
      }
      setSelectedReason("");
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      const result = await updateOrderStatus(order._id, nextStatus[order.status], tab);
      if (result) {
        success(lang("update-status-success"));
      } else {
        error(lang("update-status-fail"));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReviews = async (reviews: ReviewCreate[]) => {
    try {
      const result = await createOrderReview(order._id, reviews);
      if (result) {
        success(lang("submit-reviews-success"));
      } else {
        error(lang("submit-reviews-fail"));
      }
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
          {lang("cancel-order")}
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
          {lang("review-order")}
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
        ) : nextStatus[order.status] == "Delivering" ? (
          lang("mark-as-delivering")
        ) : (
          lang("mark-as-completed")
        )}
      </button>
    ) : null;
  }

  return null;
};

export default OrderActionButtons;
