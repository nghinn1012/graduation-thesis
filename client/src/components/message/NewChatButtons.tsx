import React, { useState } from "react";
import { FiUserPlus, FiUsers, FiChevronDown } from "react-icons/fi";

interface NewChatButtonsProps {
  onNewChat: () => void;
  onNewGroup: () => void;
}

const NewChatButtons: React.FC<NewChatButtonsProps> = ({ onNewChat, onNewGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="relative">
      {/* Desktop view - Two separate buttons */}
      <div className="hidden md:flex gap-2">
        <button
          className="btn btn-ghost flex-1 justify-start normal-case"
          onClick={onNewChat}
        >
          <FiUserPlus className="w-5 h-5 mr-2" />
          New Chat
        </button>
        <button
          className="btn btn-ghost flex-1 justify-start normal-case"
          onClick={onNewGroup}
        >
          <FiUsers className="w-5 h-5 mr-2" />
          New Group
        </button>
      </div>

      {/* Mobile view - Modal trigger */}
      <div className="md:hidden">
        <button
          className="btn btn-ghost w-full justify-between normal-case"
          onClick={() => setIsModalOpen(true)}
        >
          <FiUserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-md shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Select an Option</h2>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              onClick={() => {
                onNewChat();
                handleCloseModal();
              }}
            >
              <FiUserPlus className="w-5 h-5 mr-2" />
              New Chat
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              onClick={() => {
                onNewGroup();
                handleCloseModal();
              }}
            >
              <FiUsers className="w-5 h-5 mr-2" />
              New Group
            </button>
            <button
              className="mt-4 w-full text-center text-red-500"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewChatButtons;
