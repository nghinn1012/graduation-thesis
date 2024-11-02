import React, { useState } from "react";
import {
  BsX,
  BsCheck2,
  BsClock,
  BsPrinter,
  BsFileEarmarkPdf,
} from "react-icons/bs";
import { OrderWithUserInfo } from "../../api/post";
import { IAccountInfo } from "../../data/interface_data/account_info";
import CancelOrderModal from "./CancelOrderModal";
import ReviewModal from "./ReviewModal";

interface OrderActionsProps {
  order: OrderWithUserInfo;
  account?: IAccountInfo;
  onUpdateStatus: (status: string) => Promise<void>;
  onCancelOrder: (reason: string) => Promise<void>;
  onSubmitReviews?: (reviews: Array<{ productId: string; rating: number; comment: string }>) => Promise<void>;
  isMyOrders: boolean;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  account,
  onUpdateStatus,
  onCancelOrder,
  onSubmitReviews,
  isMyOrders
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const isBuyer = isMyOrders;
  const canCancel = order.status === "Pending";

  // Status mapping for next status
  const nextStatus: { [key: string]: string } = {
    'Pending': 'Delivering',
    'Delivering': 'Completed'
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(nextStatus[order.status]);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      await onCancelOrder(reason);
      setIsCancelModalOpen(false);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Order Actions</h2>
          <div className="space-y-4">
            {/* Cancel Order Button - Available for both buyer and seller when pending */}
            {canCancel && (
              <button
                className="btn btn-outline btn-block btn-error"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <BsX className="w-4 h-4 mr-2" />
                Cancel Order
              </button>
            )}

            {/* Update Status Button - Only for seller */}
            {!isBuyer && nextStatus[order.status] && (
              <button
                className="btn btn-primary btn-block"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <BsClock className="w-4 h-4 mr-2" />
                    Mark as {nextStatus[order.status]}
                  </>
                )}
              </button>
            )}

            {/* Review Button - Only for buyer when completed and not reviewed */}
            {isBuyer && order.status === 'Completed' && !order.isReviewed && (
              <button
                className="btn btn-accent btn-block"
                onClick={() => setIsReviewModalOpen(true)}
              >
                Review Order
              </button>
            )}

            {/* Print and Export buttons */}
            <div className="space-y-2">
              <button className="btn btn-outline btn-block">
                <BsPrinter className="w-4 h-4 mr-2" />
                Print Order
              </button>
              <button className="btn btn-outline btn-block">
                <BsFileEarmarkPdf className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelReason("");
        }}
        onCancel={handleCancelOrder}
        selectedReason={cancelReason}
        onReasonChange={setCancelReason}
        isSeller={!isMyOrders}
      />

      {onSubmitReviews && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={onSubmitReviews}
          orderId={order._id}
        />
      )}
    </>
  );
};

export default OrderActions;
