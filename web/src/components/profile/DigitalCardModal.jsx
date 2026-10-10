import React from 'react';
import { X, Sparkles, QrCode, ShieldCheck, Share2, Copy, Check } from 'lucide-react';

export default function DigitalCardModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [copied, setCopied] = React.useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://dardasha.app/@${currentUser.email.split('@')[0]}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm bg-[#0f172a] rounded-3xl border border-cyan-500/30 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs">بطاقة الهوية الرقمية (Dardasha 3D ID)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Holographic Card Container */}
        <div className="w-full h-80 rounded-3xl bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-cyan-900/90 p-5 border border-white/20 shadow-glow relative overflow-hidden flex flex-col justify-between group hover:rotate-1 hover:scale-105 transition-all duration-300">
          
          {/* Ambient Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>

          {/* Top row: Brand & Level */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <img src="/app-icon.png" alt="Dardasha" className="w-6 h-6 rounded-lg ring-1 ring-white/20 shadow" />
              <span className="font-black text-sm tracking-wider text-cyan-300">DARDASHA VIP</span>
            </div>
            <span className="px-2.5 py-0.5 bg-black/40 border border-cyan-500/30 rounded-full text-[10px] text-cyan-400 font-mono">
              LEVEL 12 ★
            </span>
          </div>

          {/* Center: Avatar & Names */}
          <div className="flex flex-col items-center text-center z-10 space-y-2">
            <div className="relative">
              <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl border-2 border-cyan-400 shadow-glow-accent object-cover" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-white">{currentUser.firstName} {currentUser.lastName}</h2>
              <p className="text-xs text-purple-300 font-mono">@{currentUser.email.split('@')[0]}</p>
            </div>
          </div>

          {/* Bottom QR & Key */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-mono">معرف الأمان المشفر:</span>
              <span className="text-[11px] text-cyan-300 font-mono font-bold">SHA-256 #DARD-{currentUser.id?.slice(0, 8)}</span>
            </div>
            <div className="p-1.5 bg-white rounded-xl shadow">
              <QrCode className="w-8 h-8 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط بطاقتي'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition"
          >
            تم
          </button>
        </div>

      </div>
    </div>
  );
}
