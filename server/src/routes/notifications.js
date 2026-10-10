import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// In-memory / persistent notifications list
let notifications = [
  {
    id: 'notif-1',
    title: 'تفاعل جديد ❤️',
    content: 'أعجب عمر التميمي بمنشورك الأخير في مساحة المجتمع.',
    time: 'منذ 5 دقائق',
    read: false,
    type: 'like',
  },
  {
    id: 'notif-2',
    title: 'رسالة مجدولة ⏰',
    content: 'تم إرسال رسالتك المجدولة بنجاح إلى سارة خالد.',
    time: 'منذ 30 دقيقة',
    read: false,
    type: 'schedule',
  },
  {
    id: 'notif-3',
    title: 'درع الأمان 🛡️',
    content: 'تم تفعيل حماية لقطات الشاشة بنجاح لحسابك.',
    time: 'منذ ساعتين',
    read: true,
    type: 'shield',
  },
  {
    id: 'notif-4',
    title: 'مساعد Dardasha AI 🤖',
    content: 'تم تلخيص 18 رسالة جديدة في محادثاتك اليوم.',
    time: 'أمس',
    read: true,
    type: 'ai',
  }
];

router.get('/', (req, res) => {
  res.json({ notifications });
});

router.post('/read-all', (req, res) => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  res.json({ notifications, message: 'تم تعيين جميع الإشعارات كمقروءة' });
});

export default router;
