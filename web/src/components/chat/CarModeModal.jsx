import React, { useState } from 'react';
import { X, Car, Mic, Phone, Volume2, Navigation, CheckCircle } from 'lucide-react';

export default function CarModeModal({ isOpen, onClose, onQuickReply }) {
  if (!isOpen) return null;

  const [isListening, setIsListening] = useState(false);
  const [lastSent, setLastSent] = useState('');

  const sendQuick = (text) => {
    onQuickReply(text);
    setLastSent(text);
    setTimeout(() => setLastSent(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0b0f19] rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 text-white flex flex-col justify-between min-h-[500px]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-300">وضع القيادة الآمن (Hands-Free Car Mode)</h2>
              <p className="text-xs text-gray-400">واجهة عملاقة عالية الوضوح لسلامتك على الطريق</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback indicator */}
        {lastSent && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-emerald-300 font-bold text-sm animate-in fade-in">
            ✅ تم إرسال: "{lastSent}"
          </div>
        )}

        {/* Giant Voice Action Center */}
        <div className="my-6 text-center space-y-3">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-36 h-36 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening ? 'bg-rose-600 scale-110 shadow-glow animate-pulse' : 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-2xl hover:scale-105'
            }`}
          >
            <Mic className="w-16 h-16 text-white" />
          </button>
          <h3 className="font-bold text-base text-white">
            {isListening ? 'جاري الاستماع لصوتك والرد تلقائياً...' : 'المس المايك العملاق للتحدث والرد بصوتك'}
          </h3>
        </div>

        {/* Giant One-Tap Quick Replies */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 block text-right">ردود سريعة بلمسة واحدة:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => sendQuick('أنا أقود السيارة حالياً، سأتواصل معك فور وصولي 🚗')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center font-bold text-sm text-amber-200 transition active:scale-95"
            >
              🚗 أنا في الطريق وأقود
            </button>
            <button
              onClick={() => sendQuick('وصلت بسلام ولله الحمد 📍')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center font-bold text-sm text-cyan-200 transition active:scale-95"
            >
              📍 وصلت بسلام
            </button>
            <button
              onClick={() => sendQuick('اتصل بي هاتفياً للضرورة 📞')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center font-bold text-sm text-purple-200 transition active:scale-95"
            >
              📞 اتصل بي صوتياً
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
