import React from 'react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  isSeller?: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  selectedReason,
  onReasonChange,
  isSeller
}) => {
  const buyerReasons = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Shipping time too long",
    "Other"
  ];

  const sellerReasons = [
    "Out of stock",
    "Cannot fulfill order at this time",
    "Pricing error",
    "Shipping issues",
    "Other"
  ];

  const reasons = isSeller ? sellerReasons : buyerReasons;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isSeller ? "Cancel Customer Order" : "Cancel Your Order"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Reason for Cancellation:
            </label>
            <select
              value={selectedReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select a reason</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onCancel(selectedReason)}
              disabled={!selectedReason}
              className="btn btn-error btn-sm"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default CancelOrderModal;
