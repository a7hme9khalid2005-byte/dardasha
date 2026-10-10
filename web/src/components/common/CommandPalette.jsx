import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Gift, User, CreditCard, Radio, 
  Mic, Lock, Palette, Settings, ArrowRight, CornerDownLeft, Sparkles, X 
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onSelectAction, 
  contacts = [] 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const defaultCommands = [
    {
      id: 'chest',
      title: 'صندوق الحظ (عالم الـ 100,000 هدية)',
      subtitle: 'افتح هديتك أو تصفح الكتالوج الشامل',
      icon: Gift,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      action: 'open_chest'
    },
    {
      id: 'profile',
      title: 'الملف الشخصي وقسم "حول"',
      subtitle: 'عرض وتعديل بيانات الهوية، رقم الجوال، وخزنة الهدايا',
      icon: User,
      color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
      action: 'open_profile'
    },
    {
      id: 'card',
      title: 'بطاقة الهوية الرقمية 3D (Holographic Card)',
      subtitle: 'عرض ومشاركة هويتك المشفرة برمز QR ثلاثي الأبعاد',
      icon: CreditCard,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      action: 'open_id_card'
    },
    {
      id: 'radar',
      title: 'رادار دردشة لاكتشاف الأصدقاء',
      subtitle: 'البحث عن مستخدمين قريبين والاتصال السريع',
      icon: Radio,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      action: 'open_radar'
    },
    {
      id: 'live',
      title: 'غرف المحادثات الصوتية الحية (Live Audio Hub)',
      subtitle: 'انضم لغرفة حوارية أو استمع للنقاشات',
      icon: Mic,
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
      action: 'open_live'
    },
    {
      id: 'vault',
      title: 'الخزنة السحابية المشفرة (Encrypted Vault)',
      subtitle: 'إدارة ملفاتك وصورك المحمية بكلمة مرور ثانية',
      icon: Lock,
      color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
      action: 'open_vault'
    },
    {
      id: 'settings',
      title: 'الإعدادات والأمان والخصوصية',
      subtitle: 'تخصيص الحساب، الأجهزة المتصلة، وخيارات العرض',
      icon: Settings,
      color: 'text-gray-300 bg-white/10 border-white/20',
      action: 'open_settings'
    }
  ];

  // Map contacts into searchable commands
  const contactCommands = contacts.map(c => ({
    id: `contact-${c.id}`,
    title: `محادثة: ${c.firstName} ${c.lastName}`,
    subtitle: c.username || c.email,
    icon: MessageSquare,
    avatar: c.avatar,
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    action: 'chat_contact',
    payload: c
  }));

  const allItems = [...defaultCommands, ...contactCommands];

  const filtered = allItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeCommand = (cmd) => {
    sounds.playClick();
    onClose();
    if (onSelectAction) {
      onSelectAction(cmd.action, cmd.payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette Modal Box */}
      <div 
        className="relative w-full max-w-xl bg-[#0b1322] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[70vh] z-10 animate-in zoom-in-95 duration-150 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onKeyDown={handleKeyDown}
      >
        
        {/* Top Search Input Line */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.02]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="اكتب أمراً أو ابحث عن صديق، إعداد، أو هدية..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none text-right font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-gray-400">
              ESC للإغلاق
            </span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-500" />
              <p className="text-xs">لم نجد نتائج مطابقة لـ "{query}"</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-2xl flex items-center justify-between text-right cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900/60 border border-cyan-500/40 shadow-sm translate-x-[-2px]'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.avatar ? (
                      <img src={item.avatar} alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/10" />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30 shrink-0">
                      <span>انقر</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↑</span>
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↓</span>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↵</span>
              <span>للاختيار</span>
            </span>
          </div>
          <span className="text-cyan-400 font-mono font-bold">Dardasha Command Hub</span>
        </div>

      </div>

    </div>
  );
}
