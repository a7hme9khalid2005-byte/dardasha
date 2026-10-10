import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Get list of contacts
router.get('/contacts', (req, res) => {
  const users = db.getUsers();
  const contacts = users
    .filter(u => u.id !== req.user.id)
    .map(({ password, ...u }) => u);
  res.json({ contacts });
});

// Get message history
router.get('/history/:contactId', (req, res) => {
  const { contactId } = req.params;
  const history = db.getChatHistory(req.user.id, contactId);
  res.json({ messages: history });
});

// Send message
router.post('/send', (req, res) => {
  const { 
    receiverId, content, mediaUrl, isVoice, voiceDuration, voiceTranscription,
    selfDestruct, isWhisper, whisperTargetId, isRawFile, rawFileSize,
    isGiftBox, isViewOnce, soundSticker, fileEncryptionKey, isForwardProtected
  } = req.body;

  if (!receiverId && !isWhisper) {
    return res.status(400).json({ error: 'المستلم مطلوب' });
  }

  const message = {
    id: uuidv4(),
    senderId: req.user.id,
    receiverId,
    content: content || '',
    mediaUrl: mediaUrl || null,
    isVoice: !!isVoice,
    voiceDuration: voiceDuration || '0:14',
    voiceTranscription: voiceTranscription || null,
    selfDestruct: selfDestruct || null, // Item 1
    isWhisper: !!isWhisper, // Item 2
    whisperTargetId: whisperTargetId || null,
    isRawFile: !!isRawFile, // Item 6
    rawFileSize: rawFileSize || null,
    isGiftBox: !!isGiftBox, // Item 63
    isViewOnce: !!isViewOnce, // Item 48
    soundSticker: soundSticker || null, // Item 69
    fileEncryptionKey: fileEncryptionKey || null, // Item 24: Per-File Encryption
    isForwardProtected: !!isForwardProtected, // Item 17: Forwarding Blocker
    isPinned: false,
    createdAt: new Date().toISOString(),
    read: false,
  };

  db.addMessage(message);

  // Check Out-of-Office Auto Responder (Item 66)
  if (receiverId) {
    const receiverOoo = db.getOutOfOffice(receiverId);
    if (receiverOoo && receiverOoo.enabled) {
      setTimeout(() => {
        const autoReply = {
          id: uuidv4(),
          senderId: receiverId,
          receiverId: req.user.id,
          content: `🤖 [رد آلي خارج أوقات العمل]: ${receiverOoo.message}`,
          createdAt: new Date().toISOString(),
          isAutoReply: true
        };
        db.addMessage(autoReply);
      }, 500);
    }
  }

  res.status(201).json({ message });
});

// Toggle Pin Message (Item 5)
router.put('/message/:id/pin', (req, res) => {
  const { id } = req.params;
  const updated = db.togglePinMessage(id);
  if (!updated) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  res.json({ message: updated });
});

// Edit message
router.put('/message/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'المحتوى الجديد مطلوب' });

  const updated = db.editMessage(id, content);
  if (!updated) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  res.json({ message: updated });
});

// Clean delete
router.delete('/message/:id', (req, res) => {
  const { id } = req.params;
  db.deleteMessageClean(id);
  res.json({ success: true, message: 'تم الحذف بدون أثر' });
});

// Schedule message
router.post('/schedule', (req, res) => {
  const { receiverId, content, scheduledFor } = req.body;
  if (!receiverId || !content || !scheduledFor) {
    return res.status(400).json({ error: 'البيانات غير مكتملة' });
  }

  const message = {
    id: uuidv4(),
    senderId: req.user.id,
    receiverId,
    content,
    isScheduled: true,
    scheduledFor,
    createdAt: new Date().toISOString(),
  };

  db.addMessage(message);
  res.status(201).json({ message, notice: 'تمت جدولة الرسالة بنجاح' });
});

// Live Polls
router.post('/poll', (req, res) => {
  const { question, options, receiverId } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'السؤال وخياران على الأقل مطلوبان' });
  }

  const poll = {
    id: uuidv4(),
    creatorId: req.user.id,
    creatorName: `${req.user.firstName} ${req.user.lastName}`,
    receiverId,
    question,
    options: options.map(opt => ({ text: opt, votes: [] })),
    createdAt: new Date().toISOString(),
  };

  db.savePoll(poll);
  res.status(201).json({ poll });
});

router.post('/poll/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  const updatedPoll = db.votePoll(id, optionIndex, req.user.id);
  if (!updatedPoll) return res.status(404).json({ error: 'الاستطلاع غير موجود' });
  res.json({ poll: updatedPoll });
});

// Daily Notes (Status Bubbles)
router.get('/notes', (req, res) => {
  const notes = db.getNotes();
  res.json({ notes });
});

router.post('/note', (req, res) => {
  const { content, emoji } = req.body;
  if (!content) return res.status(400).json({ error: 'محتوى الملاحظة مطلوب' });

  const note = {
    id: uuidv4(),
    userId: req.user.id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userAvatar: req.user.avatar,
    content,
    emoji: emoji || '💭',
    createdAt: new Date().toISOString(),
  };

  db.saveNote(note);
  res.status(201).json({ note });
});

// Saved Vault (Item 54)
router.get('/vault', (req, res) => {
  const items = db.getVault(req.user.id);
  res.json({ vault: items });
});

router.post('/vault', (req, res) => {
  const { title, content, type } = req.body;
  if (!content) return res.status(400).json({ error: 'المحتوى مطلوب' });
  const item = {
    id: uuidv4(),
    userId: req.user.id,
    title: title || 'عنصر محفوظ',
    content,
    type: type || 'text',
    createdAt: new Date().toISOString(),
  };
  db.addToVault(item);
  res.status(201).json({ item });
});

router.delete('/vault/:id', (req, res) => {
  db.removeFromVault(req.user.id, req.params.id);
  res.json({ success: true });
});

// Anonymous Q&A (Item 36)
router.get('/anonymous-qa', (req, res) => {
  const { recipientId } = req.query;
  const questions = db.getAnonymousQuestions(recipientId || req.user.id);
  res.json({ questions });
});

router.post('/anonymous-qa', (req, res) => {
  const { recipientId, question } = req.body;
  if (!question || !recipientId) return res.status(400).json({ error: 'السؤال والمستلم مطلوبان' });
  const item = {
    id: uuidv4(),
    recipientId,
    question,
    answer: null,
    createdAt: new Date().toISOString(),
  };
  db.addAnonymousQuestion(item);
  res.status(201).json({ item, message: 'تم إرسال السؤال السري بنجاح' });
});

router.post('/anonymous-qa/:id/answer', (req, res) => {
  const { answer } = req.body;
  const updated = db.answerAnonymousQuestion(req.params.id, answer);
  if (!updated) return res.status(404).json({ error: 'السؤال غير موجود' });
  res.json({ item: updated });
});

// ==================== NEW ENHANCED MODULES ====================

// Item 16: Burner Connect Links
router.post('/burner-link', (req, res) => {
  const { durationMinutes = 10, maxMessages = 1 } = req.body;
  const token = uuidv4().substring(0, 12);
  const burner = {
    token,
    creatorId: req.user.id,
    creatorName: `${req.user.firstName} ${req.user.lastName}`,
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
    maxMessages,
    used: false,
    createdAt: new Date().toISOString()
  };
  db.createBurnerLink(burner);
  res.json({ burner, link: `https://dardasha.app/burner/${token}` });
});

router.get('/burner-link/:token', (req, res) => {
  const link = db.getBurnerLink(req.params.token);
  if (!link) return res.status(404).json({ error: 'رابط الاتصال المؤقت غير صالح أو انتهت صلاحيته' });
  res.json({ link });
});

// Item 112: Cross-Device Draft Sync
router.get('/drafts/:contactId', (req, res) => {
  const draft = db.getDraft(req.user.id, req.params.contactId);
  res.json({ draft });
});

router.post('/drafts/:contactId', (req, res) => {
  const { text } = req.body;
  db.saveDraft(req.user.id, req.params.contactId, text || '');
  res.json({ success: true, text });
});

// Item 66: Out-of-Office Auto Responder (عندما يطلب المستخدم هذا)
router.get('/out-of-office', (req, res) => {
  const ooo = db.getOutOfOffice(req.user.id);
  res.json({ outOfOffice: ooo });
});

router.post('/out-of-office', (req, res) => {
  const { enabled, message, hours } = req.body;
  const updated = db.setOutOfOffice(req.user.id, { enabled: !!enabled, message, hours });
  res.json({ outOfOffice: updated, notice: 'تم تحديث إعدادات خارج أوقات العمل بنجاح' });
});

// Item 106: Encrypted Cloud Backup & Restore
router.post('/backup/export', (req, res) => {
  const userMessages = db.getMessages().filter(m => m.senderId === req.user.id || m.receiverId === req.user.id);
  const userVault = db.getVault(req.user.id);
  const exportData = {
    userId: req.user.id,
    userEmail: req.user.email,
    exportedAt: new Date().toISOString(),
    messagesCount: userMessages.length,
    vaultCount: userVault.length,
    messages: userMessages,
    vault: userVault,
  };
  res.json({ backup: exportData });
});

router.post('/backup/import', (req, res) => {
  const { backup } = req.body;
  if (!backup || !backup.messages) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح' });
  }
  // Restore messages safely
  backup.messages.forEach(m => {
    const existing = db.getMessages().find(ex => ex.id === m.id);
    if (!existing) db.addMessage(m);
  });
  res.json({ success: true, message: `تم استرجاع ${backup.messages.length} رسالة بنجاح!` });
});

export default router;
