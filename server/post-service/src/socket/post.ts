import { Server } from 'socket.io';

let socketServer: Server | null = null;

export const initSocketServer = (server: any) => {
  if (socketServer == null) {
    socketServer = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    socketServer.on("connection", (socket) => {
      console.log('A client connected:', socket.id);

      // Add your socket event handlers here
      // e.g., socket.on('some-event', (data) => { ... });

      socket.on("disconnect", () => {
        console.log('A client disconnected:', socket.id);
      });
    });
  }

  return socketServer;
};
