// src/server.js

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes via app object
app.io = io;

// Socket.IO Middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  if (!token || !userId) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId || String(decoded.userId) !== String(userId)) {
      return next(new Error('Authentication error'));
    }
  } catch (error) {
    return next(new Error('Authentication error'));
  }
  
  socket.userId = userId;
  socket.token = token;
  next();
});

// Socket.IO Connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId} (Socket ID: ${socket.id})`);
  
  // Join user to their personal room for targeted updates
  socket.join(`user:${socket.userId}`);
  
  // Join community room for general updates
  socket.join('community');
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
