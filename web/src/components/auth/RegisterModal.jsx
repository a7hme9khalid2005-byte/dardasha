import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Eye, EyeOff, Loader2, Calendar, User, Mail, 
  Lock, ShieldCheck, Phone, Globe, Image as ImageIcon, Camera, 
  MapPin, Check, Search, ChevronDown, RefreshCw, KeyRound, AlertCircle
} from 'lucide-react';
import { searchCountries, BASE_COUNTRIES } from '../../data/countriesData';
import { api } from '../../services/api';

const monthsArabic = [
  'يناير (01)', 'فبراير (02)', 'مارس (03)', 'أبريل (04)', 'مايو (05)', 'يونيو (06)',
  'يوليو (07)', 'أغسطس (08)', 'سبتمبر (09)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
];

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess }) {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 90 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP' | 'SUCCESS'

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    gender: 'male',
    country: 'المملكة العربية السعودية',
    phonePrefix: '+966',
    phoneNumber: '',
    bio: '',
    website: '',
    password: '',
    confirmPassword: '',
    birthDay: '15',
    birthMonth: '6',
    birthYear: '2000',
  });

  // Real Avatar Upload State (Not image URL)
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Country Selection & Search Dropdown
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [countryResults, setCountryResults] = useState([]);
  const [selectedCountryObj, setSelectedCountryObj] = useState(BASE_COUNTRIES[0]);

  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const otpInputRefs = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial country search results
  useEffect(() => {
    setCountryResults(searchCountries(countryQuery, 30));
  }, [countryQuery]);

  // OTP countdown interval
  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  useEffect(() => {
    if (step === 'OTP' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 150);
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Real Image File Picker & HTML5 Canvas Compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to 320x320 max for optimal speed and storage
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarPreview(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectCountry = (country) => {
    setSelectedCountryObj(country);
    setFormData(prev => ({
      ...prev,
      country: country.shortName,
      phonePrefix: country.dialCode
    }));
    setIsCountryOpen(false);
    setCountryQuery('');
  };

  // Step 1: Validate Form and Dispatch OTP to Email via Resend
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('يرجى كتابة الاسم الأول واسم العائلة بالكامل');
      return;
    }

    if (!formData.username.trim()) {
      setError('يرجى إدخال اسم مستخدم فريد خاص بك (@username)');
      return;
    }

    const cleanUsername = formData.username.replace(/^@/, '').trim().toLowerCase();
    if (cleanUsername.length < 3) {
      setError('يجب ألا يقل اسم المستخدم عن 3 أحرف');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setError('اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية وأرقام وشرطة سفلية (_)');
      return;
    }

    if (!formData.email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني الذي ستصلك عليه رسالة التحقق');
      return;
    }

    if (formData.password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين، يرجى التأكد من تطابق كلمة المرور وتأكيدها');
      return;
    }

    setLoading(true);
    try {
      // Trigger OTP dispatch to email
      await api.sendRegisterOtp(formData.email, formData.firstName, cleanUsername);
      setStep('OTP');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err) {
      setError(err.message || 'فشل إرسال رمز التحقق إلى بريدك الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value ? value.slice(-1) : '';
    setOtpDigits(newDigits);
    setError('');

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Finalize Account Creation with OTP Code
  const handleFinalizeRegister = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullPhone = formData.phoneNumber.trim() 
        ? `${formData.phonePrefix} ${formData.phoneNumber.trim()}`
        : '';

      const finalUsername = formData.username.trim()
        ? `@${formData.username.replace(/^@/, '').trim().toLowerCase()}`
        : `@${formData.email.split('@')[0]}`;

      const payload = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        username: finalUsername,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        gender: formData.gender,
        country: formData.country,
        phone: fullPhone,
        avatar: avatarPreview,
        bio: formData.bio.trim() || 'عضو جديد في منصة دردشة 👋',
        website: formData.website.trim(),
        birthDay: formData.birthDay,
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
        otpCode: code
      };

      await onRegisterSuccess(payload);
      setStep('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'رمز التحقق غير صحيح أو فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setError('');
    setLoading(true);
    try {
      await api.sendRegisterOtp(formData.email, formData.firstName, formData.username);
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err) {
      setError(err.message || 'فشل إعادة إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1e1b4b]/98 via-[#0f172a]/98 to-[#0b0f19]/98 text-white rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 shadow-glow animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        
        {/* Glow ambient light */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                {step === 'FORM' && 'عضوية جديدة في دردشة (Dardasha)'}
                {step === 'OTP' && 'تأكيد البريد الإلكتروني (رمز التحقق OTP)'}
                {step === 'SUCCESS' && 'تم إنشاء حسابك بنجاح! 🎉'}
              </h2>
              <p className="text-xs text-purple-200/70">
                {step === 'FORM' && 'انضم لمجتمع التواصل الذكي والحر - حساب موثق بالكامل'}
                {step === 'OTP' && 'أدخل الرمز المرسل إلى بريدك لتأكيد الملكية والأمان'}
                {step === 'SUCCESS' && 'أهلاً بك في منصة دردشة العالمية'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 relative z-10 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: COMPREHENSIVE REGISTRATION FORM */}
          {/* ======================================================== */}
          {step === 'FORM' && (
            <form onSubmit={handleProceedToOtp} className="space-y-4">
              
              {/* Real Avatar File Picker */}
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600/40 to-cyan-600/40 border-2 border-dashed border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-glow">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-cyan-300/70" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white shadow-md transition"
                    title="رفع صورة حقيقية"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-xs text-white">إضافة صورة شخصية حقيقية (ملف صورة)</h4>
                  <p className="text-[11px] text-gray-400">
                    اختر صورة حقيقية من هاتفك أو حاسوبك (JPG, PNG). يتم ضغطها وتحسينها تلقائياً.
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{avatarPreview ? 'تغيير الصورة' : 'اختر صورة من جهازك'}</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs transition"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Names: First, Middle, Last */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 block text-right">الاسم بالكامل:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="الاسم الأول *"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs text-right"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="middleName"
                      placeholder="الاسم الثاني (الأب)"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs text-right"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="اسم العائلة *"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Username (@handle) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-cyan-300 block text-right">
                    اسم المستخدم الخاص بك (@username) * :
                  </label>
                  <span className="text-[10px] text-gray-400">اسم فريد خاص بكل عميل</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    placeholder="مثال: ahmed_khalid"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 font-mono text-left text-xs pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-cyan-400 font-mono font-bold text-xs">@</span>
                </div>
              </div>

              {/* Email Address (Destination for OTP) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-purple-200">البريد الإلكتروني (لتأكيد الحساب ورمز OTP) *:</label>
                  <span className="text-[10px] text-green-300 font-bold">يمكن تسجيل أكثر من حساب بنفس الإيميل ✓</span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="yourname@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs pl-10 text-right font-mono"
                  />
                  <Mail className="w-4 h-4 text-purple-400/60 absolute left-3 top-3" />
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-300 block text-right">الجنس:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      formData.gender === 'male'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-glow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>ذكر ♂</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      formData.gender === 'female'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-glow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>أنثى ♀</span>
                  </button>
                </div>
              </div>

              {/* Country Selection (10,000+ Searchable Countries & Regions) & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Country Picker with search */}
                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-gray-300 block text-right">
                    الدولة / الإقليم (أكثر من 10,000 خيار):
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs flex items-center justify-between hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{selectedCountryObj.flag}</span>
                      <span className="font-bold truncate">{formData.country}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown with live instant search */}
                  {isCountryOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl z-30 p-2 space-y-2 max-h-56 overflow-hidden flex flex-col">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="ابحث بين 10,000 دولة ومدينة..."
                          value={countryQuery}
                          onChange={(e) => setCountryQuery(e.target.value)}
                          autoFocus
                          className="w-full px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 pr-8 text-right"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
                      </div>

                      <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                        {countryResults.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCountry(c)}
                            className="p-2 hover:bg-white/10 rounded-xl cursor-pointer flex items-center justify-between text-xs text-right transition"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>{c.flag}</span>
                              <span className="text-gray-200 truncate">{c.displayName}</span>
                            </span>
                            <span className="font-mono text-cyan-300 text-[11px] font-bold shrink-0">{c.dialCode}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number with International Prefix */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block text-right">رقم الهاتف الجوال:</label>
                  <div className="flex gap-1.5">
                    <span className="px-3 py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs font-mono font-bold text-cyan-300 flex items-center justify-center shrink-0 dir-ltr">
                      {formData.phonePrefix}
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="50 123 4567"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 font-mono text-left text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Personal Website */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-gray-300 block text-right mb-1">نبذة شخصية عنك (Bio):</label>
                  <textarea
                    rows={2}
                    name="bio"
                    placeholder="اكتب نبذة قصيرة عن اهتماماتك أو عملك..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs text-right resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block text-right mb-1">رابط الموقع الشخصي (إن وجد):</label>
                  <div className="relative">
                    <input
                      type="url"
                      name="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 font-mono text-left text-xs pl-8"
                    />
                    <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block text-right">كلمة المرور *:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="6 أحرف على الأقل"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs pl-9 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block text-right">تأكيد كلمة المرور *:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="أعد كتابة كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs pl-9 text-right"
                    />
                    <Lock className="w-3.5 h-3.5 text-purple-400/60 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Birthdate */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block text-right">تاريخ الميلاد:</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    className="w-full px-2 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>يوم {d}</option>
                    ))}
                  </select>
                  <select
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    className="w-full px-2 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs"
                  >
                    {monthsArabic.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    className="w-full px-2 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-xs"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold rounded-2xl shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال رمز التحقق إلى بريدك الإلكتروني...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>متابعة وتأكيد البريد الإلكتروني (رمز التحقق OTP) ✉️</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: OTP VERIFICATION (6 DIGITS VIA RESEND) */}
          {/* ======================================================== */}
          {step === 'OTP' && (
            <form onSubmit={handleFinalizeRegister} className="space-y-5 text-center py-2 animate-in zoom-in-95">
              
              <div className="space-y-1">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-white">تأكيد البريد الإلكتروني برمز الـ 6 أرقام</h4>
                <p className="text-xs text-gray-300">
                  تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني:
                </p>
                <span className="font-mono font-bold text-cyan-300 text-xs bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-full inline-block">
                  {formData.email}
                </span>
                <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 mt-2 inline-block">
                  💡 تنبيه: إذا لم يظهر الرمز في البريد الوارد، يرجى فحص مجلد <strong>الرسائل غير المرغوب فيها (Spam / Junk)</strong>
                </p>
              </div>

              {/* 6 Digit Glowing Boxes */}
              <div className="flex justify-center items-center gap-2 sm:gap-2.5 dir-ltr" onPaste={handlePasteOtp}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-15 text-center text-2xl font-black font-mono text-cyan-300 bg-white/5 border-2 border-white/20 rounded-2xl focus:bg-white/10 focus:border-cyan-400 focus:shadow-glow-accent focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                {canResendOtp ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة إرسال رمز التحقق الآن</span>
                  </button>
                ) : (
                  <span>
                    إعادة الإرسال بعد <strong className="text-purple-400 font-mono">{otpTimer}</strong> ثانية
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="px-4 py-2.5 text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  تعديل البيانات
                </button>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 text-white rounded-xl font-black text-xs shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>تأكيد الحساب والانضمام الآن 🎉</span>
                </button>
              </div>

            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SUCCESS */}
          {/* ======================================================== */}
          {step === 'SUCCESS' && (
            <div className="text-center py-8 space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">تم إنشاء حسابك بنجاح!</h3>
              <p className="text-xs text-gray-300">أهلاً بك يا {formData.firstName} في مجتمع دردشة الذكي. جاري تسجيل الدخول...</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
