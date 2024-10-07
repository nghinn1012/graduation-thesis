import React, { useEffect, useRef, useCallback } from 'react';
import { MessageInfo } from '../../api/notification';
import { AccountInfo } from '../../api/user';
import { useMessageContext } from '../../context/MessageContext';
import ChatMessage from './ChatMessage';

interface ChatContainerProps {
  messages: MessageInfo[];
  senders: { [key: string]: AccountInfo };
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, senders }) => {
  const { loadMoreMessages, hasMoreMessages } = useMessageContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Scroll to bottom on initial load and new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (containerRef.current) {
      const scrollDifference = containerRef.current.scrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop += scrollDifference;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Intersection Observer for infinite scrolling
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMoreMessages) {
        prevScrollHeightRef.current = containerRef.current?.scrollHeight || 0;
        loadMoreMessages();
      }
    },
    [hasMoreMessages, loadMoreMessages]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: containerRef.current,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-y-auto h-full"
    >
      {/* Loading trigger */}
      <div ref={observerTarget} className="h-1" />

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage
          key={message._id}
          message={message}
          sender={senders[message.senderId]}
        />
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
