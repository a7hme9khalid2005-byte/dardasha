import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, PenTool, RotateCcw, Download, Sparkles } from 'lucide-react';

export default function WhiteboardModal({ isOpen, onClose, contactName }) {
  if (!isOpen) return null;

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8b5cf6'); // Purple
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState('pen'); // 'pen' or 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = mode === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = mode === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">لوحة الرسم المشتركة (Shared Whiteboard)</h3>
              <p className="text-[11px] text-gray-400">ترسم وتخطط الآن بشكل حي مع {contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-white/10 bg-[#0b0f19] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('pen')}
              className={`p-2 rounded-xl transition ${mode === 'pen' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="قلم"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`p-2 rounded-xl transition ${mode === 'eraser' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="ممحاة"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Colors */}
            <div className="flex items-center gap-1.5 ml-2 mr-2">
              {['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setMode('pen'); }}
                  className={`w-5 h-5 rounded-full border-2 transition ${color === c && mode === 'pen' ? 'scale-125 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-gray-400 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition"
            title="مسح الكل"
          >
            <RotateCcw className="w-4 h-4" />
            <span>مسح اللوح</span>
          </button>
        </div>

        {/* Canvas area */}
        <div className="p-4 flex justify-center bg-[#070b14]">
          <canvas
            ref={canvasRef}
            width={600}
            height={360}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-[#0f172a] rounded-2xl border border-white/10 cursor-crosshair shadow-inner"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0b0f19] border-t border-white/10 text-center text-xs text-gray-400">
          ✨ كل ما ترسمه هنا ينعكس فورياً في الشات بينكما!
        </div>

      </div>
    </div>
  );
}
