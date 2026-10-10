import React, { useState } from 'react';
import { X, Clock, Calendar, Send, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ScheduleMessageModal({ isOpen, onClose, receiverId, contactName, onScheduled }) {
  if (!isOpen) return null;

  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to 1 hour from now
  const setQuickTime = (hours) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    const iso = d.toISOString().slice(0, 16);
    setScheduledTime(iso);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!content.trim() || !scheduledTime) {
      setError('يرجى كتابة نص الرسالة وتحديد موعد الإرسال');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.scheduleMessage(receiverId, content.trim(), scheduledTime);
      onScheduled(content.trim(), scheduledTime);
      onClose();
    } catch (err) {
      setError(err.message || 'فشل جدولة الرسالة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">جدولة رسالة تلقائية</h3>
              <p className="text-[11px] text-gray-400">إرسال تلقائي إلى {contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">نص الرسالة:</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تهنئة، تذكيراً، أو رسالة مجدولة..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-right resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">وقت وتاريخ الإرسال:</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 text-[11px]">اقتراحات سريعة:</span>
            <button
              type="button"
              onClick={() => setQuickTime(1)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-cyan-300 border border-white/10"
            >
              بعد ساعة ⏳
            </button>
            <button
              type="button"
              onClick={() => setQuickTime(5)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-purple-300 border border-white/10"
            >
              بعد 5 ساعات 🌙
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            <span>تأكيد جدولة الرسالة</span>
          </button>
        </form>

      </div>
    </div>
  );
}
