import React, { useState } from 'react';
import { 
  Search, X, Sparkles, ShieldAlert, Palette, Type, MessageSquare, 
  Users, Video, Briefcase, Eye, Navigation, Gift, CreditCard, 
  Lock, Radio, Bot, Globe2, FileText, CheckCircle, ChevronLeft, UserPlus
} from 'lucide-react';

export default function FeatureLauncherModal({
  isOpen,
  onClose,
  onOpenTypography,
  onOpenBubbleStudio,
  onOpenAppIconStudio,
  onOpenSecuritySuite,
  onOpenGroupHub,
  onOpenCallPro,
  onOpenProductivity,
  onOpenAccessibility,
  onOpenMysteryBox,
  onOpenRadar,
  onOpenIdCard,
  onOpenVault,
  onOpenAi,
  onOpenTour,
  onOpenAddFriend
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'الكل (جميع الميزات)' },
    { id: 'customization', label: '🎨 التخصيص والمظهر' },
    { id: 'security', label: '🛡️ الأمان والخصوصية' },
    { id: 'productivity', label: '⚡ الإنتاجية والأعمال' },
    { id: 'groups', label: '👥 المجموعات والقنوات' },
    { id: 'media', label: '📹 المكالمات والوسائط' },
    { id: 'accessibility', label: '♿ سهولة الاستخدام' }
  ];

  const features = [
    {
      id: 'typography',
      category: 'customization',
      title: 'استوديو الخطوط الكوني (+1,000 خط)',
      desc: 'تطبيق مباشر لأكثر من 1,000 نوع خط عربي ولاتيني وزخرفي مع بحث فوري ومعاينة حية.',
      icon: <Type className="w-5 h-5 text-purple-400" />,
      badge: 'جديد ومميز',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      action: () => { onClose(); onOpenTypography(); }
    },
    {
      id: 'bubbles',
      category: 'customization',
      title: 'استوديو فقاعات الرسائل (32 شكلاً)',
      desc: 'غيّر أسلوب وشكل فقاعات المحادثة الخاصة بك إلى نيون، كبسولة، كرتوني، سايبر، أو زجاجي فخم.',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      badge: '32 ستايل',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      action: () => { onClose(); onOpenBubbleStudio(); }
    },
    {
      id: 'app-icons',
      category: 'customization',
      title: 'أيقونات وشعارات المنصة (24 أيقونة)',
      desc: 'خصص الشعار والبادج الظاهر في شريط التطبيق الرئيسي ليطابق مزاجك وستايلك المفضل.',
      icon: <Palette className="w-5 h-5 text-amber-400" />,
      badge: '24 أيقونة',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      action: () => { onClose(); onOpenAppIconStudio(); }
    },
    {
      id: 'id-card',
      category: 'customization',
      title: 'بطاقة الهوية الرقمية 3D (Holographic Card)',
      desc: 'بطاقة عضوية ثلاثية الأبعاد تفاعلية تتفاعل مع تحريك الماوس ومع رمز QR فريد لمشاركتها.',
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      badge: '3D تفاعلي',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => { onClose(); onOpenIdCard(); }
    },
    {
      id: 'security-suite',
      category: 'security',
      title: 'الأمان السيبراني الشامل والتمويه',
      desc: 'رمز الطوارئ التمويهي (Decoy PIN)، حرق الرسائل (Burner Links)، مسح البيانات الشامل، وتشفير الملفات.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      badge: 'حماية قصوى',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      action: () => { onClose(); onOpenSecuritySuite(); }
    },
    {
      id: 'vault',
      category: 'security',
      title: 'الخزنة السحابية الخاصة (Encrypted Vault)',
      desc: 'مساحة مشفرة برمز PIN لحفظ الرسائل الهامة، الملاحظات، والمستندات الحساسة بدون مزامنة عامة.',
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      badge: 'مشفر بالكامل',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      action: () => { onClose(); onOpenVault(); }
    },
    {
      id: 'group-hub',
      category: 'groups',
      title: 'مركز المجموعات والقنوات المتقدمة',
      desc: 'خيوط المحادثة (Threads)، رسائل البث الإذاعي (Broadcasts)، صندوق المقترحات للمشرفين، وتحليلات النشاط.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      badge: 'للمجتمعات',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      action: () => { onClose(); onOpenGroupHub(); }
    },
    {
      id: 'call-pro',
      category: 'media',
      title: 'الاتصال الفائق والوسائط (Call Pro Suite)',
      desc: 'خلفيات 3D افتراضية، وضع توفير استهلاك الإنترنت (Data Saver)، شاشة عائمة (PiP)، والضغط للتحدث.',
      icon: <Video className="w-5 h-5 text-cyan-400" />,
      badge: 'مكالمات HD',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => { onClose(); onOpenCallPro(); }
    },
    {
      id: 'productivity',
      category: 'productivity',
      title: 'أدوات الإنتاجية وإدارة الأعمال',
      desc: 'الردود الجاهزة السريعة باختصار `/`، الرد الآلي خارج أوقات العمل، وتصدير وثائق المحادثة الموقعة.',
      icon: <Briefcase className="w-5 h-5 text-teal-400" />,
      badge: 'أعمال وإنتاجية',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      action: () => { onClose(); onOpenProductivity(); }
    },
    {
      id: 'accessibility',
      category: 'accessibility',
      title: 'سهولة الوصول والتحكم الصوتي',
      desc: 'التنقل في المنصة بالأوامر الصوتية، تباين فائق للشاشات (High Contrast)، والتغذية الاهتزازية (Haptics).',
      icon: <Eye className="w-5 h-5 text-yellow-400" />,
      badge: 'سهولة الوصول',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      action: () => { onClose(); onOpenAccessibility(); }
    },
    {
      id: 'mystery-box',
      category: 'customization',
      title: 'صندوق الحظ اليومي والمفاجآت',
      desc: 'افتح صندوق الحظ اليومي للحصول على نقاط كوزمك، شارات نادرة، وثيمات سرية كل 24 ساعة.',
      icon: <Gift className="w-5 h-5 text-amber-400" />,
      badge: 'مكافآت يومية',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      action: () => { onClose(); onOpenMysteryBox(); }
    },
    {
      id: 'radar',
      category: 'groups',
      title: 'رادار الأصدقاء القريبين (Nearby Radar)',
      desc: 'اكتشف مستخدمي منصة دردشة القريبين منك جغرافياً وتواصل معهم فوراً بنقرة واحدة.',
      icon: <Navigation className="w-5 h-5 text-cyan-400" />,
      badge: 'استكشاف محلي',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => { onClose(); onOpenRadar(); }
    },
    {
      id: 'add-friends',
      category: 'groups',
      title: 'إضافة وإدارة الأصدقاء (Friends Hub)',
      desc: 'إرسال طلبات صداقة بالمعرف، مسح رمز QR الفوري، وإدارة الدوائر الاجتماعية والطلبات المعلقة.',
      icon: <UserPlus className="w-5 h-5 text-purple-400" />,
      badge: 'نظام متكامل',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      action: () => { onClose(); onOpenAddFriend && onOpenAddFriend(); }
    },
    {
      id: 'ai-assistant',
      category: 'productivity',
      title: 'المساعد الذكي الاصطناعي (Dardasha AI)',
      desc: 'اسأل الذكاء الاصطناعي لتلخيص المحادثات، كتابة ردود سريعة، ترجمة اللغات، واقتراح الأفكار.',
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      badge: 'ذكاء اصطناعي',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      action: () => { onClose(); onOpenAi(); }
    }
  ];

  const filteredFeatures = features.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-[#111827] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-purple-600/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-cyan-600/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between relative z-10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>مركز الميزات الخارقة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  +70 ميزة نشطة
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                كل ما تحتاجه للتحكم الكامل، التخصيص، والأمان والترفيه في مكان واحد واضح وبسيط
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onOpenTour(); }}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>🌟 الجولة التعريفية</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02] space-y-3 relative z-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ميزة (مثال: خطوط، أمان، رادار، مكالمات، مسودة...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-white text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-glow'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 relative z-10">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">لم يتم العثور على ميزات تطابق بحثك "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-3 text-xs text-cyan-400 hover:underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredFeatures.map(item => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="group p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 rounded-2xl transition cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition">
                          {item.icon}
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                          {item.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed pr-10">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-300 group-hover:text-cyan-400">
                    <span>تشغيل الميزة</span>
                    <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Quick Tip */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 text-center text-[11px] text-gray-400 relative z-10">
          💡 <span className="font-bold text-gray-300">نصيحة:</span> جميع الميزات تعمل بشكل متزامن ومتوافق 100% بدون أي تضارب.
        </div>

      </div>
    </div>
  );
}
