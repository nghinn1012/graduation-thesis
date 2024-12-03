import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  return (
    <div id="delete_modal" className={`modal m-0 ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-sm bg-white">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn btn-error btn-sm" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="btn btn-sm" onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
