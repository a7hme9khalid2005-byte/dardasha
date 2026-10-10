import React, { useState, useEffect } from 'react';
import { 
  X, Gift, Sparkles, Award, Check, Search, Filter, 
  Coins, Zap, Eye, ArrowRight, Loader2, Compass, ShieldCheck,
  Clock, Lock, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { sounds } from '../../utils/soundEffects';

const CHEST_TIERS = [
  {
    id: 'daily',
    name: 'صندوق الحظ (كل 3 أيام)',
    subtitle: 'متاح مرة واحدة كل 3 أيام مجاناً',
    icon: '🎁',
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
    border: 'border-amber-500/40',
    badge: 'مجاني كل 3 أيام',
    badgeColor: 'bg-amber-500/20 text-amber-300'
  },
  {
    id: 'golden',
    name: 'الصندوق الذهبي الملكي',
    subtitle: 'فرص مضاعفة للهدايا النادرة والملحمية',
    icon: '🏆',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    border: 'border-yellow-400/50',
    badge: 'فرص نادرة 2x',
    badgeColor: 'bg-yellow-400/20 text-yellow-300'
  },
  {
    id: 'cosmic',
    name: 'الصندوق الكوني الأسطوري',
    subtitle: 'للهدايا الخرافية والأرقام التسلسلية VIP',
    icon: '🌌',
    gradient: 'from-purple-600 via-fuchsia-500 to-cyan-400',
    border: 'border-fuchsia-400/50',
    badge: 'أسطوري VIP',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300'
  }
];

export default function MysteryBoxModal({ isOpen, onClose, onGiftClaimed }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'catalog'
  const [selectedTier, setSelectedTier] = useState('daily');
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [wonGift, setWonGift] = useState(null);
  const [error, setError] = useState('');

  // 3-Day Cooldown States
  const [canOpen, setCanOpen] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [resettingDev, setResettingDev] = useState(false);

  // Catalog Explorer states
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');

  const currentTierObj = CHEST_TIERS.find(t => t.id === selectedTier) || CHEST_TIERS[0];

  // Fetch chest status on mount
  useEffect(() => {
    checkChestStatus();
  }, [isOpen]);

  // Live countdown timer ticker (ticks every 1s)
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (!canOpen && !loadingStatus) {
        setCanOpen(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setCanOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, canOpen, loadingStatus]);

  const checkChestStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getChestStatus();
      setCanOpen(res.canOpen);
      if (!res.canOpen && res.remainingMs) {
        setRemainingSeconds(Math.ceil(res.remainingMs / 1000));
      } else {
        setRemainingSeconds(0);
      }
    } catch (err) {
      console.warn('Status check warning:', err.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleOpenChest = async () => {
    if (opening || opened || !canOpen) return;
    setOpening(true);
    setError('');

    try {
      const res = await api.openChest(selectedTier);
      
      // Delay for dramatic chest shaking animation
      setTimeout(() => {
        sounds.playGift();
        setWonGift(res.gift);
        setOpened(true);
        setOpening(false);
        setCanOpen(false);
        // Exactly 3 days countdown = 3 * 24 * 3600 seconds
        setRemainingSeconds(3 * 24 * 3600);

        // Grand Confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        if (onGiftClaimed) onGiftClaimed(res.gift);
      }, 1200);
    } catch (err) {
      setError(err.message || 'فشل فتح الصندوق');
      setOpening(false);
      checkChestStatus();
    }
  };

  const handleResetDevCooldown = async () => {
    setResettingDev(true);
    try {
      await api.resetChestCooldown();
      setCanOpen(true);
      setRemainingSeconds(0);
      setError('');
    } catch (err) {
      alert('فشل إعادة التعيين');
    } finally {
      setResettingDev(false);
    }
  };

  const handleResetForNext = () => {
    setOpened(false);
    setWonGift(null);
  };

  // Fetch catalog items when catalog tab is opened
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadCatalog();
    }
  }, [activeTab, catalogPage, selectedRarity]);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await api.exploreGifts({
        page: catalogPage,
        limit: 12,
        rarity: selectedRarity,
        query: searchQuery
      });
      setCatalogItems(res.items || []);
    } catch (err) {
      console.error('Catalog load error:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCatalogPage(1);
    loadCatalog();
  };

  // Convert remainingSeconds into days, hours, mins, secs
  const days = Math.floor(remainingSeconds / (3600 * 24));
  const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Glow ambient lights */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>صندوق الحظ التفاعلي</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  متاح كل 3 أيام ⏰
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">عالم الـ 100,000 هدية بأرقام تسلسلية حصرية (#000001 - #100000)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Mode Tabs Switcher */}
        <div className="flex border-b border-white/10 px-4 bg-black/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('open')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'open'
                ? 'border-amber-400 text-amber-300 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>فتح الصندوق (كل 3 أيام)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-purple-400 text-purple-300 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>استعراض كتالوج الـ 100,000 هدية</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* TAB 1: OPEN CHEST */}
          {activeTab === 'open' && (
            <div className="space-y-4">
              
              {!opened ? (
                <>
                  {/* Chest Tier Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {CHEST_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier.id)}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          selectedTier === tier.id
                            ? `${tier.border} bg-white/10 shadow-glow scale-[1.02]`
                            : 'border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-2xl">{tier.icon}</span>
                        <span className="text-[11px] font-bold text-white leading-tight">{tier.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold mt-0.5 ${tier.badgeColor}`}>
                          {tier.badge}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* COOLDOWN STATUS BANNER (EVERY 3 DAYS) */}
                  {!canOpen && (
                    <div className="p-4 bg-gradient-to-r from-amber-950/50 via-slate-900/60 to-purple-950/50 border border-amber-500/40 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                      <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>الصندوق في فترة الانتظار (يفتح مرة كل 3 أيام)</span>
                      </div>
                      
                      {/* Live Digital Countdown */}
                      <div className="flex items-center justify-center gap-2 font-mono py-1">
                        <div className="p-2 bg-black/50 border border-amber-500/30 rounded-xl min-w-[54px]">
                          <span className="text-lg font-black text-amber-300 block">{days}</span>
                          <span className="text-[9px] text-gray-400">يوم</span>
                        </div>
                        <span className="text-amber-400 font-bold">:</span>
                        <div className="p-2 bg-black/50 border border-amber-500/30 rounded-xl min-w-[54px]">
                          <span className="text-lg font-black text-amber-300 block">{String(hours).padStart(2, '0')}</span>
                          <span className="text-[9px] text-gray-400">ساعة</span>
                        </div>
                        <span className="text-amber-400 font-bold">:</span>
                        <div className="p-2 bg-black/50 border border-amber-500/30 rounded-xl min-w-[54px]">
                          <span className="text-lg font-black text-amber-300 block">{String(minutes).padStart(2, '0')}</span>
                          <span className="text-[9px] text-gray-400">دقيقة</span>
                        </div>
                        <span className="text-amber-400 font-bold">:</span>
                        <div className="p-2 bg-black/50 border border-amber-500/30 rounded-xl min-w-[54px]">
                          <span className="text-lg font-black text-cyan-300 block">{String(seconds).padStart(2, '0')}</span>
                          <span className="text-[9px] text-gray-400">ثانية</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400">
                        🔒 يُتاح لكل مستخدم فتح هدية مجانية واحدة كل 3 أيام للحفاظ على ندرة المقتنيات.
                      </p>

                      {/* Developer testing bypass */}
                      <button
                        type="button"
                        onClick={handleResetDevCooldown}
                        disabled={resettingDev}
                        className="text-[10px] text-cyan-400/80 hover:text-cyan-300 hover:underline pt-1 inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${resettingDev ? 'animate-spin' : ''}`} />
                        <span>إعادة تعيين العداد فوراً (وضع التجربة Dev)</span>
                      </button>
                    </div>
                  )}

                  {/* Interactive Chest Visual */}
                  <div className="py-5 text-center space-y-4">
                    <div
                      onClick={canOpen ? handleOpenChest : undefined}
                      className={`w-36 h-36 rounded-3xl bg-gradient-to-tr ${currentTierObj.gradient} mx-auto flex items-center justify-center cursor-pointer shadow-glow transition-all duration-300 relative group ${
                        !canOpen ? 'opacity-50 grayscale-[40%] cursor-not-allowed' : opening ? 'animate-spin scale-110' : 'hover:scale-105 active:scale-95 animate-bounce'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition" />
                      {!canOpen ? (
                        <div className="relative">
                          <Gift className="w-16 h-16 text-white drop-shadow-lg opacity-80" />
                          <div className="absolute -bottom-1 -right-1 p-1 bg-black/80 rounded-full border border-amber-400 text-amber-400">
                            <Lock className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <Gift className="w-20 h-20 text-white drop-shadow-lg" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-base text-white">
                        {!canOpen 
                          ? 'الصندوق مغلق حالياً حتى انتهاء فترة الـ 3 أيام'
                          : opening 
                          ? 'جاري سحب جائزتك من بين 100,000 هدية...' 
                          : 'الصندوق جاهز للفتح الآن! انقر لاستلام هديتك 🎁'}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                        تحتوي الصناديق على سيارات سوبر كار، يخوت، صواريخ، عملات، وألقاب نادرة برقم تسلسلي خاص.
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={canOpen ? handleOpenChest : undefined}
                      disabled={opening || !canOpen}
                      className={`w-full py-3.5 bg-gradient-to-r ${currentTierObj.gradient} text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {opening ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري فتح الصندوق...</span>
                        </>
                      ) : !canOpen ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>متاح بعد: {days > 0 ? `${days} يوم و ` : ''}{hours} ساعة و {minutes} دقيقة ⏳</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>افتح الصندوق الآن مجاناً! 🎁</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* WON REWARD DISPLAY */
                <div className="space-y-4 py-3 animate-in zoom-in-95 duration-300 text-center">
                  
                  {/* Badge & Serial Number Header */}
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${wonGift?.rarityBadgeClass}`}>
                      {wonGift?.rarityLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                      الرقم التسلسلي: {wonGift?.serialNumber} / #100,000
                    </span>
                  </div>

                  {/* Icon Card with Aura */}
                  <div className="relative my-4">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-amber-400/60 flex items-center justify-center mx-auto shadow-glow text-5xl">
                      {wonGift?.icon || '🎁'}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="font-black text-xl text-amber-300">
                      {wonGift?.name}
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed px-4">
                      {wonGift?.description}
                    </p>
                  </div>

                  {/* Value / Coin Perk */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs font-bold">
                      <Coins className="w-4 h-4" />
                      <span>القيمة: {wonGift?.value?.toLocaleString()} كوينز</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>أضيفت لخزنتك الدائمة ✅</span>
                    </div>
                  </div>

                  {/* 3-day notice after claim */}
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                    ⏳ صندوقك القادم سيكون متاحاً للفتح بعد <strong>3 أيام</strong> من الآن!
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={onClose}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black rounded-xl text-xs shadow-glow transition"
                    >
                      استلام والعودة للدردشة 🎉
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: 100,000 GIFTS CATALOG EXPLORER */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ابحث بالاسم أو الرقم مثل: #000001 أو سيارة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 pr-9 text-right"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    بحث
                  </button>
                </div>

                {/* Rarity Pill Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { key: '', label: 'الكل (100,000)' },
                    { key: 'mythic', label: 'خرافية 💎' },
                    { key: 'legendary', label: 'أسطورية 🟡' },
                    { key: 'epic', label: 'ملحمية 🟣' },
                    { key: 'rare', label: 'نادرة 🔵' },
                    { key: 'common', label: 'شائعة ⚪' }
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => { setSelectedRarity(f.key); setCatalogPage(1); }}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-bold transition ${
                        selectedRarity === f.key
                          ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Items Grid */}
              {catalogLoading ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                  <p className="text-xs">جاري تصفح عالم الـ 100,000 هدية...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {catalogItems.map((item) => (
                    <div 
                      key={item.serialNumber}
                      className="p-3 bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-2xl flex items-center justify-between text-right gap-2.5 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl p-1.5 bg-black/40 rounded-xl border border-white/10 shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-white truncate group-hover:text-amber-300 transition">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-cyan-400 font-mono font-bold">
                              {item.serialNumber}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${item.rarityBadgeClass}`}>
                              {item.rarityLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 font-bold shrink-0">
                        {item.value?.toLocaleString()} 🪙
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400">
                <button
                  type="button"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(p => p - 1)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-40 transition"
                >
                  السابق
                </button>
                <span className="font-mono font-bold text-purple-300">
                  الصفحة {catalogPage} من 8,333
                </span>
                <button
                  type="button"
                  disabled={catalogPage >= 8333}
                  onClick={() => setCatalogPage(p => p + 1)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-40 transition"
                >
                  التالي
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
