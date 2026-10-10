import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Move } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ChatHeads({ contacts, onSelectContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(contacts?.[0] || null);
  const [miniInput, setMiniInput] = useState('');
  const [miniMessages, setMiniMessages] = useState([
    { id: 1, text: 'مرحباً! أنا أستخدم فقاعة المحادثة السريعة (Chat Head) 💬', sender: 'them' }
  ]);

  // Draggable position state
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? 24 : 24,
    y: typeof window !== 'undefined' ? window.innerHeight - 100 : 500
  }));

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    if (contacts && contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0]);
    }
  }, [contacts, activeContact]);

  // Touch and Mouse Drag Handlers
  const handlePointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y
    };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX) || 0;
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY) || 0;

      const deltaX = currentX - dragStartRef.current.x;
      const deltaY = currentY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      // Constrain within screen bounds
      const maxX = window.innerWidth - 70;
      const maxY = window.innerHeight - 70;
      const newX = Math.max(10, Math.min(maxX, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(maxY, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleHeadClick = () => {
    if (hasMovedRef.current) return; // Ignore click if user was dragging
    sounds.playClick();
    setIsOpen(prev => !prev);
  };

  if (!contacts || contacts.length === 0) return null;
  const current = activeContact || contacts[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!miniInput.trim()) return;
    sounds.playSend();
    setMiniMessages(prev => [...prev, { id: Date.now(), text: miniInput.trim(), sender: 'me' }]);
    setMiniInput('');
  };

  return (
    <div 
      className="fixed z-50 select-none transition-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Mini Chat Window */}
      {isOpen && (
        <div 
          className="absolute bottom-16 left-0 w-80 h-96 bg-[#0f172a] border border-cyan-500/40 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="p-3 bg-[#1e293b] border-b border-white/10 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (onSelectContact) onSelectContact(current);
                setIsOpen(false);
              }}
            >
              <img 
                src={current.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-cyan-400 object-cover" 
              />
              <div className="text-right">
                <h4 className="text-xs font-bold text-white hover:text-cyan-300 transition">
                  {current.firstName} {current.lastName}
                </h4>
                <span className="text-[9px] text-cyan-300">فقاعة دردشة حرة (Chat Head)</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {miniMessages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-3 py-1.5 rounded-2xl max-w-[85%] text-right ${
                  m.sender === 'me' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 bg-[#1e293b]/80 border-t border-white/10 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="رد سريع..."
              value={miniInput}
              onChange={(e) => setMiniInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full text-xs text-white focus:outline-none focus:border-cyan-400 text-right"
            />
            <button 
              type="submit" 
              className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-full shadow-glow transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Draggable Avatar Head Button */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleHeadClick}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform duration-100 relative group flex items-center justify-center"
        title="اسحب الفقاعة لأي مكان على الشاشة أو انقر لفتحها"
      >
        <img 
          src={current.avatar} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover border-2 border-[#0b0f19] pointer-events-none" 
        />
        
        {/* Unread badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#0b0f19] shadow animate-pulse pointer-events-none">
          1
        </span>

        {/* Drag handle pill on hover */}
        <div className="absolute -bottom-2 bg-black/70 px-1.5 py-0.2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition text-[8px] text-cyan-300 font-mono pointer-events-none">
          سحب ✥
        </div>
      </div>
    </div>
  );
}
