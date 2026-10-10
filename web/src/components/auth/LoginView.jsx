import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Loader2, Sparkles, MessageCircle, Shield, Zap, Lock, Mail, Users, User,
  QrCode, RefreshCw, Smartphone, CheckCircle, ShieldAlert
} from 'lucide-react';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { api, API_BASE } from '../../services/api';
import QRCode from 'qrcode';

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

  // Mobile App Installation (PWA) Handler
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (typeof window !== 'undefined' && window.location.search.includes('install=true')) {
      setShowInstallBanner(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        alert('📱 لتثبيت تطبيق دردشة على آيفون:\n1. اضغط على زر المشاركة (Share ⎋) أسفل المتصفح.\n2. اختر "إضافة إلى الصفحة الرئيسية (Add to Home Screen ➕)".');
      } else {
        alert('📱 لتثبيت تطبيق دردشة:\nاضغط على خيارات المتصفح (⋮) في الأعلى واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
      }
    }
  };

  // 1. Generate QR Session ONLY once when switching to QR mode
  useEffect(() => {
    if (authMode === 'qr') {
      initQrSession();
    }
  }, [authMode]);

  // 2. Poll for QR status independently without re-triggering session generation
  useEffect(() => {
    if (authMode !== 'qr' || !qrSessionId || qrStatus === 'confirmed') return;

    const pollInterval = setInterval(async () => {
      try {
        const check = await api.checkQrSession(qrSessionId);
        if (check.status === 'confirmed' && check.token) {
          setQrStatus('confirmed');
          clearInterval(pollInterval);
          localStorage.setItem('dardasha_token', check.token);
          window.location.reload();
        } else if (check.status === 'expired') {
          setQrStatus('expired');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.warn('QR poll warn:', err);
      }
    }, 1500);

    const countdownInterval = setInterval(() => {
      setQrTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

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
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await onLogin({ identifier: email.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = async (userData) => {
    await onRegister(userData);
  };

  // Dynamic App URL for standard phone camera scanning & mobile PWA installation
  const [appInstallUrl, setAppInstallUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return isLocal ? 'http://10.10.10.51:3000?install=true' : `${window.location.origin}?install=true`;
    }
    return 'https://github.com/a7hme9khalid2005-byte/dardasha';
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-detect local network IP dynamically from backend
  useEffect(() => {
    let isMounted = true;
    const fetchNetwork = async () => {
      if (typeof window === 'undefined') return;
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        try {
          const info = await api.getNetworkInfo();
          if (info?.localIp && info.localIp !== 'localhost' && isMounted) {
            const port = window.location.port ? `:${window.location.port}` : '';
            setAppInstallUrl(`http://${info.localIp}${port}?install=true`);
          }
        } catch (e) {
          console.warn('Network auto-detect warning:', e);
        }
      } else {
        if (isMounted) {
          setAppInstallUrl(`${window.location.origin}?install=true`);
        }
      }
    };
    fetchNetwork();
    return () => { isMounted = false; };
  }, []);

  // Generate crisp standard QR code whenever appInstallUrl changes
  useEffect(() => {
    if (!appInstallUrl) return;
    QRCode.toDataURL(appInstallUrl, {
      margin: 2,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate local QR code:', err));
  }, [appInstallUrl]);

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
                    <User className="w-3.5 h-3.5" />
                    <span>اسم المستخدم / البريد</span>
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
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>تثبيت التطبيق عبر QR 📱</span>
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

              {/* PWA Mobile Direct Install Banner */}
              {showInstallBanner && (
                <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-cyan-400/50 rounded-2xl flex items-center justify-between gap-3 text-right shadow-lg animate-fade-in">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>📲</span> تثبيت تطبيق دردشة على هاتفك
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      سرعة فائقة ووصول فوري من شاشتك الرئيسية
                    </p>
                  </div>
                  <button
                    onClick={handleInstallApp}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-glow transition active:scale-95"
                  >
                    تثبيت الآن
                  </button>
                </div>
              )}

              {/* MODE 1: Standard Password Login */}
              {authMode === 'password' && (
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="اسم المستخدم (@username) أو البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition text-sm pl-11 text-right font-mono"
                    />
                    <User className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-4" />
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

              {/* MODE 2: Mobile App PWA Install QR Code */}
              {authMode === 'qr' && (
                <div className="space-y-4 text-center animate-in zoom-in-95">
                  <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center space-y-3">
                    
                    <div className="relative group p-4 bg-white rounded-3xl shadow-2xl border-4 border-cyan-400/40">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Dardasha Mobile App Install QR"
                          className="w-56 h-56 object-contain"
                        />
                      ) : (
                        <div className="w-56 h-56 flex flex-col items-center justify-center space-y-2 text-gray-700">
                          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                          <span className="text-xs font-bold">جاري توليد الرمز...</span>
                        </div>
                      )}
                    </div>

                    {/* Direct Copyable Link for Mobile */}
                    <div className="w-full p-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-center space-y-1.5">
                      <span className="text-[10px] text-gray-400 block font-medium">أو افتح هذا الرابط مباشرة من متصفح هاتفك:</span>
                      <div className="flex items-center justify-between gap-2 px-1">
                        <span className="text-xs text-cyan-300 font-mono font-bold truncate select-all dir-ltr" style={{ direction: 'ltr' }}>
                          {appInstallUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(appInstallUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2500);
                          }}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1"
                        >
                          {copiedLink ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-300" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <span>نسخ الرابط</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right w-full space-y-2 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-cyan-500/20">
                      <p className="text-cyan-300 font-bold flex items-center gap-1.5 text-xs">
                        <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>طريقة التثبيت بكاميرا الهاتف:</span>
                      </p>
                      <ol className="text-[11px] text-gray-300 list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>افتح <strong className="text-white">كاميرا هاتفك العادية</strong> (آيفون أو أندرويد) ووجّهها نحو الرمز أعلاه.</li>
                        <li>اضغط على الرابط الأصفر الذي يظهر لك على شاشة الكاميرا.</li>
                        <li>في المتصفح: اضغط زر <strong className="text-cyan-300">"تثبيت التطبيق"</strong> ليتم تثبيته فوراً كتطبيق كامل على هاتفك!</li>
                      </ol>
                    </div>

                    <div className="flex items-center justify-between w-full pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-gray-400 font-mono">متوافق مع جميع الهواتف</span>
                      <button 
                        onClick={async () => {
                          try {
                            const info = await api.getNetworkInfo();
                            if (info?.localIp && info.localIp !== 'localhost') {
                              const port = window.location.port ? `:${window.location.port}` : '';
                              setAppInstallUrl(`http://${info.localIp}${port}?install=true`);
                            }
                          } catch (e) {
                            console.warn('Refresh error:', e);
                          }
                          initQrSession();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>تحديث الرمز</span>
                      </button>
                    </div>

                  </div>

                  {/* Direct Action Button */}
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-glow transition flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>تثبيت التطبيق على هذا الجهاز الآن 📲</span>
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
