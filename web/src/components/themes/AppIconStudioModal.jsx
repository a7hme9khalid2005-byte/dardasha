import React, { useState } from 'react';
import { X, Sparkles, Check, Crown, Flame, Gem, Shield, Zap, Eye } from 'lucide-react';

export const appIconsCatalog = [
  { 
    id: 'dardasha-official', 
    name: 'شعار دردشة الرسمي (Official Master)', 
    imgSrc: '/app-icon.png', 
    bg: 'from-[#252878] via-[#20236a] to-[#16184d]', 
    shadow: 'shadow-[0_0_25px_rgba(255,94,20,0.5)]', 
    badge: '★ الشعار الرسمي',
    isOfficial: true
  },
  { id: 'cosmic-violet', name: 'البنفسجي الكوني', iconText: 'D', bg: 'from-purple-600 via-indigo-600 to-cyan-400', shadow: 'shadow-[0_0_20px_rgba(147,51,234,0.7)]', badge: '🔮' },
  { id: 'cyber-cyan', name: 'السيان النيوني السريع', iconText: '⚡', bg: 'from-cyan-500 via-teal-500 to-blue-600', shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.8)]', badge: '🩵' },
  { id: 'golden-vip', name: 'الذهب الإمبراطوري الملكي', iconText: '👑', bg: 'from-amber-400 via-yellow-500 to-amber-700', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.8)]', badge: 'VIP' },
  { id: 'stealth-black', name: 'التخفي الأسود الشبح', iconText: '🕶️', bg: 'from-zinc-900 via-neutral-900 to-black border border-white/20', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.15)]', badge: '🕶️' },
  { id: 'matrix-green', name: 'ماتريكس الأخضر المشفر', iconText: '01', bg: 'from-emerald-500 via-green-600 to-teal-800', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.8)]', badge: '📟' },
  { id: 'solar-flame', name: 'لهب الشمس المتوقد', iconText: '🔥', bg: 'from-rose-600 via-orange-500 to-amber-500', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.8)]', badge: '🔥' },
  { id: 'sapphire-ocean', name: 'ياقوت المحيط الأزرق العميق', iconText: '💎', bg: 'from-blue-600 via-indigo-700 to-cyan-500', shadow: 'shadow-[0_0_20px_rgba(37,99,235,0.8)]', badge: '💎' },
  { id: 'sunset-crimson', name: 'شفق الغروب الأرجواني', iconText: '🌅', bg: 'from-fuchsia-600 via-pink-600 to-rose-600', shadow: 'shadow-[0_0_20px_rgba(219,39,119,0.8)]', badge: '🌅' },
  { id: 'emerald-crystal', name: 'كريستال الزمرد الأخضر', iconText: '🌿', bg: 'from-teal-400 via-emerald-500 to-green-700', shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.8)]', badge: '🌿' },
  { id: 'quantum-holo', name: 'الهولوجرام الكمي', iconText: '🌀', bg: 'from-cyan-400 via-purple-500 to-pink-500', shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.8)]', badge: '🌀' },
  { id: 'retro-pixel', name: 'ريترو بكسل الألعاب 8-Bit', iconText: '👾', bg: 'from-indigo-800 via-purple-800 to-pink-700 border-2 border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', badge: '👾' },
  { id: 'neon-heart', name: 'نبض النيون الوردي', iconText: '💖', bg: 'from-pink-500 via-rose-500 to-red-600', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.8)]', badge: '💖' },
  { id: 'carbon-fiber', name: 'ألياف الكربون الرياضية', iconText: '🏎️', bg: 'from-slate-900 via-zinc-800 to-neutral-900 border border-cyan-400/30', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', badge: '🏎️' },
  { id: 'diamond-cut', name: 'الماسة الزرقاء الملكية', iconText: '🔷', bg: 'from-sky-400 via-blue-600 to-indigo-900', shadow: 'shadow-[0_0_20px_rgba(56,189,248,0.8)]', badge: '🔷' },
  { id: 'cyber-shield', name: 'درع الحارس السيبراني', iconText: '🛡️', bg: 'from-emerald-600 via-cyan-600 to-blue-700', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.7)]', badge: '🛡️' },
  { id: 'rocket-orbit', name: 'صاروخ المدار الفضائي', iconText: '🚀', bg: 'from-indigo-600 via-purple-600 to-cyan-400', shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.8)]', badge: '🚀' },
  { id: 'lightning-bolt', name: 'الصاعقة الكهربائية الخاطفة', iconText: '⚡', bg: 'from-amber-400 via-yellow-400 to-orange-500', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.9)]', badge: '⚡' },
  { id: 'arctic-frost', name: 'صقيع القطب المتجمد', iconText: '❄️', bg: 'from-cyan-300 via-sky-400 to-blue-500 text-slate-900', shadow: 'shadow-[0_0_20px_rgba(125,211,252,0.8)]', badge: '❄️' },
  { id: 'steampunk-gear', name: 'ترس البخار النحاسي', iconText: '⚙️', bg: 'from-amber-700 via-yellow-700 to-amber-900 border border-amber-400/40', shadow: 'shadow-[0_0_15px_rgba(180,83,9,0.7)]', badge: '⚙️' },
  { id: 'radioactive', name: 'النشاط الإشعاعي المشع', iconText: '☢️', bg: 'from-lime-400 via-green-500 to-emerald-700 text-slate-950 font-black', shadow: 'shadow-[0_0_20px_rgba(163,230,53,0.8)]', badge: '☢️' },
  { id: 'moonlight', name: 'كسوف ضوء القمر', iconText: '🌙', bg: 'from-slate-800 via-indigo-950 to-purple-950 border border-purple-400/30', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]', badge: '🌙' },
  { id: 'constellation', name: 'برج النجوم السماوي', iconText: '✨', bg: 'from-fuchsia-600 via-purple-700 to-cyan-500', shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.8)]', badge: '✨' },
  { id: 'minimal-mono', name: 'الخط الأحادي المينيمال', iconText: '⚪', bg: 'from-white via-gray-200 to-gray-400 text-slate-950 font-black', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.6)]', badge: '⚪' },
  { id: 'rainbow-prism', name: 'طيف قوس قزح الكوني', iconText: '🌈', bg: 'from-red-500 via-green-500 to-blue-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.8)]', badge: '🌈' },
];

export default function AppIconStudioModal({ isOpen, onClose, currentIcon, onIconSelect }) {
  if (!isOpen) return null;

  const [selectedIcon, setSelectedIcon] = useState(currentIcon || 'cosmic-violet');
  const [savedNotice, setSavedNotice] = useState(false);

  const activeObj = appIconsCatalog.find(i => i.id === selectedIcon) || appIconsCatalog[0];

  const handleSelect = (id) => {
    setSelectedIcon(id);
    localStorage.setItem('dardasha_app_icon', id);
    if (onIconSelect) {
      onIconSelect(id);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>استوديو أيقونات وشعارات التطبيق (App Icons Studio)</span>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono">
                  24 أيقونة احترافية
                </span>
              </h2>
              <p className="text-xs text-gray-400">خصص مظهر أيقونة وشعار منصة دردشة في شريط التصفح وشاشة البدء والتطبيق المثبت</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedNotice && (
          <div className="m-3 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold text-center animate-in fade-in">
            ✅ تم تفعيل أيقونة "{activeObj.name}" بنجاح وتحديث الشعار!
          </div>
        )}

        {/* Live Preview Box */}
        <div className="p-6 bg-[#0b0f19]/80 border-b border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-right">
          <div className={`w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr ${activeObj.bg} ${activeObj.shadow} flex items-center justify-center text-white font-black text-3xl transition-all duration-300 transform hover:scale-105 ring-2 ring-white/10 shrink-0`}>
            {activeObj.imgSrc ? (
              <img src={activeObj.imgSrc} alt={activeObj.name} className="w-full h-full object-cover" />
            ) : (
              activeObj.iconText
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">الأيقونة المفعلة حالياً: {activeObj.name}</h3>
            <p className="text-xs text-gray-300">يتم تطبيق هذا الشعار فوراً في شريط المهام (Navbar) وشاشة الهاتف و PWA.</p>
            <span className="inline-block mt-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-cyan-300">
              Badge: {activeObj.badge}
            </span>
          </div>
        </div>

        {/* Icons Grid (24 Unique Icons) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {appIconsCatalog.map((icon) => (
            <div
              key={icon.id}
              onClick={() => handleSelect(icon.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col items-center text-center gap-2.5 group hover:scale-[1.03] ${
                selectedIcon === icon.id
                  ? 'border-amber-400 bg-amber-950/40 shadow-glow'
                  : 'border-white/10 bg-white/5 hover:border-amber-500/40'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr ${icon.bg} ${icon.shadow} flex items-center justify-center text-white font-black text-xl transition-transform group-hover:scale-110 ring-1 ring-white/10 shrink-0`}>
                {icon.imgSrc ? (
                  <img src={icon.imgSrc} alt={icon.name} className="w-full h-full object-cover" />
                ) : (
                  icon.iconText
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white group-hover:text-amber-300 block">
                  {icon.name}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {icon.badge}
                </span>
              </div>

              {selectedIcon === icon.id && (
                <span className="px-2 py-0.5 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>نشطة</span>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">
            إجمالي الأيقونات المتوفرة: {appIconsCatalog.length} أيقونة حصرية
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            تثبيت الأيقونة
          </button>
        </div>

      </div>
    </div>
  );
}
