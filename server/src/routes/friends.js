import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// 1. Get incoming & outgoing friend requests
router.get('/requests', (req, res) => {
  try {
    const data = db.getFriendRequests(req.user.id);
    res.json(data);
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب طلبات الصداقة' });
  }
});

// 2. Send friend request by username, email or ID
router.post('/request', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني' });
    }

    const result = db.sendFriendRequest(req.user.id, identifier.trim());
    res.status(201).json({
      message: `تم إرسال طلب الصداقة إلى ${result.targetUser.firstName} بنجاح!`,
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'فشل إرسال طلب الصداقة' });
  }
});

// 3. Respond to friend request (accept / reject)
router.post('/respond', (req, res) => {
  try {
    const { requestId, action, circle } = req.body;
    if (!requestId || !action) {
      return res.status(400).json({ error: 'معرف الطلب والإجراء مطلوبان' });
    }

    const result = db.respondFriendRequest(requestId, req.user.id, action, circle || 'all');
    const msg = action === 'accept'
      ? 'تم قبول طلب الصداقة بنجاح! تم إضافة الصديق لقائمة المحادثات 🤝'
      : 'تم رفض طلب الصداقة';
    res.json({ message: msg, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message || 'فشل معالجة طلب الصداقة' });
  }
});

// 4. Cancel outgoing friend request
router.delete('/request/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.cancelFriendRequest(id, req.user.id);
    res.json({ message: 'تم إلغاء طلب الصداقة بنجاح' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'فشل إلغاء الطلب' });
  }
});

// 5. Get friend suggestions (People you may know)
router.get('/suggestions', (req, res) => {
  try {
    const suggestions = db.getFriendSuggestions(req.user.id);
    res.json({ suggestions });
  } catch (err) {
    console.error('Error getting suggestions:', err);
    res.status(500).json({ error: 'فشل جلب اقتراحات الأصدقاء' });
  }
});

// 6. Get user personal Friend QR Code & Magic Link
router.get('/qr', (req, res) => {
  try {
    const username = req.user.email ? req.user.email.split('@')[0] : req.user.id;
    const qrToken = `friend-qr-${req.user.id}-${Buffer.from(username).toString('base64')}`;
    const shareLink = `https://dardasha.app/add/@${username}`;
    
    // Quick SVG QR representation or public QR generator API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareLink)}&bgcolor=ffffff&color=6d28d9`;

    res.json({
      qrToken,
      shareLink,
      qrCodeUrl,
      username,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'فشل توليد رمز QR' });
  }
});

// 7. Claim Friend QR scan
router.post('/qr/claim', (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken || !qrToken.startsWith('friend-qr-')) {
      return res.status(400).json({ error: 'رمز QR غير صالح أو منتهي الصلاحية' });
    }

    const parts = qrToken.split('-');
    const targetUserId = parts[2];

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'هذا رمز QR الخاص بك!' });
    }

    const result = db.sendFriendRequest(req.user.id, targetUserId);
    res.json({
      message: `تم التعرف على رمز QR وتم إرسال طلب الصداقة إلى ${result.targetUser.firstName} فوراً! 📲`,
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'فشل ربط الصداقة عبر QR' });
  }
});

export default router;
