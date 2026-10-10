import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { mobileApi } from '../services/api';

export default function ForgotPasswordScreen({ onNavigateLogin }) {
  const [step, setStep] = useState('EMAIL'); // 'EMAIL', 'OTP', 'NEW_PASSWORD', 'SUCCESS'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');

  const digitRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await mobileApi.forgotPassword(email);
      if (res.debugCode) setDebugOtp(res.debugCode);
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

    const newArr = [...otpDigits];
    newArr[index] = value ? value.slice(-1) : '';
    setOtpDigits(newArr);
    setError('');

    if (value && index < 5 && digitRefs.current[index + 1]) {
      digitRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('يرجى إدخال كامل رمز التحقق (6 أرقام)');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await mobileApi.verifyOtp(email, code);
      setStep('NEW_PASSWORD');
    } catch (err) {
      setError(err.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
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
      await mobileApi.resetPassword(email, code, newPassword);
      setStep('SUCCESS');
    } catch (err) {
      setError(err.message || 'فشل إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {step === 'EMAIL' && 'البحث عن حسابك'}
          {step === 'OTP' && 'رمز التحقق الرقمي (OTP)'}
          {step === 'NEW_PASSWORD' && 'تعيين كلمة سر جديدة'}
          {step === 'SUCCESS' && 'تم بنجاح!'}
        </Text>

        <Text style={styles.subtitle}>نظام الحماية الرقمية لمنصة Dardasha</Text>

        {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

        {/* STEP 1: Email Form */}
        {step === 'EMAIL' && (
          <View>
            <Text style={styles.instruction}>
              أدخل عنوان بريدك الإلكتروني وسنرسل لك رمز تحقق فورياً مكوناً من 6 أرقام:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>إرسال كود الـ 6 أرقام</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: 6-Digit OTP */}
        {step === 'OTP' && (
          <View>
            <Text style={styles.instruction}>
              تم إرسال كود التحقق إلى: <Text style={styles.boldEmail}>{email}</Text>
            </Text>

            {debugOtp ? (
              <Text style={styles.hintText}>💡 رمز التحقق السريع للاختبار: {debugOtp}</Text>
            ) : null}

            {/* 6 Glowing Digit Boxes */}
            <View style={styles.otpRow}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={el => (digitRefs.current[idx] = el)}
                  style={styles.otpBox}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={val => handleDigitChange(idx, val)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                      digitRefs.current[idx - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            <View style={styles.timerRow}>
              {canResend ? (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendText}>إعادة إرسال الرمز الآن</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  إعادة إرسال الرمز بعد <Text style={{ color: '#c4b5fd', fontWeight: 'bold' }}>{timer}</Text> ثانية
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleVerifyOtp}
              disabled={loading || otpDigits.join('').length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>تأكيد الرمز والمتابعة</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Set New Password Form */}
        {step === 'NEW_PASSWORD' && (
          <View>
            <Text style={styles.instruction}>
              تم التحقق بنجاح! أدخل كلمة المرور الجديدة:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="تأكيد كلمة المرور الجديدة"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: '#10b981' }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>حفظ كلمة المرور</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: Success Message */}
        {step === 'SUCCESS' && (
          <View style={{ alignItems: 'center', paddingVertical: 15 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>✨</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 }}>
              تم تغيير كلمة المرور بنجاح!
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={onNavigateLogin}>
              <Text style={styles.btnPrimaryText}>الذهاب لتسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Return Button */}
        {step !== 'SUCCESS' && (
          <TouchableOpacity style={styles.backBtn} onPress={onNavigateLogin}>
            <Text style={styles.backBtnText}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0b0f19',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 18,
  },
  boldEmail: {
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  hintText: {
    fontSize: 12,
    color: '#a78bfa',
    backgroundColor: 'rgba(139,92,246,0.15)',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 14,
  },
  errorText: {
    backgroundColor: 'rgba(244,63,94,0.15)',
    color: '#f43f5e',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 14,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  otpBox: {
    width: '14.5%',
    height: 52,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  resendText: {
    fontSize: 13,
    color: '#06b6d4',
    fontWeight: 'bold',
  },
  btnPrimary: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
