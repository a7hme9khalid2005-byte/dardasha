import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { PORT, UPLOAD_DIR } from './config.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import postsRoutes from './routes/posts.js';
import notificationsRoutes from './routes/notifications.js';
import groupsRoutes from './routes/groups.js';
import friendsRoutes from './routes/friends.js';
import aiRoutes from './routes/ai.js';
import giftsRoutes from './routes/gifts.js';
import { db, syncFromMongoDB } from './db.js';
import { connectMongoDB, dbState } from './database.js';
import { 
  noSqlSanitizer, 
  loginLimiter, 
  otpLimiter, 
  globalApiLimiter, 
  globalErrorHandler 
} from './middleware/security.js';

// Global Anti-Crash Process Handlers (Never let unhandled errors terminate the server)
process.on('uncaughtException', (err) => {
  console.error('🛡️ [Anti-Crash Shield] Uncaught Exception intercepted:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('🛡️ [Anti-Crash Shield] Unhandled Promise Rejection intercepted:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Trust first proxy (Render / Cloudflare / reverse proxy)
app.set('trust proxy', 1);

// 1. Security Headers via Helmet (Blocks XSS, Clickjacking, MIME-sniffing)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.disable('x-powered-by');

// 2. Enable CORS with safe configurations
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Payload size limiting (Protects against memory exhaustion DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. NoSQL / Mongo Injection Sanitizer (Blocks $gt, $ne, prototype pollution)
app.use(noSqlSanitizer);

// 5. Rate Limiters (DDoS, Brute-Force & OTP spamming defense)
app.use('/api', globalApiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register/send-otp', otpLimiter);
app.use('/api/auth/forgot-password', otpLimiter);

app.use('/uploads', express.static(UPLOAD_DIR));

// Serve built Web Application directly on port 5000
const webDistPath = path.join(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gifts', giftsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dardasha Server (دردشة)',
    database: dbState.isConnected ? 'connected' : 'connecting/fallback',
    timestamp: new Date().toISOString(),
  });
});

// Database Status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: dbState.isConnected,
    engine: 'MongoDB Atlas + Dual Persistence Engine',
    cluster: dbState.clusterName,
    database: dbState.dbName,
    lastConnectedAt: dbState.lastConnectedAt,
    error: dbState.error,
    stats: {
      usersCount: db.getUsers().length,
      messagesCount: db.getMessages().length,
      postsCount: db.getPosts().length
    }
  });
});

// Mount Global Error Handler to catch all API errors gracefully
app.use(globalErrorHandler);

// Fallback to index.html for SPA routing or redirect to port 3000
app.get('*', (req, res) => {
  const indexPath = path.join(webDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.redirect('http://localhost:3000');
  }
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // User authenticates on socket
  socket.on('user_connected', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      db.updateUser(userId, { status: 'online' });
      io.emit('user_status_changed', { userId, status: 'online' });
      console.log(`👤 User ${userId} is now online`);
    }
  });

  // Direct real-time messaging
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', message);
    }
  });

  // Real-time typing indicators
  socket.on('typing', ({ senderId, receiverId, isTyping }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { senderId, isTyping });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        db.updateUser(userId, { status: 'offline' });
        io.emit('user_status_changed', { userId, status: 'offline' });
        console.log(`👤 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Seed default initial community post or demo welcome if empty
const existingPosts = db.getPosts();
if (existingPosts.length === 0) {
  db.createPost({
    id: 'post-welcome-1',
    userId: 'system-dardasha',
    authorName: 'فريق دردشة (Dardasha Team)',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dardasha&backgroundColor=1877f2',
    content: '🎉 أهلاً بكم جميعاً في منصة Dardasha (دردشة)! نجمع لكم بين سرعة وخصوصية المحادثات ومشاركة اللحظات الممتعة مع الأصدقاء. استمتعوا بالتجربة!',
    imageUrl: null,
    likes: [],
    comments: [
      {
        id: 'c-welcome-1',
        userId: 'admin',
        authorName: 'مساعد دردشة الذكي',
        authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai&backgroundColor=00a884',
        content: 'نحن هنا لمساعدتكم وتقديم تجربة تواصل فريدة وآمنة! ✨',
        createdAt: new Date().toISOString(),
      }
    ],
    createdAt: new Date().toISOString(),
  });
}

server.listen(PORT, async () => {
  console.log(`\n🚀 Dardasha Server running on http://localhost:${PORT}`);
  console.log(`💬 API ready: http://localhost:${PORT}/api/health\n`);

  // Connect to MongoDB Atlas Cloud & Synchronize
  try {
    const isConnected = await connectMongoDB();
    if (isConnected) {
      await syncFromMongoDB();
    }
  } catch (err) {
    console.error('Failed to initialize MongoDB on startup:', err);
  }
});
