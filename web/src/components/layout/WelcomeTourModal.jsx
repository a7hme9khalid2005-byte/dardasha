import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Palette, Tv, Bot, CheckCircle, 
  ArrowLeft, ArrowRight, Zap, Trophy, X, Compass, Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WelcomeTourModal({ isOpen, onClose, onOpenLauncher, onOpenTypography, currentUser }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'أهلاً بك في منصة Dardasha (دردشة)! 🚀',
      subtitle: 'الجيل الجديد من التواصل الفوري الكوني والذكي',
      badge: 'مرحباً بك',
      badgeColor: 'from-purple-500 to-indigo-500',
      icon: <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />,
      content: (
        <div className="space-y-3 text-right">
          <p className="text-sm text-gray-200 leading-relaxed">
            صُممت دردشة لتقدم لك تجربة تواصل فريدة تماماً تختلف عن أي تطبيق تقليدي — بصرية، سريعة، وفائقة الأمان.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="text-lg">🌌</span>
              <div>
                <p className="font-bold text-white">هوية كونية حديثة</p>
                <p className="text-gray-400 text-[11px]">مظهر زجاجي داكن مريح للعين</p>
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <p className="font-bold text-white">سرعة استجابة فائقة</p>
                <p className="text-gray-400 text-[11px]">تزامن فوري بدون أي تأخير</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'خصوصية وأمان خارق بلا أثر 🛡️',
      subtitle: 'أعلى معايير الحماية والتخفي لم تجدها في أي مكان آخر',
      badge: 'أمان سيبراني',
      badgeColor: 'from-rose-500 to-red-600',
      icon: <ShieldCheck className="w-12 h-12 text-rose-400" />,
      content: (
        <div className="space-y-3 text-right">
          <p className="text-sm text-gray-200 leading-relaxed">
            أنت المتحكم الكامل في بياناتك ومحادثاتك مع أدوات حماية متطورة مدمجة:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200">
              <span className="text-base">👻</span>
              <div>
                <span className="font-bold">المحادثات الشبحية برمز PIN:</span> إخفاء تام للمحادثة من القائمة ولا تظهر إلا برمز سري في البحث.
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
              <span className="text-base">🔥</span>
              <div>
                <span className="font-bold">روابط الحرق الذاتي (Burner Links):</span> رسائل بروابط تنفجر ذاتياً بعد قراءتها مرة واحدة فقط.
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-200">
              <span className="text-base">🥷</span>
              <div>
                <span className="font-bold">وضع التخفي الكامل:</span> إخفاء "يكتب الآن" و"متصل الآن" وعلامات القراءة بلمسة واحدة.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'تخصيص كامل لذوقك الفريد 🎨',
      subtitle: 'أكثر من 1,000 خط عربي وعالمي، 32 فقاعة، و24 أيقونة!',
      badge: 'استوديو الإبداع',
      badgeColor: 'from-fuchsia-500 to-pink-500',
      icon: <Palette className="w-12 h-12 text-fuchsia-400" />,
      content: (
        <div className="space-y-3 text-right">
          <p className="text-sm text-gray-200 leading-relaxed">
            اجعل التطبيق يعبر عن شخصيتك تماماً بدون قيود:
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl">
              <p className="text-lg font-black text-purple-300 font-mono">+1,000</p>
              <p className="text-gray-300 font-bold mt-1">خط قابل للتطبيق</p>
              <p className="text-[10px] text-gray-400">عربي ولاتيني وزخرفي</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl">
              <p className="text-lg font-black text-blue-300 font-mono">32</p>
              <p className="text-gray-300 font-bold mt-1">شكل للفقاعات</p>
              <p className="text-[10px] text-gray-400">نيون، كرتوني، كبسولة</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
              <p className="text-lg font-black text-amber-300 font-mono">24</p>
              <p className="text-gray-300 font-bold mt-1">شعار وأيقونة</p>
              <p className="text-[10px] text-gray-400">لتخصيص هوية التطبيق</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'تفاعل وترفيه فوري مع الأصدقاء 🎧',
      subtitle: 'شاهد واستمع معاً، ولوحة رسم حية، وتفريغ فوري للصوت',
      badge: 'تفاعل حي',
      badgeColor: 'from-cyan-500 to-blue-500',
      icon: <Tv className="w-12 h-12 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-right">
          <p className="text-sm text-gray-200 leading-relaxed">
            الدردشة لم تعد مجرد نصوص جامدة — استمتع بلحظات حقيقية معاً:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="font-bold text-cyan-300 flex items-center gap-1">
                <span>🍿</span> مشاهدة متزامنة
              </p>
              <p className="text-gray-400 text-[11px] mt-1">تشغيل ومزامنة مقاطع الفيديو مع أصدقائك في نفس الثانية أثناء الشات.</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="font-bold text-emerald-300 flex items-center gap-1">
                <span>🎙️</span> تحويل الصوت لنص
              </p>
              <p className="text-gray-400 text-[11px] mt-1">تفريغ أي تسجيل صوتي إلى نص فوري إذا كنت في مكان عام لا يمكنك الاستماع فيه.</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="font-bold text-purple-300 flex items-center gap-1">
                <span>🎨</span> لوحة رسم مشتركة
              </p>
              <p className="text-gray-400 text-[11px] mt-1">شاشة رسم بيضاء ترسمان وتكتبان عليها معاً في الوقت الفعلي.</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <span>🎁</span> صندوق الحظ اليومي
              </p>
              <p className="text-gray-400 text-[11px] mt-1">مكافآت، شارات، ونقاط كوزمك يومية بانتظارك كل 24 ساعة.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'تهانينا! أنت الآن جاهز للانطلاق 🎉',
      subtitle: 'لقد حصلت على شارة المستكشف الماسي 💎',
      badge: 'إنجاز مكتمل',
      badgeColor: 'from-amber-400 to-yellow-500',
      icon: <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-purple-500/20 rounded-2xl border border-yellow-400/40">
            <span className="text-4xl">🎖️</span>
            <h4 className="font-black text-white text-base mt-2">شارة المستكشف الكوني (Cosmic Pioneer)</h4>
            <p className="text-xs text-yellow-200 mt-1">
              تمت إضافة الشارة إلى ملفك الشخصي بنجاح، وربحت +100 نقطة كوزمك!
            </p>
          </div>
          <p className="text-xs text-gray-300">
            يمكنك الوصول لجميع الميزات في أي وقت عبر زر <span className="text-cyan-400 font-bold">"🚀 مركز الميزات"</span> في أعلى الشاشة.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (currentStep === tourSteps.length - 2) {
        // Confetti when reaching final step
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      localStorage.setItem('dardasha_tour_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#111827] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-white">
        
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-purple-600/30 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${step.badgeColor}`}>
              {step.badge}
            </span>
            <span className="text-xs text-gray-400">
              خطوة {currentStep + 1} من {tourSteps.length}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3">
              {step.icon}
            </div>
            <h2 className="text-xl font-black text-white">{step.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{step.subtitle}</p>
          </div>

          <div className="min-h-[170px] flex items-center justify-center">
            {step.content}
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {tourSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-7 bg-gradient-to-r from-purple-500 to-cyan-400' 
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between relative z-10">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-gray-500'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep === tourSteps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-glow transition transform hover:scale-105"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ابدأ تجربة دردشة الآن 🚀</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow transition"
              >
                <span>التالي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
