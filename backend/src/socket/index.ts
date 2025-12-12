/**
 * Socket.io Event Handlers
 */

import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import config from '../config';
import {
  FacilitatorEvents,
  FacilitatorCommands,
  ParticipantEvents,
  PublicEvents,
} from '@evr/shared';

// Store active connections
const activeSockets = new Map<string, Socket>();
const sessionRooms = new Map<string, Set<string>>();

export function setupSocketHandlers(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    pingInterval: config.wsPingInterval,
    pingTimeout: config.wsPingTimeout,
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    activeSockets.set(socket.id, socket);

    // Join a session room
    socket.on('join_session', (data: { sessionId: string; participantId?: string; role?: string }) => {
      const { sessionId, participantId, role } = data;

      socket.join(`session:${sessionId}`);

      // Track session rooms
      if (!sessionRooms.has(sessionId)) {
        sessionRooms.set(sessionId, new Set());
      }
      sessionRooms.get(sessionId)?.add(socket.id);

      // Store metadata on socket
      socket.data.sessionId = sessionId;
      socket.data.participantId = participantId;
      socket.data.role = role;

      console.log(`Socket ${socket.id} joined session ${sessionId} as ${role || 'observer'}`);

      socket.emit('joined_session', { sessionId, socketId: socket.id });
    });

    // Leave a session room
    socket.on('leave_session', (data: { sessionId: string }) => {
      const { sessionId } = data;
      socket.leave(`session:${sessionId}`);

      sessionRooms.get(sessionId)?.delete(socket.id);

      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    // Facilitator commands
    socket.on(FacilitatorCommands.PAUSE, (data) => {
      console.log('Facilitator pause session:', data);
      io.to(`session:${data.sessionId}`).emit('session_paused', data);
    });

    socket.on(FacilitatorCommands.RESUME, (data) => {
      console.log('Facilitator resume session:', data);
      io.to(`session:${data.sessionId}`).emit('session_resumed', data);
    });

    socket.on(FacilitatorCommands.SKIP_PHASE, (data) => {
      console.log('Facilitator skip phase:', data);
      io.to(`session:${data.sessionId}`).emit('phase_skipped', data);
    });

    socket.on(FacilitatorCommands.END_SESSION, (data) => {
      console.log('Facilitator end session:', data);
      io.to(`session:${data.sessionId}`).emit('session_ended', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const sessionId = socket.data.sessionId;
      if (sessionId) {
        sessionRooms.get(sessionId)?.delete(socket.id);

        // Notify session about disconnection
        if (socket.data.participantId) {
          io.to(`session:${sessionId}`).emit(FacilitatorEvents.PARTICIPANT_LEFT, {
            participantId: socket.data.participantId,
            sessionId,
            timestamp: new Date(),
          });
        }
      }

      activeSockets.delete(socket.id);
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Helper functions to emit events
  io.emitToSession = (sessionId: string, event: string, data: any) => {
    io.to(`session:${sessionId}`).emit(event, data);
  };

  io.getSessionSocketCount = (sessionId: string): number => {
    return sessionRooms.get(sessionId)?.size || 0;
  };

  console.log('Socket.io initialized');
  return io;
}

// Extend Socket.io types
declare module 'socket.io' {
  interface Server {
    emitToSession: (sessionId: string, event: string, data: any) => void;
    getSessionSocketCount: (sessionId: string) => number;
  }
}
