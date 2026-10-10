import React, { useState, useEffect } from 'react';
import { 
  X, Mic, Eye, Vibrate, Bell, Volume2, Sparkles, Check, Play, Sliders
} from 'lucide-react';

export default function AccessibilityModal({ 
  isOpen, 
  onClose,
  highContrastEnabled,
  onToggleHighContrast,
  reducedMotion,
  onToggleReducedMotion,
  dyslexicFont,
  onToggleDyslexicFont,
  textZoom,
  onTextZoomChange,
  onVoiceCommand
}) {
  if (!isOpen) return null;

  // Item 98: Voice Navigation
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [lastVoiceResult, setLastVoiceResult] = useState('');
  const [voiceNotice, setVoiceNotice] = useState('');

  // Item 100: Haptic feedback toggle
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Item 101: Keyword Alerts
  const [keywords, setKeywords] = useState(['عاجل', 'ضروري', 'اجتماع', 'أحمد']);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordNotice, setKeywordNotice] = useState('');

  // Web Speech Recognition for Voice Navigation (Item 98)
  const handleToggleVoiceNav = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم التعرف على الصوت المباشر حالياً.');
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setVoiceNotice('جاري الاستماع لصوتك... قل مثلاً: "المحادثات" أو "المجتمع" أو "المظهر المظلم"');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setLastVoiceResult(transcript);
        setIsListeningVoice(false);
        setVoiceNotice(`تم استلام الأمر الصوتي: "${transcript}"`);
        if (onVoiceCommand) {
          onVoiceCommand(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setVoiceNotice('تعذر التقاط الصوت، يرجى المحاولة ثانية');
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningVoice(false);
    }
  };

  // Test Haptic pattern (Item 100)
  const testHapticPattern = (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    } else {
      console.log('Haptic vibration simulated:', pattern);
    }
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    if (!keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setKeywordNotice(`تمت إضافة كلمة التنبيه: "${newKeyword.trim()}"`);
      setTimeout(() => setKeywordNotice(''), 2500);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (word) => {
    setKeywords(prev => prev.filter(w => w !== word));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-yellow-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shadow-glow">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>سهولة الوصول والتحكم الذكي (Smart Accessibility)</span>
                <span className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-[10px] font-mono">
                  البنود 98-102
                </span>
              </h2>
              <p className="text-xs text-gray-400">التحكم الصوتي، وضع التباين العالي، الاهتزازات التعبيرية، وكلمات التنبيه</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* Item 98: Voice Navigation Commands */}
          <div className="p-4 bg-white/5 border border-yellow-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-yellow-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4" />
                  <span>التحكم والتوجيه الصوتي الذكي (Voice Navigation)</span>
                </h4>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  تحدث بأوامر صوتية باللغة العربية للتبديل بين الصفحات وفتح الدردشات بدون لمس الشاشة.
                </p>
              </div>

              <button
                onClick={handleToggleVoiceNav}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  isListeningVoice
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-glow'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isListeningVoice ? 'جاري الاستماع...' : 'تحدث بأمر'}</span>
              </button>
            </div>

            {voiceNotice && (
              <div className="p-2.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl text-center font-bold">
                {voiceNotice}
              </div>
            )}
          </div>

          {/* Item 99: High Contrast & Large Font Mode (في حال قام المستخدم بتفعيلها من الإعدادات) */}
          <div className="p-4 bg-gradient-to-r from-yellow-950/40 to-slate-900 border border-yellow-400/30 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-yellow-400" />
                <span>وضع التباين العالي وتكبير الخطوط لراحة العين</span>
              </h4>
              <p className="text-[11px] text-gray-300">
                زيادة حجم الخطوط مع تباين لوني مدروس لسهولة القراءة في مختلف ظروف الإضاءة.
              </p>
            </div>

            <input
              type="checkbox"
              checked={highContrastEnabled}
              onChange={(e) => onToggleHighContrast && onToggleHighContrast(e.target.checked)}
              className="w-5 h-5 accent-yellow-400 rounded cursor-pointer mr-3"
            />
          </div>

          {/* Motion Reduction Toggle */}
          <div className="p-4 bg-white/5 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>تقليل الحركة والرسوم التفاعلية (Reduced Motion)</span>
              </h4>
              <p className="text-[11px] text-gray-300">
                إيقاف تأثيرات الجزيئات، احتفالات الكونفيتي، والتأثيرات الموسمية لتقليل إجهاد العين ودوار الحركة.
              </p>
            </div>

            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => onToggleReducedMotion && onToggleReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 rounded cursor-pointer mr-3"
            />
          </div>

          {/* Dyslexic-Friendly Font Toggle */}
          <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>خط مخصص لسهولة القراءة وعسر القراءة (Dyslexia-Friendly Font)</span>
              </h4>
              <p className="text-[11px] text-gray-300">
                استخدام خط عالي الوضوح والتمايز يسهل قراءة الرسائل والنصوص بدون تداخل الحروف.
              </p>
            </div>

            <input
              type="checkbox"
              checked={dyslexicFont}
              onChange={(e) => onToggleDyslexicFont && onToggleDyslexicFont(e.target.checked)}
              className="w-5 h-5 accent-purple-400 rounded cursor-pointer mr-3"
            />
          </div>

          {/* Adjustable Text Zoom Slider (80% - 150%) */}
          <div className="p-4 bg-white/5 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>تكبير وتصغير حجم النصوص والواجهة (Text Zoom)</span>
                </h4>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  تحكم دقيق بحجم الخطوط عبر المنصة بنسبة تتراوح بين 80% وحتى 150%
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
                {textZoom || 100}%
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-mono text-gray-400">80%</span>
              <input
                type="range"
                min="80"
                max="150"
                step="5"
                value={textZoom || 100}
                onChange={(e) => onTextZoomChange && onTextZoomChange(Number(e.target.value))}
                className="flex-1 accent-emerald-400 cursor-pointer h-2 bg-white/10 rounded-lg"
              />
              <span className="text-[11px] font-mono text-gray-400">150%</span>
              <button
                type="button"
                onClick={() => onTextZoomChange && onTextZoomChange(100)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-200 text-[10px] font-bold rounded-lg transition"
              >
                إعادة ضبط (100%)
              </button>
            </div>
          </div>

          {/* Item 100: Haptic Feedback Patterns */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                  <Vibrate className="w-4 h-4" />
                  <span>الاهتزازات اللمسية التعبيرية (Haptic Engine)</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  اهتزازات ملموسة دقيقة ومتفاوتة عند إرسال رسالة، أو ورود تنبيه، أو خطأ أمني.
                </p>
              </div>

              <input
                type="checkbox"
                checked={hapticsEnabled}
                onChange={(e) => setHapticsEnabled(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-gray-400 text-[11px]">تجربة الاهتزاز:</span>
              <button
                onClick={() => testHapticPattern([40])}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-200 text-[11px]"
              >
                إرسال رسالة 💬
              </button>
              <button
                onClick={() => testHapticPattern([30, 50, 30])}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-200 text-[11px]"
              >
                إشعار 🔔
              </button>
              <button
                onClick={() => testHapticPattern([50, 100, 50])}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-200 text-[11px]"
              >
                تحذير طوارئ ⚠️
              </button>
            </div>
          </div>

          {/* Item 101: Keyword Alerts */}
          <div className="p-4 bg-white/5 border border-rose-500/30 rounded-2xl space-y-3">
            <div>
              <h4 className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                <span>التنبيه عند ورود كلمات مفتاحية مخصصة</span>
              </h4>
              <p className="text-[11px] text-gray-300 mt-0.5">
                إطلاق نغمة تنبيه قوية ومميزة عند ورود هذه الكلمات في أي محادثة حتى وإن كانت مكتومة!
              </p>
            </div>

            {keywordNotice && (
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-center font-bold">
                {keywordNotice}
              </div>
            )}

            {/* Add keyword form */}
            <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="أضف كلمة مفتاحية (مثال: عاجل، مهم، توقيع)..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
              >
                إضافة
              </button>
            </form>

            {/* Keywords tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full font-bold text-xs flex items-center gap-1.5"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveKeyword(word)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Audio speed control highlight */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>التحكم الذكي في سرعة تشغيل التسجيلات الصوتية</span>
            </h4>
            <p className="text-[11px] text-gray-400">
              مدمجة تلقائياً في مشغل الصوتيات داخل الشات وتتيح تسريع الصوت من <strong>0.75x</strong> حتى <strong>3.0x</strong> بضغطة زر واحدة.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">Dardasha Accessibility Active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl shadow-glow transition"
          >
            حفظ وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
