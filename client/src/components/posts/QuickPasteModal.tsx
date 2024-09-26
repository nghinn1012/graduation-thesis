import React, { useState } from "react";
import { IoAddCircleOutline, IoCloseSharp } from "react-icons/io5";

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
  return (
    <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-3/4 max-h-screen relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={closeModal}
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-lg">Quick Add Ingredients & Instructions</h3>

        <p className="py-4">Add your ingredients in the format: name quantity</p>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder="Example: Tomato 2, Onion 3"
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
        ></textarea>

        <p className="py-4">Add your instructions:</p>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder="Example: Chop the tomatoes, Sauté the onions"
          value={instructionInput}
          onChange={(e) => setInstructionInput(e.target.value)}
        ></textarea>

        <div className="modal-action flex justify-between mt-4">
          <button className="btn btn-outline" onClick={handleModalSubmit}>
            Add Ingredients & Instructions
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPasteModal;
