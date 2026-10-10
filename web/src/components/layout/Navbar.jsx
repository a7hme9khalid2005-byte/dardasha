import React, { useState } from 'react';
import { 
  MessageSquare, Globe, Sparkles, Bell, LogOut, Search, User, Sliders,
  Radio, Navigation, Gift, Lock, CreditCard, Download, Compass,
  Type, ShieldAlert, Users, Video, Briefcase, Eye, Palette, Bot,
  HelpCircle, ChevronDown, Rocket, X, Phone, UserPlus
} from 'lucide-react';
import { appIconsCatalog } from '../themes/AppIconStudioModal';

export default function Navbar({ 
  currentUser, 
  contacts = [],
  activeTab, 
  onTabChange, 
  onOpenAi, 
  onOpenNotifications, 
  onOpenProfile, 
  onOpenSettings,
  onOpenLive,
  onOpenRadar,
  onOpenCarMode,
  onOpenMysteryBox,
  onOpenVault,
  onOpenIdCard,
  onOpenSecuritySuite,
  onOpenGroupHub,
  onOpenCallPro,
  onOpenProductivity,
  onOpenAccessibility,
  onOpenTypography,
  onOpenBubbleStudio,
  onOpenAppIconStudio,
  onOpenLauncher,
  onOpenTour,
  onOpenContactProfile,
  onStartChat,
  onOpenAddFriend,
  onOpenCommandPalette,
  incomingRequestsCount = 0,
  pwaInstallPrompt,
  onInstallPwa,
  onLogout 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Dynamic App Logo & Icon
  const savedIconId = localStorage.getItem('dardasha_app_icon') || 'dardasha-official';
  const currentAppIcon = appIconsCatalog.find(i => i.id === savedIconId) || appIconsCatalog[0];

  // Matching contacts for live search
  const matchingContacts = contacts.filter(c => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-white/10 h-16 px-3 sm:px-5 flex items-center justify-between text-white shadow-lg">
      
      {/* Brand & Dynamic Logo */}
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => onTabChange('chat')}
        >
          {/* Dynamic App Icon Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-glow group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10 shrink-0">
            {currentAppIcon.imgSrc ? (
              <img src={currentAppIcon.imgSrc} alt="Dardasha" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-tr ${currentAppIcon.bg} ${currentAppIcon.shadow} flex items-center justify-center text-white font-black text-lg`}>
                {currentAppIcon.iconText}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-wide text-white">
                Dardasha
              </span>
              <span className="text-orange-400 text-xs font-bold bg-orange-500/15 px-1.5 py-0.5 rounded-md border border-orange-500/30">
                دردشة
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">تواصل حديث فائق الذكاء</p>
          </div>
        </div>

        {/* Live Person Search with Instant Autocomplete & Profile View */}
        <div className="relative hidden lg:block mr-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن صديق بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-48 xl:w-60 pl-8 pr-3.5 py-1.5 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition text-right"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div 
              onMouseDown={(e) => e.preventDefault()}
              className="absolute top-11 right-0 w-80 bg-[#111827] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150 text-right"
            >
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 border-b border-white/10 flex items-center justify-between">
                <span>نتائج البحث عن "{searchQuery}"</span>
                <button 
                  onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {matchingContacts.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  لم يتم العثور على شخص بهذا الاسم
                </div>
              ) : (
                matchingContacts.map(person => (
                  <div
                    key={person.id}
                    className="p-2 rounded-xl hover:bg-white/5 flex items-center justify-between gap-2 transition group"
                  >
                    <div 
                      className="flex items-center gap-2 cursor-pointer flex-1 truncate"
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery('');
                        if (onOpenContactProfile) onOpenContactProfile(person);
                      }}
                    >
                      <img src={person.avatar} alt="Avatar" className="w-8 h-8 rounded-xl object-cover ring-1 ring-purple-500/30" />
                      <div className="truncate">
                        <p className="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">
                          {person.firstName} {person.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          @{person.email?.split('@')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery('');
                          if (onOpenContactProfile) onOpenContactProfile(person);
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 hover:text-white rounded-lg transition"
                        title="عرض الملف الشخصي"
                      >
                        الملف
                      </button>
                      <button
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery('');
                          if (onStartChat) onStartChat(person);
                        }}
                        className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-[10px] text-purple-200 hover:text-white rounded-lg font-bold transition"
                        title="بدء محادثة"
                      >
                        دردشة
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <nav className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/10 backdrop-blur-md">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
          <span>المحادثات</span>
        </button>

        <button
          onClick={() => onTabChange('feed')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap ${
            activeTab === 'feed'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-purple-300" />
          <span>المجتمع</span>
        </button>

        <button
          onClick={() => onTabChange('hubs')}
          className={`hidden md:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap ${
            activeTab === 'hubs'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-300" />
          <span>الاهتمامات</span>
        </button>

        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition whitespace-nowrap"
          title="مساعد الذكاء الاصطناعي الفوري"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">الذكاء الاصطناعي</span>
        </button>
      </nav>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Command Palette Quick Shortcut Pill */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition group"
          title="البحث السريع ولوحة الأوامر (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden xl:inline text-gray-300">بحث</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded-md border border-white/15 font-mono text-cyan-300">
            ⌘K
          </kbd>
        </button>

        {/* Interactive Tour Pill */}
        <button
          onClick={onOpenTour}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition"
          title="جولة تعريفية تفاعلية بجميع مزايا دردشة"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>جولة سريعة</span>
        </button>

        {/* Daily Mystery Box with bounce */}
        <button
          onClick={onOpenMysteryBox}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm hover:scale-105"
          title="صندوق الحظ اليومي (مكافآت وشارات مجانية)"
        >
          <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="hidden xl:inline">صندوق الحظ</span>
        </button>

        {/* Add Friend Button with badge */}
        <button
          onClick={onOpenAddFriend}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white transition relative shadow-sm hover:scale-[1.02]"
          title="إضافة وإدارة الأصدقاء وطلبات الصداقة"
        >
          <UserPlus className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden md:inline">إضافة صديق</span>
          {incomingRequestsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {incomingRequestsCount}
            </span>
          )}
        </button>

        {/* THE MASTER FEATURE LAUNCHER BUTTON */}
        <button
          onClick={onOpenLauncher}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-glow hover:shadow-cyan-500/20 transition-all duration-200 transform hover:scale-[1.02]"
          title="مركز الميزات الشامل للتحكم والتخصيص والأمان"
        >
          <Rocket className="w-3.5 h-3.5 text-cyan-200" />
          <span className="hidden sm:inline">مركز الميزات</span>
        </button>

        {/* Notifications */}
        <button 
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition relative"
          title="مركز الإشعارات والتنبيهات"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
            2
          </span>
        </button>

        {/* User Profile & Master Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.firstName}
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-purple-400/50"
            />
            <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-[#111827] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="font-bold text-sm text-white">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-purple-300 font-mono truncate">@{currentUser.email.split('@')[0]}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    عضو موثق ✦
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => { setShowUserMenu(false); onOpenProfile(); }}
                  className="w-full text-right px-4 py-2 text-gray-200 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>الملف الشخصي والإحصائيات</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenIdCard(); }}
                  className="w-full text-right px-4 py-2 text-cyan-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>بطاقة الهوية الرقمية 3D</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenVault(); }}
                  className="w-full text-right px-4 py-2 text-indigo-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>الخزنة السحابية المشفرة</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenTypography(); }}
                  className="w-full text-right px-4 py-2 text-purple-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>استوديو الخطوط (+1,000 خط)</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenBubbleStudio(); }}
                  className="w-full text-right px-4 py-2 text-blue-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>أشكال فقاعات الرسائل (32 ستايل)</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenAppIconStudio(); }}
                  className="w-full text-right px-4 py-2 text-amber-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>أيقونات وشعارات التطبيق (24 شكل)</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenSecuritySuite(); }}
                  className="w-full text-right px-4 py-2 text-rose-300 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>مركز الأمان والتمويه المتقدم</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenSettings(); }}
                  className="w-full text-right px-4 py-2 text-gray-200 hover:bg-white/5 flex items-center gap-2.5 transition"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>إعدادات التطبيق والحساب</span>
                </button>

                <div className="border-t border-white/10 my-1"></div>

                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full text-right px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
