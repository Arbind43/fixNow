import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import app from './app';
import { initSocket } from './socket';

// Load env vars
dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

const startServer = async () => {
  try {
    // Bypassing ISP DNS block for SRV records using Google DNS
    require('dns').setServers(['8.8.8.8']);
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixnow';
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

startServer();
