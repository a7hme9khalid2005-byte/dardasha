import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { mobileApi, setAuthToken } from '../services/api';

export default function LoginScreen({ onNavigateRegister, onNavigateForgot, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await mobileApi.login({ email, password });
      setAuthToken(res.token);
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0b0f19' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>D</Text>
          </View>
          <Text style={styles.brandTitle}>Dardasha</Text>
          <Text style={styles.brandSubtitle}>
            منصة التواصل الذكي والحر — سرعة فائقة وأمان تام.
          </Text>
        </View>

        {/* Futuristic Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>تسجيل الدخول</Text>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="كلمة السر"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.btnLogin}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnLoginText}>دخول إلى المنصة</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotBtn} onPress={onNavigateForgot}>
            <Text style={styles.forgotText}>هل نسيت كلمة المرور؟ (كود 6 أرقام)</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Create Account */}
          <TouchableOpacity
            style={styles.btnCreate}
            onPress={onNavigateRegister}
          >
            <Text style={styles.btnCreateText}>إنشاء حساب جديد في دردشة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#0b0f19',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  cardHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  input: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 12,
  },
  btnLogin: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnLoginText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  forgotText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  btnCreate: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnCreateText: {
    color: '#ddd6fe',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
