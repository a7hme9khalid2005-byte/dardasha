import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Eraser, PenTool, RotateCcw, Download, Sparkles, Sliders, Check 
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function WhiteboardModal({ isOpen, onClose, contactName }) {
  if (!isOpen) return null;

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8b5cf6'); // Purple
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState('pen'); // 'pen' or 'eraser'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = mode === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = mode === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sounds.playClick();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExportPng = () => {
    sounds.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create temporary export canvas with dark background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Draw current canvas on top
    ctx.drawImage(canvas, 0, 0);

    const imageUri = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `dardasha_whiteboard_${Date.now()}.png`;
    link.href = imageUri;
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-glow">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">لوحة الرسم التشاركية الحية (Live Whiteboard)</h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                مساحة تفاعلية مشتركة مع {contactName || 'صديقك'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPng}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-glow"
              title="تصدير كـ صورة PNG عالية الجودة"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'تم التصدير!' : 'تصدير PNG'}</span>
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar with Tools, Brushes & Palette */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-[#0b0f19] flex items-center justify-between flex-wrap gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            {/* Pen Tool */}
            <button
              onClick={() => { sounds.playClick(); setMode('pen'); }}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 font-bold ${
                mode === 'pen' ? 'bg-purple-600 text-white shadow-glow' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>قلم</span>
            </button>

            {/* Eraser Tool */}
            <button
              onClick={() => { sounds.playClick(); setMode('eraser'); }}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 font-bold ${
                mode === 'eraser' ? 'bg-rose-600 text-white shadow-glow' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>ممحاة</span>
            </button>

            {/* Brush Size Slider */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[11px] text-gray-400">الحجم:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
                className="w-20 accent-cyan-400 h-1 rounded cursor-pointer"
              />
              <span className="font-mono text-cyan-300 text-[10px] w-4">{lineWidth}</span>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1.5 mr-2">
              {['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ffffff', '#ec4899'].map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setMode('pen'); sounds.playClick(); }}
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    color === c && mode === 'pen' ? 'scale-125 border-white shadow-glow' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`لون ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Clear Canvas */}
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-gray-400 hover:text-rose-400 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح اللوح</span>
          </button>
        </div>

        {/* Canvas Workspace */}
        <div className="p-4 flex-1 flex items-center justify-center bg-[#070b14] overflow-auto">
          <canvas
            ref={canvasRef}
            width={720}
            height={440}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-[#0f172a] rounded-2xl border border-cyan-500/30 cursor-crosshair shadow-inner max-w-full touch-none"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>🎨 رسم حر ومتزامن مع تصدير صور PNG بدقة كاملة</span>
          <span className="text-cyan-400 font-mono">Dardasha Canvas v2.0</span>
        </div>

      </div>
    </div>
  );
}
