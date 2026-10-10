import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, QrCode, Copy, Check, Users, Clock, 
  X, CheckCircle, XCircle, Sparkles, Share2, ShieldCheck, 
  Star, Home, Briefcase, Globe, Loader2, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export default function AddFriendModal({
  isOpen,
  onClose,
  currentUser,
  onFriendAdded
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'requests', 'qr', 'suggestions'
  const [requestSubTab, setRequestSubTab] = useState('incoming'); // 'incoming', 'outgoing'
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedCircles, setSelectedCircles] = useState({}); // requestId -> circle

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // QR state
  const [qrData, setQrData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualQrToken, setManualQrToken] = useState('');
  const [claimingQr, setClaimingQr] = useState(false);

  // Notification / Toast
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRequests();
      loadSuggestions();
      loadQr();
    }
  }, [isOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.getFriendRequests();
      setIncomingRequests(res.incoming || []);
      setOutgoingRequests(res.outgoing || []);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await api.getFriendSuggestions();
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadQr = async () => {
    try {
      const res = await api.getFriendQrData();
      setQrData(res);
    } catch (err) {
      console.error('Failed to load QR data:', err);
    }
  };

  const handleSendRequest = async (identifier) => {
    const target = identifier || searchInput;
    if (!target || !target.trim()) return;

    try {
      setSearching(true);
      setSearchError('');
      setSearchFeedback(null);
      
      const res = await api.sendFriendRequest(target.trim());
      setSearchFeedback(res);
      showToast(res.message || 'تم إرسال طلب الصداقة بنجاح!');
      setSearchInput('');
      loadRequests();
      loadSuggestions();
    } catch (err) {
      setSearchError(err.message || 'فشل إرسال الطلب');
    } finally {
      setSearching(false);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      const circle = selectedCircles[requestId] || 'all';
      const res = await api.respondFriendRequest(requestId, action, circle);
      showToast(res.message);
      loadRequests();
      if (action === 'accept' && onFriendAdded) {
        onFriendAdded();
      }
    } catch (err) {
      showToast(err.message || 'حدث خطأ في معالجة الطلب');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await api.cancelFriendRequest(requestId);
      showToast('تم إلغاء طلب الصداقة');
      loadRequests();
    } catch (err) {
      showToast(err.message || 'فشل إلغاء الطلب');
    }
  };

  const handleCopyLink = () => {
    if (!qrData?.shareLink) return;
    navigator.clipboard.writeText(qrData.shareLink);
    setCopiedLink(true);
    showToast('تم نسخ رابط الصداقة الخاص بك إلى الحافظة! 📋');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaimQr = async (e) => {
    e?.preventDefault();
    if (!manualQrToken.trim()) return;

    try {
      setClaimingQr(true);
      const res = await api.claimFriendQr(manualQrToken.trim());
      showToast(res.message);
      setManualQrToken('');
      loadRequests();
    } catch (err) {
      showToast(err.message || 'فشل ربط الرمز');
    } finally {
      setClaimingQr(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-glow">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>إضافة وإدارة الأصدقاء</span>
                {incomingRequests.length > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                    {incomingRequests.length} جديد
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">ابحث عن أصدقاء، امسح رموز QR، وأدر طلبات الصداقة والدوائر</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Notice */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-purple-900/80 to-slate-900 border border-purple-500/40 text-purple-200 rounded-2xl text-xs font-bold text-center animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-3 pt-2 bg-[#0d1322] text-xs font-bold gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'search' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span>البحث والإضافة</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'requests' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>الطلبات</span>
            {incomingRequests.length > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>رمز QR والرابط</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'suggestions' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>قد تعرفهم</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: Search & Add */}
          {activeTab === 'search' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <p className="text-gray-300">
                  ابحث عن صديقك عبر اسم المستخدم (مثال: <code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">@sarah</code>) أو بريده الإلكتروني:
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="اكتب المعرف أو البريد الإلكتروني..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                      className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-xs text-right pr-9"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                  </div>

                  <button
                    onClick={() => handleSendRequest()}
                    disabled={searching || !searchInput.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-glow disabled:opacity-50 transition"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>إرسال الطلب</span>
                  </button>
                </div>

                {/* Quick Suggestion Tags */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-gray-400">حسابات شائعة:</span>
                  {['@sarah', '@omar', '@layla', '@salem'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchInput(tag);
                        handleSendRequest(tag);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 rounded-lg text-[11px] font-mono transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Box */}
              {searchError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-center font-bold animate-in fade-in">
                  {searchError}
                </div>
              )}

              {/* Success Result Card */}
              {searchFeedback && (
                <div className="p-4 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={searchFeedback.targetUser.avatar} 
                        alt="Avatar" 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/40"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {searchFeedback.targetUser.firstName} {searchFeedback.targetUser.lastName}
                        </h4>
                        <p className="text-[11px] text-purple-300 font-mono">
                          @{searchFeedback.targetUser.email?.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {searchFeedback.targetUser.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم إرسال الطلب</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Requests Management */}
          {activeTab === 'requests' && (
            <div className="space-y-4 text-xs">
              {/* Sub tabs */}
              <div className="flex border-b border-white/10 pb-2 gap-2">
                <button
                  onClick={() => setRequestSubTab('incoming')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    requestSubTab === 'incoming' 
                      ? 'bg-purple-600 text-white shadow-glow' 
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>الطلبات الواردة</span>
                  <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px]">
                    {incomingRequests.length}
                  </span>
                </button>

                <button
                  onClick={() => setRequestSubTab('outgoing')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    requestSubTab === 'outgoing' 
                      ? 'bg-purple-600 text-white shadow-glow' 
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>الطلبات المرسلة</span>
                  <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px]">
                    {outgoingRequests.length}
                  </span>
                </button>
              </div>

              {/* Incoming Requests List */}
              {requestSubTab === 'incoming' && (
                <div className="space-y-3">
                  {loadingRequests ? (
                    <div className="p-8 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                      <span>جاري تحميل الطلبات...</span>
                    </div>
                  ) : incomingRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-500 opacity-60" />
                      <p className="font-bold text-white">لا توجد طلبات صداقة واردة حالياً</p>
                      <p className="text-[11px] text-gray-500 mt-1">عندما يرسل لك شخص طلب صداقة، ستجده هنا مع خيار تحديد دائرته الاجتماعية.</p>
                    </div>
                  ) : (
                    incomingRequests.map(req => (
                      <div 
                        key={req.id} 
                        className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-500/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.sender.avatar} 
                            alt="Sender" 
                            className="w-11 h-11 rounded-2xl object-cover ring-1 ring-cyan-400/40"
                          />
                          <div>
                            <h4 className="font-bold text-white text-xs">
                              {req.sender.firstName} {req.sender.lastName}
                            </h4>
                            <p className="text-[11px] text-cyan-300 font-mono">
                              @{req.sender.email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                              {req.sender.bio || 'مستخدم على منصة دردشة'}
                            </p>
                          </div>
                        </div>

                        {/* Actions + Circle Selector */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {/* Circle dropdown */}
                          <select
                            value={selectedCircles[req.id] || 'all'}
                            onChange={(e) => setSelectedCircles({ ...selectedCircles, [req.id]: e.target.value })}
                            className="px-2.5 py-1.5 bg-black/40 border border-white/15 rounded-xl text-white text-[11px] focus:outline-none"
                            title="اختر الدائرة الاجتماعية للصديق"
                          >
                            <option value="all">🌐 عام</option>
                            <option value="close_friends">⭐ الأصدقاء المقربون</option>
                            <option value="family">🏠 العائلة</option>
                            <option value="work">💼 العمل</option>
                          </select>

                          <button
                            onClick={() => handleRespondRequest(req.id, 'accept')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-glow text-[11px] transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>قبول</span>
                          </button>

                          <button
                            onClick={() => handleRespondRequest(req.id, 'reject')}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-rose-600/30 text-gray-400 hover:text-rose-300 rounded-xl flex items-center gap-1 text-[11px] transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>تجاهل</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Outgoing Requests List */}
              {requestSubTab === 'outgoing' && (
                <div className="space-y-3">
                  {outgoingRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-500 opacity-60" />
                      <p className="font-bold text-white">لا توجد طلبات مرسلة معلقة</p>
                    </div>
                  ) : (
                    outgoingRequests.map(req => (
                      <div 
                        key={req.id} 
                        className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.receiver.avatar} 
                            alt="Receiver" 
                            className="w-10 h-10 rounded-2xl object-cover ring-1 ring-purple-500/30"
                          />
                          <div>
                            <h4 className="font-bold text-white text-xs">
                              {req.receiver.firstName} {req.receiver.lastName}
                            </h4>
                            <p className="text-[11px] text-gray-400 font-mono">
                              @{req.receiver.email?.split('@')[0]}
                            </p>
                            <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>بانتظار الموافقة...</span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-rose-600/30 text-gray-400 hover:text-rose-300 rounded-xl text-[11px] font-bold transition"
                        >
                          إلغاء الطلب
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QR Code & Direct Share Link */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#0b0f19] border border-purple-500/30 rounded-3xl text-center space-y-4 shadow-xl">
                <div>
                  <h3 className="font-black text-sm text-white">رمز QR للصداقة الفورية</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    دع صديقك يمسح هذا الرمز بكاميرته لإضافتك في ثانية دون كتابة
                  </p>
                </div>

                {qrData?.qrCodeUrl && (
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-glow-accent border-2 border-purple-400/40">
                    <img 
                      src={qrData.qrCodeUrl} 
                      alt="Personal Friend QR Code" 
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                )}

                {/* Share Link Copy */}
                <div className="p-3 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-between gap-2 max-w-md mx-auto text-right">
                  <span className="text-[11px] font-mono text-purple-300 truncate" dir="ltr">
                    {qrData?.shareLink || 'https://dardasha.app/add/@user'}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-1 text-[11px] shadow-glow flex-shrink-0 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>

              {/* Paste Friend QR Code Token */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>هل وصلك رمز اتصال أو كود QR من صديق؟</span>
                </h4>
                <p className="text-[11px] text-gray-400">
                  الصق كود الصداقة هنا للارتباط بحسابه فوراً:
                </p>

                <form onSubmit={handleClaimQr} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="الصق كود friend-qr-... هنا"
                    value={manualQrToken}
                    onChange={(e) => setManualQrToken(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={claimingQr || !manualQrToken.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 transition"
                  >
                    {claimingQr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'ربط'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: Suggestions (People you may know) */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>أشخاص قد تعرفهم في مجتمع دردشة</span>
                </span>
                <span className="text-gray-400 text-[11px]">مبني على الاهتمامات المشتركة</span>
              </div>

              {loadingSuggestions ? (
                <div className="p-8 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>جاري البحث عن اقتراحات...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="font-bold text-white">أنت متصل بالفعل بجميع الأعضاء المقترحين!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map(person => (
                    <div 
                      key={person.id} 
                      className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={person.avatar} 
                          alt="Avatar" 
                          className="w-11 h-11 rounded-2xl object-cover ring-1 ring-amber-400/30 group-hover:ring-amber-400 transition"
                        />
                        <div className="space-y-0.5 truncate">
                          <h4 className="font-bold text-white text-xs truncate">
                            {person.firstName} {person.lastName}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            @{person.email?.split('@')[0]}
                          </p>
                          <span className="inline-block text-[10px] text-amber-300/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 truncate max-w-full">
                            {person.mutualReason}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequest(person.id)}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-glow text-[11px] transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>إضافة صديق</span>
                      </button>
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام صداقة مشفر ومحمي من السبام</span>
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
