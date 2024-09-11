// import React, { createContext, useEffect, useState } from "react";
// import { Socket, io } from "socket.io-client";
// import { useAuthContext } from "../hooks/useAuthContext";
// import { VITE_SOCKET_URL } from "../config/config";

// interface ISocketContextProviderProps {
//   children?: React.ReactNode;
// }

// interface ISocketContext {
//   socket?: Socket;
// }

// export const SocketContext = createContext<ISocketContext>({});

// export default function SocketContextProvider({
//   children,
// }: ISocketContextProviderProps) {
//   const [socket, setSocket] = useState<Socket>();
//   const authContext = useAuthContext();

//   useEffect(() => {
//     const auth = authContext.auth;

//     if (auth != null && socket == null) {
//       const newSocket = io(VITE_SOCKET_URL, {
//         extraHeaders: {
//           Authorization: auth.token,
//         },
//       });
//       setSocket(newSocket);

//       newSocket.on("connect", () => {
//         console.info("Socket connected", newSocket.id);
//       });
//       newSocket.on("error", (err) => console.log(err));
//     }

//     return () => {
//       if (auth == null && socket != null) {
//         socket.close();
//       }
//     };
//   }, [authContext.auth, setSocket, socket]);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: socket,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// }
