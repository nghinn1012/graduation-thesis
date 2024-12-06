import React, { useState } from "react";
import { postFetcher } from "../../../api/post";
import { useToastContext } from "../../../hooks/useToastContext";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useI18nContext } from "../../../hooks/useI18nContext";
interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}
const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  postId,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const {success, error} = useToastContext();
  const {auth} = useAuthContext();
  const language = useI18nContext();
  const lang = language.of("ReportSection");

  const handleSubmit = async () => {
    console.log({ postId, reason, description });
    if (!auth?.token) {
      error("Vui lòng đăng nhập để gửi khiếu nại");
      return;
    }
    const result = await postFetcher.createComplaint(postId, reason, description, auth?.token);
    if (result) {
      success(lang("complaint-success"));
    } else {
      error(lang("complaint-fail"));
    }
    onClose();
  };

  return (
    <>
      <input
        type="checkbox"
        id={`complaint_modal_${postId}`}
        className="modal-toggle"
        checked={isOpen}
        onChange={onClose}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{lang("report")}</h3>

          <select
            className="select select-bordered w-full mt-4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="" disabled>
              {lang("select-reason")}
            </option>
            <option value="spam">{lang("spam")}</option>
            <option value="inappropriate">{lang(
              "inappropriate"
            )}</option>
            <option value="harassment">{lang("harassment")}</option>
            <option value="other">{lang("other")}</option>
          </select>

          <textarea
            className="textarea textarea-bordered w-full mt-4"
            placeholder={lang("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="modal-action">
            <button onClick={onClose} className="btn">
              {lang("cancel")}
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              {lang("submit")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintModal;
