import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message';

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected via socket: ${socket.data.user.id}`);

    // Join a specific booking room to chat
    socket.on('join_booking_room', (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.data.user.id} joined room booking_${bookingId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: { bookingId: string, receiverId: string, content: string }) => {
      try {
        // Guard: validate that IDs are real MongoDB ObjectIds (24-char hex)
        const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
        if (!isValidObjectId(data.bookingId) || !isValidObjectId(data.receiverId)) {
          console.warn(`⚠️ send_message rejected — invalid IDs. bookingId: ${data.bookingId}, receiverId: ${data.receiverId}`);
          socket.emit('message_error', { error: 'Invalid booking or receiver ID. Please refresh and try again.' });
          return;
        }

        // 1. Save to database
        const message = await Message.create({
          sender: socket.data.user.id,
          receiver: data.receiverId,
          booking: data.bookingId,
          content: data.content,
        });

        const populatedMessage = await message.populate('sender', 'name avatar');

        // 2. Broadcast to the specific booking room
        io.to(`booking_${data.bookingId}`).emit('receive_message', populatedMessage);

        // 3. Emit notification event to receiver
        io.to(`user_${data.receiverId}`).emit('new_notification', {
          title: 'New Message',
          message: `${(populatedMessage.sender as any).name} sent you a message`,
          bookingId: data.bookingId,
        });

      } catch (error) {
        console.error('Socket error saving message:', error);
        socket.emit('message_error', { error: 'Failed to send message. Please try again.' });
      }
    });

    // Listen for global user room to receive notifications anywhere in the app
    socket.join(`user_${socket.data.user.id}`);

    // ── Location Tracking ──────────────────────────────────────────────
    // Technician sends their GPS coords; server broadcasts to booking room.
    socket.on('technician:location', (data: { bookingId: string; lat: number; lng: number }) => {
      console.log(`📍 Location update from ${socket.data.user.id} for booking ${data.bookingId}`);
      // Only broadcast to other users in the booking room (not back to sender)
      socket.to(`booking_${data.bookingId}`).emit('technician:location:update', {
        lat: data.lat,
        lng: data.lng,
        userId: socket.data.user.id,
        timestamp: Date.now(),
      });
    });

    // Technician stops sharing location (e.g. job completed)
    socket.on('technician:stop_sharing', (bookingId: string) => {
      socket.to(`booking_${bookingId}`).emit('technician:location:stopped');
    });
    // ─────────────────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
};
