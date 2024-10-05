import React, { useState, ChangeEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage(''); 
    }
  };

  return (
    <div className="mt-4 flex items-center border-t border-gray-300 pt-2">
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={handleChange}
        className="input input-bordered flex-1"
      />
      <button
        className="btn btn-primary ml-2"
        onClick={handleSendMessage}
        disabled={!message.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
