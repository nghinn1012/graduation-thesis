import React, { useState } from "react";
import {
  BsX,
  BsCheck2,
  BsClock,
  BsPrinter,
  BsFileEarmarkPdf,
} from "react-icons/bs";
import { OrderWithUserInfo, ReviewCreate } from "../../api/post";
import { IAccountInfo } from "../../data/interface_data/account_info";
import CancelOrderModal from "./CancelOrderModal";
import ReviewModal from "./ReviewModal";
import { useI18nContext } from "../../hooks/useI18nContext";
import { useProductContext } from "../../context/ProductContext";
import { useToastContext } from "../../hooks/useToastContext";

interface OrderActionsProps {
  order: OrderWithUserInfo;
  account?: IAccountInfo;
  onUpdateStatus: (status: string) => Promise<OrderWithUserInfo | undefined>;
  onOpenCancelModal: () => void;
  onOpenReviewModal: () => void;
  isMyOrders: boolean;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  account,
  onUpdateStatus,
  onOpenCancelModal,
  onOpenReviewModal,
  isMyOrders,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const language = useI18nContext();
  const lang = language.of("OrderSection");
  const { errorProduct, setErrorProduct } = useProductContext();
  const { error, success } = useToastContext();

  const isBuyer = isMyOrders;
  const canCancel = order.status === "Pending";

  const nextStatus: { [key: string]: string } = {
    Pending: "Delivering",
    Delivering: "Completed",
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      const result = await onUpdateStatus(nextStatus[order.status]);
      if (result) {
        success(lang("order-status-updated"));
      } else {
        error(lang("order-status-failed"));
      }
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">{lang("order-actions")}</h2>
          <div className="space-y-4">
            {canCancel && (
              <button
                className="btn btn-outline btn-block btn-error"
                onClick={onOpenCancelModal}
              >
                <BsX className="w-4 h-4 mr-2" />
                {lang("cancel-order")}
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
                    {nextStatus[order.status] === "Delivering"
                      ? lang("mark-as-delivering")
                      : lang("mark-as-completed")}
                  </>
                )}
              </button>
            )}

            {/* Review Button - Only for buyer when completed and not reviewed */}
            {isBuyer && order.status === "Completed" && !order.isReviewed && (
              <button
                className="btn btn-accent btn-block"
                onClick={onOpenReviewModal}
              >
                {lang("review-order")}
              </button>
            )}

            {/* Print and Export buttons */}
            {/* <div className="space-y-2">
              <button className="btn btn-outline btn-block">
                <BsPrinter className="w-4 h-4 mr-2" />
                Print Order
              </button>
              <button className="btn btn-outline btn-block">
                <BsFileEarmarkPdf className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderActions;
