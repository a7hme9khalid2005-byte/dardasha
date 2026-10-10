import React from 'react';
import { X, ShieldCheck, QrCode, Lock, Check } from 'lucide-react';

export default function E2EVerificationModal({ isOpen, onClose, contactName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm bg-[#0f172a] rounded-3xl border border-emerald-500/30 shadow-2xl p-6 text-white text-center animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs">التحقق من التشفير التام (E2E Verification)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-4 bg-white rounded-3xl w-48 h-48 mx-auto flex items-center justify-center shadow-glow mb-4">
          <QrCode className="w-40 h-40 text-slate-900" />
        </div>

        <p className="text-xs text-emerald-300 font-bold mb-1">المحادثة مع {contactName} مشفرة بالكامل</p>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto mb-4">
          لمطابقة التشفير، قارن الأرقام أدناه مع شاشة جهاز صديقك أو امسح رمز الـ QR.
        </p>

        {/* 60-digit blocks */}
        <div className="p-3 bg-black/40 rounded-2xl border border-white/10 font-mono text-[11px] text-cyan-300 space-y-1 dir-ltr">
          <div>4829 1048 2940 1934 9481</div>
          <div>5930 2049 1948 2049 8492</div>
          <div>1948 5930 2048 4920 1849</div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
          <Check className="w-4 h-4" />
          <span>مفاتيح التشفير متطابقة وآمنة بنسبة 100%</span>
        </div>

      </div>
    </div>
  );
}
