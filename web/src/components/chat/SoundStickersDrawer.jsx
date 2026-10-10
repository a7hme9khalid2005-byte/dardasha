import React from 'react';
import { X, Volume2, Sparkles, Smile } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const soundStickersList = [
  { id: 'ss1', title: 'ضحكة طريفة 😂', audioText: 'هاهاهاها!', emoji: '😂' },
  { id: 'ss2', title: 'تصفيق حار 👏', audioText: 'برافو رائع!', emoji: '👏' },
  { id: 'ss3', title: 'احتفال وبوق 🎺', audioText: 'تادا احتفال!', emoji: '🎉' },
  { id: 'ss4', title: 'صدمة واندهاش 😱', audioText: 'يا إلهي صدمة!', emoji: '😱' },
  { id: 'ss5', title: 'قلب وحب ❤️', audioText: 'أحبك ومشاعر!', emoji: '❤️' },
  { id: 'ss6', title: 'نوم وشخير 😴', audioText: 'زززز نوم!', emoji: '😴' },
];

export default function SoundStickersDrawer({ isOpen, onClose, onSendSoundSticker }) {
  if (!isOpen) return null;

  const playPreviewAndSend = (sticker) => {
    // Play preview using native Web Audio API synthesizer
    sounds.playStickerSound(sticker.id);
    onSendSoundSticker(sticker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl p-5 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs">الملصقات الصوتية التفاعلية (Sound Stickers)</h3>
              <span className="text-[10px] text-cyan-300 font-mono">Web Audio Synthesizer ⚡</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mb-3 text-right">
          اختر ملصقاً صوتياً مولداً ذاتياً عبر Web Audio API يصدر نغمة عند النقر عليه في الدردشة:
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {soundStickersList.map(st => (
            <button
              key={st.id}
              onClick={() => playPreviewAndSend(st)}
              className="p-3 bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-400 rounded-2xl flex items-center justify-between transition group text-right active:scale-95"
            >
              <div className="text-right">
                <span className="font-bold text-xs text-white block">{st.title}</span>
                <span className="text-[10px] text-purple-300 font-mono">{st.audioText}</span>
              </div>
              <span className="text-2xl group-hover:scale-125 transition">{st.emoji}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
