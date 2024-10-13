import React, { useEffect, useRef, useCallback, useMemo } from 'react';
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

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, MessageInfo[]>);
  }, [messages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const scrollDifference = containerRef.current.scrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop += scrollDifference;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
    }
  }, [messages]);

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
      <div ref={observerTarget} className="h-1" />

      {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
        <React.Fragment key={date}>
          {messagesForDate.map((message, index) => (
            <ChatMessage
              key={message._id}
              message={message}
              sender={senders[message.senderId]}
              showDate={index === 0}
            />
          ))}
        </React.Fragment>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
