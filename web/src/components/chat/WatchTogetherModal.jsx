import React, { useState } from 'react';
import { X, Tv, Music, Play, Pause, ExternalLink, Sparkles } from 'lucide-react';

export default function WatchTogetherModal({ isOpen, onClose, contactName }) {
  if (!isOpen) return null;

  const [activeMedia, setActiveMedia] = useState({
    title: 'مقطع استماع مشترك (Co-Listen Audio)',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    isPlaying: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">مشاركة واستماع متزامن (Watch & Listen Together)</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                متزامن الآن بالمللي ثانية مع {contactName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Container */}
        <div className="bg-[#0b0f19] rounded-2xl p-5 border border-white/10 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center mx-auto shadow-glow">
            <Music className="w-8 h-8 text-white animate-bounce" />
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">{activeMedia.title}</h4>
            <p className="text-xs text-gray-400 mt-1">البث المباشر يعمل لكليكما في نفس الوقت</p>
          </div>

          {/* Embedded Audio */}
          <div className="pt-2">
            <audio controls autoPlay src={activeMedia.url} className="w-full h-10 rounded-xl" />
          </div>
        </div>

        {/* Preset quick streams */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-bold text-gray-400 block">قنوات وقوائم سريعة مقترحة:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setActiveMedia({
                title: 'موسيقى هادئة وتركيز (Lo-Fi Chill)',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                type: 'audio',
                isPlaying: true
              })}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-right text-purple-300 font-semibold transition"
            >
              🎧 تركيز وهدوء
            </button>
            <button
              onClick={() => setActiveMedia({
                title: 'بودكاست تقني مميز (Tech Discussion)',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                type: 'audio',
                isPlaying: true
              })}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-right text-cyan-300 font-semibold transition"
            >
              🎙️ بودكاست مشترك
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
