import React, { useState, useEffect } from 'react';
import { 
  Camera, Edit3, Calendar, Mail, User, ShieldCheck, Heart, 
  MessageSquare, FileText, Sparkles, Check, Loader2, Award, ArrowRight,
  CreditCard, Share2, Copy, Gift, Zap, Crown, Flame, Gem, ShieldAlert,
  Phone, MapPin, Globe, Twitter, Instagram, Github, Linkedin, Send,
  Lock, Eye, Tag, Smile, Compass, Coins, ExternalLink, Plus, Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import DigitalCardModal from './DigitalCardModal';
import MysteryBoxModal from '../gamification/MysteryBoxModal';
import { sounds } from '../../utils/soundEffects';
import { AVATAR_PRESETS } from '../../data/avatarPresets';

const avatarPresets = AVATAR_PRESETS.map(p => p.url);

const avatarFrames = [
  { id: 'none', label: 'بدون إطار', ringClass: 'border-white/20' },
  { id: 'neon', label: 'نيون النبض 🩵', ringClass: 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)] border-cyan-300' },
  { id: 'galaxy', label: 'إعصار الجالاكسي 🌌', ringClass: 'ring-4 ring-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)] border-fuchsia-400' },
  { id: 'cyber', label: 'لهب السايبر 🔥', ringClass: 'ring-4 ring-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.8)] border-orange-400' },
  { id: 'crystal', label: 'درع الكريستال 💎', ringClass: 'ring-4 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.8)] border-emerald-300' },
];

const roleBadges = [
  { id: 'founder', title: 'المؤسس VIP ✦', icon: Crown, color: 'from-amber-400 to-yellow-600 text-amber-100' },
  { id: 'creator', title: 'صانع محتوى 🚀', icon: Zap, color: 'from-purple-500 to-indigo-600 text-purple-100' },
  { id: 'ambassador', title: 'سفير المنصة 💎', icon: Gem, color: 'from-cyan-400 to-blue-600 text-cyan-100' },
  { id: 'security', title: 'حامي التشفير 🛡️', icon: ShieldCheck, color: 'from-emerald-400 to-teal-600 text-emerald-100' },
];

const achievementBadgesList = [
  { id: 'b1', name: 'المتحدث اللبق', desc: 'أرسل أكثر من 500 رسالة مشفرة', icon: '💬', unlocked: true, date: '10 أكتوبر 2026' },
  { id: 'b2', name: 'درع الأمان الفائق', desc: 'تفعيل التخفي وحماية لقطات الشاشة', icon: '🛡️', unlocked: true, date: '8 أكتوبر 2026' },
  { id: 'b3', name: 'المحاور السري (Ghost)', desc: 'استخدام وضع الرسائل الهمسية والشبح', icon: '👻', unlocked: true, date: '7 أكتوبر 2026' },
  { id: 'b4', name: 'صانع اللحظات الحية', desc: 'حفظ أكثر من 15 وسائط في الخزنة السحابية', icon: '✨', unlocked: true, date: '5 أكتوبر 2026' },
  { id: 'b5', name: 'نجم الرادار والاجتماع', desc: 'اكتشاف أصدقاء عبر رادار Dardasha', icon: '📡', unlocked: false, progress: '3/5' },
  { id: 'b6', name: 'سفير التواصل الذهبي', desc: 'دعوة 10 أصدقاء برابط الإحالة الخاص', icon: '💎', unlocked: false, progress: '7/10' },
];

export default function ProfileView({ currentUser, onProfileUpdated, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);

  // Core profile fields
  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [lastName, setLastName] = useState(currentUser.lastName || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || avatarPresets[0]);
  const [currentFrame, setCurrentFrame] = useState(currentUser.avatarFrame || 'galaxy');
  const [currentRole, setCurrentRole] = useState(currentUser.customRole || 'founder');
  
  // Extended "About" fields
  const [username, setUsername] = useState(currentUser.username || `@${currentUser.email.split('@')[0]}`);
  const [phone, setPhone] = useState(currentUser.phone || '+966 50 123 4567');
  const [phonePrivacy, setPhonePrivacy] = useState(currentUser.phonePrivacy || 'friends');
  const [location, setLocation] = useState(currentUser.location || '🇸🇦 الرياض، المملكة العربية السعودية');
  const [statusVibe, setStatusVibe] = useState(currentUser.statusVibe || '🚀 يطور ميزات دردشة ويدير عالم الـ 100,000 هدية 🎁✨');
  const [interests, setInterests] = useState(currentUser.interests || ['#تطوير_ويب', '#أمن_سيبراني', '#ذكاء_اصطناعي', '#تقنية', '#ريادة_أعمال']);
  const [newTagInput, setNewTagInput] = useState('');
  const [socialLinks, setSocialLinks] = useState(currentUser.socialLinks || {
    website: 'https://dardasha.app',
    twitter: 'ahmed_dev',
    github: 'ahmedkhalid2005',
    instagram: 'ahmed_creative'
  });
  const [zodiac, setZodiac] = useState(currentUser.zodiac || 'الجوزاء ♊');

  // Navigation & feedback
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'gifts', 'badges', 'ambassador', 'posts'
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // User Gifts Inventory (100,000 Universe)
  const [userGifts, setUserGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  const selectedFrameObj = avatarFrames.find(f => f.id === currentFrame) || avatarFrames[2];
  const selectedRoleObj = roleBadges.find(r => r.id === currentRole) || roleBadges[0];

  useEffect(() => {
    loadUserGifts();
  }, []);

  const loadUserGifts = async () => {
    setLoadingGifts(true);
    try {
      const res = await api.getMyGifts();
      setUserGifts(res.inventory || []);
    } catch (err) {
      console.error('Error fetching gifts:', err);
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const payload = { 
        firstName, 
        lastName, 
        bio, 
        avatar,
        avatarFrame: currentFrame,
        customRole: currentRole,
        username,
        phone,
        phonePrivacy,
        location,
        statusVibe,
        interests,
        socialLinks,
        zodiac
      };

      const res = await api.updateProfile(payload);
      onProfileUpdated({
        ...currentUser,
        ...payload
      });
      setIsEditing(false);
      sounds.playClick();
      setNotice('تم تحديث ملفك الشخصي وبيانات "حول" بنجاح! ✨');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'فشل التحديث');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    sounds.playClick();
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    sounds.playClick();
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyReferral = () => {
    const link = `https://dardasha.app/join?ref=${username.replace('@', '')}_vip`;
    navigator.clipboard.writeText(link);
    sounds.playClick();
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleAddInterestTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!interests.includes(tag)) {
      setInterests([...interests, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveInterestTag = (tagToRemove) => {
    setInterests(interests.filter(t => t !== tagToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-white animate-in fade-in duration-200">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Mystery Box Trigger */}
          <button
            onClick={() => setShowMysteryBox(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-300 shadow-glow transition"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>صندوق الـ 100,000 هدية 🎁</span>
          </button>

          {/* 3D Holographic ID Card Trigger */}
          <button
            onClick={() => setShowIdCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 border border-cyan-400/40 rounded-xl text-xs font-bold text-cyan-300 shadow-glow transition"
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>بطاقة الهوية الرقمية 3D</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-center">
          ✅ {notice}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
        
        {/* Cover Banner with Ambient Gradient */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
          
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 bg-gradient-to-r ${selectedRoleObj.color} rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5`}>
              <selectedRoleObj.icon className="w-3.5 h-3.5" />
              <span>{selectedRoleObj.title}</span>
            </span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-5">
            
            {/* Animated Avatar with Frame */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
              <div className="relative group">
                <img
                  src={currentUser.avatar || avatar}
                  alt={currentUser.firstName}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover transition-all duration-300 ${selectedFrameObj.ringClass}`}
                />
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-glow transition"
                  title="تعديل الصورة والإطار"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{currentUser.firstName} {currentUser.lastName}</span>
                  <Award className="w-5 h-5 text-cyan-400" />
                </h1>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                  <span className="text-xs text-purple-300 font-mono font-bold">
                    {username}
                  </span>
                  <button 
                    onClick={handleCopyUsername}
                    className="p-1 text-gray-400 hover:text-cyan-300 transition"
                    title="نسخ اسم المستخدم"
                  >
                    {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-cyan-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{location.split('،')[0]}</span>
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-2 max-w-md font-medium leading-relaxed">
                  {currentUser.bio || 'لا توجد نبذة شخصية حتى الآن. انقر على تعديل لإضافة نبذة مميزة وإطارك المفضل.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-2xl font-bold text-xs shadow-glow transition flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل الملف و"حول"</span>
              </button>
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-center">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="block text-lg font-black text-cyan-400 font-mono">142</span>
              <span className="text-[11px] text-gray-400 font-bold">الرسائل المتبادلة</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="block text-lg font-black text-amber-400 font-mono">{userGifts.length}</span>
              <span className="text-[11px] text-gray-400 font-bold">هدايا ومقتنيات حصرية</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="block text-lg font-black text-rose-400 font-mono">89</span>
              <span className="text-[11px] text-gray-400 font-bold">التفاعلات المستلمة</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="block text-lg font-black text-emerald-400 font-mono">100%</span>
              <span className="text-[11px] text-gray-400 font-bold">حماية الخصوصية وتوثيق OTP</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 text-xs font-bold gap-2 overflow-x-auto pb-1">
        
        {/* NEW: ABOUT TAB */}
        <button
          onClick={() => setActiveTab('about')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'about' ? 'border-cyan-400 text-cyan-300 font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span>حول الحساب والبيانات (About)</span>
        </button>

        {/* NEW: GIFTS INVENTORY TAB (100,000 UNIVERSE) */}
        <button
          onClick={() => setActiveTab('gifts')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'gifts' ? 'border-amber-400 text-amber-300 font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>خزنة الهدايا ({userGifts.length})</span>
        </button>

        {/* BADGES */}
        <button
          onClick={() => setActiveTab('badges')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'badges' ? 'border-purple-400 text-purple-300 font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>شارات الإنجازات (81)</span>
        </button>

        {/* AMBASSADOR */}
        <button
          onClick={() => setActiveTab('ambassador')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ambassador' ? 'border-purple-400 text-purple-300 font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4 text-purple-400" />
          <span>مكافآت السفير (90)</span>
        </button>

        {/* POSTS */}
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'posts' ? 'border-purple-400 text-white font-black' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>منشوراتي</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ABOUT (حول الحساب والبيانات) - FULL REDESIGN */}
      {/* ======================================================== */}
      {activeTab === 'about' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Card 1: Identity & Contact Details */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-cyan-500/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span>بيانات الهوية والتواصل (Contact & Identity)</span>
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل البيانات</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Username Handle */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-gray-400">اسم المستخدم (المعرف):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-cyan-300">{username}</span>
                  <button 
                    onClick={handleCopyUsername} 
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                    title="نسخ المعرف"
                  >
                    {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>رقم الجوال:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white dir-ltr">{phone}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {phonePrivacy === 'public' ? 'عام' : phonePrivacy === 'friends' ? 'للأصدقاء' : 'خاص 🔒'}
                  </span>
                  <button 
                    onClick={handleCopyPhone} 
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                    title="نسخ الرقم"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>البريد الإلكتروني:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{currentUser.email}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>موثق Resend OTP</span>
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>الموقع والمدينة:</span>
                </div>
                <span className="font-bold text-white">{location}</span>
              </div>

              {/* Birthdate & Zodiac */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>تاريخ الميلاد والبرج:</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="font-mono">
                    {currentUser.birthDay || 15} / {currentUser.birthMonth || 6} / {currentUser.birthYear || 2000}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold">
                    {zodiac}
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-gray-400">الجنس:</span>
                <span className="font-bold text-purple-300">
                  {currentUser.gender === 'female' ? 'أنثى ♀' : currentUser.gender === 'custom' ? 'مخصص ✦' : 'ذكر ♂'}
                </span>
              </div>

            </div>
          </div>

          {/* Card 2: Current Status & Vibe */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>الحالة الراهنة والمزاج (Current Status & Vibe)</span>
            </h3>

            <div className="p-4 bg-gradient-to-r from-purple-900/40 to-slate-900/60 border border-purple-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-black/40 rounded-xl border border-white/10">💬</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold">الحالة المعروضة في الشات:</p>
                  <p className="text-sm font-bold text-white mt-0.5">{statusVibe}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition"
              >
                تحديث
              </button>
            </div>

            {/* Interest Tags */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>الاهتمامات والهوايات (Interest Tags):</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {interests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 text-cyan-200 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Social & Web Links */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-black text-purple-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>الروابط وحسابات التواصل الاجتماعي (Social & Portfolio)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 font-bold">الموقع الشخصي:</p>
                      <p className="text-white font-mono truncate max-w-[180px]">{socialLinks.website}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-300" />
                </a>
              )}

              {socialLinks.twitter && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Twitter className="w-4 h-4 text-sky-400" />
                    <div>
                      <p className="text-gray-400 font-bold">Twitter / X:</p>
                      <p className="text-white font-mono">@{socialLinks.twitter.replace('@', '')}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">حساب موثق</span>
                </div>
              )}

              {socialLinks.github && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-gray-200" />
                    <div>
                      <p className="text-gray-400 font-bold">GitHub:</p>
                      <p className="text-white font-mono">{socialLinks.github}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">مطور</span>
                </div>
              )}

              {socialLinks.instagram && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="text-gray-400 font-bold">Instagram:</p>
                      <p className="text-white font-mono">@{socialLinks.instagram.replace('@', '')}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">مبدع</span>
                </div>
              )}

            </div>
          </div>

          {/* Card 4: Trust & Verification */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-3">
            <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>مؤشرات الثقة وتاريخ الحساب</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-gray-400 block mb-1">عضو في دردشة منذ:</span>
                <span className="font-bold text-white font-mono">
                  {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-gray-400 block mb-1">حالة الحساب والتوثيق:</span>
                <span className="font-bold text-emerald-400">موثق بالكامل 100% 🛡️</span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-gray-400 block mb-1">بروتوكول التشفير:</span>
                <span className="font-bold text-cyan-300 font-mono">E2EE 256-bit AES</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GIFTS INVENTORY (خزنة الـ 100,000 هدية والمقتنيات) */}
      {/* ======================================================== */}
      {activeTab === 'gifts' && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1e293b]/70 backdrop-blur-xl p-6 rounded-3xl border border-amber-500/30">
            <div>
              <h3 className="font-black text-base text-amber-300 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>خزنة الهدايا والمقتنيات (عالم الـ 100,000 هدية)</span>
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                جميع الجوائز التي فزت بها أو استلمتها من أصدقائك تحمل أرقاماً تسلسلية نادرة وخاصة بك فقط.
              </p>
            </div>

            <button
              onClick={() => setShowMysteryBox(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow-glow transition flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>فتح صندوق حظ جديد 🎁</span>
            </button>
          </div>

          {loadingGifts ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              <p className="text-xs">جاري تحميل حقيبة الهدايا...</p>
            </div>
          ) : userGifts.length === 0 ? (
            <div className="py-12 text-center bg-[#1e293b]/40 rounded-3xl border border-white/5 space-y-3">
              <Gift className="w-12 h-12 text-gray-500 mx-auto" />
              <h4 className="font-bold text-sm text-gray-300">حقيبة الهدايا فارغة حالياً</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                افتح صندوق الحظ اليومي المجاني لتسحب هديتك الأولى برقم تسلسلي خاص من أصل 100,000 هدية!
              </p>
              <button
                onClick={() => setShowMysteryBox(true)}
                className="px-5 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl text-xs"
              >
                افتح صندوق الحظ الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userGifts.map((gift) => (
                <div
                  key={gift.instanceId || gift.serialNumber}
                  className="bg-[#1e293b]/70 backdrop-blur-xl border border-white/10 hover:border-amber-400/40 rounded-3xl p-5 space-y-3 relative overflow-hidden transition group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2 bg-black/40 rounded-2xl border border-white/10">
                      {gift.icon}
                    </span>
                    <div className="text-left">
                      <span className="font-mono text-xs font-bold text-cyan-300 block">
                        {gift.serialNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block font-black ${gift.rarityBadgeClass}`}>
                        {gift.rarityLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition">
                      {gift.name}
                    </h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed line-clamp-2">
                      {gift.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-300 font-mono font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{gift.value?.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {gift.obtainedAt ? new Date(gift.obtainedAt).toLocaleDateString('ar-EG') : 'مقتنى دائم'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BADGES (شارات الإنجازات) */}
      {/* ======================================================== */}
      {activeTab === 'badges' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>شارات الإنجاز والتميز في دردشة (Badges)</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">المكتملة: 4 من 6</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {achievementBadgesList.map((badge) => (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                  badge.unlocked 
                    ? 'bg-gradient-to-br from-purple-900/40 to-slate-900/60 border-purple-500/30' 
                    : 'bg-white/5 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl p-2 bg-black/40 rounded-2xl border border-white/10">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-xs text-white">{badge.name}</h4>
                    <p className="text-[11px] text-gray-300 leading-snug">{badge.desc}</p>
                    {badge.unlocked ? (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                        مفتوحة: {badge.date}
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                        التقدم: {badge.progress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AMBASSADOR (برنامج السفير) */}
      {/* ======================================================== */}
      {activeTab === 'ambassador' && (
        <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-6 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
                <Crown className="w-5 h-5 text-cyan-400" />
                <span>برنامج السفير ومكافآت الإحالة (Ambassador Rewards)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                ادعُ أصدقاءك للانضمام إلى منصة دردشة واكسب ميزات حصرية ونقاط VIP مجانية
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-black/40 border border-cyan-500/30 rounded-xl text-center">
                <span className="block text-sm font-black text-cyan-300 font-mono">1,250</span>
                <span className="text-[10px] text-gray-400">نقاط المكافأة</span>
              </div>
              <div className="px-3 py-1.5 bg-black/40 border border-purple-500/30 rounded-xl text-center">
                <span className="block text-sm font-black text-purple-300 font-mono">7</span>
                <span className="text-[10px] text-gray-400">أصدقاء انضموا</span>
              </div>
            </div>
          </div>

          {/* Referral link box */}
          <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <label className="block text-xs font-bold text-gray-300">رابط الدعوة الخاص بك:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://dardasha.app/join?ref=${username.replace('@', '')}_vip`}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-cyan-300 font-mono text-left"
              />
              <button
                onClick={handleCopyReferral}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: POSTS (منشوراتي) */}
      {/* ======================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-2xl border border-white/10 p-5 text-right space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">منذ يومين</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">عام 📣</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              سعيد جداً بالانضمام لمنصة دردشة الذكية! تجربة سريعة وتصميم فائق الأمان وعالم هدايا استثنائي 🚀✨
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center gap-3 text-xs text-gray-400">
              <span>❤️ 24 تفاعل</span>
              <span>💬 6 تعليقات</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT PROFILE & ABOUT MODAL */}
      {/* ======================================================== */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0f172a] rounded-3xl border border-purple-500/30 p-6 text-white max-h-[92vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white">تعديل الملف الشخصي وبيانات "حول"</h3>
                <p className="text-xs text-gray-400 mt-0.5">خصص هويتك، رقم هاتفك، اهتماماتك، وروابط التواصل:</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 text-right">الاسم الأول:</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 text-right">اسم العائلة:</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Username & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1 text-right">اسم المستخدم (@username):</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono text-left focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-emerald-300 text-right">رقم الجوال:</label>
                    <select
                      value={phonePrivacy}
                      onChange={(e) => setPhonePrivacy(e.target.value)}
                      className="bg-black/60 border border-white/10 text-[10px] rounded px-1.5 py-0.5 text-gray-300"
                    >
                      <option value="public">مرئي للجميع</option>
                      <option value="friends">للأصدقاء فقط</option>
                      <option value="private">خاص بي 🔒</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Location & Zodiac */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rose-300 mb-1 text-right">الموقع / البلد والمدينة:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="🇸🇦 الرياض، المملكة العربية السعودية"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 text-right">البرج الفلكي:</label>
                  <input
                    type="text"
                    value={zodiac}
                    onChange={(e) => setZodiac(e.target.value)}
                    placeholder="الجوزاء ♊"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Status / Vibe */}
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1 text-right">الحالة والمزاج الراهن (Status / Vibe):</label>
                <input
                  type="text"
                  value={statusVibe}
                  onChange={(e) => setStatusVibe(e.target.value)}
                  placeholder="🚀 في وضع العمل والإنتاجية..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Interests Tags Editor */}
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1 text-right">الاهتمامات والهوايات (أضف وسوم #):</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="اكتب اهتماماً مثلاً: #تصميم"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterestTag}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterestTag(tag)}
                        className="text-gray-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 text-right">روابط التواصل الاجتماعي:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="الموقع: https://..."
                    value={socialLinks.website || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-left"
                  />
                  <input
                    type="text"
                    placeholder="Twitter/X: username"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-left"
                  />
                  <input
                    type="text"
                    placeholder="GitHub: username"
                    value={socialLinks.github || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-left"
                  />
                  <input
                    type="text"
                    placeholder="Instagram: username"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* 12 Avatar Presets Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-purple-300 text-right">اختر صورة الأفاتار الشخصية:</label>
                  <span className="text-[10px] text-cyan-300 font-mono">12 قالباً مخصصاً</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      title={preset.name}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 group hover:scale-105 ${
                        avatar === preset.url
                          ? 'border-purple-400 ring-2 ring-purple-400/50 shadow-glow bg-purple-950/40'
                          : 'border-white/10 hover:border-cyan-400/50 bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-lg" />
                      {avatar === preset.url && (
                        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white bg-purple-600 rounded-full p-0.5 shadow-md" />
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white truncate px-0.5 opacity-0 group-hover:opacity-100 transition">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Frames Selector */}
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 text-right">اختر إطار الأفاتار المتحرك:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {avatarFrames.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setCurrentFrame(frame.id)}
                      className={`p-2 rounded-xl border text-center transition text-xs font-bold ${
                        currentFrame === frame.id 
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-glow' 
                          : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {frame.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs text-gray-300 mb-1 text-right">النبذة الشخصية (Bio):</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب عن اهتماماتك أو مقولتك المفضلة..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white text-right focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs text-gray-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl text-xs shadow-glow transition flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ التعديلات بالكامل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D Holographic ID Card Modal */}
      <DigitalCardModal 
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        currentUser={currentUser}
      />

      {/* 100,000 Gifts Mystery Chest Modal */}
      <MysteryBoxModal
        isOpen={showMysteryBox}
        onClose={() => setShowMysteryBox(false)}
        onGiftClaimed={(gift) => {
          loadUserGifts();
          setNotice(`مبروك! فزت بـ "${gift.name}" (${gift.serialNumber}) وأضيفت لخزنة الهدايا! 🎉`);
          setTimeout(() => setNotice(''), 4000);
        }}
      />

    </div>
  );
}
