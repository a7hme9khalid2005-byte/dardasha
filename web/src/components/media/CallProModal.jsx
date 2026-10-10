import React, { useState, useEffect } from 'react';
import { 
  X, Video, Mic, MicOff, Volume2, Activity, Wifi, Shield, 
  Sparkles, Layers, Sliders, Minimize2, Maximize2, Monitor
} from 'lucide-react';

const virtual3dBackgrounds = [
  { id: 'space-station', name: 'محطة الفضاء المدارية 🛰️', gradient: 'from-purple-950 via-slate-900 to-indigo-950' },
  { id: 'cyberpunk-neon', name: 'مدينة السايبربنك النيونية 🏙️', gradient: 'from-fuchsia-950 via-slate-900 to-cyan-950' },
  { id: 'zen-garden', name: 'واحة الطبيعة الهادئة 🌿', gradient: 'from-emerald-950 via-slate-900 to-teal-950' },
  { id: 'cosmic-beach', name: 'الشاطئ الكوني المتلألئ 🌌', gradient: 'from-blue-950 via-indigo-950 to-purple-950' },
];

export default function CallProModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [activeBg, setActiveBg] = useState(virtual3dBackgrounds[0].id);
  const [dataSaver, setDataSaver] = useState(true); // Item 41
  const [pipActive, setPipActive] = useState(false); // Item 43
  const [ping, setPing] = useState(18); // Item 44
  const [bitrate, setBitrate] = useState('1,420 kbps'); // Item 44
  const [isTalkingPush, setIsTalkingPush] = useState(false); // Item 47
  
  // Item 48: Per-User Volume
  const [userVolumes, setUserVolumes] = useState({
    user1: 90,
    user2: 75,
    user3: 100
  });

  // Spacebar Push-to-Talk listener (Item 47)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        setIsTalkingPush(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsTalkingPush(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const currentBgObj = virtual3dBackgrounds.find(b => b.id === activeBg) || virtual3dBackgrounds[0];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
      pipActive ? 'bottom-4 left-4 inset-auto w-80 h-96 p-0 z-50 pointer-events-auto' : 'bg-black/85 backdrop-blur-md'
    }`}>
      <div className={`relative w-full ${
        pipActive ? 'h-full rounded-2xl border-2 border-cyan-400' : 'max-w-4xl rounded-3xl border border-cyan-500/30'
      } bg-[#0f172a] shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">غرفة الاتصال المرئي الفائق (Pro Call Suite)</h3>
              <p className="text-[10px] text-gray-400">خلفيات 3D، توفير البيانات، ومؤشر البينغ الحي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Item 43: Picture-in-Picture Toggle */}
            <button
              onClick={() => setPipActive(!pipActive)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 transition"
              title="نافذة عائمة (Picture-in-Picture)"
            >
              {pipActive ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Stage with Virtual 3D Background (Item 39) */}
        <div className={`relative flex-1 min-h-[220px] bg-gradient-to-br ${currentBgObj.gradient} flex items-center justify-center p-4 overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          
          {/* Main User Video Avatar Card */}
          <div className="relative text-center space-y-2 z-10">
            <div className="relative inline-block">
              <img
                src={currentUser?.avatar}
                alt="Avatar"
                className={`w-28 h-28 rounded-3xl border-4 object-cover shadow-2xl transition ${
                  isTalkingPush ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.9)] scale-105' : 'border-cyan-400 shadow-glow'
                }`}
              />
              <div className={`absolute -bottom-2 right-1/2 transform translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                isTalkingPush ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-black/60 text-white border border-white/20'
              }`}>
                {isTalkingPush ? '🎙️ يتحدث الآن' : 'مايك هادئ'}
              </div>
            </div>

            <h4 className="text-sm font-black text-white">{currentUser?.firstName} (أنت)</h4>
          </div>

          {/* Item 44: Real-time Connection Monitor overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-3 text-[11px] font-mono z-10">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Ping: {ping}ms
            </span>
            <span className="text-cyan-300">Bitrate: {bitrate}</span>
          </div>

          {/* Item 41: Ultra Data Saver Indicator */}
          {dataSaver && (
            <div className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-500/30 text-[10px] text-amber-300 font-bold z-10">
              ⚡ وضع توفير البيانات نشط (2G/3G Saver)
            </div>
          )}

          {/* Item 47: Push to Talk Hint */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-gray-300 border border-white/10 z-10">
            💡 اضغط واستمر على <strong className="text-cyan-300">مسطرة المسافة (Spacebar)</strong> للتحدث الفوري
          </div>
        </div>

        {/* Lower Controls Bar (Hidden in PiP mode) */}
        {!pipActive && (
          <div className="p-4 bg-[#0b0f19] border-t border-white/10 space-y-4">
            
            {/* 3D Virtual Background Switcher */}
            <div>
              <span className="text-xs font-bold text-gray-300 block mb-2 text-right">الخلفيات التفاعلية ثلاثية الأبعاد (3D Stage):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {virtual3dBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setActiveBg(bg.id)}
                    className={`p-2 rounded-xl border text-center transition text-xs font-bold ${
                      activeBg === bg.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-glow'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-User Volume Sliders */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-purple-300 block text-right">ميكسر الصوت المستقل لكل متحدث:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span>طارق العلي</span>
                    <span>{userVolumes.user1}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={userVolumes.user1}
                    onChange={(e) => setUserVolumes(v => ({ ...v, user1: e.target.value }))}
                    className="w-full accent-cyan-400 h-1 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span>سارة خالد</span>
                    <span>{userVolumes.user2}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={userVolumes.user2}
                    onChange={(e) => setUserVolumes(v => ({ ...v, user2: e.target.value }))}
                    className="w-full accent-cyan-400 h-1 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span>أحمد المنصور</span>
                    <span>{userVolumes.user3}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={userVolumes.user3}
                    onChange={(e) => setUserVolumes(v => ({ ...v, user3: e.target.value }))}
                    className="w-full accent-cyan-400 h-1 rounded-lg"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
