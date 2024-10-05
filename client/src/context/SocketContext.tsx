// SocketContext.tsx
import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { VITE_SOCKET_POST_URL } from "../config/config";
import { useAuthContext } from "../hooks/useAuthContext";

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {account} = useAuthContext();

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
      console.log(`Message from ${data.chatGroupId}: ${data.message.text}`);
    });

    socketInstance.on("getOnlineUsers", (onlineUsers) => {
      console.log("Online users:", onlineUsers);
    });

    return () => {
      socketInstance.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
