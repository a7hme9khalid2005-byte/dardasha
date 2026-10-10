import React, { useState } from 'react';
import { X, BarChart3, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function PollModal({ isOpen, onClose, receiverId, onPollCreated }) {
  if (!isOpen) return null;

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['نعم 👍', 'لا 👎']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOptions = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) {
      setError('يرجى كتابة السؤال وإدخال خيارين على الأقل');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.createPoll(question.trim(), cleanOptions, receiverId);
      onPollCreated(res.poll);
      onClose();
    } catch (err) {
      setError(err.message || 'فشل إنشاء الاستطلاع');
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
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">استطلاع رأي حي (Live Poll)</h3>
              <p className="text-[11px] text-gray-400">اتخاذ قرار وتصويت فوري مع الأصدقاء</p>
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

        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">سؤال الاستطلاع:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="مثال: أين نلتقي اليوم؟ أو ما هو أفضل وقت؟"
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">خيارات التصويت:</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`خيار ${idx + 1}`}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-right"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-2 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold pt-1"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة خيار آخر</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            <span>نشر الاستطلاع في المحادثة</span>
          </button>
        </form>

      </div>
    </div>
  );
}
