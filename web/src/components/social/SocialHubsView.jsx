import React, { useState, useEffect } from 'react';
import { 
  Compass, Hash, HelpCircle, Calendar, Sparkles, Send, Users, 
  Flame, BookOpen, Gamepad2, Palette, Trophy, Briefcase, Check, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const communityHubs = [
  { id: 'tech', name: 'التقنية والبرمجة 💻', members: '1,420 عضو', desc: 'نقاشات الذكاء الاصطناعي، البرمجة وأحدث أخبار التكنولوجيا.', icon: Briefcase },
  { id: 'gaming', name: 'مجتمع الجيمنج 🎮', members: '2,150 عضو', desc: 'بطولات، استعراض ألعاب وتحديات مجتمعية حماسية.', icon: Gamepad2 },
  { id: 'design', name: 'التصميم والفن 🎨', members: '890 عضو', desc: 'مشاركة واجهات المستخدم والرسومات الإبداعية والتغذية البصرية.', icon: Palette },
  { id: 'sports', name: 'الرياضة واللياقة ⚽', members: '1,120 عضو', desc: 'متابعة مباريات كرة القدم والتمارين الصحية والنشاط اليومي.', icon: Trophy },
];

export default function SocialHubsView({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('hubs'); // 'hubs', 'anonymous_qa', 'memories'
  
  // Anonymous Q&A state (Item 36)
  const [questions, setQuestions] = useState([]);
  const [anonymousInput, setAnonymousInput] = useState('');
  const [answerInputs, setAnswerInputs] = useState({});
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    loadQA();
  }, []);

  const loadQA = async () => {
    try {
      const res = await api.getAnonymousQA(currentUser.id);
      setQuestions(res.questions || [
        { id: 'qa-1', question: 'ما هو أكثر هدف تسعى لتحقيقه في مجال عملك هذا العام؟', answer: 'تطوير منصة دردشة لتصبح رقم واحد في المنطقة العربية إن شاء الله 🚀', createdAt: new Date().toISOString() },
        { id: 'qa-2', question: 'ما هي نصيحتك لأي شخص يبدأ في البرمجة والتصميم؟', answer: null, createdAt: new Date().toISOString() },
      ]);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSendAnonymousQuestion = async (e) => {
    e.preventDefault();
    if (!anonymousInput.trim()) return;
    try {
      const res = await api.sendAnonymousQuestion(currentUser.id, anonymousInput.trim());
      setQuestions(prev => [res.item, ...prev]);
      setAnonymousInput('');
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (id) => {
    const text = answerInputs[id]?.trim();
    if (!text) return;
    try {
      const res = await api.answerAnonymousQuestion(id, text);
      setQuestions(prev => prev.map(q => q.id === id ? res.item : q));
      setAnswerInputs(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-white animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمجتمع</span>
        </button>
        <h2 className="text-base font-extrabold text-white">استكشاف المجتمعات والأنشطة</h2>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 text-xs font-bold gap-2">
        {/* Item 37 */}
        <button
          onClick={() => setActiveTab('hubs')}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'hubs' ? 'border-purple-400 text-white font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Hash className="w-4 h-4 text-purple-400" />
          <span>مجتمعات الاهتمامات (Hubs)</span>
        </button>

        {/* Item 36 */}
        <button
          onClick={() => setActiveTab('anonymous_qa')}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'anonymous_qa' ? 'border-cyan-400 text-white font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>صندوق الأسئلة الصامتة (صراحة)</span>
        </button>

        {/* Item 40 */}
        <button
          onClick={() => setActiveTab('memories')}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'memories' ? 'border-amber-400 text-white font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>ذكريات في مثل هذا اليوم</span>
        </button>
      </div>

      {/* TAB 1: Interest Hubs (Item 37) */}
      {activeTab === 'hubs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communityHubs.map(hub => {
            const Icon = hub.icon;
            return (
              <div key={hub.id} className="p-5 bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-400/40 transition space-y-3 group text-right">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-mono">
                    {hub.members}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white">{hub.name}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{hub.desc}</p>
                <button className="w-full py-2 bg-white/5 hover:bg-purple-600 border border-white/10 hover:border-transparent text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>انضم للمجتمع</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Anonymous Q&A (Item 36) */}
      {activeTab === 'anonymous_qa' && (
        <div className="space-y-5">
          {/* Ask box */}
          <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>اطرح سؤالاً سرياً ومجهولاً تماماً (دون معرفة هويتك):</span>
            </div>
            
            {sendSuccess && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 text-center font-bold">
                ✅ تم إرسال سؤالك السري بنجاح!
              </div>
            )}

            <form onSubmit={handleSendAnonymousQuestion} className="space-y-2 text-xs">
              <textarea
                rows={2}
                placeholder="اكتب سؤالاً أو مصارحة سرية..."
                value={anonymousInput}
                onChange={(e) => setAnonymousInput(e.target.value)}
                className="w-full p-3 bg-black/30 border border-white/10 rounded-2xl text-white text-right focus:outline-none focus:border-cyan-400 resize-none"
              />
              <button
                type="submit"
                disabled={!anonymousInput.trim()}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-glow transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 -rotate-90" />
                <span>إرسال بصوت مجهول 🎭</span>
              </button>
            </form>
          </div>

          {/* Q&A Thread */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-300 text-right">الأسئلة والإجابات المفتوحة:</h4>
            {questions.map(q => (
              <div key={q.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-right">
                <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold">
                  <span>❓ سؤال مجهول:</span>
                </div>
                <p className="text-xs sm:text-sm text-white font-medium">{q.question}</p>

                {/* Answer if exists */}
                {q.answer ? (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-300 block">رد {currentUser.firstName}:</span>
                    <p className="text-gray-200">{q.answer}</p>
                  </div>
                ) : (
                  /* Answer Input for recipient */
                  <div className="flex items-center gap-1.5 pt-2">
                    <input
                      type="text"
                      placeholder="اكتب ردك العلني على هذا السؤال..."
                      value={answerInputs[q.id] || ''}
                      onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() => handleAnswerQuestion(q.id)}
                      disabled={!answerInputs[q.id]?.trim()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold disabled:opacity-30"
                    >
                      نشر الرد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: On This Day Memories (Item 40) */}
      {activeTab === 'memories' && (
        <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6 space-y-4 text-right">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold">
              📅 في مثل هذا اليوم قبل عام
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <h4 className="font-bold text-sm text-white">"أول يوم في انطلاق الفكرة العظيمة..."</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              "اليوم بدأنا تصميم وتطوير منصة دردشة للجمع بين حرية التواصل وأعلى معايير الخصوصية الرقمية. الذكريات الجميلة تصنع المستقبل!"
            </p>
            <div className="text-[10px] text-gray-500 font-mono pt-1">
              8 أكتوبر 2025 • تم الحفظ في ذكرياتك
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
