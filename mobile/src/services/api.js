// Mobile API Client (uses Platform-appropriate localhost or network IP)
const API_BASE = 'http://10.0.2.2:5000/api'; // Android emulator localhost, or change to http://localhost:5000 for iOS/web

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
});

export const mobileApi = {
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل التسجيل');
    return result;
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل تسجيل الدخول');
    return result;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إرسال رمز التحقق');
    return result;
  },

  async verifyOtp(email, code) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'رمز التحقق غير صحيح');
    return result;
  },

  async resetPassword(email, code, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل تغيير كلمة المرور');
    return result;
  },

  async getContacts() {
    const res = await fetch(`${API_BASE}/chat/contacts`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getChatHistory(contactId) {
    const res = await fetch(`${API_BASE}/chat/history/${contactId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async sendMessage(receiverId, content) {
    const res = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ receiverId, content }),
    });
    return res.json();
  },

  async getPosts() {
    const res = await fetch(`${API_BASE}/posts`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createPost(content) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async likePost(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  }
};
