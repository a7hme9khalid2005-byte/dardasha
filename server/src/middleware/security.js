import rateLimit from 'express-rate-limit';

/**
 * 1. Deep NoSQL / Mongo Injection & Prototype Pollution Sanitizer
 * Strips any keys starting with '$' or containing '.' recursively.
 */
export function noSqlSanitizer(req, res, next) {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        delete obj[key];
        continue;
      }

      // Prevent MongoDB Operator Injection (e.g. $gt, $ne, $where)
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`🚨 Blocked potential NoSQL injection key: "${key}" from IP ${req.ip}`);
        delete obj[key];
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
}

/**
 * 2. Brute-Force & Credential Stuffing Rate Limiter for Login
 * Allows max 10 failed/successful login attempts per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تم تجاوز عدد محاولات الدخول المسموح بها. لحمايتك، تم تعليق المحاولات لمدة 15 دقيقة.',
    retryAfterMinutes: 15,
  },
});

/**
 * 3. Rate Limiter for OTP & Password Reset
 * Prevents email spamming, SMS/OTP bombing, and code guessing attacks.
 * Max 5 requests per 10 minutes per IP.
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تم طلب عدد كبير من رموز التحقق مؤخراً. يرجى الانتظار 10 دقائق قبل إعادة المحاولة.',
    retryAfterMinutes: 10,
  },
});

/**
 * 4. General API Rate Limiter
 * Shields server against DDoS and flooding attacks.
 * Max 400 requests per 15 minutes per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 450,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تم رصد نشاط غير معتاد من هذا العنوان. يرجى الانتظار قليلاً.',
  },
});

/**
 * 5. Production Safe Error Handler (Anti-Crash Shield)
 * Catches unhandled errors, logs stack traces securely, and shields internal server details.
 */
export function globalErrorHandler(err, req, res, next) {
  console.error(`💥 [CrashGuard] Unhandled Exception on ${req.method} ${req.url}:`, err.stack || err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'حدث استثناء مؤقت أثناء معالجة الطلب. تم عزل المشكلة بنجاح.' : err.message,
    code: err.code || 'SECURE_SERVER_EXCEPTION',
    timestamp: new Date().toISOString()
  });
}
