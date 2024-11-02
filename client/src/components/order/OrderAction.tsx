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
import CancelOrderModal from './CancelOrderModal';

interface OrderActionsProps {
  order: OrderWithUserInfo;
  account?: IAccountInfo;
  onUpdateStatus: (status: string) => Promise<void>;
  onCancelOrder: (reason: string) => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  account,
  onUpdateStatus,
  onCancelOrder,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const isBuyer = account?._id === order.userId;

  const canCancel = isBuyer && order.status === "Pending";

  const canUpdateStatus = !isBuyer;

  const handleStatusUpdate = async () => {
    try {
      await onUpdateStatus(selectedStatus);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      await onCancelOrder(reason);
      setIsCancelModalOpen(false);
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
            {canCancel && (
              <button
                className="btn btn-outline btn-block btn-error"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <BsX className="w-4 h-4 mr-2" />
                Cancel Order
              </button>
            )}

            {canUpdateStatus && (
              <div className="space-y-3">
                {!isUpdating ? (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setIsUpdating(true)}
                  >
                    <BsClock className="w-4 h-4 mr-2" />
                    Update Status
                  </button>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="select select-bordered w-full"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary flex-1"
                        onClick={handleStatusUpdate}
                      >
                        <BsCheck2 className="w-4 h-4 mr-2" />
                        Confirm
                      </button>
                      <button
                        className="btn btn-ghost flex-1"
                        onClick={() => setIsUpdating(false)}
                      >
                        <BsX className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelReason('');
        }}
        onCancel={handleCancelOrder}
        selectedReason={cancelReason}
        onReasonChange={setCancelReason}
      />
    </>
  );
};

export default OrderActions;
