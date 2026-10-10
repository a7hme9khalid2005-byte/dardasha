import React, { useState } from 'react';
import { X, Navigation, Radio, MapPin, Shield, MessageSquare, UserCheck } from 'lucide-react';

export default function RadarModal({ isOpen, onClose, onStartChat }) {
  if (!isOpen) return null;

  const [range, setRange] = useState('2km');
  const [isDiscoverable, setIsDiscoverable] = useState(true);

  const nearbyUsers = [
    { id: 'near-1', name: 'طارق العلي', distance: '350 متر', bio: 'مصمم واجهات ومتحمس للتقنية 🎨', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Tariq&backgroundColor=06b6d4' },
    { id: 'near-2', name: 'ليلى منصور', distance: '1.2 كم', bio: 'قهوة وكتب وسفر ☕📖', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Layla&backgroundColor=ec4899' },
    { id: 'near-3', name: 'خالد السعيد', distance: '1.8 كم', bio: 'مطور برمجيات ومهتم بالذكاء الاصطناعي 💻', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Khaled&backgroundColor=8b5cf6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-cyan-500/30 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm">رادار الأصدقاء القريبين (Nearby Radar)</h3>
              <p className="text-[11px] text-gray-400">اكتشف وتواصل مع أعضاء دردشة في محيطك</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radar Graphic Simulation */}
        <div className="relative w-44 h-44 mx-auto my-3 rounded-full border-2 border-cyan-500/30 bg-[#070b14] flex items-center justify-center overflow-hidden">
          {/* Concentric rings */}
          <div className="absolute w-32 h-32 rounded-full border border-cyan-500/20"></div>
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20"></div>
          {/* Rotating sonar beam */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent animate-spin origin-center" style={{ animationDuration: '3s' }}></div>
          {/* Center blip */}
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-glow-accent z-10"></div>
          {/* Discovered blips */}
          <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-purple-400 animate-ping"></div>
          <div className="absolute bottom-10 left-10 w-3 h-3 rounded-full bg-rose-400 animate-ping"></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-xs py-2 border-y border-white/10 my-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">نطاق البحث:</span>
            {['500m', '2km', '5km'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${range === r ? 'bg-cyan-600 text-white shadow-glow' : 'bg-white/5 text-gray-400'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
            <input
              type="checkbox"
              checked={isDiscoverable}
              onChange={(e) => setIsDiscoverable(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className="text-[11px] font-bold">الظهور على الرادار</span>
          </label>
        </div>

        {/* Discovered List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {nearbyUsers.map(user => (
            <div key={user.id} className="p-2.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-xl border border-cyan-400/40" />
                <div className="text-right">
                  <h4 className="font-bold text-white flex items-center gap-1">
                    <span>{user.name}</span>
                    <span className="text-[10px] text-cyan-300 font-mono">({user.distance})</span>
                  </h4>
                  <p className="text-[10px] text-gray-400">{user.bio}</p>
                </div>
              </div>
              <button
                onClick={() => { onStartChat(user); onClose(); }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>محادثة</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
