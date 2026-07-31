import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

let io = null;

const ROOMS = {
  ADMIN: 'admin',
  user: (id) => `user:${id}`,
  seller: (id) => `seller:${id}`,
  order: (id) => `order:${id}`,
};

export function createSocketService(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl || '*',
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyToken({ token, secret: env.jwt.accessSecret });
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    socket.join(ROOMS.user(id));

    if (role === 'ROLE_ADMIN') {
      socket.join(ROOMS.ADMIN);
    }
    if (role === 'ROLE_SELLER') {
      socket.join(ROOMS.seller(id));
    }

    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call createSocketService first.');
  }
  return io;
}

function toPlain(data) {
  if (!data) return {};
  if (typeof data.toObject === 'function') return data.toObject({ virtuals: false });
  if (typeof data.toJSON === 'function') return data.toJSON();
  return data;
}

export function emitToUser(userId, event, data) {
  getIO().to(ROOMS.user(userId)).emit(event, toPlain(data));
}

export function emitToSeller(sellerId, event, data) {
  getIO().to(ROOMS.seller(sellerId)).emit(event, toPlain(data));
}

export function emitToAdmin(event, data) {
  getIO().to(ROOMS.ADMIN).emit(event, toPlain(data));
}

export function emitToOrder(orderId, event, data) {
  getIO().to(ROOMS.order(orderId)).emit(event, toPlain(data));
}

export { ROOMS };
