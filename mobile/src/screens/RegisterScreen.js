import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';

export default function RegisterScreen({ onNavigateLogin, onRegisterSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDay, setBirthDay] = useState('15');
  const [birthMonth, setBirthMonth] = useState('6');
  const [birthYear, setBirthYear] = useState('2000');
  const [gender, setGender] = useState('male'); // 'female', 'male', 'custom'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    if (password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await mobileApi.register({
        firstName,
        lastName,
        email,
        password,
        birthDay: parseInt(birthDay, 10),
        birthMonth: parseInt(birthMonth, 10),
        birthYear: parseInt(birthYear, 10),
        gender,
      });
      Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح! مرحباً بك في دردشة');
      if (onRegisterSuccess) onRegisterSuccess(res);
    } catch (err) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>عضوية جديدة في Dardasha</Text>
        <Text style={styles.subtitle}>انضم لمنصة التواصل الذكي والحر</Text>

        {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

        {/* Names Row */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="الاسم الأول"
            placeholderTextColor="#64748b"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="اسم العائلة"
            placeholderTextColor="#64748b"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="كلمة السر الجديدة"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Date of Birth Section */}
        <Text style={styles.sectionLabel}>تاريخ الميلاد</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.thirdInput]}
            placeholder="اليوم"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={birthDay}
            onChangeText={setBirthDay}
          />
          <TextInput
            style={[styles.input, styles.thirdInput]}
            placeholder="الشهر"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={birthMonth}
            onChangeText={setBirthMonth}
          />
          <TextInput
            style={[styles.input, styles.thirdInput]}
            placeholder="السنة"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={birthYear}
            onChangeText={setBirthYear}
          />
        </View>

        {/* Gender Selection */}
        <Text style={styles.sectionLabel}>الجنس</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.genderBox, gender === 'female' && styles.genderActive]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>أنثى ♀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderBox, gender === 'male' && styles.genderActive]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>ذكر ♂</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderBox, gender === 'custom' && styles.genderActive]}
            onPress={() => setGender('custom')}
          >
            <Text style={[styles.genderText, gender === 'custom' && styles.genderTextActive]}>مخصص ✦</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          🔒 بياناتك الشخصية محمية ومشفرة وفق أعلى معايير الخصوصية.
        </Text>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.btnRegister}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnRegisterText}>انضم الآن إلى دردشة ✨</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity style={styles.backBtn} onPress={onNavigateLogin}>
          <Text style={styles.backBtnText}>هل لديك حساب؟ تسجيل الدخول</Text>
        </TouchableOpacity>
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
  errorText: {
    backgroundColor: 'rgba(244,63,94,0.15)',
    color: '#f43f5e',
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 10,
  },
  halfInput: {
    width: '48%',
    marginBottom: 0,
  },
  thirdInput: {
    width: '31%',
    marginBottom: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c4b5fd',
    textAlign: 'right',
    marginBottom: 6,
    marginTop: 4,
  },
  genderBox: {
    width: '31%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  genderActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139,92,246,0.25)',
  },
  genderText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    marginVertical: 10,
    lineHeight: 16,
  },
  btnRegister: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnRegisterText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '600',
  },
});
