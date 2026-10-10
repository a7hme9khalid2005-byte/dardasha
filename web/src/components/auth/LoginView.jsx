import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Loader2, Sparkles, MessageCircle, Shield, Zap, Lock, Mail, Users, 
  QrCode, RefreshCw, Smartphone, CheckCircle, ShieldAlert
} from 'lucide-react';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { api, API_BASE } from '../../services/api';

export default function LoginView({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState('password'); // 'password', 'qr'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Item 113: Web QR Login States
  const [qrSessionId, setQrSessionId] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState('idle'); // 'pending', 'confirmed', 'expired'
  const [qrTimer, setQrTimer] = useState(120);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Generate QR Session when switching to QR mode
  useEffect(() => {
    let pollInterval;
    let countdownInterval;

    if (authMode === 'qr') {
      initQrSession();

      // Poll check every 1500ms
      pollInterval = setInterval(async () => {
        if (qrSessionId && qrStatus !== 'confirmed') {
          try {
            const check = await api.checkQrSession(qrSessionId);
            if (check.status === 'confirmed' && check.token) {
              setQrStatus('confirmed');
              clearInterval(pollInterval);
              localStorage.setItem('dardasha_token', check.token);
              // Trigger app reload or state update
              window.location.reload();
            } else if (check.status === 'expired') {
              setQrStatus('expired');
              clearInterval(pollInterval);
            }
          } catch (err) {
            console.warn('QR poll warn:', err);
          }
        }
      }, 1500);

      countdownInterval = setInterval(() => {
        setQrTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [authMode, qrSessionId, qrStatus]);

  const initQrSession = async () => {
    setQrLoading(true);
    setQrStatus('pending');
    setQrTimer(120);
    try {
      const res = await api.generateQrSession();
      setQrSessionId(res.sessionId);
    } catch (err) {
      console.error('Failed to generate QR session:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSimulateMobileApproval = async () => {
    if (!qrSessionId) return;
    try {
      const check = await api.checkQrSession(qrSessionId);
      if (check.status === 'confirmed' && check.token) {
        setQrStatus('confirmed');
        localStorage.setItem('dardasha_token', check.token);
        setTimeout(() => window.location.reload(), 800);
      } else {
        alert('يرجى مسح الرمز من خلال تطبيق الهاتف للمصادقة');
      }
    } catch {
      alert('في انتظار تأكيد المصادقة من الهاتف');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await onLogin({ email, password });
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = async (userData) => {
    await onRegister(userData);
  };

  // QR Code Image URL using dynamic QR API with clean vector SVG
  const qrCodeUrl = qrSessionId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`dardasha://login?session=${qrSessionId}`)}&bgcolor=0f172a&color=06b6d4&margin=10`
    : '';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-between relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Aurora Orbs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Brand & Showcase Side */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40">
              <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-glow shrink-0">
                <img src="/app-icon.png" alt="Dardasha Logo" className="w-full h-full object-cover" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white">
                    Dardasha
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    دردشة
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">المنصة الذكية للتواصل والمحادثات</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              جيل جديد من التواصل، <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                بتجربة فريدة ومستقلة تماماً.
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              منصة مبتكرة تمزج الدردشة الفورية المشفرة مع مساحات المجتمع التفاعلية والذكاء الاصطناعي — بدون خوارزميات إدمانية أو تتبع مزعج.
            </p>

            {/* Feature Highlights Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-right hover:border-purple-500/40 transition">
                <Zap className="w-4 h-4 text-amber-400 mb-1.5" />
                <h4 className="font-bold text-xs text-white">سرعة فائقة</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">محادثات فورية WebSockets</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-right hover:border-cyan-500/40 transition">
                <QrCode className="w-4 h-4 text-cyan-400 mb-1.5" />
                <h4 className="font-bold text-xs text-white">دخول QR فوري</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">مسح الكود والمزامنة الحية</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-right hover:border-blue-500/40 transition">
                <Sparkles className="w-4 h-4 text-blue-400 mb-1.5" />
                <h4 className="font-bold text-xs text-white">تخصيص مطلق</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">+1,000 خط و 32 فقاعة</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-right hover:border-rose-500/40 transition">
                <Shield className="w-4 h-4 text-rose-400 mb-1.5" />
                <h4 className="font-bold text-xs text-white">أمان الطوارئ</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">رمز Decoy والدردشة الشبحية</p>
              </div>
            </div>

          </div>

          {/* Login Card (Futuristic Glass) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
              
              {/* Header & Mode Switcher */}
              <div className="mb-6 text-center space-y-3">
                <h3 className="text-xl font-extrabold text-white">تسجيل الدخول إلى حسابك</h3>
                
                {/* Switch between Password & Instant Web QR */}
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      authMode === 'password'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>البريد الإلكتروني</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('qr')}
                    className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      authMode === 'qr'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>مسح كود QR الفوري (113)</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold text-right">
                  ⚠️ {error}
                </div>
              )}

              {successNotice && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold text-right">
                  ✅ {successNotice}
                </div>
              )}

              {/* MODE 1: Standard Password Login */}
              {authMode === 'password' && (
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition text-sm pl-11 text-right"
                    />
                    <Mail className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-4" />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة السر (أو رمز Decoy التمويهي)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition text-sm pl-11 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-4 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Forgot Password Row */}
                  <div className="flex items-center justify-end text-[11px] px-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black rounded-xl text-sm shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      'دخول إلى المنصة'
                    )}
                  </button>
                </form>
              )}

              {/* MODE 2: Item 113 - Instant Web QR Login */}
              {authMode === 'qr' && (
                <div className="space-y-4 text-center animate-in zoom-in-95">
                  <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center space-y-3">
                    
                    {qrLoading ? (
                      <div className="w-48 h-48 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                        <span className="text-xs text-gray-400">توليد رمز الجلسة المشفر...</span>
                      </div>
                    ) : (
                      <div className="relative group">
                        <img
                          src={qrCodeUrl}
                          alt="Dardasha Web QR Login"
                          className="w-48 h-48 rounded-xl border-2 border-cyan-400/40 shadow-glow-accent object-contain p-1 bg-white"
                        />
                        {qrStatus === 'expired' && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-3 text-center">
                            <span className="text-xs text-rose-400 font-bold mb-2">انتهت صلاحية الرمز</span>
                            <button
                              onClick={initQrSession}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>تحديث الرمز</span>
                            </button>
                          </div>
                        )}
                        {qrStatus === 'confirmed' && (
                          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-3 text-center">
                            <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce mb-2" />
                            <span className="text-xs text-emerald-300 font-bold">تم تأكيد الدخول بنجاح!</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-right w-full space-y-1 text-xs">
                      <p className="text-gray-300 font-bold">خطوات تسجيل الدخول عبر QR:</p>
                      <ol className="text-[11px] text-gray-400 list-decimal list-inside space-y-0.5">
                        <li>افتح تطبيق Dardasha على هاتفك.</li>
                        <li>انتقل إلى الإعدادات ⚙️ واضغط "مسح كود QR للمتصفح".</li>
                        <li>وجّه الكاميرا نحو هذا الرمز لتسجيل الدخول فوراً!</li>
                      </ol>
                    </div>

                    <div className="flex items-center justify-between w-full pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-gray-400 font-mono">الصلاحية: {qrTimer} ثانية</span>
                      <button 
                        onClick={initQrSession}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>تحديث</span>
                      </button>
                    </div>

                  </div>

                  {/* Quick Simulator Button for immediate testing on current device */}
                  <button
                    type="button"
                    onClick={handleSimulateMobileApproval}
                    className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>تجربة المصادقة السريعة الآن (Instant QR Auth)</span>
                  </button>
                </div>
              )}

              {/* Forgot Password */}
              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline"
                >
                  هل نسيت كلمة المرور؟ (كود 6 أرقام)
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#131b2e] text-gray-400 font-medium rounded-full">أو</span>
                </div>
              </div>

              {/* Create Account Trigger */}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>إنشاء حساب جديد في دردشة</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 px-4 text-xs text-gray-500 text-center relative z-10">
        <p>© 2026 Dardasha Platform • منصة التواصل الذكي الحرة</p>
      </footer>

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onPasswordResetSuccess={() => {
          setSuccessNotice('تم تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.');
        }}
      />
    </div>
  );
}
