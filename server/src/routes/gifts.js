import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db.js';
import { drawRandomGift, generateGiftByIndex, exploreGifts } from '../utils/giftsEngine.js';

const router = Router();

// Cooldown period: exactly 3 days (72 hours in milliseconds)
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function formatRemainingTime(ms) {
  if (ms <= 0) return 'متاح الآن';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} يوم`);
  if (hours > 0) parts.push(`${hours} ساعة`);
  if (minutes > 0) parts.push(`${minutes} دقيقة`);
  if (parts.length === 0 || seconds > 0) parts.push(`${seconds} ثانية`);

  return parts.join(' و ');
}

/**
 * 0. Check Chest Cooldown Status (Every 3 Days Rule)
 */
router.get('/chest/status', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findUserById(userId);

    const lastOpen = user?.lastChestOpenAt ? new Date(user.lastChestOpenAt).getTime() : 0;
    const now = Date.now();
    const elapsed = now - lastOpen;
    const canOpen = elapsed >= THREE_DAYS_MS;
    const remainingMs = canOpen ? 0 : Math.max(0, THREE_DAYS_MS - elapsed);
    const nextAvailableAt = canOpen ? new Date(now).toISOString() : new Date(lastOpen + THREE_DAYS_MS).toISOString();

    res.json({
      success: true,
      canOpen,
      remainingMs,
      cooldownDays: 3,
      lastChestOpenAt: user?.lastChestOpenAt || null,
      nextAvailableAt,
      formattedRemaining: formatRemainingTime(remainingMs)
    });
  } catch (err) {
    console.error('Error checking chest status:', err);
    res.status(500).json({ error: 'فشل فحص حالة الصندوق' });
  }
});

/**
 * 1. Open Mystery Chest (Restricted to once every 3 days)
 */
router.post('/chest/open', authMiddleware, (req, res) => {
  try {
    const { chestTier = 'daily', forceReset = false } = req.body;
    const userId = req.user.id;
    const user = db.findUserById(userId);

    const lastOpen = user?.lastChestOpenAt ? new Date(user.lastChestOpenAt).getTime() : 0;
    const now = Date.now();
    const elapsed = now - lastOpen;

    // Enforce 3-day cooldown unless forceReset flag is explicitly requested for testing
    if (elapsed < THREE_DAYS_MS && !forceReset) {
      const remainingMs = THREE_DAYS_MS - elapsed;
      const formatted = formatRemainingTime(remainingMs);
      return res.status(400).json({
        error: `يمكنك فتح صندوق الهدايا مرة واحدة كل 3 أيام! الوقت المتبقي لفتح الصندوق القادم: ${formatted}`,
        canOpen: false,
        remainingMs,
        formattedRemaining: formatted,
        nextAvailableAt: new Date(lastOpen + THREE_DAYS_MS).toISOString()
      });
    }

    // Draw a unique gift from the 100,000 universe
    const drawnGift = drawRandomGift(chestTier);

    // Save to user's persistent inventory
    const savedGift = db.addUserGift(userId, drawnGift);

    // Update user's lastChestOpenAt timestamp to enforce the 3-day cooldown
    db.updateUser(userId, { lastChestOpenAt: new Date(now).toISOString() });

    // Add Audit Log for gamification
    db.addAuditLog({
      userId,
      action: `فتح صندوق الحظ (${chestTier}): ربح ${drawnGift.name} (${drawnGift.serialNumber})`,
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'متصفح',
      status: 'success'
    });

    const nextAvailableAt = new Date(now + THREE_DAYS_MS).toISOString();

    res.json({
      success: true,
      gift: savedGift,
      nextAvailableAt,
      cooldownDays: 3,
      message: `مبروك! حصلت على ${savedGift.name} برقم تسلسلي ${savedGift.serialNumber} من عالم الـ 100,000 هدية!`
    });
  } catch (err) {
    console.error('Error opening chest:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء فتح الصندوق' });
  }
});

/**
 * Reset Cooldown for Testing
 */
router.post('/chest/reset-cooldown', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    db.updateUser(userId, { lastChestOpenAt: null });
    res.json({
      success: true,
      message: 'تمت إعادة تعيين عداد الصندوق بنجاح! يمكنك فتحه الآن للتجربة'
    });
  } catch (err) {
    res.status(500).json({ error: 'فشل إعادة التعيين' });
  }
});

/**
 * 2. Get My Collected Gifts Inventory
 */
router.get('/my-inventory', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    let inventory = db.getUserGifts(userId);

    // If new user with empty inventory, award 2 introductory gifts from the 100,000 universe!
    if (!inventory || inventory.length === 0) {
      const welcomeGift1 = drawRandomGift('golden');
      const welcomeGift2 = drawRandomGift('daily');
      db.addUserGift(userId, welcomeGift1);
      db.addUserGift(userId, welcomeGift2);
      inventory = db.getUserGifts(userId);
    }

    res.json({
      success: true,
      inventory,
      totalCount: inventory.length
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'فشل تحميل حقيبة الهدايا' });
  }
});

/**
 * 3. Get Public Gifts Showcase for a User
 */
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const gifts = db.getUserGifts(userId);
    res.json({
      success: true,
      showcase: gifts || []
    });
  } catch (err) {
    console.error('Error fetching user gifts showcase:', err);
    res.status(500).json({ error: 'فشل جلب هدايا المستخدم' });
  }
});

/**
 * 4. Send Gift to Contact / Friend
 */
router.post('/send', authMiddleware, (req, res) => {
  try {
    const { receiverId, giftIndex, note = '' } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ error: 'يرجى تحديد المستلم' });
    }

    const targetUser = db.findUserById(receiverId);
    if (!targetUser) {
      return res.status(404).json({ error: 'المستخدم المستلم غير موجود' });
    }

    // Generate or draw gift by index
    const gift = giftIndex ? generateGiftByIndex(giftIndex) : drawRandomGift('golden');

    const sentGift = db.sendGiftToUser(senderId, receiverId, gift, note);

    // Send an automatic chat message / notification
    db.addMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId,
      receiverId,
      content: `🎁 أرسل لك هدية فاخرة: "${gift.name}" (${gift.serialNumber})! ${note ? `\n💬 "${note}"` : ''}`,
      type: 'gift',
      giftData: gift,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      gift: sentGift,
      message: `تم إرسال الهدية بنجاح إلى ${targetUser.firstName}!`
    });
  } catch (err) {
    console.error('Error sending gift:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الهدية' });
  }
});

/**
 * 5. Explore & Search 100,000 Gifts Universe Catalog
 */
router.get('/explore', (req, res) => {
  try {
    const { page, limit, rarity, category, query } = req.query;
    const results = exploreGifts({ page, limit, rarity, category, query });
    res.json({
      success: true,
      ...results
    });
  } catch (err) {
    console.error('Error exploring gifts:', err);
    res.status(500).json({ error: 'فشل استعراض كتالوج الهدايا' });
  }
});

export default router;
