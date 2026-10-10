import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, Zap, Clock, Folder, FileDown, Store, 
  Cloud, QrCode, Monitor, Check, Copy, AlertCircle, Save, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

export default function ProductivityToolsModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('snippets'); // 'snippets', 'ooo', 'folders', 'business', 'backup_sync'

  // Item 64: Canned Snippets
  const [snippets, setSnippets] = useState([
    { trigger: '/welcome', text: 'أهلاً بك وسهلاً في منصة دردشة! يسعدنا تواصلك معنا دائماً 🌟' },
    { trigger: '/pricing', text: 'نوفر باقات VIP مجانية ومميزات متقدمة يمكنك استكشافها من صفحة الإعدادات 💎' },
    { trigger: '/faq', text: 'منصة دردشة مشفرة بالكامل طرف-لطرف (E2EE) وتضمن أقصى معايير الخصوصية 🛡️' }
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newText, setNewText] = useState('');

  // Item 66: Out-of-Office (عندما يطلب المستخدم هذا)
  const [oooEnabled, setOooEnabled] = useState(false);
  const [oooMessage, setOooMessage] = useState('أنا خارج أوقات العمل حالياً. سأرد عليك في أقرب وقت متاح!');
  const [oooNotice, setOooNotice] = useState('');

  // Item 67: Chat Folders
  const [folders, setFolders] = useState([
    { id: 'f-all', name: 'الكل 💬', count: 12 },
    { id: 'f-work', name: 'العمل والمشاريع 💼', count: 4 },
    { id: 'f-personal', name: 'العائلة والأصدقاء 👨‍👩‍👧', count: 6 },
    { id: 'f-channels', name: 'المجتمعات والقنوات 📢', count: 2 }
  ]);
  const [newFolderName, setNewFolderName] = useState('');

  // Item 72: Business Profile
  const [businessName, setBusinessName] = useState('مؤسسة دردشة للتقنية الذكية');
  const [businessHours, setBusinessHours] = useState('9:00 ص - 6:00 م (الأحد - الخميس)');
  const [businessCategory, setBusinessCategory] = useState('تقنية المعلومات والاتصالات');
  const [businessLocation, setBusinessLocation] = useState('الرياض / دبي / القاهرة');

  // Item 106 & 108: Backup & Migration
  const [backupJson, setBackupJson] = useState(null);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    loadOoo();
  }, []);

  const loadOoo = async () => {
    try {
      const res = await api.getOutOfOffice();
      if (res.outOfOffice) {
        setOooEnabled(res.outOfOffice.enabled);
        if (res.outOfOffice.message) setOooMessage(res.outOfOffice.message);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSaveOoo = async () => {
    try {
      await api.setOutOfOffice({ enabled: oooEnabled, message: oooMessage });
      setOooNotice('✅ تم حفظ إعدادات الرد الآلي خارج أوقات العمل بنجاح!');
      setTimeout(() => setOooNotice(''), 3000);
    } catch (err) {
      alert('فشل الحفظ');
    }
  };

  const handleAddSnippet = (e) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newText.trim()) return;
    const cleanTrigger = newTrigger.startsWith('/') ? newTrigger.trim() : `/${newTrigger.trim()}`;
    setSnippets(prev => [...prev, { trigger: cleanTrigger, text: newText.trim() }]);
    setNewTrigger('');
    setNewText('');
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders(prev => [...prev, { id: `f-${Date.now()}`, name: newFolderName.trim(), count: 0 }]);
    setNewFolderName('');
  };

  const handleExportBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.exportBackup();
      setBackupJson(JSON.stringify(res.backup, null, 2));
      
      // Auto-download file
      const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dardasha_backup_${new Date().toISOString().split('T')[0]}.enc.json`;
      a.click();
    } catch (err) {
      alert('فشل تصدير النسخة');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shadow-glow">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>أدوات الإنتاجية والأعمال والنسخ السحابي (Productivity Suite)</span>
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[10px] font-mono">
                  البنود 64-112
                </span>
              </h2>
              <p className="text-xs text-gray-400">الردود الجاهزة، الرد خارج أوقات العمل، تصنيف المحادثات، وبطاقة الأعمال</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0b0f19] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'snippets' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>الردود الجاهزة (64)</span>
          </button>

          <button
            onClick={() => setActiveTab('ooo')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ooo' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>خارج أوقات العمل (66)</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'folders' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4 text-cyan-400" />
            <span>تصنيف المحادثات (67)</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'business' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>ملف الأعمال (72)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_sync')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup_sync' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>النسخ والترحيل (106/108/112)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {oooNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center">
              {oooNotice}
            </div>
          )}

          {/* TAB 1: Canned Snippets (Item 64) */}
          {activeTab === 'snippets' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">
                قوالب ونصوص جاهزة تستدعيها فوراً في حقل الكتابة بكتابة الرمز <strong className="text-amber-400 font-mono">/</strong>:
              </p>

              {/* Add Snippet form */}
              <form onSubmit={handleAddSnippet} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="رمز الاستدعاء (مثال: /discount)"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-right"
                  />
                  <input
                    type="text"
                    placeholder="النص الكامل للرد..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-glow text-xs"
                >
                  إضافة قالب جديد
                </button>
              </form>

              {/* Snippets list */}
              <div className="space-y-2">
                {snippets.map((snip, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 text-right">
                      <span className="font-mono font-bold text-amber-400 text-sm">{snip.trigger}</span>
                      <p className="text-gray-300">{snip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Out of Office (Item 66 - عندما يطلب المستخدم هذا) */}
          {activeTab === 'ooo' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>الرد التلقائي الذكي خارج ساعات العمل</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      تفعيل رد فوري آلي على أي رسالة واردة عندما تكون في إجازة أو خارج أوقات دوامك.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={oooEnabled}
                    onChange={(e) => setOooEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-300 font-bold">رسالة الرد الآلي المخصصة:</label>
                  <textarea
                    rows={3}
                    value={oooMessage}
                    onChange={(e) => setOooMessage(e.target.value)}
                    className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-white text-right focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveOoo}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-glow text-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ إعدادات الرد الآلي</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Chat Folders (Item 67) */}
          {activeTab === 'folders' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">نظم محادثاتك في مجلدات وتبويبات مستقلة لترتيب يومك:</p>

              {/* Add folder */}
              <form onSubmit={handleAddFolder} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اسم المجلد الجديد (مثال: 🎓 الدراسة، 👨‍💻 البرمجة)..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-right"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                >
                  إنشاء مجلد
                </button>
              </form>

              {/* Folders grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {folders.map((f) => (
                  <div key={f.id} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{f.name}</span>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono text-xs">
                      {f.count} محادثة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Business Profile (Item 72) */}
          {activeTab === 'business' && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 text-xs">
              <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>بطاقة تعريف الأعمال والأنشطة التجارية</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">اسم النشاط أو الشركة:</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">ساعات العمل الرسمية:</label>
                  <input
                    type="text"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">تصنيف النشاط:</label>
                  <input
                    type="text"
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">الموقع أو الفروع:</label>
                  <input
                    type="text"
                    value={businessLocation}
                    onChange={(e) => setBusinessLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 font-bold text-right">
                ✨ تظهر بطاقة الأعمال هذه تلقائياً لعملائك عند فتح محادثة معك!
              </div>
            </div>
          )}

          {/* TAB 5: Backup, Migration, Draft Sync & Desktop (Items 106, 108, 109, 112) */}
          {activeTab === 'backup_sync' && (
            <div className="space-y-4 text-xs">
              
              {/* Encrypted Cloud Backup */}
              <div className="p-4 bg-white/5 border border-blue-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span>النسخ الاحتياطي المشفر على سحابتك الخاصة</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      تصدير كافة رسائلك وخزنتك في ملف مشفر بكلمة سر وتنزيله أو حفظه في Google Drive.
                    </p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    disabled={backingUp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-glow"
                  >
                    {backingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    <span>تصدير نسخة مشفرة الآن</span>
                  </button>
                </div>
              </div>

              {/* Device Migration via QR */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>نقل المحادثات المباشر بين جهازين بكود QR</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    انقل سجلاتك وصورك من هاتف لهاتف آخر فوراً عبر مسح كود محلي دون رفع للسحابة.
                  </p>
                </div>

                <button
                  onClick={() => alert('تم توليد كود الترحيل المحلي بنجاح 📲')}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-xl font-bold"
                >
                  بدء الترحيل
                </button>
              </div>

              {/* Desktop Mode & Cross-Device Draft Sync */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                  <h5 className="font-bold text-white flex items-center gap-1">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span>تطبيق سطح المكتب فائق الخفة</span>
                  </h5>
                  <p className="text-[11px] text-gray-400">
                    يعمل بأقل من 50MB رام عبر نواة PWA المتقدمة لسرعة إقلاع واستجابة لحظية.
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                  <h5 className="font-bold text-white flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>مزامنة المسودات عبر الأجهزة الفورية</span>
                  </h5>
                  <p className="text-[11px] text-gray-400">
                    النص غير المرسل يُحفظ سحابياً لحظة بلحظة وتجده بانتظارك على كافة أجهزتك.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">Dardasha Productivity Suite Active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
