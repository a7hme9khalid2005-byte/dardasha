import React, { useState, useEffect } from 'react';
import { X, Lock, Bookmark, Plus, Trash2, Copy, Check, FileText, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function SavedVaultView({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [vaultItems, setVaultItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      const res = await api.getVault();
      setVaultItems(res.vault || [
        { id: 'v1', title: 'ملاحظة سرية مشفرة', content: 'رقم الخزنة الشخصية وأفكار المشروع الجديدة 🚀', type: 'text', createdAt: new Date().toISOString() },
        { id: 'v2', title: 'رابط مهم للرجوع إليه', content: 'https://dardasha.com/docs/security', type: 'link', createdAt: new Date().toISOString() },
      ]);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      const res = await api.addToVault(newTitle.trim() || 'عنصر محفوظ', newContent.trim());
      setVaultItems(prev => [res.item, ...prev]);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.removeFromVault(id);
      setVaultItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-indigo-500/30 shadow-2xl p-6 text-white max-h-[85vh] flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">خزنة الرسائل الشخصية (Personal Vault)</h3>
              <p className="text-[11px] text-gray-400">مساحتك الخاصة المحمية والمشفرة لحفظ الملاحظات والروابط</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="space-y-2 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
          <input
            type="text"
            placeholder="عنوان الملاحظة (اختياري)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-1.5 bg-black/30 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-indigo-400"
          />
          <textarea
            rows={2}
            placeholder="اكتب فكرة، كوداً، رابطاً أو نصاً لحفظه مشفراً في خزنتك..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-indigo-400 resize-none"
          />
          <button
            type="submit"
            disabled={!newContent.trim()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>حفظ في الخزنة السرية</span>
          </button>
        </form>

        {/* Vault Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {vaultItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bookmark className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p>خزنتك فارغة، أضف أول عنصر سري الآن</p>
            </div>
          ) : (
            vaultItems.map(item => (
              <div key={item.id} className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 text-right relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.id, item.content)}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                      title="نسخ"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-rose-400"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-xs">{item.title}</h4>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap break-words">{item.content}</p>
                <span className="text-[10px] text-gray-500 font-mono block">
                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
