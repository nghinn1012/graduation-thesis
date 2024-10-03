// SocketContext.tsx
import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { VITE_SOCKET_POST_URL } from "../config/config";

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance: Socket = io(VITE_SOCKET_POST_URL);

    socketInstance.on("connect", () => {
      console.log("Successfully connected to server");
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.log("Connection error:", error);
    });

    setSocket(socketInstance);

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
