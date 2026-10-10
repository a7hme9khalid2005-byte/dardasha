import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Briefcase, Zap, Clock, Folder, FileDown, Store, 
  Cloud, QrCode, Monitor, Check, Copy, AlertCircle, Save, Loader2,
  StickyNote, CheckSquare, Timer, Plus, Trash2, Play, Pause, RotateCcw, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { sounds } from '../../utils/soundEffects';

export default function ProductivityToolsModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('sticky_notes'); // 'sticky_notes', 'todo_manager', 'pomodoro', 'snippets', 'ooo', 'backup_sync'

  // ================= 1. STICKY NOTES =================
  const [stickyNotes, setStickyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('dardasha_sticky_notes');
      return saved ? JSON.parse(saved) : [
        { id: 'sn-1', title: 'ملاحظة سرية 🚀', content: 'مراجعة خوارزمية التشفير ومزامنة الـ WebSockets اليوم الساعة 4 عصراً.', color: 'bg-amber-500/20 border-amber-500/40 text-amber-100' },
        { id: 'sn-2', title: 'فكرة ميزة جديدة 💡', content: 'إضافة إشعارات ذكية بالذكاء الاصطناعي للمحادثات ذات الأولوية.', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-100' }
      ];
    } catch {
      return [];
    }
  });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNoteColor, setSelectedNoteColor] = useState('amber');

  const handleAddStickyNote = (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const colorClasses = {
      amber: 'bg-amber-500/20 border-amber-500/40 text-amber-100',
      purple: 'bg-purple-500/20 border-purple-500/40 text-purple-100',
      cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-100',
      emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100',
      rose: 'bg-rose-500/20 border-rose-500/40 text-rose-100'
    };
    const newNote = {
      id: `sn-${Date.now()}`,
      title: newNoteTitle.trim() || 'ملاحظة لاصقة',
      content: newNoteContent.trim(),
      color: colorClasses[selectedNoteColor] || colorClasses.amber,
      createdAt: new Date().toISOString()
    };
    const updated = [newNote, ...stickyNotes];
    setStickyNotes(updated);
    localStorage.setItem('dardasha_sticky_notes', JSON.stringify(updated));
    setNewNoteTitle('');
    setNewNoteContent('');
    sounds.playClick();
  };

  const handleDeleteStickyNote = (id) => {
    const updated = stickyNotes.filter(n => n.id !== id);
    setStickyNotes(updated);
    localStorage.setItem('dardasha_sticky_notes', JSON.stringify(updated));
    sounds.playClick();
  };

  // ================= 2. TO-DO LIST MANAGER =================
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('dardasha_todos');
      return saved ? JSON.parse(saved) : [
        { id: 'td-1', text: 'تأكيد الحساب عبر رمز OTP 6 أرقام', done: true, priority: 'high' },
        { id: 'td-2', text: 'إنشاء بطاقة العمل الرقمية ثلاثية الأبعاد 3D', done: true, priority: 'medium' },
        { id: 'td-3', text: 'دعوة صديق لتجربة ميزة Watch Together', done: false, priority: 'high' },
        { id: 'td-4', text: 'فتح صندوق الحظ اليومي واكتشاف الهدايا', done: false, priority: 'low' }
      ];
    } catch {
      return [];
    }
  });
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('medium');

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo = {
      id: `td-${Date.now()}`,
      text: newTodoText.trim(),
      done: false,
      priority: newTodoPriority
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    localStorage.setItem('dardasha_todos', JSON.stringify(updated));
    setNewTodoText('');
    sounds.playClick();
  };

  const handleToggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTodos(updated);
    localStorage.setItem('dardasha_todos', JSON.stringify(updated));
    sounds.playReceive();
  };

  const handleDeleteTodo = (id) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    localStorage.setItem('dardasha_todos', JSON.stringify(updated));
    sounds.playClick();
  };

  // ================= 3. POMODORO FOCUS TIMER =================
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' (25 min) | 'break' (5 min)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      sounds.playTimerBell();
      if (pomodoroMode === 'work') {
        alert('🎉 أحسنت! انتهت جلسة التركيز (25 دقيقة). حان وقت استراحة 5 دقائق ☕');
        setPomodoroMode('break');
        setPomodoroSeconds(5 * 60);
      } else {
        alert('⏰ انتهت الاستراحة! هل أنت مستعد لجلسة تركيز جديدة؟ 🚀');
        setPomodoroMode('work');
        setPomodoroSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds, pomodoroMode]);

  const togglePomodoro = () => {
    sounds.playClick();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetPomodoro = () => {
    sounds.playClick();
    setIsTimerRunning(false);
    setPomodoroSeconds(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchPomodoroMode = (mode) => {
    sounds.playClick();
    setIsTimerRunning(false);
    setPomodoroMode(mode);
    setPomodoroSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ================= 4. CANNED SNIPPETS =================
  const [snippets, setSnippets] = useState([
    { trigger: '/welcome', text: 'أهلاً بك وسهلاً في منصة دردشة! يسعدنا تواصلك معنا دائماً 🌟' },
    { trigger: '/pricing', text: 'نوفر باقات VIP مجانية ومميزات متقدمة يمكنك استكشافها من صفحة الإعدادات 💎' },
    { trigger: '/faq', text: 'منصة دردشة مشفرة بالكامل طرف-لطرف (E2EE) وتضمن أقصى معايير الخصوصية 🛡️' }
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newText, setNewText] = useState('');

  // ================= 5. OUT-OF-OFFICE =================
  const [oooEnabled, setOooEnabled] = useState(false);
  const [oooMessage, setOooMessage] = useState('أنا خارج أوقات العمل حالياً. سأرد عليك في أقرب وقت متاح!');
  const [oooNotice, setOooNotice] = useState('');

  // ================= 6. BACKUP & EXPORT =================
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    api.getOutOfOffice().then(res => {
      if (res?.outOfOffice) {
        setOooEnabled(res.outOfOffice.enabled);
        if (res.outOfOffice.message) setOooMessage(res.outOfOffice.message);
      }
    }).catch(console.warn);
  }, []);

  const handleSaveOoo = async () => {
    try {
      await api.setOutOfOffice({ enabled: oooEnabled, message: oooMessage });
      setOooNotice('✅ تم حفظ إعدادات الرد الآلي خارج أوقات العمل بنجاح!');
      sounds.playClick();
      setTimeout(() => setOooNotice(''), 3000);
    } catch {
      alert('فشل الحفظ');
    }
  };

  const handleAddSnippet = (e) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newText.trim()) return;
    const cleanTrigger = newTrigger.startsWith('/') ? newTrigger.trim() : `/${newTrigger.trim()}`;
    setSnippets(prev => [...prev, { trigger: cleanTrigger, text: newText.trim() }]);
    setNewTrigger('');
    setNewText('');
    sounds.playClick();
  };

  const handleExportBackup = async () => {
    setBackingUp(true);
    sounds.playClick();
    try {
      const res = await api.exportBackup();
      const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dardasha_backup_${new Date().toISOString().split('T')[0]}.enc.json`;
      a.click();
    } catch {
      alert('فشل تصدير النسخة');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shadow-glow">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>جناح الإنتاجية الذكي (Productivity Suite)</span>
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[10px] font-mono">
                  Pro Suite
                </span>
              </h2>
              <p className="text-xs text-gray-400">ملاحظات لاصقة، مدير المهام، مؤقت بومودورو للتركيز، والردود الجاهزة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0b0f19] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('sticky_notes')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sticky_notes' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <StickyNote className="w-4 h-4 text-amber-400" />
            <span>ملاحظات لاصقة (Sticky Notes)</span>
          </button>

          <button
            onClick={() => setActiveTab('todo_manager')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'todo_manager' ? 'border-cyan-400 text-cyan-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>مدير المهام (To-Do List)</span>
          </button>

          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pomodoro' ? 'border-rose-400 text-rose-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Timer className="w-4 h-4 text-rose-400" />
            <span>مؤقت بومودورو (Pomodoro)</span>
          </button>

          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'snippets' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>الردود الجاهزة</span>
          </button>

          <button
            onClick={() => setActiveTab('ooo')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ooo' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>خارج أوقات العمل</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_sync')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup_sync' ? 'border-teal-400 text-teal-300 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>النسخ والترحيل</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {oooNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center">
              {oooNotice}
            </div>
          )}

          {/* ================= TAB 1: STICKY NOTES ================= */}
          {activeTab === 'sticky_notes' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <span className="font-bold text-amber-300 block text-right">إضافة ملاحظة لاصقة سريعة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="عنوان الملاحظة..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                  <input
                    type="text"
                    placeholder="محتوى الملاحظة..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                  <div className="flex items-center gap-2 justify-between">
                    <select
                      value={selectedNoteColor}
                      onChange={(e) => setSelectedNoteColor(e.target.value)}
                      className="px-2 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs"
                    >
                      <option value="amber">أصفر 🟡</option>
                      <option value="cyan">أزرق سماوي 🔵</option>
                      <option value="purple">بنفسجي 🟣</option>
                      <option value="emerald">أخضر 🟢</option>
                      <option value="rose">وردي 🔴</option>
                    </select>
                    <button
                      onClick={handleAddStickyNote}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-glow text-xs"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stickyNotes.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border shadow-lg space-y-2 relative group text-right ${n.color}`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDeleteStickyNote(n.id)}
                        className="text-gray-400 hover:text-rose-300 opacity-60 hover:opacity-100 transition p-1"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <h4 className="font-black text-xs text-white">{n.title}</h4>
                    </div>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: TO-DO LIST MANAGER ================= */}
          {activeTab === 'todo_manager' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleAddTodo} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="أضف مهمة جديدة إلى جدول أعمالك..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                />
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value)}
                  className="px-2.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs"
                >
                  <option value="low">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">أولوية عالية ⚡</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-glow text-xs"
                >
                  إضافة
                </button>
              </form>

              {/* Todo List Items */}
              <div className="space-y-2">
                {todos.map(t => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between text-right ${
                      t.done 
                        ? 'bg-white/[0.02] border-white/5 opacity-60' 
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <button
                      onClick={() => handleDeleteTodo(t.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div 
                      onClick={() => handleToggleTodo(t.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        t.done ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-white/30 bg-black/30'
                      }`}>
                        {t.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`font-medium ${t.done ? 'line-through text-gray-400' : 'text-white'}`}>
                        {t.text}
                      </span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      t.priority === 'high' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : t.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'عادية'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: POMODORO TIMER ================= */}
          {activeTab === 'pomodoro' && (
            <div className="space-y-6 text-center py-4 text-xs">
              
              {/* Mode switch */}
              <div className="inline-flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold gap-1">
                <button
                  onClick={() => switchPomodoroMode('work')}
                  className={`px-4 py-2 rounded-xl transition ${
                    pomodoroMode === 'work' ? 'bg-rose-600 text-white shadow-glow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  جلسة تركيز (25 دقيقة) 🧠
                </button>
                <button
                  onClick={() => switchPomodoroMode('break')}
                  className={`px-4 py-2 rounded-xl transition ${
                    pomodoroMode === 'break' ? 'bg-emerald-600 text-white shadow-glow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  استراحة قصيرة (5 دقائق) ☕
                </button>
              </div>

              {/* Giant Countdown Clock */}
              <div className="my-6">
                <div className={`w-48 h-48 rounded-full border-4 mx-auto flex flex-col items-center justify-center shadow-2xl transition-all ${
                  isTimerRunning 
                    ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-pulse' 
                    : 'border-white/20 bg-black/40'
                }`}>
                  <span className="font-mono text-5xl font-black text-white tracking-widest">
                    {formatTimer(pomodoroSeconds)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 mt-2">
                    {pomodoroMode === 'work' ? 'جلسة العمل والإنتاج' : 'وقت الاستراحة والقهوة'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={togglePomodoro}
                  className={`px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition shadow-glow ${
                    isTimerRunning 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  <span>{isTimerRunning ? 'إيقاف مؤقت' : 'بدء التركيز'}</span>
                </button>

                <button
                  onClick={resetPomodoro}
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl text-gray-300 transition"
                  title="إعادة ضبط المؤقت"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-gray-400">
                تقنية بومودورو ترفع إنتاجيتك بنسبة 200% بالتركيز المتقطع وصوت الجرس المنبه بنهاية الجلسة 🔔
              </p>
            </div>
          )}

          {/* ================= TAB 4: CANNED SNIPPETS ================= */}
          {activeTab === 'snippets' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">
                قوالب ونصوص جاهزة تستدعيها فوراً في حقل الكتابة بكتابة الرمز <strong className="text-amber-400 font-mono">/</strong>:
              </p>

              <form onSubmit={handleAddSnippet} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="رمز الاستدعاء (مثال: /discount)"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-right"
                  />
                  <input
                    type="text"
                    placeholder="النص الكامل للرد..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-right"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-glow text-xs"
                >
                  إضافة قالب جديد
                </button>
              </form>

              <div className="space-y-2">
                {snippets.map((snip, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-right">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-amber-400 text-sm">{snip.trigger}</span>
                      <p className="text-gray-300">{snip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: OUT-OF-OFFICE ================= */}
          {activeTab === 'ooo' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>الرد التلقائي الذكي خارج ساعات العمل</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      تفعيل رد فوري آلي على أي رسالة واردة عندما تكون في إجازة أو خارج أوقات دوامك.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={oooEnabled}
                    onChange={(e) => setOooEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-300 font-bold text-right">رسالة الرد الآلي المخصصة:</label>
                  <textarea
                    rows={3}
                    value={oooMessage}
                    onChange={(e) => setOooMessage(e.target.value)}
                    className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-white text-right focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveOoo}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-glow text-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ إعدادات الرد الآلي</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 6: BACKUP & SYNC ================= */}
          {activeTab === 'backup_sync' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/5 border border-blue-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span>النسخ الاحتياطي المشفر على سحابتك الخاصة</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      تصدير كافة رسائلك وخزنتك في ملف مشفر بكلمة سر وتنزيله أو حفظه في Google Drive.
                    </p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    disabled={backingUp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-glow"
                  >
                    {backingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    <span>تصدير نسخة مشفرة الآن</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">Dardasha Productivity Suite Active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 text-white font-bold rounded-xl shadow-glow transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
