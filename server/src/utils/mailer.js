import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Responsive Arabic HTML Template for Dardasha OTP
 */
function buildOtpEmailHtml(code, userName = '', targetEmail = '') {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>رمز التحقق - دردشة</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          margin: 0;
          padding: 24px 12px;
          color: #ffffff;
          direction: rtl;
          text-align: right;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background: #111827;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 1px solid #1f2937;
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #064e3b 100%);
          color: #ffffff;
          padding: 36px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .logo-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
          color: #38bdf8;
        }
        .subtitle {
          margin: 8px 0 0;
          font-size: 14px;
          color: #94a3b8;
        }
        .content {
          padding: 36px 28px;
          text-align: center;
        }
        .greeting {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
        }
        .desc {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .otp-container {
          background: #0f172a;
          border: 2px dashed #38bdf8;
          border-radius: 16px;
          padding: 24px 16px;
          margin: 24px auto;
          display: inline-block;
          min-width: 290px;
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
        }
        .otp-label {
          font-size: 13px;
          color: #38bdf8;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .otp-code {
          font-size: 40px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 12px;
          font-family: 'Courier New', Courier, monospace;
          margin-right: -12px;
          user-select: all;
          text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        }
        .details-box {
          background: #1e293b;
          border-radius: 12px;
          padding: 14px 18px;
          margin: 24px 0 16px;
          font-size: 13px;
          color: #cbd5e1;
          text-align: right;
          border: 1px solid #334155;
        }
        .warning-box {
          background: rgba(245, 158, 11, 0.1);
          border-right: 4px solid #f59e0b;
          border-radius: 10px;
          padding: 14px;
          margin-top: 20px;
          font-size: 12px;
          color: #fde68a;
          text-align: right;
          line-height: 1.6;
        }
        .footer {
          background: #0b0f19;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">💬 Dardasha • دردشة</h1>
          <p class="subtitle">منصة التواصل الاجتماعي والمحادثات الفورية</p>
        </div>
        
        <div class="content">
          <div class="greeting">مرحباً ${userName ? userName : 'صديقنا'} 👋</div>
          <div class="desc">
            لقد تم طلب رمز التحقق لتأكيد حسابك أو استعادة كلمة المرور في منصة دردشة.<br>
            استخدم رمز التحقق التالي لإتمام العملية:
          </div>

          <div class="otp-container">
            <div class="otp-label">رمز التحقق الأمني</div>
            <div class="otp-code">${code}</div>
          </div>

          <div class="details-box">
            ⏱️ <strong>صلاحية الرمز:</strong> صالح للاستخدام لمدة <strong>10 دقائق</strong> فقط.<br>
            📧 <strong>البريد المستهدف:</strong> ${targetEmail || 'حسابك في دردشة'}
          </div>

          <div class="warning-box">
            🔒 <strong>تنبيه أمان:</strong> لا تشارك هذا الرمز مع أي شخص، حتى لو ادعى أنه من فريق الدعم. إذا لم تكن أنت من طلب هذا الرمز، يمكنك تجاهل هذا البريد بأمان.
          </div>
        </div>

        <div class="footer">
          © 2026 Dardasha Platform. جميع الحقوق محفوظة.<br>
          رسالة أمان تلقائية صادرة من help.shipgo@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get or initialize the Gmail SMTP Transporter
 */
export function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const smtpPass = rawPass.replace(/\s+/g, ''); // strip any spaces

  if (!smtpUser || !smtpPass) {
    console.error('⚠️ [SMTP Configuration Missing] SMTP_USER or SMTP_PASS not defined in .env');
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log(`📧 [SMTP Mailer Active] Authenticated via ${smtpUser}`);
  return transporter;
}

/**
 * Main Function: Send Verification OTP Code directly to Customer's Email
 */
export async function sendOtpEmail(email, code, userName = '') {
  const smtpUser = process.env.SMTP_USER;
  const mailer = getTransporter();
  const htmlContent = buildOtpEmailHtml(code, userName, email);

  const mailOptions = {
    from: `"دردشة Dardasha" <${smtpUser}>`,
    to: email,
    subject: `[Dardasha] رمز التحقق الخاص بك: ${code}`,
    text: `رمز التحقق الخاص بك في منصة دردشة هو: ${code}\nصالح للاستخدام لمدة 10 دقائق.\nإذا لم تكن أنت من طلب هذا الرمز، تجاهل هذه الرسالة.`,
    html: htmlContent,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'Priority': 'urgent',
    },
  };

  const info = await mailer.sendMail(mailOptions);
  console.log(`🚀 [OTP DISPATCHED] From: ${smtpUser} ➡️ To: ${email} | Code: [ ${code} ] | MsgID: ${info.messageId}`);
  return { success: true, messageId: info.messageId, provider: 'gmail_smtp' };
}
