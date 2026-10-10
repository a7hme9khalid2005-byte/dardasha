import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function ChatHeads({ contacts, onSelectContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(contacts?.[0] || null);
  const [miniInput, setMiniInput] = useState('');
  const [miniMessages, setMiniMessages] = useState([
    { id: 1, text: 'مرحباً! أنا أستخدم فقاعة المحادثة السريعة (Chat Head) 💬', sender: 'them' }
  ]);

  if (!contacts || contacts.length === 0) return null;

  const current = activeContact || contacts[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!miniInput.trim()) return;
    setMiniMessages(prev => [...prev, { id: Date.now(), text: miniInput.trim(), sender: 'me' }]);
    setMiniInput('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Mini Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-[#0f172a] border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="p-3 bg-[#1e293b] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={current.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-purple-400" />
              <div>
                <h4 className="text-xs font-bold text-white">{current.firstName} {current.lastName}</h4>
                <span className="text-[10px] text-cyan-300">فقاعة دردشة عائمة (Chat Head)</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {miniMessages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-3 py-1.5 rounded-2xl max-w-[80%] ${m.sender === 'me' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 bg-[#1e293b]/70 border-t border-white/10 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="رد سريع..."
              value={miniInput}
              onChange={(e) => setMiniInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-black/30 border border-white/10 rounded-full text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full">
              <Send className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Avatar Trigger (Item 7) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-2xl hover:scale-105 active:scale-95 transition relative group"
        title="فقاعة المحادثة السريعة (Chat Head)"
      >
        <img src={current.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#0b0f19]" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[#0b0f19] animate-pulse">
          1
        </span>
      </button>
    </div>
  );
}
