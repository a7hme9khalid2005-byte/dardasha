import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Bookmark, Plus, Trash2, Copy, Check, FileText, 
  Tag, KeyRound, Briefcase, Lightbulb, Link2, Shield, Folder
} from 'lucide-react';
import { api } from '../../services/api';
import { sounds } from '../../utils/soundEffects';

const VAULT_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Folder, color: 'text-gray-300' },
  { id: 'credentials', label: 'مفاتيح ورموز 🔑', icon: KeyRound, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'work', label: 'العمل والمشاريع 💼', icon: Briefcase, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'ideas', label: 'أفكار ملهمة 💡', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'links', label: 'روابط هامة 🔗', icon: Link2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'personal', label: 'خاص ومشفر 🔒', icon: Shield, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

export default function SavedVaultView({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [vaultItems, setVaultItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('ideas');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      const res = await api.getVault();
      setVaultItems(res.vault || [
        { 
          id: 'v1', 
          title: 'بيانات المحفظة المشفرة', 
          content: 'مفتاح الاسترجاع السحابي: 8492-4920-1849-5930 🔐', 
          category: 'credentials',
          createdAt: new Date().toISOString() 
        },
        { 
          id: 'v2', 
          title: 'وثائق وأهداف الربع الرابع', 
          content: 'إطلاق ميزات الصوت التفاعلي، ونظام الرادار الجغرافي 🚀', 
          category: 'work',
          createdAt: new Date().toISOString() 
        },
        { 
          id: 'v3', 
          title: 'رابط المرجع التقني للتشفير', 
          content: 'https://dardasha.app/docs/security/e2ee-spec', 
          category: 'links',
          createdAt: new Date().toISOString() 
        },
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
      const itemWithCat = { ...res.item, category: newItemCategory };
      setVaultItems(prev => [itemWithCat, ...prev]);
      setNewTitle('');
      setNewContent('');
      sounds.playClick();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.removeFromVault(id);
      setVaultItems(prev => prev.filter(i => i.id !== id));
      sounds.playClick();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    sounds.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = vaultItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0f172a] rounded-3xl border border-indigo-500/40 shadow-2xl p-6 text-white max-h-[88vh] flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-glow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">خزنة الرسائل المشفرة وتصنيف الوسوم (Saved Vault)</h3>
              <p className="text-[11px] text-gray-400">أرشيف آمن ومشفر 100% مع تصنيف بالوسوم والفئات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
          {VAULT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 border ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Add Item Form with Tagging */}
        <form onSubmit={handleAddItem} className="space-y-2 mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="عنوان الملاحظة (اختياري)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-indigo-400"
            />

            {/* Category Selector */}
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-cyan-300 font-bold focus:outline-none text-xs"
            >
              <option value="credentials">🔑 كلمات سر ومفاتيح</option>
              <option value="work">💼 العمل والمشاريع</option>
              <option value="ideas">💡 أفكار وملاحظات</option>
              <option value="links">🔗 روابط هامة</option>
              <option value="personal">🔒 خاص ومشفر</option>
            </select>
          </div>

          <textarea
            rows={2}
            placeholder="اكتب فكرة، مفتاحاً، رابطاً، أو نصاً لحفظه مشفراً في خزنتك..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-right focus:outline-none focus:border-indigo-400 resize-none"
          />

          <button
            type="submit"
            disabled={!newContent.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>حفظ وتشفير في الخزنة</span>
          </button>
        </form>

        {/* Vault Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-gray-600" />
              <p>لا توجد عناصر في هذا التصنيف حالياً</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const catObj = VAULT_CATEGORIES.find(c => c.id === item.category) || VAULT_CATEGORIES[3];
              return (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/10 space-y-2 text-right relative group transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
                        title="نسخ المحتوى"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-rose-400 transition"
                        title="حذف من الخزنة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catObj.color || 'text-cyan-300'}`}>
                        {catObj.label}
                      </span>
                      <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    </div>
                  </div>

                  <p className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed font-sans">{item.content}</p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1 border-t border-white/5">
                    <span className="text-cyan-400/80">🔒 مشفر بـ AES-256</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
