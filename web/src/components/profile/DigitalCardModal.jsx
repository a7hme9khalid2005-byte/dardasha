import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, QrCode, ShieldCheck, Share2, Copy, Check, 
  RotateCw, ExternalLink, Globe, Twitter, Github, Award, Crown 
} from 'lucide-react';
import QRCode from 'qrcode';
import { sounds } from '../../utils/soundEffects';

export default function DigitalCardModal({ isOpen, onClose, currentUser }) {
  if (!isOpen || !currentUser) return null;

  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const cleanUsername = currentUser.username 
    ? currentUser.username.replace(/^@/, '') 
    : (currentUser.email ? currentUser.email.split('@')[0] : 'user');

  const cardProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${cleanUsername}`
    : `https://dardasha.app/@${cleanUsername}`;

  // Generate real QR code for the user profile link
  useEffect(() => {
    QRCode.toDataURL(cardProfileUrl, {
      margin: 2,
      width: 240,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate card QR:', err));
  }, [cardProfileUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardProfileUrl);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlip = () => {
    sounds.playClick();
    setIsFlipped(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-3xl border border-cyan-500/40 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">بطاقة العمل والهوية الرقمية ثلاثية الأبعاد</h3>
              <p className="text-[10px] text-cyan-300 font-mono">3D Flippable Virtual Card</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Flippable Container */}
        <div 
          className="w-full h-96 relative cursor-pointer select-none"
          style={{ perspective: '1200px' }}
          onClick={handleFlip}
          title="انقر لقلب البطاقة (3D Flip)"
        >
          <div 
            className="w-full h-full relative transition-transform duration-700 ease-out"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            
            {/* ================= CARD FRONT ================= */}
            <div 
              className="absolute inset-0 w-full h-full rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-950 via-[#0b1021] to-cyan-950"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              {/* Holographic Sheen Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Row: App Logo & VIP Badge */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/30 shadow-md">
                    <img src="/app-icon.png" alt="Dardasha" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-wide text-white block">DARDASHA</span>
                    <span className="text-[9px] text-cyan-300 font-mono font-bold">DIGITAL IDENTITY</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-[10px] font-black">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>VIP MEMBER</span>
                </div>
              </div>

              {/* Center: Avatar & Full Details */}
              <div className="flex flex-col items-center text-center z-10 space-y-2">
                <div className="relative group">
                  <img 
                    src={currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-3xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] object-cover bg-slate-900" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-white tracking-wide">
                    {currentUser.firstName} {currentUser.lastName}
                  </h2>
                  <p className="text-xs text-cyan-300 font-mono font-bold mt-0.5">
                    @{cleanUsername}
                  </p>
                </div>

                <p className="text-xs text-gray-300 max-w-xs line-clamp-2 leading-relaxed px-2">
                  {currentUser.bio || 'عضو مميز في مجتمع دردشة للتواصل الذكي والتشفير الفائق 🌟'}
                </p>
              </div>

              {/* Bottom: E2EE Hash & Flip Hint */}
              <div className="flex items-center justify-between z-10 pt-3 border-t border-white/10 text-xs">
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 block font-mono">رمز الأمان المشفر:</span>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold">
                    E2EE #DAR-{String(currentUser.id || '2026').slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-purple-300 font-bold bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>اقلب البطاقة ⟲</span>
                </div>
              </div>
            </div>

            {/* ================= CARD BACK ================= */}
            <div 
              className="absolute inset-0 w-full h-full rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b1021] via-slate-900 to-purple-950 text-right"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Back Top: Title & Flip button */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 z-10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>رمز QR الشخصي للاتصال الفوري</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                  <span>انقر للوجه الأمامي ⟲</span>
                </div>
              </div>

              {/* Back Center: Crisp QR Code */}
              <div className="flex flex-col items-center justify-center my-auto z-10 space-y-2">
                <div className="p-3 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-2 border-cyan-400/50">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="User QR" 
                      className="w-32 h-32 object-contain" 
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-slate-900 font-mono text-xs">
                      جاري التحميل...
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-300 text-center block">
                  امسح بكاميرا الهاتف لإضافة @{cleanUsername} مباشرة إلى دردشة
                </span>
              </div>

              {/* Back Bottom: Quick Socials & Phone */}
              <div className="pt-2 border-t border-white/10 z-10 space-y-1 text-xs">
                {currentUser.phone && (
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span className="text-gray-400">الهاتف الموثق:</span>
                    <span className="font-mono text-cyan-300 dir-ltr">{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.website && (
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span className="text-gray-400">الموقع:</span>
                    <span className="font-mono text-purple-300 truncate max-w-[180px]">{currentUser.website}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold pt-1">
                  <span>موثق بنظام التشفير التام 100%</span>
                  <span>Dardasha Verified 🛡️</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Controls / Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleFlip}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-glow"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'الوجه الأمامي' : 'اقلب إلى رمز الـ QR 🔄'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط بطاقتي'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
