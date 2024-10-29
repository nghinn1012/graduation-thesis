// components/modals/CancelOrderModal.tsx
import React from 'react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason: string) => Promise<void>;
  selectedReason: string;
  onReasonChange: (reason: string) => void;
}

const cancelReasons = [
  { id: 'changed_mind', label: 'Changed my mind' },
  { id: 'wrong_item', label: 'Ordered wrong item' },
  { id: 'delivery_time', label: 'Delivery time too long' },
  { id: 'price_issue', label: 'Price issues' },
  { id: 'other', label: 'Other reasons' }
];

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  selectedReason,
  onReasonChange,
}) => {
  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedReason) return;
    await onCancel(selectedReason);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    onReasonChange(e.target.value);
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Cancel Order</h3>

        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text">Select Reason for Cancellation</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedReason}
            onChange={handleInputChange}
          >
            <option value="">Select a reason</option>
            {cancelReasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={handleCancel}
            disabled={!selectedReason}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};

export default CancelOrderModal;
