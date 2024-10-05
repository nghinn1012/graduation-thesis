// SocketContext.tsx
import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { VITE_SOCKET_POST_URL } from "../config/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { useMessageContext } from "./MessageContext";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {account, auth} = useAuthContext();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const {setChatMessages, chatMessages} = useMessageContext();

  useEffect(() => {
    const socketInstance: Socket = io(VITE_SOCKET_POST_URL, {
      query: {
        userId: account?._id,
      },
    });

    function sendMessage(receiverId: string, message: string) {
      socketInstance.emit("sendMessage", { receiverId, message });
    }

    socketInstance.on("connect", () => {
      console.log("Successfully connected to server");
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.log("Connection error:", error);
    });

    setSocket(socketInstance);

    socketInstance.on("receiveMessage", (data) => {
      console.log(data);
      console.log(chatMessages);
      console.log(`Message from ${data.chatGroupId}: ${data.message.text}`);
      setChatMessages([...chatMessages, data.message]);
    });

    socketInstance.on("getOnlineUsers", (onlineUsers) => {
      console.log("Online users:", onlineUsers);
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socketInstance.disconnect();
      console.log("Socket disconnected");
    };
  }, [auth, chatMessages]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
