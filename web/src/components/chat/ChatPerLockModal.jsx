import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, AlertCircle } from 'lucide-react';

export default function ChatPerLockModal({ isOpen, onClose, contactName, onUnlocked }) {
  if (!isOpen) return null;

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (pin === '1234' || pin === '0000' || pin.length >= 4) {
      onUnlocked();
      onClose();
    } else {
      setError('رمز PIN غير صحيح (الرمز الافتراضي: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xs bg-[#0f172a] rounded-3xl border border-rose-500/30 shadow-2xl p-6 text-white text-center animate-in zoom-in-95">
        
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-bold text-sm text-white">المحادثة محمية برمز سري</h3>
        <p className="text-[11px] text-gray-400 mt-1 mb-4">
          أدخل رمز PIN الخاص لفتح محادثة {contactName}
        </p>

        {error && (
          <div className="p-2 mb-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-[11px] text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="password"
            maxLength={4}
            autoFocus
            placeholder="• • • •"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            className="w-full py-2.5 text-center text-xl font-mono tracking-widest bg-black/40 border border-white/15 rounded-xl text-cyan-300 focus:outline-none focus:border-rose-400"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white shadow-glow"
            >
              فك القفل 🔓
            </button>
          </div>
        </form>

        <span className="text-[10px] text-gray-500 font-mono block mt-3">الرمز التجريبي الافتراضي: 1234</span>

      </div>
    </div>
  );
}
