import React from 'react';
import { X, Volume2, Smile, Sparkles } from 'lucide-react';

const soundStickersList = [
  { id: 'ss1', title: 'ضحكة طريفة 😂', audioText: 'هاهاهاها!', emoji: '😂', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'ss2', title: 'تصفيق حار 👏', audioText: 'برافو رائع!', emoji: '👏', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'ss3', title: 'احتفال وبوق 🎺', audioText: 'تادا!', emoji: '🎉', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'ss4', title: 'صدمة واندهاش 😱', audioText: 'يا إلهي!', emoji: '😱', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'ss5', title: 'قلب وحب ❤️', audioText: 'أحبك!', emoji: '❤️', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'ss6', title: 'نوم وشخير 😴', audioText: 'زززز!', emoji: '😴', soundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
];

export default function SoundStickersDrawer({ isOpen, onClose, onSendSoundSticker }) {
  if (!isOpen) return null;

  const playPreviewAndSend = (sticker) => {
    // Play preview
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
    onSendSoundSticker(sticker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl p-5 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-xs">الملصقات الصوتية التفاعلية (Sound Stickers)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mb-3 text-right">
          اختر ملصقاً يصدر صوتاً حياً مرحاً عند النقر عليه داخل المحادثة:
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
