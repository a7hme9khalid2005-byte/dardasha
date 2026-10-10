import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, FileText, Languages, Send, Check, Copy, 
  Bot, User, RefreshCw, MessageSquare, Wand2, Shield, Loader2, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export default function AIHelperModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'summary', 'translate', 'tone'
  
  // Tab 1: Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'مرحباً بك! أنا مساعد Dardasha AI المدعوم بأحدث نماذج الذكاء الاصطناعي (Google Gemini). كيف يمكنني مساعدتك اليوم؟'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Tab 2: Summarize State
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Tab 3: Translate State
  const [transInput, setTransInput] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [transResult, setTransResult] = useState('');
  const [isTransLoading, setIsTransLoading] = useState(false);

  // Tab 4: Tone / Smart Reply State
  const [toneInput, setToneInput] = useState('');
  const [toneMode, setToneMode] = useState('professional'); // 'professional', 'friendly', 'concise', 'persuasive'
  const [toneResult, setToneResult] = useState('');
  const [isToneLoading, setIsToneLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);

  // Toast / Copy
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Send Chat
  const handleSendChat = async (overridePrompt) => {
    const textToSend = overridePrompt || chatInput;
    if (!textToSend || !textToSend.trim() || isChatLoading) return;

    const userMsg = { role: 'user', text: textToSend.trim() };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await api.askAi(textToSend.trim(), updatedHistory.slice(0, -1));
      setChatMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'عذراً، حدث خطأ أثناء معالجة الطلب: ' + (err.message || 'يرجى المحاولة مرة أخرى.') 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Summarize
  const handleSummarize = async () => {
    if (!summaryInput.trim() || isSummaryLoading) return;
    setIsSummaryLoading(true);
    setSummaryResult('');

    try {
      const res = await api.summarizeAi(summaryInput.trim());
      setSummaryResult(res.summary);
    } catch (err) {
      setSummaryResult('خطأ: ' + (err.message || 'فشل التلخيص'));
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // 3. Translate
  const handleTranslate = async () => {
    if (!transInput.trim() || isTransLoading) return;
    setIsTransLoading(true);
    setTransResult('');

    try {
      const res = await api.translateAi(transInput.trim(), targetLang);
      setTransResult(res.translation);
    } catch (err) {
      setTransResult('خطأ: ' + (err.message || 'فشلت الترجمة'));
    } finally {
      setIsTransLoading(false);
    }
  };

  // 4. Tone Rewrite & Smart Reply
  const handleRewrite = async () => {
    if (!toneInput.trim() || isToneLoading) return;
    setIsToneLoading(true);
    setToneResult('');

    try {
      const res = await api.rewriteAi(toneInput.trim(), toneMode);
      setToneResult(res.rewritten);
    } catch (err) {
      setToneResult('خطأ: ' + (err.message || 'فشلت إعادة الصياغة'));
    } finally {
      setIsToneLoading(false);
    }
  };

  const handleGenerateReplies = async () => {
    if (!toneInput.trim() || isToneLoading) return;
    setIsToneLoading(true);
    setSmartReplies([]);

    try {
      const res = await api.smartReplyAi(toneInput.trim());
      setSmartReplies(res.replies || []);
    } catch (err) {
      setSmartReplies(['فشل توليد الردود: ' + err.message]);
    } finally {
      setIsToneLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[88vh] max-h-[750px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-cyan-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">مساعد Dardasha AI الذكي</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Gemini Active ⚡
                </span>
              </div>
              <p className="text-xs text-gray-400">محادثة حية، تلخيص محادثات، ترجمة فورية، وإعادة صياغة ذكية</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-3 pt-2 bg-[#0d1322] text-xs font-bold gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chat' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>محادثة حية</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'summary' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>تلخيص ذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'translate' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Languages className="w-4 h-4 text-emerald-400" />
            <span>ترجمة فورية</span>
          </button>

          <button
            onClick={() => setActiveTab('tone')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tone' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>صياغة وردود</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col text-xs">
          
          {/* TAB 1: Live Interactive Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full min-h-0 space-y-3">
              {/* Messages area */}
              <div 
                ref={chatScrollRef} 
                className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 text-xs ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                        : 'bg-white/10 border border-cyan-500/30 text-cyan-300 shadow-glow'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 relative group text-right ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none whitespace-pre-wrap leading-relaxed'
                    }`}>
                      <p>{msg.text}</p>
                      
                      {msg.role === 'assistant' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCopy(msg.text, `msg-${idx}`)}
                            className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                            title="نسخ الإجابة"
                          >
                            {copiedKey === `msg-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === `msg-${idx}` ? 'تم النسخ' : 'نسخ'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dardasha AI يكتب الآن ويحلل استفسارك...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Starters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
                {[
                  'اقترح خطة عمل لمشروع',
                  'صياغة اعتذار رسمي بأسلوب راقٍ',
                  'ما هي نصائح الأمان في الدردشة؟',
                  'ترجمة رسالة إلى الإنجليزية'
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSendChat(prompt)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] text-gray-300 hover:text-cyan-300 whitespace-nowrap transition"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-shrink-0">
                <input
                  type="text"
                  placeholder="اسأل Dardasha AI أي سؤال (اكتب هنا واضغط Enter)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  disabled={isChatLoading}
                  className="flex-1 px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-xs text-right"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-glow disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Summarize */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <label className="block text-gray-300 font-bold">
                  الصق نص المحادثة أو المقال الطويل ليتم تلخيصه في نقاط رئيسية:
                </label>
                <textarea
                  rows={6}
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder="الصق نص المحادثة أو النقاش هنا..."
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none text-right"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSummarize}
                    disabled={isSummaryLoading || !summaryInput.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-glow disabled:opacity-50 transition"
                  >
                    {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>تلخيص الآن بالذكاء الاصطناعي</span>
                  </button>
                </div>
              </div>

              {summaryResult && (
                <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-cyan-300">ملخص المحادثة الذكي:</span>
                    <button
                      onClick={() => handleCopy(summaryResult, 'summary')}
                      className="text-gray-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'summary' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-right">{summaryResult}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Translation */}
          {activeTab === 'translate' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-300">أدخل النص للترجمة:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">اللغة الهدف:</span>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="px-3 py-1.5 bg-black/50 border border-white/15 rounded-xl text-white font-bold text-xs focus:outline-none"
                    >
                      <option value="en">English (الإنجليزية)</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="fr">Français (الفرنسية)</option>
                      <option value="tr">Türkçe (التركية)</option>
                      <option value="de">Deutsch (الألمانية)</option>
                      <option value="es">Español (الإسبانية)</option>
                      <option value="ru">Русский (الروسية)</option>
                      <option value="zh">中文 (الصينية)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={transInput}
                  onChange={(e) => setTransInput(e.target.value)}
                  placeholder="اكتب أو الصق النص هنا..."
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none text-right"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleTranslate}
                    disabled={isTransLoading || !transInput.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-glow disabled:opacity-50 transition"
                  >
                    {isTransLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                    <span>ترجمة فورية فائقة الدقة</span>
                  </button>
                </div>
              </div>

              {transResult && (
                <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-emerald-300">الترجمة المعتمدة:</span>
                    <button
                      onClick={() => handleCopy(transResult, 'trans')}
                      className="text-gray-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'trans' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'trans' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{transResult}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Tone & Smart Replies */}
          {activeTab === 'tone' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <label className="font-bold text-gray-300 block">
                  أدخل نص رسالتك أو آخر رسالة وصلتك:
                </label>
                <textarea
                  rows={3}
                  value={toneInput}
                  onChange={(e) => setToneInput(e.target.value)}
                  placeholder="اكتب مسودة رسالتك لتعديل أسلوبها، أو رسالة وصلتك لاقتراح ردود ذكية عليها..."
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none text-right"
                />

                {/* Tone Selectors */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-400 text-[11px]">الأسلوب:</span>
                    {[
                      { key: 'professional', label: 'رسمي واحترافي 👔' },
                      { key: 'friendly', label: 'ودود ودافئ ☕' },
                      { key: 'concise', label: 'موجز ومباشر ⚡' },
                      { key: 'persuasive', label: 'مقنع وحماسي 🚀' },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setToneMode(t.key)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                          toneMode === t.key 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-white/5 text-gray-300 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateReplies}
                      disabled={isToneLoading || !toneInput.trim()}
                      className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold rounded-xl flex items-center gap-1 transition"
                    >
                      💡 اقتراح ردود
                    </button>
                    <button
                      onClick={handleRewrite}
                      disabled={isToneLoading || !toneInput.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-glow transition"
                    >
                      {isToneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      <span>إعادة الصياغة</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rewritten Result */}
              {toneResult && (
                <div className="p-4 bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-amber-300">الصياغة المحسنة:</span>
                    <button
                      onClick={() => handleCopy(toneResult, 'tone')}
                      className="text-gray-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'tone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'tone' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-right">{toneResult}</p>
                </div>
              )}

              {/* Smart Suggested Replies */}
              {smartReplies.length > 0 && (
                <div className="space-y-2 animate-in fade-in">
                  <span className="font-bold text-purple-300 block">الردود المقترحة (انقر للنسخ الفوري):</span>
                  {smartReplies.map((reply, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleCopy(reply, `reply-${idx}`)}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 group text-right"
                    >
                      <p className="text-gray-200 group-hover:text-white">{reply}</p>
                      <span className="text-[10px] text-gray-400 group-hover:text-purple-300 flex items-center gap-1 flex-shrink-0">
                        {copiedKey === `reply-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `reply-${idx}` ? 'تم النسخ' : 'نسخ'}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>مدعوم بتقنية Google Gemini 3.8 Flash فائقة السرعة</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-gray-200 rounded-xl font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
