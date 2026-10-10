import React, { useState } from 'react';
import { 
  X, Radio, Users, Sparkles, MonitorUp, Mic, MicOff, Video, VideoOff, 
  Smile, Shield, MessageCircle, Heart, Share2, Volume2, Gift, Gem, Rocket, Crown 
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const arFilters = [
  { id: 'none', label: 'بدون فلتر 🚫' },
  { id: 'cyber', label: 'سايبربنك 🥽' },
  { id: 'halo', label: 'هالة ذهبية ✨' },
  { id: 'neon', label: 'نظارة نيون 🕶️' },
  { id: 'cinematic', label: 'سينمائي 🎬' },
];

const STREAM_GIFTS = [
  { id: 'g-rose', label: 'وردة حمراء 🌹', icon: '🌹', coins: 10 },
  { id: 'g-diamond', label: 'ماسة نيون 💎', icon: '💎', coins: 100 },
  { id: 'g-rocket', label: 'صاروخ كوني 🚀', icon: '🚀', coins: 500 },
  { id: 'g-crown', label: 'تاج VIP 👑', icon: '👑', coins: 1000 },
];

export default function LiveStreamModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isNoiseCancelled, setIsNoiseCancelled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [viewersCount, setViewersCount] = useState(248);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [activeGiftBanner, setActiveGiftBanner] = useState(null);

  const [comments, setComments] = useState([
    { id: 1, user: 'سارة خالد', text: 'بث أسطوري بالتوفيق! 🔥' },
    { id: 2, user: 'عمر التميمي', text: 'الصوت فائق الوضوح مع عزل الضوضاء 🎙️' },
    { id: 3, user: 'نور الهدى', text: 'فلتر السايبربنك رائع جداً! ✨' },
  ]);
  const [newComment, setNewComment] = useState('');

  const triggerHeart = () => {
    sounds.playReceive();
    const id = Date.now() + Math.random();
    const newHeart = {
      id,
      x: Math.random() * 50 + 25, // percentage
      size: Math.random() * 16 + 20
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1800);
  };

  const handleSendGift = (gift) => {
    sounds.playGift();
    setActiveGiftBanner({
      sender: `${currentUser.firstName}`,
      gift: gift.label,
      icon: gift.icon
    });
    setComments(prev => [
      ...prev,
      { id: Date.now(), user: 'نظام الهدايا 🎁', text: `أرسل ${currentUser.firstName} هدية: ${gift.label}!` }
    ]);
    setTimeout(() => {
      setActiveGiftBanner(null);
    }, 3500);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    sounds.playSend();
    setComments(prev => [...prev, { id: Date.now(), user: `${currentUser.firstName}`, text: newComment.trim() }]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-rose-500/40 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/80">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-lg text-xs font-bold tracking-wider">
              LIVE • ساحة البث المباشر
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 rounded-lg text-xs text-gray-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{viewersCount} مشاهد الآن</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Video Stage (Left 2 cols) */}
          <div className="lg:col-span-2 p-4 flex flex-col justify-between bg-[#070b14] relative overflow-hidden">
            
            {/* Stage Screen Simulation */}
            <div className="w-full flex-1 min-h-[320px] rounded-2xl bg-gradient-to-tr from-purple-950/70 via-slate-900 to-indigo-950/70 border border-white/10 relative flex items-center justify-center overflow-hidden">
              
              {/* Floating Hearts */}
              {floatingHearts.map(h => (
                <div
                  key={h.id}
                  className="absolute pointer-events-none text-rose-500 animate-bounce transition-all duration-1000"
                  style={{
                    bottom: '20px',
                    left: `${h.x}%`,
                    fontSize: `${h.size}px`,
                    opacity: 0.9
                  }}
                >
                  ❤️
                </div>
              ))}

              {/* Active Gift Banner */}
              {activeGiftBanner && (
                <div className="absolute top-4 inset-x-8 p-3 rounded-2xl bg-gradient-to-r from-amber-500/90 via-purple-600/90 to-cyan-500/90 text-white text-center shadow-2xl z-20 animate-in slide-in-from-top duration-300 border border-white/30 backdrop-blur-md">
                  <div className="flex items-center justify-center gap-2 font-black text-sm">
                    <span className="text-2xl">{activeGiftBanner.icon}</span>
                    <span>{activeGiftBanner.sender} أرسل للتو: {activeGiftBanner.gift}!</span>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                  </div>
                </div>
              )}

              {isScreenSharing ? (
                <div className="text-center space-y-2 animate-in fade-in">
                  <MonitorUp className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                  <h4 className="font-bold text-sm text-white">مشاركة الشاشة بجودة فائقة (4K Ultra-Res Screen Share)</h4>
                  <p className="text-xs text-cyan-300">يتم بث شاشة حاسوبك للأعضاء مباشرة الآن</p>
                </div>
              ) : isVideoOn ? (
                <div className="text-center space-y-2">
                  <div className={`w-32 h-32 rounded-3xl overflow-hidden mx-auto border-4 ${
                    selectedFilter !== 'none' ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.8)]' : 'border-purple-500/40'
                  } transition-all`}>
                    <img src={currentUser.avatar} alt="Host" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{currentUser.firstName} {currentUser.lastName} (المضيف)</h3>
                  
                  {selectedFilter !== 'none' && (
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold animate-pulse">
                      فلتر الواقع المعزز: {arFilters.find(f => f.id === selectedFilter)?.label}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <VideoOff className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xs">الكاميرا متوقفة</p>
                </div>
              )}

              {/* Noise Cancellation Badge */}
              {isNoiseCancelled && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[10px] text-emerald-300 font-bold flex items-center gap-1 backdrop-blur-md">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>عزل الضوضاء الذكي نشط (AI Noise Cancel)</span>
                </div>
              )}
            </div>

            {/* Stage Controls & Gifting Toolbar */}
            <div className="mt-3 space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2.5 rounded-xl transition ${isMicOn ? 'bg-purple-600 text-white' : 'bg-rose-600 text-white'}`}
                    title="الميكروفون"
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-2.5 rounded-xl transition ${isVideoOn ? 'bg-purple-600 text-white' : 'bg-rose-600 text-white'}`}
                    title="الكاميرا"
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-bold ${
                      isScreenSharing ? 'bg-cyan-600 text-white shadow-glow' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <MonitorUp className="w-4 h-4 text-cyan-300" />
                    <span>مشاركة الشاشة</span>
                  </button>
                  <button
                    onClick={() => setIsNoiseCancelled(!isNoiseCancelled)}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-bold ${
                      isNoiseCancelled ? 'bg-emerald-600 text-white shadow-glow' : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>عزل الضوضاء</span>
                  </button>
                </div>

                {/* AR Filter */}
                <div className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-purple-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="bg-[#1e293b] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {arFilters.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Gift Bar */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    <span>إرسال هدية حية:</span>
                  </span>
                  {STREAM_GIFTS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleSendGift(g)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-amber-500/30 border border-white/10 hover:border-amber-400 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 active:scale-95"
                    >
                      <span>{g.icon}</span>
                      <span>{g.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Floating Heart Button */}
                <button
                  onClick={triggerHeart}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-glow active:scale-90"
                  title="إرسال قلوب متطايرة على الشاشة"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>إرسال قلب ❤️</span>
                </button>
              </div>

            </div>

          </div>

          {/* Live Chat Ticker (Right col) */}
          <div className="border-t lg:border-t-0 lg:border-r border-white/10 bg-[#0f172a] p-4 flex flex-col justify-between h-72 lg:h-auto">
            <h4 className="font-bold text-xs text-purple-300 mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>محادثة البث التفاعلية المباشرة</span>
            </h4>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {comments.map(c => (
                <div key={c.id} className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-0.5 text-right">
                  <span className="font-bold text-cyan-300 block text-[11px]">{c.user}:</span>
                  <span className="text-gray-200">{c.text}</span>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="شارك تعليقك في البث..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 text-right"
              />
              <button 
                type="submit" 
                className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition shadow-glow active:scale-95"
              >
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
