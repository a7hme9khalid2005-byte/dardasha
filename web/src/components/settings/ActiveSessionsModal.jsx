import React, { useState } from 'react';
import { X, Shield, Smartphone, Laptop, Globe, MapPin, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

export default function ActiveSessionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [sessions, setSessions] = useState([
    { id: 's1', device: 'Windows PC (Chrome 122)', location: 'الرياض، المملكة العربية السعودية 📍', ip: '192.168.1.48', current: true, time: 'نشط الآن' },
    { id: 's2', device: 'iPhone 15 Pro (Dardasha iOS)', location: 'دبي، الإمارات العربية المتحدة 📍', ip: '185.12.94.22', current: false, time: 'منذ ساعتين' },
    { id: 's3', device: 'iPad Air (Safari)', location: 'القاهرة، مصر 📍', ip: '197.34.12.80', current: false, time: 'أمس' },
  ]);

  const [terminated, setTerminated] = useState(false);

  const handleTerminateOthers = () => {
    setSessions(prev => prev.filter(s => s.current));
    setTerminated(true);
    setTimeout(() => setTerminated(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-cyan-500/30 shadow-2xl p-6 text-white max-h-[88vh] flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">أمان الحساب وخريطة الجلسات النشطة</h3>
              <p className="text-[11px] text-gray-400">إدارة الأجهزة المتصلة ومؤشر حماية الحساب</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item 49: Security Health Score Card */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between mb-4">
          <div className="space-y-1 text-right">
            <h4 className="font-bold text-xs text-emerald-300">مؤشر أمان الحساب (Security Health Score)</h4>
            <p className="text-[11px] text-gray-300">حسابك محمي بأعلى معايير التشفير والمصادقة الثنائية</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-mono font-black text-sm shadow-glow">
            96%
          </div>
        </div>

        {terminated && (
          <div className="p-3 mb-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold text-center">
            ✅ تم إنهاء جميع الجلسات والأجهزة الأخرى بنجاح!
          </div>
        )}

        {/* Item 47: Active Sessions List */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-gray-400 block text-right">الأجهزة المتصلة حالياً:</span>
          {sessions.map(s => (
            <div key={s.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400">
                  {s.device.includes('PC') ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>
                <div className="text-right">
                  <h5 className="font-bold text-white flex items-center gap-1.5">
                    <span>{s.device}</span>
                    {s.current && <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] font-bold">هذا الجهاز</span>}
                  </h5>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>{s.location}</span>
                    <span className="font-mono text-gray-500">({s.ip})</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">{s.time}</span>
            </div>
          ))}
        </div>

        {/* Terminate All Button */}
        <div className="pt-4 border-t border-white/10 mt-3">
          <button
            onClick={handleTerminateOthers}
            className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من كل الأجهزة الأخرى فوراً</span>
          </button>
        </div>

      </div>
    </div>
  );
}
