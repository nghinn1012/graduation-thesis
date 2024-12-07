import { ComplaintData } from "../../api/post";
import { useAdminComplaintContext } from "../../context/AdminComplaintContext";
import { useState } from "react";
import { useI18nContext } from "../../hooks/useI18nContext";

interface StatusUpdateModalProps {
  complaint: ComplaintData | null;
  onClose: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  complaint,
  onClose,
}) => {
  const { updateComplaintStatus } = useAdminComplaintContext();
  const [selectedStatus, setSelectedStatus] = useState<string>("resolved");
  const [isLoading, setIsLoading] = useState(false);
  const language = useI18nContext();
  const lang = language.of("ReportSection", "AdminSection");

  if (!complaint) return null;

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      await updateComplaintStatus(complaint._id, selectedStatus);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog className={`modal ${complaint ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{lang("update-complaint-status")}</h3>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">{lang("select-status")}</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="resolved">{lang("resolved")}</option>
            <option value="rejected">{lang("rejected")}</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {lang("cancel")}
          </button>
          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            onClick={handleUpdateStatus}
            disabled={isLoading}
          >
            {lang("update")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
