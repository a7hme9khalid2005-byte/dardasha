import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Get list of groups
router.get('/', (req, res) => {
  const groups = db.getGroups();
  res.json({ groups });
});

// Create new group (or event group with expiry - Item 34)
router.post('/', (req, res) => {
  const { name, description, isEventGroup, expiryDate, silentHours, quiz } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المجموعة مطلوب' });

  const groups = db.getGroups();
  const newGroup = {
    id: `group-${uuidv4().substring(0, 8)}`,
    name,
    description: description || '',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=8b5cf6`,
    membersCount: 1,
    creatorId: req.user.id,
    isEventGroup: !!isEventGroup, // Item 34
    expiryDate: expiryDate || null,
    threads: [
      { id: 'th-main', name: '💬 النقاش العام', messagesCount: 0 }
    ], // Item 25
    broadcasts: [], // Item 28
    voiceRoomActive: false, // Item 30
    voiceListeners: 0,
    silentHours: silentHours || { enabled: false }, // Item 36
    quiz: quiz || [], // Item 35
    createdAt: new Date().toISOString()
  };

  groups.unshift(newGroup);
  db.saveGroups(groups);
  res.status(201).json({ group: newGroup });
});

// Get group by ID
router.get('/:id', (req, res) => {
  const group = db.getGroups().find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  res.json({ group });
});

// Item 25: Add a new thread / topic to a group
router.post('/:id/threads', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'عنوان الموضوع الفرعي مطلوب' });
  const groups = db.getGroups();
  const group = groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'المجموعة غير موجودة' });

  const newThread = {
    id: `th-${Date.now()}`,
    name,
    messagesCount: 0,
    createdAt: new Date().toISOString()
  };
  group.threads.push(newThread);
  db.saveGroups(groups);
  res.status(201).json({ thread: newThread });
});

// Item 28: Add broadcast announcement with mandatory read confirmation
router.post('/:id/broadcasts', (req, res) => {
  const { title, content, mandatoryConfirm } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
  const groups = db.getGroups();
  const group = groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'المجموعة غير موجودة' });

  const broadcast = {
    id: `bc-${Date.now()}`,
    title,
    content,
    mandatoryConfirm: !!mandatoryConfirm,
    confirms: 0,
    confirmedUsers: [],
    createdAt: new Date().toISOString()
  };
  if (!group.broadcasts) group.broadcasts = [];
  group.broadcasts.unshift(broadcast);
  db.saveGroups(groups);
  res.status(201).json({ broadcast });
});

// Item 28: Confirm broadcast read
router.post('/:id/broadcasts/:bcId/confirm', (req, res) => {
  const groups = db.getGroups();
  const group = groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  const bc = group.broadcasts.find(b => b.id === req.params.bcId);
  if (!bc) return res.status(404).json({ error: 'الإعلان غير موجود' });

  if (!bc.confirmedUsers) bc.confirmedUsers = [];
  if (!bc.confirmedUsers.includes(req.user.id)) {
    bc.confirmedUsers.push(req.user.id);
    bc.confirms = (bc.confirms || 0) + 1;
    db.saveGroups(groups);
  }
  res.json({ success: true, confirms: bc.confirms });
});

// Item 31: Anonymous Mod Box
router.post('/:id/mod-box', (req, res) => {
  const { text, type } = req.body;
  if (!text) return res.status(400).json({ error: 'نص المقترح أو الشكوى مطلوب' });
  const item = db.addModBoxSuggestion(req.params.id, { text, type: type || 'suggestion' });
  res.status(201).json({ success: true, item, message: 'تم إرسال اقتراحك السري للمشرفين بأمان!' });
});

router.get('/:id/mod-box', (req, res) => {
  const suggestions = db.getModBoxSuggestions(req.params.id);
  res.json({ suggestions });
});

// Item 33: Community Analytics
router.get('/:id/analytics', (req, res) => {
  res.json({
    analytics: {
      totalMessagesThisWeek: 1248,
      activeMembersCount: 412,
      peakHours: '8:00 م - 11:00 م (توقيت الذروة)',
      topContributors: [
        { name: 'طارق العلي', score: '380 رسالة' },
        { name: 'سارة خالد', score: '295 رسالة' },
        { name: 'أحمد المنصور', score: '210 رسالة' }
      ],
      weeklyGrowthRate: '+18.5%'
    }
  });
});

export default router;
