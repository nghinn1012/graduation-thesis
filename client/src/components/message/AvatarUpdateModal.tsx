import React from 'react';
import { useI18nContext } from '../../hooks/useI18nContext';

interface AvatarUpdateModalProps {
  isOpen: boolean;
  avatarPreview: string | null;
  onSubmit: () => void;
  onClose: () => void;
}

const AvatarUpdateModal: React.FC<AvatarUpdateModalProps> = ({
  isOpen,
  avatarPreview,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;
  const languageContext = useI18nContext();
  const lang = languageContext.of('MessageSection');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{lang("previewAvatar")}</h3>
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt={lang("avatarPreview")}
            className="w-32 h-32 rounded-full mx-auto my-4"
          />
        )}
        <div className="modal-action">
          <button onClick={onSubmit} className="btn btn-primary">
            {lang("submit")}
          </button>
          <button onClick={onClose} className="btn">
            {lang("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpdateModal;
