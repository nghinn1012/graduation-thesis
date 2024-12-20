import { Server, Socket } from 'socket.io';
import { NotificationToUser } from '../data/interface/notification_interface';

export const userSocketMap = new Map<string, string>();

const SOCKET_EVENTS = {
  NEW_NOTIFICATION: "new-notification",
  READ_NOTIFICATION: "read-notification",
} as const;

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId === "undefined") {
      console.log('Connection attempt without userId. Disconnecting socket.');
      socket.disconnect();
      return;
    }

    console.log(`User ${userId} connected with socketId: ${socket.id}`);

    userSocketMap.set(userId, socket.id);
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

    socket.on('sendMessage', (data: { receiverId: string; message: string }) => {
      const receiverSocketId = userSocketMap.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          senderId: userId,
          message: data.message,
        });
        console.log(`Message from ${userId} to ${data.receiverId}: ${data.message}`);
      } else {
        console.log(`User ${data.receiverId} is not online.`);
      }
    });

    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected`);
      io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
    });
  });
};
