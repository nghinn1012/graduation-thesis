import React from 'react';
import { useI18nContext } from '../../hooks/useI18nContext';

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
  const language = useI18nContext();
  const lang = language.of("OrderSection");
  const buyerReasons = [
    { key: "changed-my-mind", label: lang("changed-my-mind") },
    { key: "better-price", label: lang("better-price") },
    { key: "ordered-by-mistake", label: lang("ordered-by-mistake") },
    { key: "shipping-too-long", label: lang("shipping-too-long") },
    { key: "other", label: lang("other") },
  ];

  const sellerReasons = [
    { key: "out-of-stock", label: lang("out-of-stock") },
    { key: "cannot-fulfill", label: lang("cannot-fulfill") },
    { key: "pricing-error", label: lang("pricing-error") },
    { key: "shipping-issues", label: lang("shipping-issues") },
    { key: "other", label: lang("other") },
  ];

  const reasons = isSeller ? sellerReasons : buyerReasons;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isSeller ? lang("cancel-customer-order") : lang("cancel-your-order")}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {lang("select-reason")}
            </label>
            <select
              value={selectedReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">{lang("select-reason-placeholder")}</option>
              {reasons.map((reason) => (
                <option key={reason.key} value={reason.key}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              {lang("cancel")}
            </button>
            <button
              onClick={() => onCancel(selectedReason)}
              disabled={!selectedReason}
              className="btn btn-error btn-sm"
            >
              {lang("confirm-cancellation")}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>{lang("close")}</button>
      </form>
    </dialog>
  );
};

export default CancelOrderModal;
