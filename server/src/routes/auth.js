import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { JWT_SECRET } from '../config.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Helper to create JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}` },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * 0. Send Registration OTP Code (Resend Verification)
 */
router.post('/register/send-otp', async (req, res) => {
  try {
    const { email, firstName, username } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if requested username is already taken
    if (username) {
      const cleanU = username.replace(/^@/, '').trim().toLowerCase();
      const existingUser = db.findUserByUsername(cleanU);
      if (existingUser) {
        return res.status(400).json({ error: 'اسم المستخدم هذا محجوز بالفعل، يرجى اختيار اسم مستخدم آخر' });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    db.saveOtp({
      email: cleanEmail,
      code,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    // Dispatch OTP email immediately in background so UI transition is instant
    sendOtpEmail(cleanEmail, code, firstName || 'عضو جديد').catch(err => {
      console.error('Background OTP send error:', err);
    });

    res.json({
      success: true,
      message: 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Send register OTP error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال رمز التحقق' });
  }
});

/**
 * 1. Register with Full Profile & Real Avatar
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      middleName, 
      lastName, 
      username, 
      email, 
      password, 
      gender, 
      country, 
      phone, 
      avatar, 
      bio, 
      website, 
      birthDay, 
      birthMonth, 
      birthYear,
      otpCode 
    } = req.body;

    if (!firstName || !lastName || !email || !password || !username) {
      return res.status(400).json({ error: 'يرجى تعبئة الحقول الأساسية (الاسم، اسم المستخدم، البريد، كلمة المرور)' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanU = username.replace(/^@/, '').trim().toLowerCase();

    if (!cleanU || cleanU.length < 3) {
      return res.status(400).json({ error: 'يجب ألا يقل اسم المستخدم عن 3 أحرف' });
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(cleanU)) {
      return res.status(400).json({ error: 'اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية وأرقام وشرطة سفلية (_)' });
    }

    const formattedUsername = `@${cleanU}`;
    const userExists = db.findUserByUsername(cleanU);
    if (userExists) {
      return res.status(400).json({ error: 'اسم المستخدم هذا محجوز بالفعل، يرجى اختيار اسم مستخدم آخر' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' });
    }

    // Check OTP verification if provided
    if (otpCode) {
      const record = db.verifyOtp(cleanEmail, otpCode);
      if (!record) {
        return res.status(400).json({ error: 'رمز التحقق (OTP) غير صحيح أو انتهت صلاحيته' });
      }
      db.markOtpUsed(cleanEmail, otpCode);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use uploaded real photo or SVG initials fallback
    const finalAvatar = avatar && avatar.startsWith('data:image') 
      ? avatar 
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}&backgroundColor=1877f2`;

    const newUser = {
      id: uuidv4(),
      firstName: firstName.trim(),
      middleName: (middleName || '').trim(),
      lastName: lastName.trim(),
      username: formattedUsername,
      email: cleanEmail,
      password: hashedPassword,
      gender: (gender || 'male').toLowerCase(),
      country: country || 'المملكة العربية السعودية',
      phone: phone || '',
      phonePrivacy: 'public',
      emailPrivacy: 'public',
      avatar: finalAvatar,
      bio: (bio || 'عضو جديد في منصة دردشة 👋').trim(),
      location: country || 'المملكة العربية السعودية',
      socialLinks: {
        website: (website || '').trim()
      },
      statusVibe: '✨ انضم حديثاً إلى مجتمع دردشة',
      interests: ['#دردشة', '#تواصل_ذكي', '#تقنية'],
      birthDay: parseInt(birthDay || 15, 10),
      birthMonth: parseInt(birthMonth || 6, 10),
      birthYear: parseInt(birthYear || 2000, 10),
      status: 'online',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Record Audit Log (Item 22)
    db.addAuditLog({
      userId: newUser.id,
      action: 'إنشاء حساب جديد متكامل بالصورة ورقم الهاتف',
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'متصفح',
      status: 'success'
    });

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح! مرحباً بك في دردشة',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً' });
  }
});

/**
 * 2. Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, username, identifier, password, isDecoyAttempt } = req.body;
    const loginInput = (identifier || username || email || '').trim();

    if (!loginInput || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور' });
    }

    let user = null;
    const cleanInput = loginInput.toLowerCase();

    // 1. Try finding by username first (with or without @)
    user = db.findUserByUsername(cleanInput);

    // 2. If not found by username, try by email
    if (!user) {
      const usersWithEmail = db.findUsersByEmail(cleanInput);
      if (usersWithEmail.length === 1) {
        user = usersWithEmail[0];
      } else if (usersWithEmail.length > 1) {
        // Check password against each account sharing this email
        for (const candidate of usersWithEmail) {
          const match = await bcrypt.compare(password, candidate.password);
          if (match) {
            user = candidate;
            break;
          }
        }
        if (!user) {
          return res.status(400).json({ 
            error: 'يوجد أكثر من حساب مسجل بهذا البريد. يرجى كتابة اسم المستخدم الخاص بك (@username) بدلاً من البريد الإلكتروني' 
          });
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'اسم المستخدم / البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Check Decoy PIN (Item 13)
    if (user.decoyPin && password === user.decoyPin) {
      const { password: _, ...safeUser } = user;
      const token = generateToken(user);
      db.addAuditLog({
        userId: user.id,
        action: 'دخول برمز الطوارئ التمويهي (Decoy Mode)',
        ip: req.ip || '127.0.0.1',
        device: req.headers['user-agent'] || 'متصفح',
        status: 'decoy'
      });
      return res.json({
        message: 'تم تسجيل الدخول في وضع الطوارئ التمويهي 🕶️',
        token,
        user: { ...safeUser, isDecoyActive: true },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Record Audit Log (Item 22)
    db.addAuditLog({
      userId: user.id,
      action: 'تسجيل دخول ناجح',
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'متصفح',
      status: 'success'
    });

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

/**
 * 3. Forgot Password -> Generates and sends 6-digit OTP
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const input = (identifier || email || '').trim();

    if (!input) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني' });
    }

    const clean = input.toLowerCase();
    const user = db.findUserByIdentifier(clean);

    if (!user) {
      return res.status(404).json({ error: 'لم يتم العثور على حساب مرتبط بهذا الاسم أو البريد الإلكتروني' });
    }

    const cleanEmail = user.email.toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    db.saveOtp({
      email: cleanEmail,
      code,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    // Dispatch OTP email immediately in background so UI transition is instant
    sendOtpEmail(cleanEmail, code, user.firstName).catch(err => {
      console.error('Background OTP send error:', err);
    });

    res.json({
      success: true,
      message: 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

/**
 * 4. Verify 6-digit OTP
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'يرجى تزويد البريد الإلكتروني ورمز التحقق' });
    }

    const record = db.verifyOtp(email, code);
    if (!record) {
      return res.status(400).json({ error: 'رمز التحقق غير صحيح أو انتهت صلاحيته' });
    }

    res.json({
      valid: true,
      message: 'رمز التحقق صحيح',
      email: record.email,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الرمز' });
  }
});

/**
 * 5. Reset Password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'يرجى تعبئة كافة الحقول المطلوبة' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل' });
    }

    const record = db.verifyOtp(email, code);
    if (!record) {
      return res.status(400).json({ error: 'رمز التحقق غير صالح أو انتهت صلاحيته' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.updateUser(user.id, { password: hashedPassword });
    db.markOtpUsed(email, code);

    db.addAuditLog({
      userId: user.id,
      action: 'إعادة تعيين كلمة المرور',
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'متصفح',
      status: 'success'
    });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
  }
});

/**
 * 6. Get Current Authenticated User (Profile)
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

/**
 * 7. Update User Profile
 */
router.put('/profile', authMiddleware, (req, res) => {
  const { 
    firstName, lastName, bio, avatar, avatarFrame, customRole, 
    birthDay, birthMonth, birthYear, gender, decoyPin, inactivityMonths,
    chatBubbleStyle, appThemeIcon, oledBlackEnabled, highContrastEnabled,
    selectedFontFamily,
    username, phone, phonePrivacy, emailPrivacy, location, statusVibe, interests, socialLinks, zodiac
  } = req.body;
  
  const updates = {};
  if (firstName) updates.firstName = firstName.trim();
  if (lastName) updates.lastName = lastName.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (avatar) updates.avatar = avatar;
  if (avatarFrame) updates.avatarFrame = avatarFrame;
  if (customRole) updates.customRole = customRole;
  if (birthDay) updates.birthDay = parseInt(birthDay, 10);
  if (birthMonth) updates.birthMonth = parseInt(birthMonth, 10);
  if (birthYear) updates.birthYear = parseInt(birthYear, 10);
  if (gender) updates.gender = gender;
  if (decoyPin !== undefined) updates.decoyPin = decoyPin;
  if (inactivityMonths !== undefined) updates.inactivityMonths = inactivityMonths;
  if (chatBubbleStyle !== undefined) updates.chatBubbleStyle = chatBubbleStyle;
  if (appThemeIcon !== undefined) updates.appThemeIcon = appThemeIcon;
  if (oledBlackEnabled !== undefined) updates.oledBlackEnabled = oledBlackEnabled;
  if (highContrastEnabled !== undefined) updates.highContrastEnabled = highContrastEnabled;
  if (selectedFontFamily !== undefined) updates.selectedFontFamily = selectedFontFamily;

  // New "About" fields
  if (username !== undefined) {
    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
    updates.username = cleanUsername ? `@${cleanUsername}` : '';
  }
  if (phone !== undefined) updates.phone = phone.trim();
  if (phonePrivacy !== undefined) updates.phonePrivacy = phonePrivacy;
  if (emailPrivacy !== undefined) updates.emailPrivacy = emailPrivacy;
  if (location !== undefined) updates.location = location.trim();
  if (statusVibe !== undefined) updates.statusVibe = statusVibe.trim();
  if (interests !== undefined) updates.interests = Array.isArray(interests) ? interests : [];
  if (socialLinks !== undefined) updates.socialLinks = typeof socialLinks === 'object' ? socialLinks : {};
  if (zodiac !== undefined) updates.zodiac = zodiac;

  const updatedUser = db.updateUser(req.user.id, updates);
  const { password, ...safeUser } = updatedUser;
  res.json({ user: safeUser, message: 'تم تحديث الملف الشخصي وبيانات حول الحساب بنجاح' });
});

// ==================== NEW REAL QR LOGIN ENDPOINTS (Item 113) ====================

/**
 * Item 113: Generate QR Login Session
 */
router.post('/qr/generate', (req, res) => {
  const sessionId = `qr-${uuidv4()}`;
  const session = db.createQrSession(sessionId);
  res.json({ sessionId, expiresAt: session.expiresAt });
});

/**
 * Item 113: Check QR Login Session status (Polling)
 */
router.get('/qr/check/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = db.getQrSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'جلسة QR غير صالحة' });
  }
  if (session.status === 'confirmed') {
    return res.json({
      status: 'confirmed',
      token: session.token,
      user: session.user
    });
  }
  if (Date.now() > session.expiresAt) {
    return res.json({ status: 'expired' });
  }
  res.json({ status: 'pending' });
});

/**
 * Item 113: Approve QR Login Session (from logged-in mobile or device)
 */
router.post('/qr/approve', authMiddleware, (req, res) => {
  const { sessionId } = req.body;
  const user = req.user;
  const token = generateToken(user);
  const confirmed = db.confirmQrSession(sessionId, user, token);
  if (!confirmed) {
    return res.status(400).json({ error: 'فشل تأكيد جلسة QR أو انتهت صلاحيتها' });
  }

  db.addAuditLog({
    userId: user.id,
    action: 'مصادقة تسجيل دخول عبر كود QR',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'هاتف / جهاز معتمد',
    status: 'success'
  });

  res.json({ success: true, message: 'تم تأكيد تسجيل الدخول عبر QR بنجاح!' });
});

// ==================== SECURITY SUITE ENDPOINTS ====================

/**
 * Item 22: Get Security Audit Log
 */
router.get('/audit-log', authMiddleware, (req, res) => {
  const logs = db.getAuditLogs(req.user.id);
  res.json({ logs });
});

/**
 * Item 21: Panic Button Instant Wipe
 */
router.post('/panic-wipe', authMiddleware, (req, res) => {
  db.panicWipeUserHistory(req.user.id);
  db.addAuditLog({
    userId: req.user.id,
    action: 'تنفيذ مسح الطوارئ الفوري (Panic Button)',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'متصفح',
    status: 'wiped'
  });
  res.json({ success: true, message: 'تم مسح سجل المحادثات والخزنة بالكامل بنجاح!' });
});

export default router;
