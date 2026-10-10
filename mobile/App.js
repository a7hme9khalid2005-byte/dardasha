import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ChatScreen from './src/screens/ChatScreen';
import FeedScreen from './src/screens/FeedScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT'
  const [activeTab, setActiveTab] = useState('CHAT'); // 'CHAT', 'FEED'

  // Not Authenticated
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
        {authScreen === 'LOGIN' && (
          <LoginScreen
            onNavigateRegister={() => setAuthScreen('REGISTER')}
            onNavigateForgot={() => setAuthScreen('FORGOT')}
            onLoginSuccess={(user) => setCurrentUser(user)}
          />
        )}

        {authScreen === 'REGISTER' && (
          <RegisterScreen
            onNavigateLogin={() => setAuthScreen('LOGIN')}
            onRegisterSuccess={(data) => setCurrentUser(data.user)}
          />
        )}

        {authScreen === 'FORGOT' && (
          <ForgotPasswordScreen
            onNavigateLogin={() => setAuthScreen('LOGIN')}
          />
        )}
      </SafeAreaView>
    );
  }

  // Authenticated - Main App
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => setCurrentUser(null)} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>
          Dardasha <Text style={{ color: '#1c1e21', fontSize: 16 }}>| دردشة</Text>
        </Text>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{currentUser.firstName[0]}</Text>
        </View>
      </View>

      {/* Main View */}
      <View style={{ flex: 1 }}>
        {activeTab === 'CHAT' && <ChatScreen currentUser={currentUser} />}
        {activeTab === 'FEED' && <FeedScreen currentUser={currentUser} />}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'CHAT' && styles.navTabActive]}
          onPress={() => setActiveTab('CHAT')}
        >
          <Text style={[styles.navIcon, activeTab === 'CHAT' && styles.navIconActive]}>💬</Text>
          <Text style={[styles.navText, activeTab === 'CHAT' && styles.navTextActive]}>
            المحادثات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'FEED' && styles.navTabActive]}
          onPress={() => setActiveTab('FEED')}
        >
          <Text style={[styles.navIcon, activeTab === 'FEED' && styles.navIconActive]}>🌐</Text>
          <Text style={[styles.navText, activeTab === 'FEED' && styles.navTextActive]}>
            المجتمع
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0f172a',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  logoutBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(244,63,94,0.15)',
    borderRadius: 8,
  },
  logoutText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomNav: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0f172a',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabActive: {
    borderTopWidth: 2,
    borderColor: '#7c3aed',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navIconActive: {
    transform: [{ scale: 1.1 }],
  },
  navText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#06b6d4',
    fontWeight: 'bold',
  },
});
