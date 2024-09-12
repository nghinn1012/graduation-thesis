import { Server as SocketIOServer } from 'socket.io';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      io?: SocketIOServer;
    }
  }
}
