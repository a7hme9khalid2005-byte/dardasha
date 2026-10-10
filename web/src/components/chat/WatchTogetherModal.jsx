import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Tv, Play, Pause, Volume2, VolumeX, MessageSquare, Send, 
  Sparkles, Heart, Flame, ThumbsUp, Laugh, Rocket, Users, Radio, Maximize 
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const SAMPLE_FEEDS = [
  {
    id: 'space-journey',
    title: 'رحلة إلى أعماق الفضاء والكون 🚀',
    category: 'علوم وفضاء',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    duration: '09:56'
  },
  {
    id: 'cyber-future',
    title: 'تطور الذكاء الاصطناعي وثورة المستقبل 2026 🤖',
    category: 'تقنية وبرمجة',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    duration: '10:53'
  },
  {
    id: 'nature-4k',
    title: 'مشاهد طبيعية ساحرة بجودة فائقة 🌿',
    category: 'استرخاء وطبيعة',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    duration: '00:15'
  }
];

export default function WatchTogetherModal({ isOpen, onClose, contactName }) {
  if (!isOpen) return null;

  const [activeFeed, setActiveFeed] = useState(SAMPLE_FEEDS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [roomMessages, setRoomMessages] = useState([
    { id: 1, sender: contactName || 'صديقك', text: 'أهلاً! الفيديو متزامن تماماً لكلينا الآن 🎬' },
    { id: 2, sender: 'أنت', text: 'رائع جداً! استمتع بالمشاهدة معنا ✨' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [roomMessages]);

  const togglePlay = () => {
    sounds.playClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSendReaction = (emoji) => {
    sounds.playReceive();
    const id = Date.now() + Math.random();
    setReactions(prev => [...prev, { id, emoji, x: Math.random() * 60 + 20 }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sounds.playSend();
    setRoomMessages(prev => [...prev, { id: Date.now(), sender: 'أنت', text: chatInput.trim() }]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-[#0f172a] rounded-3xl border border-purple-500/40 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-glow">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">غرفة المشاهدة المتزامنة (Watch Together Room)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  متزامن بالمللي ثانية
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                تشاهد الآن بشكل حي ومشترك مع <strong className="text-cyan-300">{contactName || 'صديقك'}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Stage Grid: Video Left / Live Chat Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Main Video Viewport (8 Cols) */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between bg-[#070b14] relative">
            
            {/* Video Player Box */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group flex items-center justify-center">
              <video
                ref={videoRef}
                src={activeFeed.videoUrl}
                poster={activeFeed.poster}
                autoPlay
                playsInline
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              />

              {/* Floating Reaction Sprinkles */}
              {reactions.map(r => (
                <div
                  key={r.id}
                  className="absolute bottom-6 text-3xl pointer-events-none animate-bounce"
                  style={{ left: `${r.x}%`, animationDuration: '1.2s' }}
                >
                  {r.emoji}
                </div>
              ))}

              {/* Player Overlay Controls on Hover */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-xs font-mono text-gray-300">
                    {activeFeed.title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-600/60 font-mono font-bold text-white">
                    HD 1080p
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Reactions Bar */}
            <div className="mt-3 flex items-center justify-between gap-2 p-2.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold">تفاعلات فورية:</span>
                {['❤️', '🔥', '👏', '😂', '🚀', '😍'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="text-lg hover:scale-130 active:scale-95 transition p-1"
                    title="إرسال تفاعل فوري على شاشة الفيديو"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-1.5">
                <select
                  value={activeFeed.id}
                  onChange={(e) => {
                    const f = SAMPLE_FEEDS.find(feed => feed.id === e.target.value);
                    if (f) setActiveFeed(f);
                  }}
                  className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
                >
                  {SAMPLE_FEEDS.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Real-time Side Chat Stream (4 Cols) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-r border-white/10 bg-[#0b0f19] p-4 flex flex-col justify-between h-72 lg:h-auto">
            <div>
              <h4 className="font-bold text-xs text-cyan-300 flex items-center gap-1.5 pb-2 border-b border-white/10 mb-3">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>محادثة غرفة المشاهدة المباشرة</span>
              </h4>

              {/* Messages list */}
              <div 
                ref={chatEndRef}
                className="space-y-2 overflow-y-auto max-h-[380px] pr-1 text-xs"
              >
                {roomMessages.map(m => (
                  <div 
                    key={m.id} 
                    className={`p-2.5 rounded-2xl text-right ${
                      m.sender === 'أنت' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 text-white mr-4' 
                        : 'bg-white/5 border border-white/5 text-gray-200 ml-4'
                    }`}
                  >
                    <span className="font-bold text-[10px] text-cyan-300 block mb-0.5">{m.sender}:</span>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-1.5 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="شارك تعليقك أثناء المشاهدة..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-right"
              />
              <button
                type="submit"
                className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl shadow-glow transition active:scale-95"
              >
                <Send className="w-4 h-4 -rotate-90" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
