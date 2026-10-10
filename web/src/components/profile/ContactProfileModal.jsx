import React, { useState, useEffect } from 'react';
import { 
  X, MessageSquare, Phone, Video, ShieldCheck, BellOff, Bell, 
  Ban, CheckCircle, Flame, Calendar, Mail, FileText, Image, 
  Music, Users, Copy, Sparkles, QrCode, Lock, Check, ExternalLink,
  ChevronLeft, Award, Radio, User, MapPin, Tag, Smile, Globe, 
  Gift, Twitter, Instagram, Github, Coins
} from 'lucide-react';
import { api } from '../../services/api';

export default function ContactProfileModal({ 
  isOpen, 
  onClose, 
  contact, 
  currentUser,
  onStartChat,
  onStartCall,
  onOpenDigitalCard 
}) {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'media', 'gifts', 'groups', 'security'
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [notice, setNotice] = useState('');
  const [contactGifts, setContactGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  useEffect(() => {
    if (contact && contact.id) {
      loadContactGifts(contact.id);
    }
  }, [contact]);

  const loadContactGifts = async (userId) => {
    setLoadingGifts(true);
    try {
      const res = await api.getUserGifts(userId);
      setContactGifts(res.showcase || []);
    } catch (err) {
      console.error('Error fetching contact gifts:', err);
    } finally {
      setLoadingGifts(false);
    }
  };

  if (!isOpen || !contact) return null;

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    showToast(!isMuted ? 'تم كتم إشعارات هذه المحادثة 🔕' : 'تم تفعيل التنبيهات مجدداً 🔔');
  };

  const handleToggleBlock = () => {
    setIsBlocked(!isBlocked);
    showToast(!isBlocked ? 'تم حظر جهة الاتصال بنجاح 🚫' : 'تم إلغاء الحظر عن جهة الاتصال ✅');
  };

  const handleCopySafetyKey = () => {
    navigator.clipboard.writeText('4829-1048-5592-0184-7721-9903');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const usernameHandle = contact.username || `@${contact.email ? contact.email.split('@')[0] : 'user'}`;
  const displayPhone = contact.phone || '+966 50 000 0000';
  const displayLocation = contact.location || '🇸🇦 الرياض، المملكة العربية السعودية';
  const displayStatus = contact.statusVibe || 'عضو نشط في منصة دردشة الذكية 🌟';
  const displayInterests = contact.interests && contact.interests.length > 0 ? contact.interests : ['#تقنية', '#تواصل_ذكي', '#دردشة'];
  const displaySocial = contact.socialLinks || {};

  // Shared Media samples
  const sharedMediaItems = [
    { type: 'image', title: 'صورة الواجهة الجديدة.png', date: 'اليوم', size: '1.4 MB', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
    { type: 'image', title: 'مخطط النظام الكوني.jpg', date: 'أمس', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80' },
    { type: 'audio', title: 'تسجيل صوتي (0:18)', date: 'منذ 3 أيام', size: '340 KB' },
    { type: 'doc', title: 'وثيقة_محادثة_مشفرة.pdf', date: '5 أكتوبر', size: '82 KB' },
  ];

  // Mutual Groups samples
  const mutualGroups = [
    { name: 'مجتمع المصممين والمطورين 🎨', members: '1,280 عضو', icon: '💻' },
    { name: 'رواد الأعمال العرب 🚀', members: '640 عضو', icon: '⚡' },
    { name: 'غرفة النقاشات الصوتية الحية 🎙️', members: '94 عضو', icon: '🔊' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white max-h-[92vh] flex flex-col">
        
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-0 left-0 w-80 h-36 bg-cyan-600/15 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header / Banner */}
        <div className="relative h-28 bg-gradient-to-r from-purple-900/50 via-slate-800/60 to-indigo-900/50 p-4 flex items-start justify-between border-b border-white/10">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>متصل الآن</span>
            </span>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pt-0 pb-6 overflow-y-auto flex-1 space-y-4 relative z-10">
          
          {/* Avatar & Core Identity */}
          <div className="flex items-end justify-between -mt-12">
            <div className="relative">
              <img
                src={contact.avatar}
                alt={contact.firstName}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#0f172a] shadow-xl bg-[#1e293b]"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#0f172a]" />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onStartChat) onStartChat(contact);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow transition flex items-center gap-1.5"
                title="مراسلة فورية"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>مراسلة</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onStartCall) onStartCall(contact, 'audio');
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 rounded-xl transition"
                title="اتصال صوتي عالي النقاء"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onStartCall) onStartCall(contact, 'video');
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-400 rounded-xl transition"
                title="مكالمة فيديو فائقة الجودة"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {notice && (
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-medium text-center animate-in fade-in">
              {notice}
            </div>
          )}

          {/* Name & Bio */}
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {contact.firstName} {contact.lastName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                عضو موثق ✦
              </span>
            </div>
            
            <p className="text-xs text-purple-300 font-mono">
              {usernameHandle}
            </p>

            <p className="text-xs text-gray-300 leading-relaxed pt-1">
              {contact.bio || 'مستخدم نشط على منصة دردشة للتواصل الفوري الحديث.'}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-orange-400 font-mono font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>14 يوم</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">سلسلة التواصل</p>
            </div>

            <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-mono font-bold text-sm">
                <Gift className="w-4 h-4" />
                <span>{contactGifts.length}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">هدايا مستلمة</p>
            </div>

            <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-cyan-400 font-mono font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>256-bit</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">تشفير كامل</p>
            </div>
          </div>

          {/* Tabs Switcher */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-2xl border border-white/10 text-xs gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'about'
                  ? 'bg-cyan-600 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              حول الحساب (About)
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'media'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              الوسائط والملفات
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'gifts'
                  ? 'bg-amber-600 text-slate-950 font-black shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              خزنة الهدايا ({contactGifts.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'security'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              الأمان
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: ABOUT (حول الحساب) */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-3 animate-in fade-in text-right">
              
              {/* Identity & Contact Box */}
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-gray-400">اسم المستخدم (المعرف):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-300">{usernameHandle}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(usernameHandle);
                        setCopiedUsername(true);
                        setTimeout(() => setCopiedUsername(false), 2000);
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رقم الجوال:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white dir-ltr">{displayPhone}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(displayPhone);
                        setCopiedPhone(true);
                        setTimeout(() => setCopiedPhone(false), 2000);
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>البريد الإلكتروني:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white">{contact.email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      موثق ✅
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>الموقع والمدينة:</span>
                  </div>
                  <span className="font-bold text-white">{displayLocation}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    <span>الحالة والمزاج:</span>
                  </div>
                  <span className="font-bold text-amber-200">{displayStatus}</span>
                </div>
              </div>

              {/* Interest Tags */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الاهتمامات والهوايات:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {displayInterests.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(displaySocial).length > 0 && (
                <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2">
                  <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>حسابات التواصل ومواقع الويب:</span>
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {displaySocial.website && (
                      <a href={displaySocial.website} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-cyan-300 transition">
                        <Globe className="w-3.5 h-3.5" />
                        <span>موقعه</span>
                      </a>
                    )}
                    {displaySocial.twitter && (
                      <span className="px-2.5 py-1 bg-white/5 rounded-lg flex items-center gap-1 text-sky-400">
                        <Twitter className="w-3.5 h-3.5" />
                        <span>@{displaySocial.twitter}</span>
                      </span>
                    )}
                    {displaySocial.github && (
                      <span className="px-2.5 py-1 bg-white/5 rounded-lg flex items-center gap-1 text-gray-200">
                        <Github className="w-3.5 h-3.5" />
                        <span>{displaySocial.github}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SHARED MEDIA */}
          {/* ======================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-2 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                {sharedMediaItems.filter(i => i.type === 'image').map((item, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-gray-200 truncate">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              {sharedMediaItems.filter(i => i.type !== 'image').map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {item.type === 'audio' ? <Music className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
                    <div>
                      <p className="font-bold text-gray-200">{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.size} • {item.date}</p>
                    </div>
                  </div>
                  <button className="text-[11px] text-cyan-400 hover:underline">تحميل</button>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CONTACT GIFTS (خزنة هدايا المستخدم) */}
          {/* ======================================================== */}
          {activeTab === 'gifts' && (
            <div className="space-y-3 animate-in fade-in text-right">
              {loadingGifts ? (
                <p className="text-xs text-center text-gray-400 py-6">جاري تحميل الهدايا...</p>
              ) : contactGifts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <Gift className="w-8 h-8 mx-auto text-gray-500" />
                  <p className="text-xs">لم يستلم هذا المستخدم هدايا بعد. كن أول من يهديه!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto">
                  {contactGifts.map((g, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3">
                      <span className="text-3xl p-1.5 bg-black/40 rounded-xl border border-white/10">{g.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{g.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">{g.serialNumber}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${g.rarityBadgeClass}`}>{g.rarityLabel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SECURITY & PREFERENCES */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-3 animate-in fade-in text-right">
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>رقم أمان التشفير (Safety Number)</span>
                  </span>
                  <button 
                    onClick={handleCopySafetyKey}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-gray-300 tracking-wider">
                  4829 • 1048 • 5592 • 0184 • 7721 • 9903
                </p>
                <p className="text-[10px] text-gray-400">
                  بصمة المفتاح العام للتحقق من أمان المحادثة ضد أي تنصت أو اعتراض خارجي.
                </p>
              </div>

              {/* Preferences Toggles */}
              <div className="space-y-1.5 text-xs">
                <div 
                  onClick={handleToggleMute}
                  className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-center gap-2">
                    {isMuted ? <BellOff className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4 text-gray-400" />}
                    <span>كتم التنبيهات من هذا المستخدم</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isMuted ? 'text-amber-400' : 'text-gray-400'}`}>
                    {isMuted ? 'مكتوم' : 'مفعل'}
                  </span>
                </div>

                <div 
                  onClick={handleToggleBlock}
                  className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-center gap-2 text-rose-300">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>حظر جهة الاتصال</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isBlocked ? 'text-rose-400' : 'text-gray-400'}`}>
                    {isBlocked ? 'محظور' : 'غير محظور'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
