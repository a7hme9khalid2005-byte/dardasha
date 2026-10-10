import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, KeyRound, CheckCircle2, Loader2, RefreshCw, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordModal({ isOpen, onClose, onPasswordResetSuccess }) {
  if (!isOpen) return null;

  const [step, setStep] = useState('EMAIL'); // 'EMAIL', 'OTP', 'NEW_PASSWORD', 'SUCCESS'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [debugOtpCode, setDebugOtpCode] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (step === 'OTP' && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 150);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      if (res.code || res.debugCode) setDebugOtpCode(res.code || res.debugCode);
      setStep('OTP');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'لم يتم العثور على الحساب');
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

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('يرجى إدخال رمز التحقق كاملاً (6 أرقام)');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      setStep('NEW_PASSWORD');
    } catch (err) {
      setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const code = otpDigits.join('');
      await api.resetPassword(email, code, newPassword);
      setStep('SUCCESS');
      setTimeout(() => {
        if (onPasswordResetSuccess) onPasswordResetSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1e1b4b]/95 via-[#0f172a]/95 to-[#0b0f19]/95 text-white rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 shadow-glow animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow dots */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {step === 'EMAIL' && 'البحث عن حسابك'}
                {step === 'OTP' && 'رمز التحقق الرقمي'}
                {step === 'NEW_PASSWORD' && 'كلمة مرور جديدة'}
                {step === 'SUCCESS' && 'تم التحقق بنجاح!'}
              </h3>
              <p className="text-[11px] text-purple-300/70">نظام الأمان المتقدم لمنصة دردشة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                أدخل اسم المستخدم الخاص بك (@username) أو بريدك الإلكتروني المسجل وسنرسل لك رمز تحقق سرياً مكوناً من 6 أرقام.
              </p>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="اسم المستخدم (@username) أو البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 text-sm pl-11 text-right font-mono"
                />
                <Mail className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-3.5" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  إرسال الرمز (OTP)
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 text-center">
              <div>
                <p className="text-xs text-gray-300 mb-1">تم إرسال كود الـ 6 أرقام إلى:</p>
                <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full inline-block">
                  {email}
                </span>
              </div>

              {/* Quick Code Display & Instant 1-Click Verification */}
              {debugOtpCode && (
                <div className="p-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900/95 to-purple-950/90 border border-cyan-400/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right shadow-lg animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">💡</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">رمز التحقق السريع:</span>
                        <span className="font-mono text-cyan-300 font-extrabold text-base tracking-widest px-2.5 py-0.5 bg-black/60 rounded-lg border border-cyan-500/40 select-all shadow-inner">
                          {debugOtpCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1">
                        تم إرساله لبريدك الإلكتروني، ويمكنك تعبئته فوراً بنقرة واحدة
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = String(debugOtpCode).trim().split('');
                      setOtpDigits(digits);
                      setError('');
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-glow transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>⚡ تعبئة الكود الآن</span>
                  </button>
                </div>
              )}

              {/* 6 Digit Glowing Boxes */}
              <div className="flex justify-center items-center gap-2 sm:gap-2.5 dir-ltr" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-15 text-center text-2xl font-black font-mono text-cyan-300 bg-white/5 border-2 border-white/20 rounded-2xl focus:bg-white/10 focus:border-cyan-400 focus:shadow-glow-accent focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    إعادة إرسال الرمز الآن
                  </button>
                ) : (
                  <span>
                    إعادة الإرسال بعد <strong className="text-purple-400 font-mono">{timer}</strong> ثانية
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="px-4 py-2.5 text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  تغيير البريد
                </button>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center gap-2 disabled:opacity-40"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  تأكيد الرمز
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-gray-300">
                تم التحقق بنجاح! أدخل كلمة المرور الجديدة لحسابك:
              </p>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs pl-11 text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="تأكيد كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-xs pl-11 text-right"
                />
                <Lock className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-3.5" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                حفظ كلمة المرور وتأكيد الدخول
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">تم تغيير كلمة المرور بنجاح!</h4>
              <p className="text-xs text-gray-400">جاري توجيهك لتسجيل الدخول...</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
