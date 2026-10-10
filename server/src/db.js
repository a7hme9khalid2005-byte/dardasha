import fs from 'fs';
import path from 'path';
import { DATA_DIR, UPLOAD_DIR } from './config.js';
import { 
  UserModel, 
  MessageModel, 
  OtpModel, 
  UserGiftModel, 
  FriendRequestModel, 
  PostModel, 
  dbState 
} from './database.js';

// Ensure data & upload directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const FRIEND_REQUESTS_FILE = path.join(DATA_DIR, 'friend_requests.json');
const USER_GIFTS_FILE = path.join(DATA_DIR, 'user_gifts.json');

function initFile(file, defaultData) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

initFile(USERS_FILE, []);
initFile(OTPS_FILE, []);
initFile(MESSAGES_FILE, []);
initFile(POSTS_FILE, []);
initFile(FRIEND_REQUESTS_FILE, []);
initFile(USER_GIFTS_FILE, []);

function readFile(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

function writeFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

export const db = {
  // Users
  getUsers: () => readFile(USERS_FILE),
  saveUsers: (users) => writeFile(USERS_FILE, users),
  findUserByEmail: (email) => {
    const users = readFile(USERS_FILE);
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },
  findUserById: (id) => {
    const users = readFile(USERS_FILE);
    return users.find(u => u.id === id);
  },
  createUser: (user) => {
    const users = readFile(USERS_FILE);
    users.push(user);
    writeFile(USERS_FILE, users);
    UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true }).catch(err => console.error('MongoDB UserModel create error:', err.message));
    return user;
  },
  updateUser: (id, updates) => {
    const users = readFile(USERS_FILE);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile(USERS_FILE, users);
      UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).catch(err => console.error('MongoDB UserModel update error:', err.message));
      return users[idx];
    }
    return null;
  },

  // OTPs for Password Reset
  getOtps: () => readFile(OTPS_FILE),
  saveOtp: (otpRecord) => {
    const otps = readFile(OTPS_FILE);
    const filtered = otps.filter(o => o.email.toLowerCase() !== otpRecord.email.toLowerCase());
    filtered.push(otpRecord);
    writeFile(OTPS_FILE, filtered);
    OtpModel.create(otpRecord).catch(err => console.error('MongoDB OtpModel save error:', err.message));
  },
  verifyOtp: (email, code) => {
    const otps = readFile(OTPS_FILE);
    const now = Date.now();
    const record = otps.find(
      o => o.email.toLowerCase() === email.trim().toLowerCase() &&
           o.code === String(code).trim() &&
           !o.used &&
           o.expiresAt > now
    );
    return record || null;
  },
  markOtpUsed: (email, code) => {
    const otps = readFile(OTPS_FILE);
    const record = otps.find(
      o => o.email.toLowerCase() === email.trim().toLowerCase() &&
           o.code === String(code).trim()
    );
    if (record) {
      record.used = true;
      writeFile(OTPS_FILE, otps);
      OtpModel.updateMany({ email: email.toLowerCase(), code: String(code).trim() }, { used: true }).catch(() => {});
    }
  },

  // Messages
  getMessages: () => readFile(MESSAGES_FILE),
  addMessage: (msg) => {
    const messages = readFile(MESSAGES_FILE);
    messages.push(msg);
    writeFile(MESSAGES_FILE, messages);
    MessageModel.create(msg).catch(err => console.error('MongoDB MessageModel save error:', err.message));
    return msg;
  },
  editMessage: (messageId, newContent) => {
    const messages = readFile(MESSAGES_FILE);
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      msg.content = newContent;
      msg.isEdited = true;
      msg.editedAt = new Date().toISOString();
      writeFile(MESSAGES_FILE, messages);
      MessageModel.updateOne({ id: messageId }, { content: newContent, isEdited: true, editedAt: new Date().toISOString() }).catch(() => {});
      return msg;
    }
    return null;
  },
  deleteMessageClean: (messageId) => {
    const messages = readFile(MESSAGES_FILE);
    const filtered = messages.filter(m => m.id !== messageId);
    writeFile(MESSAGES_FILE, filtered);
    MessageModel.deleteOne({ id: messageId }).catch(() => {});
    return true;
  },
  getChatHistory: (user1, user2) => {
    const messages = readFile(MESSAGES_FILE);
    return messages.filter(
      m => !m.isScheduled && (
        (m.senderId === user1 && m.receiverId === user2) ||
        (m.senderId === user2 && m.receiverId === user1)
      )
    );
  },

  // Scheduled Messages
  getScheduledMessages: () => {
    const messages = readFile(MESSAGES_FILE);
    return messages.filter(m => m.isScheduled);
  },
  dispatchScheduledMessages: () => {
    const messages = readFile(MESSAGES_FILE);
    const now = Date.now();
    let updated = false;
    messages.forEach(m => {
      if (m.isScheduled && new Date(m.scheduledFor).getTime() <= now) {
        m.isScheduled = false;
        m.createdAt = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) writeFile(MESSAGES_FILE, messages);
  },

  // Daily Notes (24h Status Bubbles)
  getNotes: () => {
    const file = path.join(DATA_DIR, 'notes.json');
    initFile(file, []);
    return readFile(file);
  },
  saveNote: (note) => {
    const file = path.join(DATA_DIR, 'notes.json');
    initFile(file, []);
    const notes = readFile(file).filter(n => n.userId !== note.userId);
    notes.unshift(note);
    writeFile(file, notes);
    return note;
  },

  // Polls
  getPolls: () => {
    const file = path.join(DATA_DIR, 'polls.json');
    initFile(file, []);
    return readFile(file);
  },
  savePoll: (poll) => {
    const file = path.join(DATA_DIR, 'polls.json');
    initFile(file, []);
    const polls = readFile(file);
    polls.unshift(poll);
    writeFile(file, polls);
    return poll;
  },
  votePoll: (pollId, optionIndex, userId) => {
    const file = path.join(DATA_DIR, 'polls.json');
    initFile(file, []);
    const polls = readFile(file);
    const poll = polls.find(p => p.id === pollId);
    if (poll && poll.options[optionIndex]) {
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(uid => uid !== userId);
      });
      poll.options[optionIndex].votes.push(userId);
      writeFile(file, polls);
      return poll;
    }
    return null;
  },

  // Posts / Social Lounge
  getPosts: () => readFile(POSTS_FILE),
  createPost: (post) => {
    const posts = readFile(POSTS_FILE);
    posts.unshift(post);
    writeFile(POSTS_FILE, posts);
    PostModel.findOneAndUpdate({ id: post.id }, post, { upsert: true }).catch(err => console.error('MongoDB PostModel error:', err.message));
    return post;
  },
  likePost: (postId, userId) => {
    const posts = readFile(POSTS_FILE);
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (!post.likes) post.likes = [];
      const hasLiked = post.likes.includes(userId);
      if (hasLiked) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
      writeFile(POSTS_FILE, posts);
      PostModel.updateOne({ id: postId }, { likes: post.likes }).catch(() => {});
      return post;
    }
    return null;
  },
  addComment: (postId, comment) => {
    const posts = readFile(POSTS_FILE);
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push(comment);
      writeFile(POSTS_FILE, posts);
      PostModel.updateOne({ id: postId }, { comments: post.comments }).catch(() => {});
      return post;
    }
    return null;
  },

  // Saved Messages Vault (Item 54)
  getVault: (userId) => {
    const file = path.join(DATA_DIR, 'vault.json');
    initFile(file, []);
    const items = readFile(file);
    return items.filter(i => i.userId === userId);
  },
  addToVault: (item) => {
    const file = path.join(DATA_DIR, 'vault.json');
    initFile(file, []);
    const items = readFile(file);
    items.unshift(item);
    writeFile(file, items);
    return item;
  },
  removeFromVault: (userId, itemId) => {
    const file = path.join(DATA_DIR, 'vault.json');
    initFile(file, []);
    const items = readFile(file);
    const filtered = items.filter(i => !(i.userId === userId && i.id === itemId));
    writeFile(file, filtered);
    return true;
  },

  // Anonymous Q&A (Item 36)
  getAnonymousQuestions: (recipientId) => {
    const file = path.join(DATA_DIR, 'anonymous_qa.json');
    initFile(file, []);
    const items = readFile(file);
    return items.filter(q => q.recipientId === recipientId || !recipientId);
  },
  addAnonymousQuestion: (question) => {
    const file = path.join(DATA_DIR, 'anonymous_qa.json');
    initFile(file, []);
    const items = readFile(file);
    items.unshift(question);
    writeFile(file, items);
    return question;
  },
  answerAnonymousQuestion: (questionId, answer) => {
    const file = path.join(DATA_DIR, 'anonymous_qa.json');
    initFile(file, []);
    const items = readFile(file);
    const q = items.find(i => i.id === questionId);
    if (q) {
      q.answer = answer;
      q.answeredAt = new Date().toISOString();
      writeFile(file, items);
      return q;
    }
    return null;
  },

  // Pin Message (Item 5)
  togglePinMessage: (messageId) => {
    const messages = readFile(MESSAGES_FILE);
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      msg.isPinned = !msg.isPinned;
      writeFile(MESSAGES_FILE, messages);
      return msg;
    }
    return null;
  },

  // ==================== NEW ENHANCED MODULES ====================

  // Item 22: Security Audit Logs
  getAuditLogs: (userId) => {
    const file = path.join(DATA_DIR, 'audit_logs.json');
    initFile(file, []);
    const logs = readFile(file);
    return logs.filter(l => l.userId === userId);
  },
  addAuditLog: (log) => {
    const file = path.join(DATA_DIR, 'audit_logs.json');
    initFile(file, []);
    const logs = readFile(file);
    logs.unshift({ id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, timestamp: new Date().toISOString(), ...log });
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    writeFile(file, logs);
  },

  // Item 113: Real Instant Web QR Login Sessions
  createQrSession: (sessionId) => {
    const file = path.join(DATA_DIR, 'qr_sessions.json');
    initFile(file, {});
    const sessions = readFile(file);
    sessions[sessionId] = {
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 mins valid
      user: null,
      token: null
    };
    writeFile(file, sessions);
    return sessions[sessionId];
  },
  getQrSession: (sessionId) => {
    const file = path.join(DATA_DIR, 'qr_sessions.json');
    initFile(file, {});
    const sessions = readFile(file);
    return sessions[sessionId] || null;
  },
  confirmQrSession: (sessionId, user, token) => {
    const file = path.join(DATA_DIR, 'qr_sessions.json');
    initFile(file, {});
    const sessions = readFile(file);
    if (sessions[sessionId]) {
      sessions[sessionId].status = 'confirmed';
      sessions[sessionId].user = user;
      sessions[sessionId].token = token;
      sessions[sessionId].confirmedAt = Date.now();
      writeFile(file, sessions);
      return sessions[sessionId];
    }
    return null;
  },

  // Item 16: Burner Connect Links
  createBurnerLink: (burnerRecord) => {
    const file = path.join(DATA_DIR, 'burner_links.json');
    initFile(file, []);
    const links = readFile(file);
    links.push(burnerRecord);
    writeFile(file, links);
    return burnerRecord;
  },
  getBurnerLink: (token) => {
    const file = path.join(DATA_DIR, 'burner_links.json');
    initFile(file, []);
    const links = readFile(file);
    return links.find(l => l.token === token && !l.used && new Date(l.expiresAt).getTime() > Date.now()) || null;
  },
  markBurnerLinkUsed: (token) => {
    const file = path.join(DATA_DIR, 'burner_links.json');
    initFile(file, []);
    const links = readFile(file);
    const link = links.find(l => l.token === token);
    if (link) {
      link.used = true;
      writeFile(file, links);
    }
  },

  // Item 21: Panic Button Wipe
  panicWipeUserHistory: (userId) => {
    const messages = readFile(MESSAGES_FILE);
    const filtered = messages.filter(m => m.senderId !== userId && m.receiverId !== userId);
    writeFile(MESSAGES_FILE, filtered);

    // clear vault
    const vaultFile = path.join(DATA_DIR, 'vault.json');
    if (fs.existsSync(vaultFile)) {
      const vaultItems = readFile(vaultFile).filter(i => i.userId !== userId);
      writeFile(vaultFile, vaultItems);
    }
    return true;
  },

  // Item 112: Cross-Device Draft Sync
  getDraft: (userId, contactId) => {
    const file = path.join(DATA_DIR, 'drafts.json');
    initFile(file, {});
    const drafts = readFile(file);
    const key = `${userId}_${contactId}`;
    return drafts[key] || '';
  },
  saveDraft: (userId, contactId, text) => {
    const file = path.join(DATA_DIR, 'drafts.json');
    initFile(file, {});
    const drafts = readFile(file);
    const key = `${userId}_${contactId}`;
    drafts[key] = text;
    writeFile(file, drafts);
    return text;
  },

  // Item 66: Out-of-Office Settings
  getOutOfOffice: (userId) => {
    const file = path.join(DATA_DIR, 'out_of_office.json');
    initFile(file, {});
    const ooo = readFile(file);
    return ooo[userId] || { enabled: false, message: 'أنا خارج أوقات العمل حالياً. سأرد عليك في أقرب وقت!' };
  },
  setOutOfOffice: (userId, data) => {
    const file = path.join(DATA_DIR, 'out_of_office.json');
    initFile(file, {});
    const ooo = readFile(file);
    ooo[userId] = { ...data, updatedAt: new Date().toISOString() };
    writeFile(file, ooo);
    return ooo[userId];
  },

  // Groups and Community Modules (Items 25, 26, 28, 30, 31, 32, 33, 34, 35, 36)
  getGroups: () => {
    const file = path.join(DATA_DIR, 'groups.json');
    initFile(file, [
      {
        id: 'group-cyber',
        name: 'رواد التقنية والذكاء الاصطناعي 💻',
        description: 'نقاشات تقنية وبرمجية، استعراض مشاريع وتحديات ذكاء اصطناعي.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cybertech&backgroundColor=7c3aed',
        membersCount: 842,
        threads: [
          { id: 'th-1', name: '🤖 هندسة الأوامر والـ AI', messagesCount: 145 },
          { id: 'th-2', name: '⚡ تطوير الويب والتطبيقات', messagesCount: 320 },
          { id: 'th-3', name: '🛡️ الأمن السيبراني والتشفير', messagesCount: 98 }
        ],
        broadcasts: [
          { id: 'bc-1', title: 'تحديث قواعد المجتمع', content: 'يرجى الالتزام بالاحترام المتبادل وعدم إرسال إعلانات غير مرخصة.', mandatoryConfirm: true, confirms: 124 }
        ],
        voiceRoomActive: true,
        voiceListeners: 14,
        silentHours: { enabled: true, from: '23:00', to: '07:00' },
        quiz: [
          { question: 'هل تتعهد بالالتزام بشروط الحوار البناء وعدم نشر إعلانات سبام؟', options: ['نعم، أتعهد بذلك تماماً', 'لا'], correct: 0 }
        ]
      },
      {
        id: 'group-designers',
        name: 'نادي المصممين والمبدعين 🎨',
        description: 'تغذية بصرية، مشاركة تصاميم UI/UX ونقد إيجابي محترف.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=designerclub&backgroundColor=06b6d4',
        membersCount: 520,
        threads: [
          { id: 'th-4', name: '✨ استعراض الأعمال Feedback', messagesCount: 210 },
          { id: 'th-5', name: '🖌️ ملحقات وأيقونات مجانية', messagesCount: 88 }
        ],
        broadcasts: [],
        voiceRoomActive: false,
        voiceListeners: 0,
        silentHours: { enabled: false }
      }
    ]);
    return readFile(file);
  },
  saveGroups: (groups) => {
    const file = path.join(DATA_DIR, 'groups.json');
    writeFile(file, groups);
  },
  addModBoxSuggestion: (groupId, suggestion) => {
    const file = path.join(DATA_DIR, 'mod_box.json');
    initFile(file, []);
    const items = readFile(file);
    items.unshift({ id: `mod-${Date.now()}`, groupId, ...suggestion, createdAt: new Date().toISOString() });
    writeFile(file, items);
    return items[0];
  },
  getModBoxSuggestions: (groupId) => {
    const file = path.join(DATA_DIR, 'mod_box.json');
    initFile(file, []);
    return readFile(file).filter(m => m.groupId === groupId);
  },

  // ==================== FRIEND REQUESTS & CONNECTIONS SYSTEM ====================
  getFriendRequests: (userId) => {
    const requests = readFile(FRIEND_REQUESTS_FILE);
    const users = readFile(USERS_FILE);
    const userMap = new Map(users.map(u => [u.id, {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatar: u.avatar,
      bio: u.bio,
      status: u.status || 'online'
    }]));

    const incoming = requests
      .filter(r => r.receiverId === userId && r.status === 'pending')
      .map(r => ({
        ...r,
        sender: userMap.get(r.senderId) || { id: r.senderId, firstName: 'مستخدم', lastName: '', avatar: '' }
      }));

    const outgoing = requests
      .filter(r => r.senderId === userId && r.status === 'pending')
      .map(r => ({
        ...r,
        receiver: userMap.get(r.receiverId) || { id: r.receiverId, firstName: 'مستخدم', lastName: '', avatar: '' }
      }));

    return { incoming, outgoing };
  },

  sendFriendRequest: (senderId, targetIdentifier) => {
    const users = readFile(USERS_FILE);
    const cleanTarget = String(targetIdentifier).trim().toLowerCase().replace(/^@/, '');
    
    // Find target user by ID, exact email, username (part before @), or full name
    const targetUser = users.find(u => 
      u.id === targetIdentifier ||
      u.email.toLowerCase() === cleanTarget ||
      u.email.toLowerCase().split('@')[0] === cleanTarget ||
      `${u.firstName} ${u.lastName}`.toLowerCase() === cleanTarget.toLowerCase() ||
      u.firstName.toLowerCase() === cleanTarget.toLowerCase()
    );

    if (!targetUser) {
      throw new Error('لم يتم العثور على مستخدم بهذا المعرف أو البريد');
    }

    if (targetUser.id === senderId) {
      throw new Error('لا يمكنك إرسال طلب صداقة لنفسك');
    }

    const requests = readFile(FRIEND_REQUESTS_FILE);

    // Check if already pending
    const existing = requests.find(r => 
      ((r.senderId === senderId && r.receiverId === targetUser.id) ||
       (r.senderId === targetUser.id && r.receiverId === senderId)) &&
      r.status === 'pending'
    );

    if (existing) {
      if (existing.senderId === senderId) {
        throw new Error('لقد قمت بإرسال طلب صداقة مسبقاً وما زال قيد الانتظار');
      } else {
        throw new Error('هذا المستخدم أرسل لك طلب صداقة بالفعل! يمكنك قبوله من قائمة الطلبات الواردة');
      }
    }

    // Check if already accepted
    const alreadyAccepted = requests.find(r => 
      ((r.senderId === senderId && r.receiverId === targetUser.id) ||
       (r.senderId === targetUser.id && r.receiverId === senderId)) &&
      r.status === 'accepted'
    );

    if (alreadyAccepted) {
      throw new Error('أنتم أصدقاء بالفعل في جهات الاتصال!');
    }

    const newReq = {
      id: `freq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId,
      receiverId: targetUser.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newReq);
    writeFile(FRIEND_REQUESTS_FILE, requests);
    FriendRequestModel.create(newReq).catch(err => console.error('MongoDB FriendRequest create error:', err.message));

    return {
      request: newReq,
      targetUser: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        avatar: targetUser.avatar,
        bio: targetUser.bio
      }
    };
  },

  respondFriendRequest: (requestId, userId, action, circle = 'all') => {
    const requests = readFile(FRIEND_REQUESTS_FILE);
    const req = requests.find(r => r.id === requestId && r.receiverId === userId);

    if (!req) {
      throw new Error('طلب الصداقة غير موجود أو تم التعامل معه مسبقاً');
    }

    if (action === 'accept') {
      req.status = 'accepted';
      req.circle = circle;
      req.acceptedAt = new Date().toISOString();
      writeFile(FRIEND_REQUESTS_FILE, requests);
      FriendRequestModel.updateOne({ id: requestId }, { status: 'accepted', circle, acceptedAt: req.acceptedAt }).catch(() => {});
      return { success: true, request: req, status: 'accepted' };
    } else if (action === 'reject') {
      req.status = 'rejected';
      req.rejectedAt = new Date().toISOString();
      writeFile(FRIEND_REQUESTS_FILE, requests);
      FriendRequestModel.updateOne({ id: requestId }, { status: 'rejected', rejectedAt: req.rejectedAt }).catch(() => {});
      return { success: true, request: req, status: 'rejected' };
    } else {
      throw new Error('إجراء غير معروف');
    }
  },

  cancelFriendRequest: (requestId, senderId) => {
    const requests = readFile(FRIEND_REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === requestId && r.senderId === senderId);

    if (index === -1) {
      throw new Error('الطلب غير موجود');
    }

    requests.splice(index, 1);
    writeFile(FRIEND_REQUESTS_FILE, requests);
    FriendRequestModel.deleteOne({ id: requestId }).catch(() => {});
    return { success: true };
  },

  getFriendSuggestions: (userId) => {
    const users = readFile(USERS_FILE);
    const requests = readFile(FRIEND_REQUESTS_FILE);

    const connectedIds = new Set([userId]);
    requests.forEach(r => {
      if (r.status === 'pending' || r.status === 'accepted') {
        if (r.senderId === userId) connectedIds.add(r.receiverId);
        if (r.receiverId === userId) connectedIds.add(r.senderId);
      }
    });

    const suggestions = users
      .filter(u => !connectedIds.has(u.id))
      .map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        mutualReason: 'مشترك معك في مجتمع دردشة العام 🌟'
      }));

    return suggestions;
  },

  // 100,000 Gifts Inventory & Showcase
  getUserGifts: (userId) => {
    const all = readFile(USER_GIFTS_FILE);
    return all.filter(g => g.userId === userId);
  },

  addUserGift: (userId, gift) => {
    const all = readFile(USER_GIFTS_FILE);
    const userGiftItem = {
      instanceId: `ug-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      ...gift,
      obtainedAt: new Date().toISOString()
    };
    all.unshift(userGiftItem);
    writeFile(USER_GIFTS_FILE, all);
    UserGiftModel.create(userGiftItem).catch(err => console.error('MongoDB UserGiftModel create error:', err.message));
    return userGiftItem;
  },

  sendGiftToUser: (senderId, receiverId, gift, note = '') => {
    const all = readFile(USER_GIFTS_FILE);
    const sender = readFile(USERS_FILE).find(u => u.id === senderId);
    const sentGift = {
      instanceId: `ug-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: receiverId,
      senderId,
      senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'صديق في دردشة',
      note,
      isReceivedGift: true,
      ...gift,
      obtainedAt: new Date().toISOString()
    };
    all.unshift(sentGift);
    writeFile(USER_GIFTS_FILE, all);
    UserGiftModel.create(sentGift).catch(err => console.error('MongoDB UserGiftModel create error:', err.message));
    return sentGift;
  }
};

/**
 * Hydrate in-memory and local files with MongoDB Atlas documents on connection,
 * or migrate existing seed data to MongoDB Atlas if collections are newly initialized.
 */
export async function syncFromMongoDB() {
  if (!dbState.isConnected) return;
  try {
    console.log('🔄 Synchronizing collections with MongoDB Atlas Cloud (Cluster0)...');

    // 1. Users sync
    const cloudUsers = await UserModel.find({}).lean();
    if (cloudUsers && cloudUsers.length > 0) {
      console.log(`📥 Hydrated ${cloudUsers.length} users from MongoDB Atlas`);
      const localUsers = readFile(USERS_FILE);
      const userMap = new Map();
      localUsers.forEach(u => userMap.set(u.id, u));
      cloudUsers.forEach(u => userMap.set(u.id, { ...userMap.get(u.id), ...u }));
      writeFile(USERS_FILE, Array.from(userMap.values()));
    } else {
      const localUsers = readFile(USERS_FILE);
      if (localUsers.length > 0) {
        console.log(`📤 Migrating ${localUsers.length} local users to MongoDB Atlas Cloud...`);
        for (const u of localUsers) {
          await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true });
        }
      }
    }

    // 2. Messages sync
    const cloudMsgs = await MessageModel.find({}).lean();
    if (cloudMsgs && cloudMsgs.length > 0) {
      console.log(`📥 Hydrated ${cloudMsgs.length} messages from MongoDB Atlas`);
      const localMsgs = readFile(MESSAGES_FILE);
      const msgMap = new Map();
      localMsgs.forEach(m => msgMap.set(m.id, m));
      cloudMsgs.forEach(m => msgMap.set(m.id, { ...msgMap.get(m.id), ...m }));
      writeFile(MESSAGES_FILE, Array.from(msgMap.values()));
    } else {
      const localMsgs = readFile(MESSAGES_FILE);
      if (localMsgs.length > 0) {
        console.log(`📤 Migrating ${localMsgs.length} local messages to MongoDB Atlas...`);
        for (const m of localMsgs) {
          await MessageModel.findOneAndUpdate({ id: m.id }, m, { upsert: true });
        }
      }
    }

    // 3. User Gifts sync
    const cloudGifts = await UserGiftModel.find({}).lean();
    if (cloudGifts && cloudGifts.length > 0) {
      console.log(`📥 Hydrated ${cloudGifts.length} gift records from MongoDB Atlas`);
      writeFile(USER_GIFTS_FILE, cloudGifts);
    } else {
      const localGifts = readFile(USER_GIFTS_FILE);
      if (localGifts.length > 0) {
        for (const g of localGifts) {
          await UserGiftModel.create(g).catch(() => {});
        }
      }
    }

    // 4. Friend Requests sync
    const cloudReqs = await FriendRequestModel.find({}).lean();
    if (cloudReqs && cloudReqs.length > 0) {
      writeFile(FRIEND_REQUESTS_FILE, cloudReqs);
    } else {
      const localReqs = readFile(FRIEND_REQUESTS_FILE);
      if (localReqs.length > 0) {
        for (const r of localReqs) {
          await FriendRequestModel.create(r).catch(() => {});
        }
      }
    }

    // 5. Posts sync
    const cloudPosts = await PostModel.find({}).lean();
    if (cloudPosts && cloudPosts.length > 0) {
      writeFile(POSTS_FILE, cloudPosts);
    } else {
      const localPosts = readFile(POSTS_FILE);
      if (localPosts.length > 0) {
        for (const p of localPosts) {
          await PostModel.create(p).catch(() => {});
        }
      }
    }

    console.log('✨ MongoDB Atlas Cloud Synchronization Complete!');
  } catch (err) {
    console.error('❌ MongoDB sync error:', err.message);
  }
}
