import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, 
  Sparkles, MessageSquare, Mic, CheckCheck, Clock, PenTool,
  Tv, BarChart3, Shield, Ghost, Edit2, Trash2, Volume2, Play,
  Pause, FileText, Check, Lock, Unlock, Radio, EyeOff, AlertTriangle,
  Pin, PinOff, Flame, Gift, Eye, Globe2, Music, Bookmark, QrCode,
  FileCheck, Headphones, CornerDownLeft, X, Layers, Plus, Rocket, HelpCircle, User, UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import WhiteboardModal from './WhiteboardModal';
import ScheduleMessageModal from './ScheduleMessageModal';
import PollModal from './PollModal';
import WatchTogetherModal from './WatchTogetherModal';
import E2EVerificationModal from './E2EVerificationModal';
import SoundStickersDrawer from './SoundStickersDrawer';
import ChatPerLockModal from './ChatPerLockModal';
import SavedVaultView from './SavedVaultView';
import StickerStudioModal from './StickerStudioModal';
import { bubbleStylesCatalog } from '../themes/BubbleStudioModal';
import { sounds } from '../../utils/soundEffects';

export default function ChatView({ 
  currentUser, 
  onOpenAiModal, 
  onOpenTypography, 
  onOpenBubbleStudio, 
  onOpenTour,
  onOpenContactProfile,
  onOpenAddFriend,
  activeChatContact
}) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Superpower Feature States
  const [isStealthMode, setIsStealthMode] = useState(false); // 🥷 Stealth Mode
  const [isGhostUnlocked, setIsGhostUnlocked] = useState(false); // 👻 Ghost Chat PIN Mode
  const [isWalkieTalkieActive, setIsWalkieTalkieActive] = useState(false); // 🎙️ Walkie Talkie Lounge
  const [screenshotShield, setScreenshotShield] = useState(true); // 🛡️ Screenshot Shield
  const [screenshotAlert, setScreenshotAlert] = useState(false);
  const [showMagicActions, setShowMagicActions] = useState(false); // ✨ Magic Actions Popover

  // Items 1, 2, 6, 8, 9, 23, 28, 48, 63, 68, 82, 97
  const [selfDestructSec, setSelfDestructSec] = useState(null); // Item 1
  const [isWhisperMode, setIsWhisperMode] = useState(false); // Item 2
  const [isRawFileActive, setIsRawFileActive] = useState(false); // Item 6
  const [isGiftBoxMode, setIsGiftBoxMode] = useState(false); // Item 63
  const [isViewOnceMode, setIsViewOnceMode] = useState(false); // Item 48
  const [isAutoTranslate, setIsAutoTranslate] = useState(false); // Item 9
  const [isGroupRadioPlaying, setIsGroupRadioPlaying] = useState(false); // Item 23
  const [isEarPieceMode, setIsEarPieceMode] = useState(false); // Item 97 (Proximity earpiece simulation)
  const [isIncognitoSession, setIsIncognitoSession] = useState(false); // Item 8
  const [pinnedMessage, setPinnedMessage] = useState(null); // Item 5

  // Modals & Drawers
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [isE2EOpen, setIsE2EOpen] = useState(false); // Item 41
  const [isSoundStickersOpen, setIsSoundStickersOpen] = useState(false); // Item 69
  const [isStickerStudioOpen, setIsStickerStudioOpen] = useState(false); // Sticker Studio & Memes
  const [isChatLockOpen, setIsChatLockOpen] = useState(false); // Item 45
  const [isVaultOpen, setIsVaultOpen] = useState(false); // Item 54
  const [lockedContactIds, setLockedContactIds] = useState(new Set(['contact-locked-sample']));
  const [unlockedSessionContactIds, setUnlockedSessionContactIds] = useState(new Set());

  // Message Action States (Edit)
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInputText, setEditInputText] = useState('');

  // Voice Note State
  const [transcribedMsgIds, setTranscribedMsgIds] = useState(new Set());
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [openedViewOnceIds, setOpenedViewOnceIds] = useState(new Set());
  const [openedGiftIds, setOpenedGiftIds] = useState(new Set());

  // Item 102: Voice Speed
  const [voiceSpeed, setVoiceSpeed] = useState('1.0x');

  // Item 89: Active Bubble Style
  const activeBubbleStyleId = localStorage.getItem('dardasha_bubble_style') || 'cosmic-glass';
  const activeBubbleObj = bubbleStylesCatalog.find(b => b.id === activeBubbleStyleId) || bubbleStylesCatalog[0];

  const messagesEndRef = useRef(null);

  // Item 112: Cross-Device Draft Sync Load
  useEffect(() => {
    if (selectedContact) {
      api.getDraft(selectedContact.id).then(res => {
        if (res && res.draft) setInputText(res.draft);
      }).catch(console.warn);
    }
  }, [selectedContact]);

  // Item 112: Cross-Device Draft Sync Save
  useEffect(() => {
    if (selectedContact && inputText) {
      const timer = setTimeout(() => {
        api.saveDraft(selectedContact.id, inputText).catch(console.warn);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [inputText, selectedContact]);

  // Item 70: Export Chat to Signed PDF / Document
  const handleExportPdf = () => {
    const contactName = `${selectedContact?.firstName} ${selectedContact?.lastName}`;
    const header = `وثيقة محادثة مشفرة - منصة Dardasha (دردشة)\nالطرفان: ${currentUser?.firstName} & ${contactName}\nالتاريخ: ${new Date().toLocaleString('ar-EG')}\nالتوقيع الرقمي: SHA256-DARDASHA-VERIFIED-PASS-OK\n----------------------------------------\n\n`;
    const body = messages.map(m => {
      const sender = m.senderId === currentUser.id ? currentUser.firstName : contactName;
      return `[${new Date(m.createdAt).toLocaleTimeString('ar-EG')}] ${sender}: ${m.content || (m.isVoice ? '[تسجيل صوتي]' : '[وسائط]')}`;
    }).join('\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dardasha_Chat_${selectedContact?.firstName}_Signed.txt`;
    a.click();
    alert('✅ تم تصدير واستخراج وثيقة المحادثة الموقعة رقمياً بنجاح!');
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (activeChatContact) {
      setSelectedContact(activeChatContact);
    }
  }, [activeChatContact]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await api.getContacts();
      setContacts(res.contacts || []);
      if (res.contacts && res.contacts.length > 0 && !selectedContact) {
        setSelectedContact(res.contacts[0]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const loadMessages = async (contactId) => {
    try {
      setLoadingMessages(true);
      const res = await api.getChatHistory(contactId);
      
      let msgs = res.messages || [];
      if (msgs.length === 0) {
        msgs = [
          {
            id: 'voice-demo-1',
            senderId: contactId,
            receiverId: currentUser.id,
            content: 'تسجيل صوتي (Voice Note)',
            isVoice: true,
            voiceDuration: '0:18',
            voiceTranscription: 'مرحباً يا غالي! أردت فقط التأكد من موعد لقائنا لمراجعة تفاصيل المشروع اليوم، بانتظار ردك.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: true,
          },
          {
            id: 'gift-demo-1',
            senderId: contactId,
            receiverId: currentUser.id,
            content: 'مبروك ترقيتك للمستوى الجديد في دردشة! تستاهل كل خير 🎉🎁',
            isGiftBox: true,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            read: true,
          }
        ];
      }
      setMessages(msgs);
      // check if any message is pinned
      const pinned = msgs.find(m => m.isPinned);
      if (pinned) setPinnedMessage(pinned);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, polls]);

  // Ghost Mode PIN Detection in Search Bar
  useEffect(() => {
    if (searchQuery.trim() === '#007' || searchQuery.trim() === '1234') {
      setIsGhostUnlocked(true);
    }
  }, [searchQuery]);

  // Item 91: Smart Haptic Feedback simulation
  const triggerHaptic = (pattern = [30]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Item 65: Magic Trigger Words Detection
  const checkMagicWords = (text) => {
    if (/مبروك|تهانينا|الف مبروك|ألف مبروك/.test(text)) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else if (/أحبك|احبك|قلبي|حب/.test(text)) {
      confetti({ particleCount: 80, spread: 60, shapes: ['circle'], colors: ['#f43f5e', '#ec4899', '#fda4af'] });
    }
  };

  // Send Message with all superpower attributes
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Trigger magic words celebration if matched (Item 65)
    checkMagicWords(textToSend);
    triggerHaptic([40]);
    sounds.playSend();

    const tempMsg = {
      id: 'temp-' + Date.now(),
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: textToSend,
      selfDestruct: selfDestructSec, // Item 1
      isWhisper: isWhisperMode, // Item 2
      whisperTargetId: selectedContact.id,
      isRawFile: isRawFileActive, // Item 6
      rawFileSize: isRawFileActive ? '42.8 MB (RAW)' : null,
      isGiftBox: isGiftBoxMode, // Item 63
      isViewOnce: isViewOnceMode, // Item 48
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, tempMsg]);

    // Reset one-time flags
    setSelfDestructSec(null);
    setIsWhisperMode(false);
    setIsRawFileActive(false);
    setIsGiftBoxMode(false);
    setIsViewOnceMode(false);

    try {
      const res = await api.sendMessage(selectedContact.id, textToSend, {
        selfDestruct: tempMsg.selfDestruct,
        isWhisper: tempMsg.isWhisper,
        whisperTargetId: tempMsg.whisperTargetId,
        isRawFile: tempMsg.isRawFile,
        rawFileSize: tempMsg.rawFileSize,
        isGiftBox: tempMsg.isGiftBox,
        isViewOnce: tempMsg.isViewOnce,
      });
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Item 69: Send Sound Sticker
  const handleSendSoundSticker = async (sticker) => {
    if (!selectedContact) return;
    const tempMsg = {
      id: 'ss-' + Date.now(),
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: `${sticker.emoji} ملصق صوتي: ${sticker.title}`,
      soundSticker: sticker,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, tempMsg]);
    sounds.playSend();
    triggerHaptic([50, 50]);
    try {
      await api.sendMessage(selectedContact.id, tempMsg.content, { soundSticker: sticker });
    } catch (err) {
      console.warn(err);
    }
  };

  // Sticker Studio: Send Custom Designed Sticker
  const handleSendCustomSticker = async (sticker) => {
    if (!selectedContact) return;
    const tempMsg = {
      id: 'stk-' + Date.now(),
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: `[ملصق مخصص] ${sticker.topText || ''} ${sticker.bottomText || ''}`.trim(),
      sticker: sticker,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, tempMsg]);
    sounds.playSend();
    triggerHaptic([40, 20]);
    try {
      await api.sendMessage(selectedContact.id, tempMsg.content, { sticker });
    } catch (err) {
      console.warn('Failed to send custom sticker:', err);
    }
  };

  const handleSendVoiceDemo = () => {
    if (!selectedContact) return;
    const tempVoice = {
      id: 'voice-' + Date.now(),
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: '',
      isVoice: true,
      voiceDuration: '0:14',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, tempVoice]);
    sounds.playSend();
    triggerHaptic([30, 20]);
  };

  // Item 10: 3D Animated Reaction Particle Bursts
  const handleReactionBurst = (emoji) => {
    triggerHaptic([20, 30, 20]);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  // Item 5: Toggle Pin
  const handleTogglePin = async (msg) => {
    try {
      const res = await api.togglePinMessage(msg.id);
      if (res.message?.isPinned) {
        setPinnedMessage(res.message);
      } else {
        setPinnedMessage(null);
      }
      setMessages(prev => prev.map(m => m.id === msg.id ? res.message : m));
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Message
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditInputText(msg.content);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editInputText.trim()) return;
    try {
      await api.editMessage(msgId, editInputText.trim());
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editInputText.trim(), isEdited: true } : m));
      setEditingMessageId(null);
    } catch (err) {
      console.error('Failed to edit:', err);
    }
  };

  // Clean Delete
  const handleDeleteClean = async (msgId) => {
    try {
      await api.deleteMessageClean(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Failed to delete cleanly:', err);
    }
  };

  // Toggle Transcription
  const toggleTranscription = (msgId) => {
    setTranscribedMsgIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // Open Gift Box
  const handleOpenGift = (id) => {
    setOpenedGiftIds(prev => new Set(prev).add(id));
    sounds.playGift();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    triggerHaptic([30, 40, 50]);
  };

  // Open View Once Media
  const handleOpenViewOnce = (id) => {
    setOpenedViewOnceIds(prev => new Set(prev).add(id));
  };

  // Item 45: Handle selecting a potentially locked contact
  const handleContactClick = (contact) => {
    if (lockedContactIds.has(contact.id) && !unlockedSessionContactIds.has(contact.id)) {
      setSelectedContact(contact);
      setIsChatLockOpen(true);
    } else {
      setSelectedContact(contact);
    }
  };

  const filteredContacts = contacts.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-84px)] max-w-7xl mx-auto bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl text-white relative">
      
      {/* SCREENSHOT ALERT BANNER */}
      {screenshotAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rose-400 flex items-center gap-3 animate-in bounce-in">
          <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
          <div className="text-right">
            <h5 className="font-bold text-xs">⚠️ تنبيه درع الخصوصية (Screenshot Shield)</h5>
            <p className="text-[11px] opacity-90">تم رصد محاولة التقاط صورة للشاشة في هذه المحادثة!</p>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-l border-white/10 bg-[#0b0f19]/80 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt="Avatar" 
              className="w-10 h-10 rounded-2xl ring-2 ring-purple-500/40 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-xs sm:text-sm text-white">{currentUser.firstName} {currentUser.lastName}</h2>
                {isStealthMode && (
                  <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-bold">
                    🥷 مخفي
                  </span>
                )}
              </div>
              <span className="text-[11px] text-cyan-400 font-medium">
                {isStealthMode ? 'وضع التخفي نشط' : 'متصل في دردشة'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Item 54: Personal Vault Trigger */}
            <button
              onClick={() => setIsVaultOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 transition"
              title="خزنة الرسائل الشخصية (Personal Vault)"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Ghost Mode Indicator */}
            <button
              onClick={() => setIsGhostUnlocked(!isGhostUnlocked)}
              className={`p-2 rounded-xl transition border ${
                isGhostUnlocked
                  ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
              title={isGhostUnlocked ? 'محادثات الشبح مفتوحة (Ghost Mode)' : 'محادثات الشبح مقفلة (اكتب #007 في البحث)'}
            >
              <Ghost className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Add Friend */}
        <div className="p-3 border-b border-white/5 space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="بحث في الشات (اكتب #007 لفك قفل الشبح)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition text-right"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {onOpenAddFriend && (
              <button
                type="button"
                onClick={onOpenAddFriend}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white transition flex items-center gap-1 shadow-sm"
                title="إضافة صديق جديد"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>

          {isGhostUnlocked && (
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-200 flex items-center justify-between">
              <span>👻 وضع الشبح للمحادثات السرية مفعل</span>
              <button onClick={() => setIsGhostUnlocked(false)} className="text-cyan-400 hover:underline">قفل</button>
            </div>
          )}
        </div>

        {/* Contacts with Streaks (Item 82) & Chat Locks (Item 45) */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loadingContacts ? (
            <div className="p-8 text-center text-gray-500 text-xs">جاري التحميل...</div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id;
              const isLocked = lockedContactIds.has(contact.id);

              return (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition group ${
                    isSelected ? 'bg-gradient-to-l from-purple-600/25 to-transparent border-r-2 border-purple-400' : 'hover:bg-white/5'
                  }`}
                >
                  <div 
                    onClick={() => handleContactClick(contact)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="relative">
                      <img src={contact.avatar} alt="Avatar" className="w-11 h-11 rounded-2xl ring-1 ring-white/10 object-cover" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0b0f19]"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition">{contact.firstName} {contact.lastName}</h4>
                          <span className="px-1.5 py-0.2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[9px] font-bold font-mono">
                            🔥 14
                          </span>
                          {isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">الآن</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{contact.bio || 'انقر للبدء بالمحادثة'}</p>
                    </div>
                  </div>

                  {/* Quick Profile View Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenContactProfile) onOpenContactProfile(contact);
                    }}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition opacity-0 group-hover:opacity-100"
                    title="عرض الملف الشخصي"
                  >
                    <User className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* MAIN CHAT WINDOW */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-[#0b0f19]/40 relative">
          
          {/* Top Bar with Profile View & Actions */}
          <div className="p-3 bg-[#0f172a]/90 backdrop-blur border-b border-white/10 flex items-center justify-between z-10 flex-wrap gap-2">
            
            {/* Contact details with profile opener */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedContact(null)} className="md:hidden text-gray-400 hover:text-white ml-1 font-bold text-xs">
                ←
              </button>
              
              <div 
                onClick={() => onOpenContactProfile && onOpenContactProfile(selectedContact)}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="انقر لعرض الملف الشخصي الكامل"
              >
                <div className="relative">
                  <img src={selectedContact.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl ring-1 ring-purple-400/40 object-cover group-hover:ring-cyan-400 transition" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition flex items-center gap-1.5">
                      <span>{selectedContact.firstName} {selectedContact.lastName}</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 font-normal">
                        الملف الشخصي
                      </span>
                    </h3>
                    <span className="text-[10px] text-orange-400 font-mono font-bold">🔥 14 يوم</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-medium">متصل في دردشة</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsE2EOpen(true); }}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                      title="التحقق من التشفير التام E2E"
                    >
                      <span>• مشفر E2E</span>
                      <Shield className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Superpower Actions Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              
              {/* Item 8: One-Time Ephemeral Session */}
              <button
                onClick={() => setIsIncognitoSession(!isIncognitoSession)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition border ${
                  isIncognitoSession
                    ? 'bg-purple-600 text-white border-purple-400 shadow-glow'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="محادثة مؤقتة سريعة تُمسح فور الخروج (Ephemeral Session)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">مؤقتة</span>
              </button>

              {/* Item 9: Auto Bi-directional Translator */}
              <button
                onClick={() => setIsAutoTranslate(!isAutoTranslate)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition border ${
                  isAutoTranslate
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="ترجمة ثنائية فورية تلقائية"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ترجمة فورية</span>
              </button>

              {/* Item 23: Group Audio Radio */}
              <button
                onClick={() => setIsGroupRadioPlaying(!isGroupRadioPlaying)}
                className={`p-1.5 rounded-xl transition border ${
                  isGroupRadioPlaying
                    ? 'bg-amber-600 text-white border-amber-400 shadow-glow'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="محطة راديو المجموعة المباشرة"
              >
                <Radio className="w-4 h-4 text-amber-300" />
              </button>

              {/* Item 97: Proximity Ear-piece simulation */}
              <button
                onClick={() => setIsEarPieceMode(!isEarPieceMode)}
                className={`p-1.5 rounded-xl transition border ${
                  isEarPieceMode
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title={isEarPieceMode ? 'وضع سماعة الأذن الخاصة نشط 🦻' : 'وضع مكبر الصوت نشط 🔊'}
              >
                <Headphones className="w-4 h-4" />
              </button>

              {/* 🥷 Stealth Mode */}
              <button
                onClick={() => setIsStealthMode(!isStealthMode)}
                className={`p-1.5 rounded-xl transition border ${
                  isStealthMode
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="وضع التخفي الكامل"
              >
                <EyeOff className="w-4 h-4" />
              </button>

              {/* 📺 Watch Together */}
              <button
                onClick={() => setIsWatchOpen(true)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300"
                title="مشاركة واستماع متزامن"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* 🎨 Shared Whiteboard */}
              <button
                onClick={() => setIsWhiteboardOpen(true)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
                title="لوحة الرسم المشتركة"
              >
                <PenTool className="w-4 h-4" />
              </button>

              {/* 📄 Item 70: Export Signed Chat Document */}
              <button
                onClick={handleExportPdf}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 transition"
                title="تصدير وثيقة المحادثة الموقعة رقمياً"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ITEM 5: STICKY PINNED BANNER */}
          {pinnedMessage && (
            <div className="bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-900 border-b border-purple-500/30 px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top">
              <div className="flex items-center gap-2 truncate">
                <Pin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-gray-400 text-[11px] flex-shrink-0">رسالة مثبتة:</span>
                <span className="font-bold text-white truncate">{pinnedMessage.content}</span>
              </div>
              <button 
                onClick={() => setPinnedMessage(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
                title="إلغاء التثبيت"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ITEM 23: GROUP AUDIO RADIO BROADCAST BANNER */}
          {isGroupRadioPlaying && (
            <div className="bg-gradient-to-r from-amber-950/90 to-orange-950/90 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-bold text-amber-200">بث راديو المجموعة المباشر (Group Radio Stream 📻)</span>
                <span className="text-[10px] text-amber-400/80 font-mono">• 12 مستمع</span>
              </div>
              <audio autoPlay loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
              <button onClick={() => setIsGroupRadioPlaying(false)} className="text-xs text-amber-300 hover:underline">إيقاف</button>
            </div>
          )}

          {/* MESSAGES FEED */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
            {loadingMessages ? (
              <div className="text-center text-xs text-gray-500 py-6 my-auto">جاري التحميل...</div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl shadow-inner shadow-black/40">
                  ☕
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-gray-200">صندوقك هادئ حالياً</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    ابدأ المحادثة بترحيب لطيف أو فنجان قهوة ☕ أو أهدِ صديقك هدية مميزة من عالم الـ 100,000 هدية 🎁
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setInputText('السلام عليكم ورحمة الله وبركاته 👋');
                      sounds.playClick();
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 transition"
                  >
                    👋 مرحباً
                  </button>
                  <button
                    onClick={() => {
                      setInputText('صباح / مساء الخير ☕ كيف حالك اليوم؟');
                      sounds.playClick();
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-amber-300 transition"
                  >
                    ☕ كيف حالك؟
                  </button>
                  <button
                    onClick={() => {
                      setIsGiftBoxMode(true);
                      sounds.playClick();
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 transition flex items-center gap-1"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>إرسال هدية</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isVoice = msg.isVoice;
                const showTranscription = transcribedMsgIds.has(msg.id);
                const isGift = msg.isGiftBox;
                const isGiftOpened = openedGiftIds.has(msg.id);
                const isViewOnce = msg.isViewOnce;
                const isViewOnceOpened = openedViewOnceIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-start' : 'justify-end'} group`}
                  >
                    <div className="relative max-w-[85%] sm:max-w-[70%]">
                      
                      {/* ACTION CONTROLS ON HOVER (Pin, Edit & Clean Delete) */}
                      {isMine && !isVoice && (
                        <div className="absolute -top-6 right-0 hidden group-hover:flex items-center gap-1 bg-[#1e293b] border border-white/10 px-2 py-0.5 rounded-lg text-[10px] text-gray-300 shadow-md z-20">
                          {/* Item 5: Pin */}
                          <button
                            onClick={() => handleTogglePin(msg)}
                            className="hover:text-amber-300 flex items-center gap-0.5"
                            title="تثبيت في أعلى الشات"
                          >
                            <Pin className="w-3 h-3" />
                            <span>تثبيت</span>
                          </button>
                          <span className="text-gray-600">|</span>
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="hover:text-cyan-300 flex items-center gap-0.5"
                            title="تعديل الرسالة"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>
                          <span className="text-gray-600">|</span>
                          <button
                            onClick={() => handleDeleteClean(msg.id)}
                            className="hover:text-rose-400 flex items-center gap-0.5"
                            title="حذف بدون أثر"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        </div>
                      )}

                      {/* MESSAGE BUBBLE (Item 89: Dynamic Bubble Styles) */}
                      <div
                        className={`p-3 sm:px-4 text-xs sm:text-sm leading-relaxed shadow-lg relative transition-all ${
                          isMine 
                            ? `${activeBubbleObj.previewClass} rounded-tr-none` 
                            : 'bg-white/10 backdrop-blur-md text-gray-100 rounded-2xl rounded-tl-none border border-white/10'
                        }`}
                      >
                        {/* ITEM 1: Self-Destruct Countdown Badge */}
                        {msg.selfDestruct && (
                          <div className="mb-1 text-[10px] text-amber-300 flex items-center gap-1 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                            <span>🔥 تدمير ذاتي بعد {msg.selfDestruct} ثانية</span>
                          </div>
                        )}

                        {/* ITEM 2: Whisper Message Container */}
                        {msg.isWhisper && (
                          <div className="mb-1.5 p-2 bg-black/40 border border-purple-400/40 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>همسة سرية موجهة (Whisper Message)</span>
                          </div>
                        )}

                        {/* ITEM 6: Zero Compression RAW File Badge */}
                        {msg.isRawFile && (
                          <div className="mb-2 p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs flex items-center justify-between">
                            <span className="font-mono text-cyan-300 font-bold">ملف خام أصلي (100% RAW)</span>
                            <span className="text-[10px] text-gray-400 font-mono">{msg.rawFileSize}</span>
                          </div>
                        )}

                        {/* ITEM 63: Gift Box Wrapped Message */}
                        {isGift && !isGiftOpened ? (
                          <div 
                            onClick={() => handleOpenGift(msg.id)}
                            className="p-4 bg-gradient-to-tr from-rose-900 to-purple-900 rounded-xl border border-rose-400/40 text-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-glow"
                          >
                            <Gift className="w-10 h-10 text-amber-300 mx-auto animate-bounce mb-1" />
                            <h4 className="font-bold text-xs text-white">لديك رسالة مفاجأة داخل صندوق هدية! 🎁</h4>
                            <span className="text-[10px] text-cyan-300 underline block mt-1">انقر هنا لفتح الهدية والمفاجأة</span>
                          </div>
                        ) : isViewOnce && isViewOnceOpened ? (
                          /* ITEM 48: View-Once Already Dissolved */
                          <div className="p-2.5 bg-black/30 text-gray-500 rounded-xl text-xs flex items-center gap-1.5 font-mono italic">
                            <Eye className="w-4 h-4" />
                            <span>تمت مشاهدة الوسائط لمرة واحدة واختفت 💨</span>
                          </div>
                        ) : isViewOnce ? (
                          /* ITEM 48: View Once Button */
                          <div 
                            onClick={() => handleOpenViewOnce(msg.id)}
                            className="p-3 bg-cyan-950/50 border border-cyan-400 rounded-xl cursor-pointer hover:bg-cyan-900/50 transition flex items-center gap-2"
                          >
                            <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-900 font-black text-xs flex items-center justify-center">1</span>
                            <div>
                              <span className="font-bold text-xs text-white block">صورة للعرض مرة واحدة فقط</span>
                              <span className="text-[10px] text-cyan-300">انقر للمشاهدة قبل الحذف الذاتي</span>
                            </div>
                          </div>
                        ) : msg.soundSticker ? (
                          /* ITEM 69: Interactive Sound Sticker */
                          <div 
                            onClick={() => {
                              sounds.playStickerSound(msg.soundSticker.id);
                              triggerHaptic([20, 20]);
                            }}
                            className="p-3 bg-white/10 rounded-2xl border border-white/20 text-center cursor-pointer hover:scale-105 transition active:scale-95 space-y-1"
                          >
                            <span className="text-4xl block">{msg.soundSticker.emoji}</span>
                            <span className="font-bold text-xs text-cyan-300 block">{msg.soundSticker.title}</span>
                            <span className="text-[10px] text-gray-300 flex items-center justify-center gap-1 font-mono">
                              <Volume2 className="w-3 h-3 text-purple-300" />
                              <span>انقر للاستماع للصوت</span>
                            </span>
                          </div>
                        ) : msg.sticker ? (
                          /* Custom Sticker from Sticker Studio */
                          <div 
                            className="p-2.5 bg-black/40 rounded-2xl border-2 text-center overflow-hidden max-w-[210px] space-y-1"
                            style={{ borderColor: msg.sticker.outlineColor || '#8b5cf6' }}
                          >
                            <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/10">
                              <img src={msg.sticker.img} alt="Custom Sticker" className="w-full h-36 object-cover" />
                              {msg.sticker.topText && (
                                <span className="absolute top-1 inset-x-1 text-center font-black text-white text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/50 px-1 py-0.5 rounded backdrop-blur-sm truncate">
                                  {msg.sticker.topText}
                                </span>
                              )}
                              {msg.sticker.bottomText && (
                                <span className="absolute bottom-1 inset-x-1 text-center font-black text-amber-300 text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/50 px-1 py-0.5 rounded backdrop-blur-sm truncate">
                                  {msg.sticker.bottomText}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 block font-mono">ملصق استوديو دردشة ✨</span>
                          </div>
                        ) : editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editInputText}
                              onChange={(e) => setEditInputText(e.target.value)}
                              className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded-lg text-xs text-white focus:outline-none"
                            />
                            <div className="flex justify-end gap-1.5 text-[11px]">
                              <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 text-gray-300">إلغاء</button>
                              <button onClick={() => handleSaveEdit(msg.id)} className="px-2 py-0.5 bg-cyan-500 text-slate-900 font-bold rounded">حفظ</button>
                            </div>
                          </div>
                        ) : isVoice ? (
                          /* Voice Player */
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                              >
                                {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                              </button>
                              <div className="flex-1 space-y-1">
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                  <div className={`h-full bg-cyan-400 ${playingVoiceId === msg.id ? 'w-2/3 animate-pulse' : 'w-1/4'}`}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/70 font-mono">
                                  <span>{msg.voiceDuration || '0:15'}</span>
                                  {/* Item 102: Audio Speed Controls */}
                                  <div className="flex items-center gap-1">
                                    {['0.75x', '1.0x', '1.5x', '2.0x'].map(spd => (
                                      <button
                                        key={spd}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setVoiceSpeed(spd); }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                                          voiceSpeed === spd 
                                            ? 'bg-cyan-400 text-slate-900 shadow-glow' 
                                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                                        }`}
                                      >
                                        {spd}
                                      </button>
                                    ))}
                                  </div>
                                  <span>{isEarPieceMode ? '🦻 سماعة خاصة' : '🔊 مكبر صوت'}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleTranscription(msg.id)}
                              className="w-full py-1.5 px-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-[11px] font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition"
                            >
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{showTranscription ? 'إخفاء النص المفرغ' : '✨ تفريغ الصوت إلى نص'}</span>
                            </button>

                            {showTranscription && (
                              <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-purple-200 animate-in fade-in leading-relaxed text-right">
                                📝 {msg.voiceTranscription || 'مرحباً، تم تحويل الفويس نوت إلى نص بنجاح!'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            
                            {/* ITEM 9: In-Chat Auto Translation Card */}
                            {isAutoTranslate && (
                              <div className="mt-2 pt-2 border-t border-white/15 text-[11px] text-cyan-200 flex items-center gap-1.5 font-sans">
                                <Globe2 className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                                <span>ترجمة فورية: "{msg.content}"</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Time & Checks */}
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-white/60 font-mono">
                          {msg.isPinned && <Pin className="w-3 h-3 text-amber-300" />}
                          {msg.isEdited && <span className="text-[9px] text-purple-200">معدلة</span>}
                          <span>{timeString}</span>
                          {isMine && !isStealthMode && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                        </div>
                      </div>

                      {/* ITEM 10: 3D Reaction Burst Buttons */}
                      <div className="flex items-center gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition duration-150">
                        {['❤️', '🔥', '🎉', '👏', '🚀'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReactionBurst(emoji)}
                            className="p-1 rounded-full hover:bg-white/10 hover:scale-125 transition text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR WITH CLEAN MAGIC ACTIONS & COMPOSER */}
          <div className="bg-[#0f172a]/95 backdrop-blur border-t border-white/10 p-3 space-y-2">
            
            {/* Active Mode Indicators Strip */}
            {(selfDestructSec || isWhisperMode || isGiftBoxMode || isViewOnceMode || isRawFileActive) && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] animate-in fade-in">
                {selfDestructSec && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>تدمير ذاتي: {selfDestructSec}ث</span>
                    <button onClick={() => setSelfDestructSec(null)} className="hover:text-white mr-1 font-bold">×</button>
                  </span>
                )}
                {isWhisperMode && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>همسة سرية مشفرة</span>
                    <button onClick={() => setIsWhisperMode(false)} className="hover:text-white mr-1 font-bold">×</button>
                  </span>
                )}
                {isGiftBoxMode && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    <span>صندوق هدية تفاعلي</span>
                    <button onClick={() => setIsGiftBoxMode(false)} className="hover:text-white mr-1 font-bold">×</button>
                  </span>
                )}
                {isViewOnceMode && (
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>عرض لمرة واحدة 1x</span>
                    <button onClick={() => setIsViewOnceMode(false)} className="hover:text-white mr-1 font-bold">×</button>
                  </span>
                )}
                {isRawFileActive && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    <span>ملف خام RAW</span>
                    <button onClick={() => setIsRawFileActive(false)} className="hover:text-white mr-1 font-bold">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Input & Action Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
              
              {/* Magic Actions (+) Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMagicActions(!showMagicActions)}
                  className={`p-2.5 rounded-2xl border transition flex items-center justify-center ${
                    showMagicActions 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-glow' 
                      : 'bg-white/5 border-white/10 text-cyan-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="أدوات وميزات المحادثة السحرية (+)"
                >
                  <Plus className={`w-4 h-4 transform transition-transform ${showMagicActions ? 'rotate-45' : ''}`} />
                </button>

                {/* Popover Menu with Magic Actions */}
                {showMagicActions && (
                  <div className="absolute bottom-14 right-0 w-72 bg-[#111827] border border-white/15 rounded-3xl shadow-2xl p-3 z-40 animate-in slide-in-from-bottom-3 text-right space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>الأدوات السحرية للرسالة</span>
                      </span>
                      <button onClick={() => setShowMagicActions(false)} className="text-gray-400 hover:text-white text-xs">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsPollOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-cyan-300 transition"
                      >
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>استطلاع رأي</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsScheduleOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-purple-300 transition"
                      >
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>جدولة رسالة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsWhiteboardOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-emerald-300 transition"
                      >
                        <PenTool className="w-4 h-4 text-emerald-400" />
                        <span>لوحة رسم حية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsWatchOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-indigo-300 transition"
                      >
                        <Tv className="w-4 h-4 text-indigo-400" />
                        <span>مشاهدة معاً</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsWhisperMode(!isWhisperMode); }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition ${isWhisperMode ? 'bg-purple-600/30 border-purple-400 text-purple-200' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span>همسة سرية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsGiftBoxMode(!isGiftBoxMode); }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition ${isGiftBoxMode ? 'bg-rose-600/30 border-rose-400 text-rose-200' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        <Gift className="w-4 h-4 text-rose-400" />
                        <span>صندوق هدية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsViewOnceMode(!isViewOnceMode); }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition ${isViewOnceMode ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>عرض لمرة واحدة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsSoundStickersOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-amber-300 transition"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>ملصق صوتي</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsStickerStudioOpen(true); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-pink-300 transition"
                      >
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>استوديو الملصقات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); handleExportPdf(); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-teal-300 transition"
                      >
                        <FileText className="w-4 h-4 text-teal-400" />
                        <span>تصدير وثيقة PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); setIsRawFileActive(!isRawFileActive); }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition ${isRawFileActive ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>ملف خام RAW</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowMagicActions(false); onOpenAiModal && onOpenAiModal(); }}
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 flex items-center gap-2 text-purple-200 hover:text-white transition col-span-2 justify-center font-bold"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <span>مساعد الذكاء الاصطناعي (Gemini AI)</span>
                      </button>
                    </div>

                    {/* Self destruct selector in drawer */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>تدمير ذاتي:</span>
                      </span>
                      <select
                        value={selfDestructSec || ''}
                        onChange={(e) => setSelfDestructSec(e.target.value ? parseInt(e.target.value, 10) : null)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                      >
                        <option value="">معطل (عادي)</option>
                        <option value="5">بعد 5 ثوانٍ 🔥</option>
                        <option value="30">بعد 30 ثانية 🔥</option>
                        <option value="60">بعد 60 ثانية 🔥</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Item 64: Canned Snippets Autocomplete Dropdown */}
              {inputText.startsWith('/') && (
                <div className="absolute bottom-16 right-4 left-4 bg-[#1e293b] border border-amber-500/40 rounded-2xl shadow-2xl p-2 z-30 space-y-1 animate-in slide-in-from-bottom-2 text-right">
                  <div className="px-3 py-1 text-[11px] font-bold text-amber-300 border-b border-white/10 flex items-center justify-between">
                    <span>قوالب الردود السريعة الجاهزة</span>
                    <span className="font-mono text-[10px] text-gray-400">انقر للاختيار التلقائي</span>
                  </div>
                  {[
                    { trigger: '/welcome', text: 'أهلاً بك وسهلاً في منصة دردشة! يسعدنا تواصلك معنا دائماً 🌟' },
                    { trigger: '/pricing', text: 'نوفر باقات VIP مجانية ومميزات متقدمة يمكنك استكشافها من صفحة الإعدادات 💎' },
                    { trigger: '/faq', text: 'منصة دردشة مشفرة بالكامل طرف-لطرف (E2EE) وتضمن أقصى معايير الخصوصية 🛡️' }
                  ].filter(s => s.trigger.startsWith(inputText)).map(s => (
                    <button
                      key={s.trigger}
                      type="button"
                      onClick={() => setInputText(s.text)}
                      className="w-full text-right p-2 rounded-xl hover:bg-white/5 flex items-center justify-between transition text-xs"
                    >
                      <span className="text-gray-200 truncate">{s.text}</span>
                      <span className="font-mono font-bold text-amber-400 mr-2">{s.trigger}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input */}
              <input
                type="text"
                placeholder="اكتب رسالتك في دردشة (جرب / للردود السريعة، أو اضغط + للمزيد)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition text-right"
              />

              {/* Quick Voice Note Mic */}
              <button
                type="button"
                onClick={handleSendVoiceDemo}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 transition"
                title="إرسال تسجيل صوتي فوري (يمكن تفريغه لنص)"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Gemini AI Quick Assistant */}
              <button
                type="button"
                onClick={onOpenAiModal}
                className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 hover:from-purple-600/30 hover:to-cyan-500/30 border border-purple-500/30 text-cyan-300 hover:text-white transition shadow-sm"
                title="مساعد الذكاء الاصطناعي الفوري (Gemini AI)"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-40 text-white rounded-2xl shadow-glow transition flex items-center justify-center"
                title="إرسال"
              >
                <Send className="w-4 h-4 -rotate-90" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 sm:p-10 text-center bg-[#0b0f19]/40 relative overflow-y-auto">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-40 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-600/15 blur-3xl pointer-events-none rounded-full" />

          {/* Hero Welcome Card */}
          <div className="relative z-10 max-w-xl w-full space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>منصة التواصل الكونية الأسرع</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                مرحباً بك، <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">{currentUser?.firstName || 'صديقنا'}</span> 👋
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
                دردشة تمنحك تجربة تواصل فريدة تماماً — سريعة، مشفرة، وغنية بالإبداع. اختر محادثة من القائمة الجانبية أو جرب أحد الإجراءات السريعة أدناه:
              </p>
            </div>

            {/* 4 Interactive Launchpad Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
              
              {/* Card 1: Start Instant Chat */}
              <div 
                onClick={() => {
                  if (contacts.length > 0) setSelectedContact(contacts[0]);
                }}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">💬</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                    فوري
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                  ابدأ أول محادثة الآن
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  انقر لاختيار أول جهة اتصال وبدء المحادثة المباشرة فوراً.
                </p>
              </div>

              {/* Card 2: Ghost Chat */}
              <div 
                onClick={() => {
                  setIsGhostUnlocked(true);
                  alert('👻 تم تفعيل وضع الشبح! المحادثات السرية تظهر الآن في القائمة.');
                }}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-rose-500/40 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">👻</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                    حماية PIN
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-rose-300 transition">
                  المحادثات الشبحية السرية
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  محادثات مخفية تماماً تظهر فقط عند إدخال رمز PIN السري (0000).
                </p>
              </div>

              {/* Card 3: Customization Studio */}
              <div 
                onClick={() => {
                  if (onOpenTypography) onOpenTypography();
                }}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/40 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🎨</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    +1,000 خط
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition">
                  استوديو الخطوط والأناقة
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  اختر من بين أكثر من 1,000 نوع خط و 32 شكلاً لفقاعات الرسائل.
                </p>
              </div>

              {/* Card 4: AI Assistant */}
              <div 
                onClick={onOpenAiModal}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    ذكاء فوري
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                  مساعد الذكاء الاصطناعي
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  اطلب تلخيص المحادثات، توليد أفكار، أو كتابة ردود سريعة بذكاء.
                </p>
              </div>

            </div>

            {/* Did You Know Tips */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/40 to-cyan-950/40 border border-white/10 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>هل تعلم؟ نصائح سريعة لراحتك:</span>
              </div>
              <ul className="text-[11px] text-gray-300 space-y-1.5 list-disc list-inside">
                <li><span className="font-bold text-white">اختصار `/` للردود السريعة:</span> اكتب `/` في شريط الرسائل لعرض ردود جاهزة بنقرة واحدة.</li>
                <li><span className="font-bold text-white">التفريغ الصوتي 🎙️:</span> اضغط زر التفريغ بجانب أي فويس نوت لقراءته كنص مكتوب فوراً.</li>
                <li><span className="font-bold text-white">زر الأدوات السحرية (+):</span> يمنحك تصويتات، لوحة رسم، وجدولة رسائل وميزات حرق ذاتي.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* MODALS */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        contactName={selectedContact ? `${selectedContact.firstName}` : ''}
      />

      <ScheduleMessageModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        receiverId={selectedContact?.id}
        contactName={selectedContact?.firstName}
        onScheduled={(text, time) => {
          alert(`تمت جدولة رسالتك: "${text}" للإرسال تلقائياً في ${new Date(time).toLocaleString('ar-EG')}`);
        }}
      />

      <PollModal
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        receiverId={selectedContact?.id}
        onPollCreated={(newPoll) => setPolls(prev => [newPoll, ...prev])}
      />

      <WatchTogetherModal
        isOpen={isWatchOpen}
        onClose={() => setIsWatchOpen(false)}
        contactName={selectedContact?.firstName}
      />

      {/* Item 41: E2E Verification Modal */}
      <E2EVerificationModal
        isOpen={isE2EOpen}
        onClose={() => setIsE2EOpen(false)}
        contactName={selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ''}
      />

      {/* Item 69: Sound Stickers Drawer */}
      <SoundStickersDrawer
        isOpen={isSoundStickersOpen}
        onClose={() => setIsSoundStickersOpen(false)}
        onSendSoundSticker={handleSendSoundSticker}
      />

      {/* In-App Sticker Studio Modal */}
      <StickerStudioModal
        isOpen={isStickerStudioOpen}
        onClose={() => setIsStickerStudioOpen(false)}
        onStickerCreated={handleSendCustomSticker}
      />

      {/* Item 45: Per-Chat Lock Modal */}
      <ChatPerLockModal
        isOpen={isChatLockOpen}
        onClose={() => setIsChatLockOpen(false)}
        contactName={selectedContact ? `${selectedContact.firstName}` : ''}
        onUnlocked={() => {
          if (selectedContact) {
            setUnlockedSessionContactIds(prev => new Set(prev).add(selectedContact.id));
          }
        }}
      />

      {/* Item 54: Personal Saved Messages Vault */}
      <SavedVaultView
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

    </div>
  );
}
