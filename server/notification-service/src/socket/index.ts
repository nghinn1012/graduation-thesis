import { Server, Socket } from 'socket.io';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.emit("hello", "world", (response: string) => {
      console.log(response);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
