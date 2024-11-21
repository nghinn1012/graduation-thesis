import { useEffect, useState } from "react";
import { useI18nContext } from "../../hooks/useI18nContext";

interface GroupNameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNameChange: (newName: string) => void;
  chatGroupId?: string;
  currentGroupName?: string;
}

export default function GroupNameChangeModal({
  isOpen,
  onClose,
  onNameChange,
  chatGroupId,
  currentGroupName
}: GroupNameChangeModalProps) {
  const [newName, setNewName] = useState(currentGroupName || '');
  const languageContext = useI18nContext();
  const lang = languageContext.of("MessageSection");

  useEffect(() => {
    setNewName(currentGroupName || '');
  }, [currentGroupName]);

  const handleSubmit = () => {
    if (newName.trim() && newName !== currentGroupName) {
      onNameChange(newName);
      onClose();
    }
  };

  return (
    <dialog
      className="modal"
      open={isOpen}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">{lang("changeGroupName")}</h3>
        <div className="py-4">
          <input
            type="text"
            placeholder={lang("enterGroupName")}
            className="input input-bordered w-full"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!newName.trim() || newName === currentGroupName}
          >
            {lang("confirm")}
          </button>
          <button
            className="btn"
            onClick={onClose}
          >
            {lang("cancel")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
