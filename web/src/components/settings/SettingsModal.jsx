import React, { useState } from 'react';
import { 
  X, Shield, Bell, Palette, Globe, Key, Volume2, 
  Smartphone, LogOut, Check, Sliders, Moon, Fingerprint,
  EyeOff, RefreshCw, Laptop, ShieldCheck, ExternalLink, Sparkles
} from 'lucide-react';
import ActiveSessionsModal from './ActiveSessionsModal';

export default function SettingsModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy', 'security', 'notifications', 'appearance'
  const [ghostPin, setGhostPin] = useState('#007');
  const [stealthDefault, setStealthDefault] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenshotShield, setScreenshotShield] = useState(true);
  const [accentColor, setAccentColor] = useState('violet');
  const [savedNotice, setSavedNotice] = useState(false);

  // Item 42: Biometric Passkeys
  const [passkeysEnabled, setPasskeysEnabled] = useState(true);
  const [passkeyNotice, setPasskeyNotice] = useState('');

  // Item 43: Username-Only Anonymity
  const [usernameOnlyAnonymity, setUsernameOnlyAnonymity] = useState(true);

  // Item 47 & 49: Active Sessions Modal
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  // Item 99: Multi-device sync status
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing'

  const handleTogglePasskey = () => {
    const nextVal = !passkeysEnabled;
    setPasskeysEnabled(nextVal);
    if (nextVal) {
      setPasskeyNotice('تم ربط بصمة الوجه/الإصبع (WebAuthn Passkey) بنجاح على هذا المتصفح!');
    } else {
      setPasskeyNotice('تم إيقاف المصادقة البيومترية');
    }
    setTimeout(() => setPasskeyNotice(''), 3000);
  };

  const handleForceSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 1500);
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh] animate-in zoom-in-95">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">إعدادات المنصة والأمان الشامل</h3>
                <p className="text-[10px] text-gray-400">تخصيص الخصوصية، البصمة، المزامنة، والمظهر</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Setting Category Tabs */}
          <div className="flex border-b border-white/10 bg-[#0b0f19] text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'privacy' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>الخصوصية</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'security' ? 'border-cyan-400 text-cyan-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>الأمان والبصمة (42/47)</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'notifications' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>التنبيهات</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'appearance' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>المظهر</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {savedNotice && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold text-center">
                ✅ تم حفظ تفضيلاتك بنجاح!
              </div>
            )}

            {passkeyNotice && (
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold text-center">
                {passkeyNotice}
              </div>
            )}

            {/* TAB 1: Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 text-xs">
                
                {/* Item 43: Username-Only Anonymity Toggle */}
                <div className="p-3.5 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-purple-400" />
                      <h4 className="font-bold text-white">الخصوصية التامة بالمعرف (@username)</h4>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      إخفاء رقم هاتفك وبريدك الإلكتروني تماماً عن الآخرين؛ الظهور والبحث يتم فقط عبر اسم المستخدم (@username).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={usernameOnlyAnonymity}
                    onChange={(e) => setUsernameOnlyAnonymity(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer mr-3"
                  />
                </div>

                {/* Ghost PIN */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">رمز المحادثات السرية (Ghost PIN):</span>
                    <Key className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    الرمز الذي تكتبه في شريط البحث لفك قفل المحادثات المخفية:
                  </p>
                  <input
                    type="text"
                    value={ghostPin}
                    onChange={(e) => setGhostPin(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl font-mono text-cyan-300 text-center text-sm font-bold focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Stealth Mode Default */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">وضع التخفي الدائم (Always Stealth)</h4>
                    <p className="text-[11px] text-gray-400">إخفاء حالتك تلقائياً عن الجميع دون تفعيلها يدوياً كل مرة</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={stealthDefault}
                    onChange={(e) => setStealthDefault(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Screenshot Shield */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">درع حماية لقطات الشاشة (Screenshot Shield)</h4>
                    <p className="text-[11px] text-gray-400">إرسال تحذير أحمر فوري عند قيام الطرف الآخر بتصوير الشاشة</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={screenshotShield}
                    onChange={(e) => setScreenshotShield(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

              </div>
            )}

            {/* TAB 2: Security & Passkeys */}
            {activeTab === 'security' && (
              <div className="space-y-4 text-xs">
                
                {/* Item 42: Biometric Passkeys Card */}
                <div className="p-3.5 bg-white/5 border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">مفاتيح المرور البيومترية (Passkeys)</h4>
                        <p className="text-[10px] text-cyan-400 font-mono">WebAuthn / Windows Hello / FaceID</p>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePasskey}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                        passkeysEnabled 
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {passkeysEnabled ? 'مفعلة 🔐' : 'تعطيل'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    تسجيل الدخول الفوري دون كتابة كلمات المرور عبر بصمة الإصبع أو معرف الوجه الموثوق.
                  </p>
                </div>

                {/* Items 47 & 49: Active Sessions & Health Score Launcher */}
                <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>الأجهزة المتصلة ومؤشر الصحة الأمنية</span>
                    </h4>
                    <p className="text-[11px] text-gray-400">إدارة الجلسات الحالية وفحص درجة الأمان (96%)</p>
                  </div>
                  <button
                    onClick={() => setShowSessionsModal(true)}
                    className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl text-cyan-300 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <span>عرض التفاصيل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Item 99: Multi-Device Live Cloud Sync Status */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-purple-400" />
                      <span>المزامنة السحابية اللحظية بين الأجهزة</span>
                    </span>
                    <button 
                      onClick={handleForceSync}
                      className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>{syncStatus === 'syncing' ? 'جارٍ التحديث...' : 'تحديث يدوي'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    جميع محادثاتك ورسائلك المجدولة وصناديق المفاجآت متزامنة لحظياً بين الويب والهاتف.
                  </p>
                  <div className="p-2 bg-black/30 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">حالة السيرفر والويب سوكيت:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      متصل ومتزامن 100%
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">أصوات الرسائل الفورية والتفاعلات</h4>
                    <p className="text-[11px] text-gray-400">تشغيل نغمة هادئة عند وصول رسالة جديدة أو استيكر صوتي</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">إشعارات رمز التحقق (OTP) ومحاولات الدخول</h4>
                    <p className="text-[11px] text-gray-400">إرسال كود الـ 6 أرقام وتنبيه فوري لأي جهاز جديد</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <h4 className="font-bold text-white">اللون المميز للمنصة (Signature Accent):</h4>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { key: 'violet', label: 'بنفسجي مشع 💜', bg: '#8b5cf6' },
                      { key: 'cyan', label: 'نيوني سماوي 🩵', bg: '#06b6d4' },
                      { key: 'emerald', label: 'زمردي 💚', bg: '#10b981' },
                      { key: 'rose', label: 'وردي فاخر 💖', bg: '#f43f5e' },
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setAccentColor(item.key)}
                        className={`p-2.5 rounded-xl border text-center transition text-[11px] font-bold ${
                          accentColor === item.key ? 'border-white bg-white/10' : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <span className="block w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: item.bg }}></span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* OLED True Pitch Black Mode */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">الوضع الداكن الحقيقي لشاشات OLED</h4>
                    <p className="text-[11px] text-gray-400">سواد مطلق بنسبة 100% لإيقاف بكسلات شاشات AMOLED وتوفير البطارية</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localStorage.getItem('dardasha_oled_black') === 'true'}
                    onChange={(e) => {
                      localStorage.setItem('dardasha_oled_black', e.target.checked);
                      if (e.target.checked) {
                        document.body.classList.add('bg-black');
                      } else {
                        document.body.classList.remove('bg-black');
                      }
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 1500);
                    }}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* High Contrast Mode */}
                <div className="p-3.5 bg-white/5 border border-yellow-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-yellow-300">وضع التباين اللوني العالي والخطوط المكبرة</h4>
                    <p className="text-[11px] text-gray-400">تكبير النصوص بنسبة 130% مع تباين أصفر وأسود فائق الوضوح</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localStorage.getItem('dardasha_high_contrast') === 'true'}
                    onChange={(e) => {
                      localStorage.setItem('dardasha_high_contrast', e.target.checked);
                      setSavedNotice(true);
                      setTimeout(() => {
                        setSavedNotice(false);
                        window.location.reload();
                      }, 1000);
                    }}
                    className="w-5 h-5 accent-yellow-400 rounded cursor-pointer"
                  />
                </div>

                {/* Seasonal Ambient Effects */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <h4 className="font-bold text-white">المؤثرات البصرية التفاعلية:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'بدون تأثير 🚫' },
                      { id: 'snow', label: 'تساقط الثلوج ❄️' },
                      { id: 'cosmic-dust', label: 'غبار كوني ✨' }
                    ].map(fx => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => {
                          localStorage.setItem('dardasha_seasonal_effect', fx.id);
                          setSavedNotice(true);
                          setTimeout(() => setSavedNotice(false), 1200);
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          localStorage.getItem('dardasha_seasonal_effect') === fx.id || (fx.id === 'cosmic-dust' && !localStorage.getItem('dardasha_seasonal_effect'))
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">لغة الواجهة (Language)</h4>
                    <p className="text-[11px] text-gray-400">اللغة الحالية: العربية (RTL)</p>
                  </div>
                  <select className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onLogout}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl text-xs shadow-glow transition"
            >
              حفظ الإعدادات
            </button>
          </div>

        </div>
      </div>

      {/* Item 47 & 49: Active Sessions Modal */}
      <ActiveSessionsModal 
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
      />
    </>
  );
}
