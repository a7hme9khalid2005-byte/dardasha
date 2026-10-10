import React, { useState, useEffect } from 'react';
import { 
  X, Users, Hash, Shield, Megaphone, Volume2, HelpCircle, 
  Sparkles, BarChart3, Calendar, CheckSquare, Clock, Plus, Send, Check, Crown, AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function GroupHubModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('threads'); // 'threads', 'broadcasts', 'voice', 'modbox', 'analytics', 'settings'
  const [loading, setLoading] = useState(false);

  // New Thread input (Item 25)
  const [newThreadName, setNewThreadName] = useState('');
  
  // New Broadcast input (Item 28)
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastMandatory, setBroadcastMandatory] = useState(true);

  // Mod Box input (Item 31)
  const [modBoxText, setModBoxText] = useState('');
  const [modBoxSent, setModBoxSent] = useState(false);

  // Quiz state (Item 35)
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await api.getGroups();
      setGroups(res.groups || []);
      if (res.groups && res.groups.length > 0) {
        setActiveGroup(res.groups[0]);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddThread = async (e) => {
    e.preventDefault();
    if (!newThreadName.trim() || !activeGroup) return;
    try {
      const res = await api.addGroupThread(activeGroup.id, newThreadName.trim());
      setActiveGroup(prev => ({
        ...prev,
        threads: [...(prev.threads || []), res.thread]
      }));
      setNewThreadName('');
    } catch (err) {
      alert('فشل إضافة الموضوع');
    }
  };

  const handleAddBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim() || !activeGroup) return;
    try {
      const res = await api.addGroupBroadcast(activeGroup.id, {
        title: broadcastTitle.trim(),
        content: broadcastContent.trim(),
        mandatoryConfirm: broadcastMandatory
      });
      setActiveGroup(prev => ({
        ...prev,
        broadcasts: [res.broadcast, ...(prev.broadcasts || [])]
      }));
      setBroadcastTitle('');
      setBroadcastContent('');
    } catch (err) {
      alert('فشل إرسال الإعلان');
    }
  };

  const handleConfirmBroadcast = async (bcId) => {
    if (!activeGroup) return;
    try {
      const res = await api.confirmBroadcast(activeGroup.id, bcId);
      setActiveGroup(prev => ({
        ...prev,
        broadcasts: prev.broadcasts.map(b => b.id === bcId ? { ...b, confirms: res.confirms, isConfirmedByMe: true } : b)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendModBox = async (e) => {
    e.preventDefault();
    if (!modBoxText.trim() || !activeGroup) return;
    try {
      await api.sendModBoxItem(activeGroup.id, { text: modBoxText.trim() });
      setModBoxText('');
      setModBoxSent(true);
      setTimeout(() => setModBoxSent(false), 3000);
    } catch (err) {
      alert('فشل الإرسال');
    }
  };

  if (!activeGroup && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-[#0f172a] rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-glow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>إدارة المجموعات والمجتمعات المتقدمة (Community Hub)</span>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-mono">
                  البنود 25-36
                </span>
              </h2>
              <p className="text-xs text-gray-400">قنوات ومواضيع فرعية، إعلانات ملزمة، غرف صوتية مفتوحة، وصندوق شكاوى سري</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Groups Switcher Row */}
        <div className="p-3 bg-[#0b0f19] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition whitespace-nowrap ${
                activeGroup?.id === g.id
                  ? 'border-indigo-400 bg-indigo-950/60 text-white shadow-glow'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <img src={g.avatar} alt="Group" className="w-5 h-5 rounded-full" />
              <span>{g.name}</span>
              <span className="text-[10px] opacity-60 font-mono">({g.membersCount})</span>
            </button>
          ))}
        </div>

        {/* Active Group Banner & Welcome Card (Item 32) */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-indigo-300">{activeGroup.name}</h3>
              {/* Item 26: Role badge */}
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-[10px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>مشرف معتمد (Owner VIP)</span>
              </span>
            </div>
            <p className="text-xs text-gray-300">{activeGroup.description}</p>
          </div>

          {/* Item 36: Silent Hours Indicator */}
          {activeGroup.silentHours?.enabled && (
            <div className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-xl text-center">
              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>ساعات الصمت: {activeGroup.silentHours.from} - {activeGroup.silentHours.to}</span>
              </span>
            </div>
          )}
        </div>

        {/* Feature Sub-Tabs */}
        <div className="flex border-b border-white/10 bg-[#0f172a] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('threads')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'threads' ? 'border-indigo-400 text-indigo-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4 text-cyan-400" />
            <span>المواضيع والقنوات (25)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('broadcasts')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'broadcasts' ? 'border-indigo-400 text-indigo-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 text-rose-400" />
            <span>الإعلانات وتأكيد القراءة (28)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('voice')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'voice' ? 'border-indigo-400 text-indigo-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>الغرفة الصوتية المفتوحة (30)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modbox')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'modbox' ? 'border-indigo-400 text-indigo-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>صندوق الشكاوى السري (31)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'analytics' ? 'border-indigo-400 text-indigo-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>إحصائيات التفاعل (33)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: Threads / Topics (Item 25) */}
          {activeSubTab === 'threads' && (
            <div className="space-y-4 text-xs">
              
              {/* Add Thread form */}
              <form onSubmit={handleAddThread} className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl">
                <input
                  type="text"
                  placeholder="أنشئ موضوعاً أو قناة فرعية جديدة (مثال: 🤖 أسئلة الذكاء الاصطناعي)..."
                  value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة موضوع</span>
                </button>
              </form>

              {/* Threads list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGroup.threads?.map((th) => (
                  <div
                    key={th.id}
                    className="p-4 bg-white/5 border border-white/10 hover:border-cyan-400/40 rounded-2xl transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="space-y-1 text-right">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-cyan-400" />
                        <span>{th.name}</span>
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {th.messagesCount || 0} مشاركة نشطة
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-bold">
                      دخول 💬
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: Broadcast Announcements with Mandatory Read (Item 28) */}
          {activeSubTab === 'broadcasts' && (
            <div className="space-y-4 text-xs">
              
              {/* Create Broadcast form (Owner/Mod only) */}
              <form onSubmit={handleAddBroadcast} className="p-4 bg-white/5 border border-rose-500/30 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-rose-400" />
                  <span>نشر إعلان مثبت مع طلب تأكيد القراءة الإلزامي</span>
                </h4>
                
                <input
                  type="text"
                  placeholder="عنوان الإعلان..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-rose-400"
                />

                <textarea
                  rows={2}
                  placeholder="نص الإعلان والتعليمات الهامة للأعضاء..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-rose-400 resize-none"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={broadcastMandatory}
                      onChange={(e) => setBroadcastMandatory(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span>إلزام الأعضاء بالنقر على "تم الاطلاع والتأكيد"</span>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-glow"
                  >
                    نشر الإعلان الآن
                  </button>
                </div>
              </form>

              {/* Broadcasts feed */}
              <div className="space-y-3">
                {activeGroup.broadcasts?.map((bc) => (
                  <div key={bc.id} className="p-4 bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white">{bc.title}</h4>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold">
                        إعلان رسمي 📢
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed">{bc.content}</p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-mono">
                        {bc.confirms || 0} عضو أكدوا القراءة ✅
                      </span>

                      <button
                        onClick={() => handleConfirmBroadcast(bc.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                          bc.isConfirmedByMe 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{bc.isConfirmedByMe ? 'تم التأكيد مسبقاً' : 'تم الاطلاع والتأكيد'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: Always-On Voice Room (Item 30) */}
          {activeSubTab === 'voice' && (
            <div className="p-6 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-glow animate-pulse">
                <Volume2 className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-base font-black text-white">الغرفة الصوتية المفتوحة (Always-On Voice Lounge)</h3>
                <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                  غرفة دائمة مفتوحة للأعضاء على مدار الساعة، انضم للتحدث والاستماع مع أصدقائك بلمسة زر وبدون رنين.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>متصل الآن: 14 عضواً يتحدثون ويستمعون</span>
              </div>

              <button
                onClick={() => alert('تم الانضمام للغرفة الصوتية بنجاح 🎙️')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs rounded-2xl shadow-glow transition"
              >
                انضم للغرفة الصوتية الآن (تحدث واستمع)
              </button>
            </div>
          )}

          {/* Anonymous Mod Box */}
          {activeSubTab === 'modbox' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/5 border border-amber-500/30 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>صندوق الشكاوى والاقتراحات السري للمشرفين</span>
                </h4>
                <p className="text-[11px] text-gray-300">
                  هل لديك اقتراح لتطوير المجموعة أو بلاغ عن سلوك غير لائق؟ أرسله للمشرفين الآن بهوية مجهولة 100% دون كشف اسمك.
                </p>

                {modBoxSent && (
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-center font-bold">
                    ✅ تم إرسال رسالتك السرية للمشرفين بنجاح!
                  </div>
                )}

                <form onSubmit={handleSendModBox} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="اكتب مقترحك أو ملاحظتك هنا بحرية تامة..."
                    value={modBoxText}
                    onChange={(e) => setModBoxText(e.target.value)}
                    required
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-amber-400 resize-none"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl shadow-glow"
                  >
                    إرسال كاقتراح سري للمشرفين
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: Community Analytics (Item 33) */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-lg font-black text-cyan-400 font-mono">1,248</span>
                  <span className="text-[10px] text-gray-400">رسالة هذا الأسبوع</span>
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-lg font-black text-purple-400 font-mono">412</span>
                  <span className="text-[10px] text-gray-400">عضو متفاعل نشط</span>
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-lg font-black text-emerald-400 font-mono">+18.5%</span>
                  <span className="text-[10px] text-gray-400">معدل النمو الأسبوعي</span>
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-lg font-black text-amber-400 font-mono">8م - 11م</span>
                  <span className="text-[10px] text-gray-400">ساعات الذروة</span>
                </div>
              </div>

              {/* Item 35: Admission Quiz details */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-right">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>نظام اختبار القبول وتأهيل الأعضاء الجدد</span>
                </h4>
                <p className="text-[11px] text-gray-300">
                  سؤال القبول النشط: "هل تتعهد بالالتزام بشروط الحوار البناء وعدم نشر إعلانات سبام؟"
                </p>
                <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                  معدل اجتياز الاختبار: 94%
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            أنت في مجموعة: <strong className="text-indigo-300">{activeGroup.name}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
