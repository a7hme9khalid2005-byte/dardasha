import React, { useState } from 'react';
import { X, MessageSquare, Check, Sparkles, Sliders } from 'lucide-react';

export const bubbleStylesCatalog = [
  { id: 'cosmic-glass', name: 'الزجاجي الكوني المتوهج 🔮', previewClass: 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-md border border-white/20 shadow-glow rounded-3xl' },
  { id: 'cyber-neon', name: 'نيون السايبر المشع 🩵', previewClass: 'bg-[#0f172a] border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] text-cyan-100 rounded-2xl' },
  { id: 'sharp-blade', name: 'الشفرة الحادة المستقبلية 🗡️', previewClass: 'bg-indigo-900/90 border-r-4 border-cyan-400 rounded-tr-none rounded-bl-none rounded-xl' },
  { id: 'rounded-pill', name: 'الكبسولة الناعمة 💊', previewClass: 'bg-purple-600 text-white rounded-full px-5 py-2.5 shadow-md' },
  { id: 'hexagonal-tech', name: 'التقنية السداسية ⬡', previewClass: 'bg-slate-900 border border-purple-500/50 [clip-path:polygon(5%_0%,95%_0%,100%_50%,95%_100%,5%_100%,0%_50%)] p-4' },
  { id: 'holographic-prism', name: 'الهولوجرام الموشوري 🌀', previewClass: 'bg-gradient-to-tr from-cyan-500/60 via-purple-500/60 to-pink-500/60 border border-white/30 backdrop-blur-xl shadow-lg rounded-3xl' },
  { id: 'cyber-terminal', name: 'طرفية الأوامر (Terminal) 📟', previewClass: 'bg-black border border-emerald-500 text-emerald-400 font-mono rounded-none p-3 shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
  { id: 'curved-wave', name: 'الأمواج الانسيابية 🌊', previewClass: 'bg-gradient-to-r from-blue-600 to-cyan-600 rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg' },
  { id: 'folded-origami', name: 'الورق المطوي (Origami) 📄', previewClass: 'bg-indigo-950 border-t-2 border-l-2 border-purple-400 rounded-2xl shadow-xl' },
  { id: 'comic-pop', name: 'سحاب الكوميكس التعبيري 💭', previewClass: 'bg-amber-500 text-slate-950 font-black border-2 border-black rounded-3xl shadow-[3px_3px_0px_#000]' },
  { id: 'velvet-ribbon', name: 'الشريط المخملي الملكي 🎀', previewClass: 'bg-gradient-to-r from-rose-900 to-pink-900 border border-rose-400/30 rounded-2xl shadow-lg' },
  { id: 'minimalist-wire', name: 'الإطار المينيمال النقي ⚪', previewClass: 'bg-transparent border border-white/40 text-white rounded-xl' },
  { id: 'aurora-gradient', name: 'شفق الأورورا المتدرج 🌌', previewClass: 'bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 rounded-3xl shadow-glow' },
  { id: 'retro-pixel', name: 'ريترو بكسل 8-Bit 👾', previewClass: 'bg-slate-900 border-2 border-yellow-400 rounded-none shadow-[2px_2px_0px_#facc15]' },
  { id: 'golden-luxury', name: 'الذهب الفاخر الملوكي 👑', previewClass: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-slate-950 font-black rounded-2xl shadow-glow' },
  { id: 'dark-carbon', name: 'كاربون فايبر التخفي 🕶️', previewClass: 'bg-[#111622] border border-gray-700/60 rounded-2xl shadow-inner' },
  { id: 'frosted-ice', name: 'الجليد المتبلور ❄️', previewClass: 'bg-cyan-950/70 border border-cyan-300/40 backdrop-blur-2xl rounded-3xl' },
  { id: 'speech-cloud', name: 'سحابة المحادثة العصرية ☁️', previewClass: 'bg-slate-800 rounded-3xl rounded-bl-sm border border-white/10' },
  { id: 'slanted-slice', name: 'الشريحة المائلة 📐', previewClass: 'bg-purple-800 -skew-x-3 rounded-xl border border-purple-400/40' },
  { id: 'cyber-shield', name: 'درع السايبر الحصين 🛡️', previewClass: 'bg-slate-900 border-l-4 border-emerald-400 rounded-r-2xl' },
  { id: 'crystal-prism', name: 'الكريستال الألماسي 💎', previewClass: 'bg-gradient-to-br from-indigo-900/90 to-purple-950/90 border border-cyan-400/40 shadow-glow rounded-3xl' },
  { id: 'space-capsule', name: 'كبسولة المدار الفضائي 🚀', previewClass: 'bg-gradient-to-r from-purple-900 to-slate-900 border border-purple-500/40 rounded-full px-6' },
  { id: 'vintage-scroll', name: 'المخطوطة العتيقة 📜', previewClass: 'bg-amber-950/60 border border-amber-600/40 text-amber-200 rounded-xl' },
  { id: 'neon-underline', name: 'خط النيون المتوهج ⚡', previewClass: 'bg-[#161f38] border-b-4 border-cyan-400 rounded-t-2xl' },
  { id: 'claymorphism', name: 'طين ثلاثي الأبعاد فائق النعومة 🏺', previewClass: 'bg-[#222f4d] shadow-[8px_8px_16px_#090d17,-8px_-8px_16px_#2b3b61] rounded-3xl' },
  { id: 'starlight-nebula', name: 'سديم النجوم الكوني ✨', previewClass: 'bg-gradient-to-tr from-fuchsia-900 via-purple-900 to-indigo-950 rounded-3xl border border-fuchsia-500/30' },
  { id: 'floating-island', name: 'الجزيرة الطافية 🏝️', previewClass: 'bg-slate-800 shadow-2xl border border-white/10 rounded-2xl' },
  { id: 'sunset-dusk', name: 'شمس الغروب المتوهجة 🌅', previewClass: 'bg-gradient-to-r from-orange-600 to-rose-600 rounded-2xl shadow-glow' },
  { id: 'deep-ocean', name: 'خندق المحيط العميق 🌊', previewClass: 'bg-gradient-to-r from-blue-950 to-cyan-950 border border-cyan-500/30 rounded-3xl' },
  { id: 'hazard-tech', name: 'الخطر التقني المخطط ⚠️', previewClass: 'bg-zinc-900 border-2 border-amber-500 rounded-xl' },
  { id: 'amethyst-gem', name: 'جوهرة الجمشت البنفسجية 🪨', previewClass: 'bg-gradient-to-br from-purple-700 to-purple-950 border border-purple-300/40 rounded-2xl' },
  { id: 'quantum-flux', name: 'التدفق الكمي المتسارع 🧬', previewClass: 'bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl border border-emerald-400/40 shadow-glow' }
];

export default function BubbleStudioModal({ isOpen, onClose, currentStyle, onStyleSelect }) {
  if (!isOpen) return null;

  const [selectedStyle, setSelectedStyle] = useState(currentStyle || 'cosmic-glass');
  const [savedNotice, setSavedNotice] = useState(false);

  const activeObj = bubbleStylesCatalog.find(b => b.id === selectedStyle) || bubbleStylesCatalog[0];

  const handleSelect = (id) => {
    setSelectedStyle(id);
    localStorage.setItem('dardasha_bubble_style', id);
    if (onStyleSelect) {
      onStyleSelect(id);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>استوديو أشكال فقاعات المحادثة (Bubble Studio)</span>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-[10px] font-mono">
                  32 نمط وتصميم حصري
                </span>
              </h2>
              <p className="text-xs text-gray-400">اختر التصميم المفضل ليظهر في كافة رسائلك داخل المحادثات والقروبات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedNotice && (
          <div className="m-3 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold text-center animate-in fade-in">
            ✅ تم تفعيل نمط فقاعة "{activeObj.name}" بنجاح!
          </div>
        )}

        {/* Live Interactive Preview Box */}
        <div className="p-5 bg-[#0b0f19]/80 border-b border-white/10 space-y-3">
          <span className="text-xs font-bold text-cyan-300 block text-right">معاينة حية للمحادثة بالنمط المختار:</span>
          
          <div className="space-y-3 max-w-lg mx-auto">
            {/* Outgoing Message (Me) */}
            <div className="flex justify-start">
              <div className={`p-3.5 max-w-[85%] text-xs font-medium text-white transition-all duration-200 ${activeObj.previewClass}`}>
                <span>مرحباً! كيف ترى شكل الفقاعة الجديد على منصة دردشة؟ 🚀✨</span>
                <span className="block text-[10px] opacity-75 mt-1 font-mono text-left">10:42 م • تم الإرسال</span>
              </div>
            </div>

            {/* Incoming Message (Them) */}
            <div className="flex justify-end">
              <div className="p-3.5 max-w-[85%] text-xs font-medium text-gray-200 bg-white/10 border border-white/10 rounded-2xl">
                <span>تصميم استثنائي ومميز كلياً عن الواتساب والفيسبوك! 🔥</span>
                <span className="block text-[10px] opacity-60 mt-1 font-mono text-right">10:43 م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Styles Grid (32+ Unique Styles) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {bubbleStylesCatalog.map((style) => (
            <div
              key={style.id}
              onClick={() => handleSelect(style.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between group hover:scale-[1.02] ${
                selectedStyle === style.id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-glow'
                  : 'border-white/10 bg-white/5 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                  {style.name}
                </span>
                {selectedStyle === style.id && (
                  <span className="p-1 bg-cyan-400 text-slate-900 rounded-full">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Mini Sample */}
              <div className={`p-2.5 text-[11px] text-white line-clamp-1 mt-1 text-right ${style.previewClass}`}>
                نص تجريبي للفقاعة
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">
            إجمالي الأنماط المتاحة: {bubbleStylesCatalog.length} شكلاً فريداً
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            تأكيد الاختيار
          </button>
        </div>

      </div>
    </div>
  );
}
