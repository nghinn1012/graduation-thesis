import React, { useState } from "react";
import { IoAddCircleOutline, IoCloseSharp } from "react-icons/io5";
import { useI18nContext } from "../../hooks/useI18nContext";

interface QuickPasteModalProps {
  isModalOpen: boolean;
  closeModal: (e: any) => void;
  modalInput: string;
  setModalInput: (input: string) => void;
  instructionInput: string;
  setInstructionInput: (input: string) => void;
  handleModalSubmit: (event: any) => void;
}

const QuickPasteModal: React.FC<QuickPasteModalProps> = ({
  isModalOpen,
  closeModal,
  modalInput,
  setModalInput,
  instructionInput,
  setInstructionInput,
  handleModalSubmit,
}) => {
  const language = useI18nContext();
  const lang = language.of("QuickPasteTab");
  return (
    <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-3/4 max-h-screen relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={closeModal}
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-lg">{lang("title")}</h3>

        <p className="py-4">{lang("ingredientsLabel")}</p>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder={lang("ingredientPlaceholder")}
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
        ></textarea>

        <p className="py-4">{lang("instructionsLabel")}</p>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder={lang("instructionPlaceholder")}
          value={instructionInput}
          onChange={(e) => setInstructionInput(e.target.value)}
        ></textarea>

        <div className="modal-action flex justify-between mt-4">
          <button className="btn btn-outline" onClick={handleModalSubmit}>
            {lang("submitButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPasteModal;
