import dns from 'dns';
import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

// Resolve SRV hostnames reliably on all environments (bypassing Windows DNS EBADRESP issues)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if not permitted in environment
}

// Global Connection State
export const dbState = {
  isConnected: false,
  error: null,
  clusterName: 'Cluster0 (MongoDB Atlas)',
  dbName: 'dardasha',
  lastConnectedAt: null,
};

// ----------------- SCHEMAS & MODELS -----------------

// 1. User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, default: '' },
  secondName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  gender: { type: String, default: '' },
  country: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  avatarFrame: { type: String, default: 'galaxy' },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  password: { type: String, default: '' },
  status: { type: String, default: 'offline' },
  customRole: { type: String, default: 'founder' },
  statusVibe: { type: String, default: '' },
  phonePrivacy: { type: String, default: 'friends' },
  interests: { type: [String], default: [] },
  socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  zodiac: { type: String, default: '' },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// 2. Message Schema
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  content: { type: String, default: '' },
  selfDestruct: { type: Number, default: null },
  isWhisper: { type: Boolean, default: false },
  whisperTargetId: { type: String, default: null },
  isRawFile: { type: Boolean, default: false },
  rawFileSize: { type: String, default: null },
  isGiftBox: { type: Boolean, default: false },
  isViewOnce: { type: Boolean, default: false },
  isVoice: { type: Boolean, default: false },
  voiceDuration: { type: String, default: null },
  voiceTranscription: { type: String, default: null },
  soundSticker: { type: mongoose.Schema.Types.Mixed, default: null },
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  scheduledFor: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true, strict: false });

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// 3. OTP Schema
const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Number, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const OtpModel = mongoose.models.Otp || mongoose.model('Otp', OtpSchema);

// 4. User Gifts Inventory Schema
const UserGiftSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  inventory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  lastChestOpenTime: { type: Number, default: 0 },
  unlockedCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const UserGiftModel = mongoose.models.UserGift || mongoose.model('UserGift', UserGiftSchema);

// 5. Friend Request Schema
const FriendRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  fromUserId: { type: String, required: true, index: true },
  toUserId: { type: String, required: true, index: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const FriendRequestModel = mongoose.models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema);

// 6. Community Posts Schema
const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: '' },
  authorName: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  likes: { type: [String], default: [] },
  comments: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const PostModel = mongoose.models.Post || mongoose.model('Post', PostSchema);

// ----------------- CONNECTION INITIALIZER -----------------

export async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set in environment.');
    return false;
  }

  try {
    console.log('🍃 Connecting to MongoDB Atlas Cloud...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'dardasha',
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 15000,
      autoIndex: true,
    });

    dbState.isConnected = true;
    dbState.error = null;
    dbState.lastConnectedAt = new Date().toISOString();

    console.log('✅ Connected to MongoDB Atlas Cloud (Cluster0 / dardasha) successfully!');

    // Synchronize Indexes (Allow multiple accounts per email, enforce unique username)
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('🔄 [Index Update] Dropped legacy email_1 unique index to allow multiple accounts per email.');
    } catch (e) {
      // index might not exist or already dropped
    }
    try {
      await mongoose.connection.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true });
      console.log('✅ [Index Update] Created unique username_1 index.');
    } catch (e) {
      // safe ignore
    }

    // Fault-tolerant event listeners
    mongoose.connection.on('disconnected', () => {
      dbState.isConnected = false;
      console.warn('⚠️ MongoDB disconnected. Retrying connection in background while local cache serves requests...');
    });

    mongoose.connection.on('reconnected', () => {
      dbState.isConnected = true;
      dbState.lastConnectedAt = new Date().toISOString();
      console.log('🔄 MongoDB Atlas Cloud reconnected successfully!');
    });

    mongoose.connection.on('error', (err) => {
      dbState.error = err.message;
      console.error('⚠️ MongoDB background connection error (Handled gracefully):', err.message);
    });

    return true;
  } catch (err) {
    dbState.isConnected = false;
    dbState.error = err.message;
    console.error('❌ MongoDB Initial Connection Error (Local cache active):', err.message);
    return false;
  }
}
