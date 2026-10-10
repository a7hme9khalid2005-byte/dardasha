import React, { useState } from 'react';
import { 
  X, Radio, Users, Sparkles, MonitorUp, Mic, MicOff, Video, VideoOff, 
  Smile, Shield, MessageCircle, Heart, Share2, Volume2
} from 'lucide-react';

const arFilters = [
  { id: 'none', label: 'بدون فلتر 🚫' },
  { id: 'cyber', label: 'سايبربنك 🥽' },
  { id: 'halo', label: 'هالة ذهبية ✨' },
  { id: 'neon', label: 'نظارة نيون 🕶️' },
  { id: 'cinematic', label: 'سينمائي 🎬' },
];

export default function LiveStreamModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false); // Item 24
  const [isNoiseCancelled, setIsNoiseCancelled] = useState(true); // Item 25
  const [selectedFilter, setSelectedFilter] = useState('none'); // Item 22
  const [viewersCount, setViewersCount] = useState(148);
  const [comments, setComments] = useState([
    { id: 1, user: 'سارة خالد', text: 'بث أسطوري بالتوفيق! 🔥' },
    { id: 2, user: 'عمر التميمي', text: 'الصوت واضح جداً مع عزل الضوضاء 🎙️' },
    { id: 3, user: 'نور الهدى', text: 'الفلتر رائع جداً! ✨' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: `${currentUser.firstName}`, text: newComment.trim() }]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-lg text-xs font-bold tracking-wider">
              LIVE • بث مباشر
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 rounded-lg text-xs text-gray-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{viewersCount} مشاهد</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Video Stage (Left 2 cols) */}
          <div className="lg:col-span-2 p-4 flex flex-col justify-between bg-[#070b14] relative">
            
            {/* Stage Screen Simulation */}
            <div className="w-full flex-1 min-h-[300px] rounded-2xl bg-gradient-to-tr from-purple-950/60 via-slate-900 to-indigo-950/60 border border-white/10 relative flex items-center justify-center overflow-hidden">
              
              {isScreenSharing ? (
                /* Item 24: Screen Share Display */
                <div className="text-center space-y-2 animate-in fade-in">
                  <MonitorUp className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                  <h4 className="font-bold text-sm text-white">مشاركة الشاشة بجودة فائقة (4K Ultra-Res Screen Share)</h4>
                  <p className="text-xs text-cyan-300">يتم بث شاشة حاسوبك للأعضاء مباشرة الآن</p>
                </div>
              ) : isVideoOn ? (
                <div className="text-center space-y-2">
                  <div className={`w-32 h-32 rounded-3xl overflow-hidden mx-auto border-4 ${selectedFilter !== 'none' ? 'border-cyan-400 shadow-glow-accent' : 'border-purple-500/40'} transition-all`}>
                    <img src={currentUser.avatar} alt="Host" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{currentUser.firstName} {currentUser.lastName} (المضيف)</h3>
                  
                  {/* Item 22: Active AR Filter Badge */}
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

              {/* Item 25: AI Noise Cancellation Active Badge */}
              {isNoiseCancelled && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[10px] text-emerald-300 font-bold flex items-center gap-1 backdrop-blur-md">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>عزل الضوضاء الذكي نشط (AI Noise Cancel)</span>
                </div>
              )}
            </div>

            {/* Stage Controls Toolbar */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/10 text-xs">
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
                {/* Item 24: Screen Share */}
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-bold ${isScreenSharing ? 'bg-cyan-600 text-white shadow-glow' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'}`}
                  title="مشاركة الشاشة بجودة 4K"
                >
                  <MonitorUp className="w-4 h-4 text-cyan-300" />
                  <span>مشاركة الشاشة</span>
                </button>
                {/* Item 25: AI Noise Cancellation */}
                <button
                  onClick={() => setIsNoiseCancelled(!isNoiseCancelled)}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-bold ${isNoiseCancelled ? 'bg-emerald-600 text-white shadow-glow' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                  title="عزل الضوضاء بالذكاء الاصطناعي"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>عزل الضوضاء</span>
                </button>
              </div>

              {/* Item 22: AR Filter Selector */}
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

          </div>

          {/* Live Chat Ticker (Right col) */}
          <div className="border-t lg:border-t-0 lg:border-r border-white/10 bg-[#0f172a] p-4 flex flex-col justify-between h-72 lg:h-auto">
            <h4 className="font-bold text-xs text-purple-300 mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>محادثة البث المباشر</span>
            </h4>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {comments.map(c => (
                <div key={c.id} className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
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
                className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button type="submit" className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl">
                <Heart className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
