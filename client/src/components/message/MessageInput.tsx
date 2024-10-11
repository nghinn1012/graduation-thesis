import React, { useState, ChangeEvent, useEffect, KeyboardEvent } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { CiFaceSmile, CiImageOn } from "react-icons/ci";
import { IoSend } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai"; // Icon để xóa ảnh
import { useMessageContext } from "../../context/MessageContext";

interface MessageInputProps {
  onSendMessage: (message: string, image?: string) => void; // Chấp nhận image là string (base64) hoặc File
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null); // Thay vì File, ta lưu base64 string
  const [imagePreview, setImagePreview] = useState<string | null>(null); // URL xem trước ảnh
  const { chatGroupSelect } = useMessageContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImage = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSendMessage = () => {
    if (message.trim() || image) {
      onSendMessage(message, image ? image : undefined);
      setMessage("");
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {chatGroupSelect && (
        <div className="p-2 flex flex-col border-t border-gray-300 pt-2 px-2 bg-gray-100 rounded-lg relative">
          {imagePreview && (
            <div className="relative mb-2 flex justify-start">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-[50%] rounded-md object-cover"
              />
              <button
                className="absolute top-0 right-0 -mt-1 -mr-1"
                onClick={handleRemoveImage}
              >
                <AiOutlineCloseCircle className="w-5 h-5 text-red-500" />
              </button>
            </div>
          )}

          <div className="flex items-center">
            <label className="cursor-pointer">
              <CiImageOn className="w-6 h-6 mr-2" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            <button
              className="mr-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <CiFaceSmile className="w-6 h-6" />
            </button>

            <input
              type="text"
              placeholder="Start a new message"
              value={message}
              onKeyDown={handleKeyPress}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border rounded-md outline-none"
            />

            <button
              className="ml-2"
              onClick={handleSendMessage}
              disabled={!message.trim() && !image}
            >
              <IoSend className="w-6 h-6" />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-16">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MessageInput;
