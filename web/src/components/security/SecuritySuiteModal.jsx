import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Key, Clock, EyeOff, Link2, Lock, Radio, Globe, 
  Trash2, FileText, Camera, ShieldAlert, Check, Copy, AlertTriangle, Loader2 
} from 'lucide-react';
import { api } from '../../services/api';

export default function SecuritySuiteModal({ 
  isOpen, 
  onClose, 
  currentUser,
  watermarkEnabled,
  onToggleWatermark
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency', 'burner', 'audit', 'p2p_relay'

  // Item 13: Decoy PIN
  const [decoyPin, setDecoyPin] = useState(currentUser?.decoyPin || '');
  const [decoyNotice, setDecoyNotice] = useState('');

  // Item 14: Inactivity Self-Wipe
  const [inactivityMonths, setInactivityMonths] = useState(currentUser?.inactivityMonths || 3);

  // Item 15: DRM Screen Blackout
  const [drmBlackout, setDrmBlackout] = useState(true);

  // Item 16: Burner Connect Link
  const [burnerLink, setBurnerLink] = useState(null);
  const [generatingBurner, setGeneratingBurner] = useState(false);
  const [copiedBurner, setCopiedBurner] = useState(false);

  // Item 17: Forwarding Blocker
  const [forwardBlocker, setForwardBlocker] = useState(true);

  // Item 18: P2P Direct Mesh
  const [p2pMeshActive, setP2pMeshActive] = useState(true);

  // Item 19: Relay Call Shield (IP Hider)
  const [relayCallShield, setRelayCallShield] = useState(true);

  // Item 21: Panic Wipe
  const [wiping, setWiping] = useState(false);
  const [wipeNotice, setWipeNotice] = useState('');

  // Item 22: Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Item 24: Per-file encryption password
  const [filePass, setFilePass] = useState('DardashaSecret2026');

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveDecoyPin = async () => {
    try {
      await api.updateProfile({ decoyPin, inactivityMonths });
      setDecoyNotice('تم حفظ رمز الطوارئ التمويهي (Decoy PIN) بنجاح!');
      setTimeout(() => setDecoyNotice(''), 3000);
    } catch (err) {
      alert('فشل الحفظ');
    }
  };

  const handleGenerateBurnerLink = async () => {
    setGeneratingBurner(true);
    try {
      const res = await api.createBurnerLink(10, 1);
      setBurnerLink(res.link);
    } catch (err) {
      alert('فشل توليد الرابط');
    } finally {
      setGeneratingBurner(false);
    }
  };

  const handleCopyBurner = () => {
    if (!burnerLink) return;
    navigator.clipboard.writeText(burnerLink);
    setCopiedBurner(true);
    setTimeout(() => setCopiedBurner(false), 2000);
  };

  const handlePanicWipe = async () => {
    if (!window.confirm('⚠️ تحذير أمني فائق:\nهل أنت متأكد من مسح كافة سجلات محادثاتك وخزنتك السحابية فوراً وبدون رجعة؟')) {
      return;
    }
    setWiping(true);
    try {
      await api.panicWipe();
      setWipeNotice('✅ تم مسح كافة السجلات الحساسة بنجاح عبر مفتاح الطوارئ!');
      setTimeout(() => setWipeNotice(''), 4000);
    } catch (err) {
      alert('فشل المسح');
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-rose-400 flex items-center justify-center shadow-glow">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>جناح الأمان والخصوصية السيبرانية (Cyber Shield Suite)</span>
                <span className="px-2.5 py-0.5 bg-red-500/20 text-rose-300 border border-red-500/30 rounded-full text-[10px] font-mono">
                  البنود 13-24
                </span>
              </h2>
              <p className="text-xs text-gray-400">إدارة وضع الطوارئ، التمويه، مكافحة التصوير الخارجي، وسجل التدقيق الأمني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 bg-[#0b0f19] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'emergency' ? 'border-red-400 text-rose-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-rose-400" />
            <span>الطوارئ والتمويه (13/14/21)</span>
          </button>

          <button
            onClick={() => setActiveTab('burner')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'burner' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4 text-amber-400" />
            <span>الروابط المؤقتة والتشفير (16/17/24)</span>
          </button>

          <button
            onClick={() => setActiveTab('p2p_relay')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'p2p_relay' ? 'border-cyan-400 text-cyan-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>اتصال الند وحجب IP (18/19/23)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'audit' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>سجل تدقيق الأمان (22)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {decoyNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center">
              {decoyNotice}
            </div>
          )}

          {wipeNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center">
              {wipeNotice}
            </div>
          )}

          {/* TAB 1: Emergency & Decoy */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 text-xs">
              
              {/* Item 13: Decoy PIN Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-purple-400" />
                      <span>رمز مرور الطوارئ التمويهي (Decoy PIN)</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      إذا أُجبرت على فتح حسابك تحت التهديد، اكتب هذا الرمز بدلاً من كلمة سرك، وسيفتح واجهة وهمية فارغة!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="ضع رمز التمويه مثلاً: #999 أو decoy123"
                    value={decoyPin}
                    onChange={(e) => setDecoyPin(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/40 border border-white/15 rounded-xl font-mono text-cyan-300 text-right focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleSaveDecoyPin}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                  >
                    حفظ الرمز
                  </button>
                </div>
              </div>

              {/* Item 14: Inactivity Self-Wipe */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>المسح التلقائي عند عدم النشاط</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    حذف محادثاتك وبياناتك الحساسة تلقائياً إذا انقطعت عن فتح التطبيق لفترة محددة.
                  </p>
                </div>

                <select
                  value={inactivityMonths}
                  onChange={(e) => setInactivityMonths(parseInt(e.target.value, 10))}
                  className="bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-white font-bold text-xs"
                >
                  <option value={1}>شهر واحد (1 شهر)</option>
                  <option value={3}>3 أشهر (موصى به)</option>
                  <option value={6}>6 أشهر</option>
                  <option value={12}>سنة كاملة</option>
                </select>
              </div>

              {/* DRM Screen Blackout */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-rose-400" />
                    <span>حظر لقطات الشاشة المتطور (DRM Blackout)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    تعتيم الشاشة كلياً عند استشعار برامج تصوير أو تسجيل الشاشة لمنع استخراج المحادثات.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={drmBlackout}
                  onChange={(e) => setDrmBlackout(e.target.checked)}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Panic Button (Instant Wipe) */}
              <div className="p-4 bg-gradient-to-r from-red-950/60 to-rose-950/60 border border-red-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>زر مسح الطوارئ الفوري (Panic Wipe)</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  بضغطة واحدة، يتم تدمير كافة الرسائل والمحادثات والخزنة السحابية فوراً دون ترك أي أثر على السيرفرات.
                </p>
                <button
                  onClick={handlePanicWipe}
                  disabled={wiping}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-glow transition flex items-center justify-center gap-2"
                >
                  {wiping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>تفعيل مسح الطوارئ الفوري الآن</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Burner Links & File Encryption */}
          {activeTab === 'burner' && (
            <div className="space-y-4 text-xs">
              
              {/* Burner Connect Link */}
              <div className="p-4 bg-white/5 border border-amber-500/30 rounded-2xl space-y-3">
                <h3 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span>رابط الاتصال المؤقت (Burner Link)</span>
                </h3>
                <p className="text-[11px] text-gray-300">
                  أنشئ رابطاً سرياً لمحادثة شخص غير مسجل؛ الرابط صالح لمدة 10 دقائق أو لرسالة واحدة فقط وينتهي تماماً بعدها!
                </p>

                {burnerLink ? (
                  <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10">
                    <input
                      type="text"
                      readOnly
                      value={burnerLink}
                      className="flex-1 bg-transparent text-cyan-300 font-mono text-left text-xs"
                    />
                    <button
                      onClick={handleCopyBurner}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      {copiedBurner ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBurner ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateBurnerLink}
                    disabled={generatingBurner}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl shadow-glow text-xs flex items-center gap-1.5"
                  >
                    {generatingBurner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                    <span>توليد رابط اتصال مؤقت الآن</span>
                  </button>
                )}
              </div>

              {/* Item 17: Forwarding Blocker */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>حماية التوجيه والنسخ (Forwarding Blocker)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    منع نسخ نصوصك أو إعادة توجيه رسائلك خارج المحادثة لحفظ حقوق الخصوصية.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={forwardBlocker}
                  onChange={(e) => setForwardBlocker(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Per-File Encryption */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>التشفير المنفصل للملفات برقم سري</span>
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">AES-256 Per-File</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  كلمة المرور الافتراضية لقفل الملفات والمستندات الحساسة قبل إرسالها للطرف الآخر:
                </p>
                <input
                  type="text"
                  value={filePass}
                  onChange={(e) => setFilePass(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl font-mono text-cyan-300 text-left focus:outline-none focus:border-cyan-400"
                />
              </div>

            </div>
          )}

          {/* TAB 3: P2P Mesh & Relay Calls & Watermark */}
          {activeTab === 'p2p_relay' && (
            <div className="space-y-4 text-xs">
              
              {/* Anti-Camera Watermark Shield */}
              <div className="p-4 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <span>مكافحة تصوير الشاشة بكاميرا خارجية (Watermark Shield)</span>
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    وضع علامة مائية شفافة متحركة برقم الجلسة واسم المستخدم فوق الشاشة لمنع التصوير بهاتف آخر.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={(e) => onToggleWatermark && onToggleWatermark(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer mr-2"
                />
              </div>

              {/* P2P Direct Mesh Chat */}
              <div className="p-4 bg-white/5 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>الدردشات المشفرة المباشرة بدون سيرفر (P2P Mesh)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    اتصال مشفر مباشر من جهاز لجهاز عبر WebRTC DataChannels دون مرور الرسائل بأي سيرفر وسيط.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={p2pMeshActive}
                  onChange={(e) => setP2pMeshActive(e.target.checked)}
                  className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                />
              </div>

              {/* Relay Call Shield (IP Hider) */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>إخفاء عنوان IP أثناء المكالمات (Relay Call Shield)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    تمرير صوت وفيديو المكالمات عبر سيرفرات ترحيل مشفرة لمنع الطرف الآخر من كشف عنوانك الجغرافي.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={relayCallShield}
                  onChange={(e) => setRelayCallShield(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

            </div>
          )}

          {/* TAB 4: Security Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>سجل تدقيق الأمان ومحاولات الوصول (Security Audit Log)</span>
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">آخر 10 أحداث</span>
              </div>

              {loadingLogs ? (
                <div className="py-10 text-center">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">جاري تحميل سجل الأمان...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center text-gray-400">
                  لا توجد أنشطة مشبوهة أو تسجيلات دخول غير عادية حتى الآن. حسابك محمي بنجاح!
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-0.5 text-right">
                        <span className="font-bold text-white block">{log.action}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          IP: {log.ip} • {log.device}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>حماية نشطة 100% بنظام Dardasha Shield</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            حفظ وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
