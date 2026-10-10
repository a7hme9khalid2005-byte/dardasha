import React, { useState } from 'react';
import { X, Sparkles, Image, Check, Download, Palette, Layers } from 'lucide-react';

const stickerTemplates = [
  { id: 't1', title: 'قطة مندهشة 🐱', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80' },
  { id: 't2', title: 'فرحة واحتفال 🎉', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=300&q=80' },
  { id: 't3', title: 'قهوة وتركيز ☕', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' },
  { id: 't4', title: 'ذكاء اصطناعي 🤖', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
];

export default function StickerStudioModal({ isOpen, onClose, onStickerCreated }) {
  if (!isOpen) return null;

  const [selectedImg, setSelectedImg] = useState(stickerTemplates[0].img);
  const [topText, setTopText] = useState('صباح الإبداع!');
  const [bottomText, setBottomText] = useState('دردشة 🚀');
  const [outlineColor, setOutlineColor] = useState('#8b5cf6');

  const handleSave = () => {
    const stickerData = {
      id: 'sticker-' + Date.now(),
      img: selectedImg,
      topText,
      bottomText,
      outlineColor,
    };
    onStickerCreated(stickerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl p-6 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">استوديو صناعة الملصقات والميمز (Sticker Studio)</h3>
              <p className="text-[11px] text-gray-400">اصنع ملصقاتك المخصصة بنصوصك الخاصة واستخدمها في الشات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Sticker Box */}
        <div className="p-4 bg-[#070b14] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative mb-4">
          <div 
            className="w-48 h-48 rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center border-4"
            style={{ borderColor: outlineColor }}
          >
            <img src={selectedImg} alt="Template" className="w-full h-full object-cover" />
            {topText && (
              <span className="absolute top-2 left-2 right-2 text-center font-black text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                {topText}
              </span>
            )}
            {bottomText && (
              <span className="absolute bottom-2 left-2 right-2 text-center font-black text-amber-300 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                {bottomText}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 mt-2">معاينة حية للملصق الجاهز للإرسال</span>
        </div>

        {/* Templates */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-300 font-bold mb-1.5">اختر قالباً سريعاً:</label>
            <div className="grid grid-cols-4 gap-2">
              {stickerTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedImg(t.img)}
                  className={`p-1 rounded-xl border transition overflow-hidden ${selectedImg === t.img ? 'border-purple-400 shadow-glow' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                >
                  <img src={t.img} alt={t.title} className="w-full h-12 object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Texts */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-300 mb-1">النص العلوي:</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs text-right focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">النص السفلي:</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs text-right focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Color border */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-300">لون الإطار المضيء:</span>
            <div className="flex items-center gap-1.5">
              {['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => setOutlineColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition ${outlineColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-400 hover:text-white">إلغاء</button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الملصق واستخدامه 🎨</span>
          </button>
        </div>

      </div>
    </div>
  );
}
