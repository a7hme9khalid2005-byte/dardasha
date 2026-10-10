export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('dardasha_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Authentication
  async sendRegisterOtp(email, firstName, username) {
    const res = await fetch(`${API_BASE}/auth/register/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, username }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إرسال رمز التحقق');
    return result;
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إنشاء الحساب');
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

  async forgotPassword(identifier) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier }),
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
    if (!res.ok) throw new Error(result.error || 'فشل إعادة تعيين كلمة المرور');
    return result;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل جلب الملف الشخصي');
    return res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل تحديث الملف الشخصي');
    return result;
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Chat
  async getContacts() {
    const res = await fetch(`${API_BASE}/chat/contacts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل جلب جهات الاتصال');
    return res.json();
  },

  async getChatHistory(contactId) {
    const res = await fetch(`${API_BASE}/chat/history/${contactId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل جلب المحادثات');
    return res.json();
  },

  async sendMessage(receiverId, content, extra = {}) {
    const res = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        receiverId, 
        content,
        isVoice: extra.isVoice || false,
        voiceTranscription: extra.voiceTranscription || null,
        selfDestruct: extra.selfDestruct || null,
        isWhisper: extra.isWhisper || false,
        whisperTargetId: extra.whisperTargetId || null,
        isRawFile: extra.isRawFile || false,
        rawFileSize: extra.rawFileSize || null,
        isGiftBox: extra.isGiftBox || false,
        isViewOnce: extra.isViewOnce || false,
        soundSticker: extra.soundSticker || null,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إرسال الرسالة');
    return result;
  },

  async togglePinMessage(messageId) {
    const res = await fetch(`${API_BASE}/chat/message/${messageId}/pin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getVault() {
    const res = await fetch(`${API_BASE}/chat/vault`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addToVault(title, content, type = 'text') {
    const res = await fetch(`${API_BASE}/chat/vault`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, type }),
    });
    return res.json();
  },

  async removeFromVault(id) {
    const res = await fetch(`${API_BASE}/chat/vault/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAnonymousQA(recipientId) {
    const res = await fetch(`${API_BASE}/chat/anonymous-qa?recipientId=${recipientId || ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async sendAnonymousQuestion(recipientId, question) {
    const res = await fetch(`${API_BASE}/chat/anonymous-qa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientId, question }),
    });
    return res.json();
  },

  async answerAnonymousQuestion(id, answer) {
    const res = await fetch(`${API_BASE}/chat/anonymous-qa/${id}/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answer }),
    });
    return res.json();
  },

  async editMessage(messageId, content) {
    const res = await fetch(`${API_BASE}/chat/message/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async deleteMessageClean(messageId) {
    const res = await fetch(`${API_BASE}/chat/message/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async scheduleMessage(receiverId, content, scheduledFor) {
    const res = await fetch(`${API_BASE}/chat/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, content, scheduledFor }),
    });
    return res.json();
  },

  async createPoll(question, options, receiverId) {
    const res = await fetch(`${API_BASE}/chat/poll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question, options, receiverId }),
    });
    return res.json();
  },

  async votePoll(pollId, optionIndex) {
    const res = await fetch(`${API_BASE}/chat/poll/${pollId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ optionIndex }),
    });
    return res.json();
  },

  // Daily Notes (Status Bubbles)
  async getNotes() {
    const res = await fetch(`${API_BASE}/chat/notes`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveNote(content, emoji) {
    const res = await fetch(`${API_BASE}/chat/note`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, emoji }),
    });
    return res.json();
  },

  // Posts with Circles
  async getPosts(circle = 'all') {
    const res = await fetch(`${API_BASE}/posts?circle=${circle}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل جلب المنشورات');
    return res.json();
  },

  async createPost(content, imageUrl, circle = 'public') {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, imageUrl, circle }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل نشر المنشور');
    return result;
  },

  async likePost(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addComment(postId, content) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  // Item 113: Instant Web QR Login
  async generateQrSession() {
    const res = await fetch(`${API_BASE}/auth/qr/generate`, { method: 'POST' });
    return res.json();
  },

  async checkQrSession(sessionId) {
    const res = await fetch(`${API_BASE}/auth/qr/check/${sessionId}`);
    return res.json();
  },

  async approveQrSession(sessionId) {
    const res = await fetch(`${API_BASE}/auth/qr/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },

  async getNetworkInfo() {
    try {
      const res = await fetch(`${API_BASE}/network-info`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Network info fetch error:', e);
    }
    return null;
  },

  // Item 22: Security Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/auth/audit-log`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Item 21: Panic Button Wipe
  async panicWipe() {
    const res = await fetch(`${API_BASE}/auth/panic-wipe`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Item 16: Burner Connect Link
  async createBurnerLink(durationMinutes, maxMessages) {
    const res = await fetch(`${API_BASE}/chat/burner-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ durationMinutes, maxMessages }),
    });
    return res.json();
  },

  async getBurnerLink(token) {
    const res = await fetch(`${API_BASE}/chat/burner-link/${token}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Item 112: Cross-Device Draft Sync
  async getDraft(contactId) {
    const res = await fetch(`${API_BASE}/chat/drafts/${contactId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveDraft(contactId, text) {
    const res = await fetch(`${API_BASE}/chat/drafts/${contactId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Item 66: Out-of-Office Settings
  async getOutOfOffice() {
    const res = await fetch(`${API_BASE}/chat/out-of-office`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async setOutOfOffice(data) {
    const res = await fetch(`${API_BASE}/chat/out-of-office`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Item 106: Encrypted Cloud Backup & Restore
  async exportBackup() {
    const res = await fetch(`${API_BASE}/chat/backup/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async importBackup(backup) {
    const res = await fetch(`${API_BASE}/chat/backup/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ backup }),
    });
    return res.json();
  },

  // Groups and Communities (Items 25, 26, 28, 30, 31, 32, 33, 34, 35, 36)
  async getGroups() {
    const res = await fetch(`${API_BASE}/groups`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createGroup(data) {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addGroupThread(groupId, name) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/threads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async addGroupBroadcast(groupId, data) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/broadcasts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async confirmBroadcast(groupId, bcId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/broadcasts/${bcId}/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async sendModBoxItem(groupId, data) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/mod-box`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getGroupAnalytics(groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/analytics`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Friend Requests & Connections System
  async getFriendRequests() {
    const res = await fetch(`${API_BASE}/friends/requests`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async sendFriendRequest(identifier) {
    const res = await fetch(`${API_BASE}/friends/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ identifier }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال طلب الصداقة');
    return data;
  },

  async respondFriendRequest(requestId, action, circle = 'all') {
    const res = await fetch(`${API_BASE}/friends/respond`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestId, action, circle }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل معالجة طلب الصداقة');
    return data;
  },

  async cancelFriendRequest(requestId) {
    const res = await fetch(`${API_BASE}/friends/request/${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إلغاء الطلب');
    return data;
  },

  async getFriendSuggestions() {
    const res = await fetch(`${API_BASE}/friends/suggestions`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getFriendQrData() {
    const res = await fetch(`${API_BASE}/friends/qr`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async claimFriendQr(qrToken) {
    const res = await fetch(`${API_BASE}/friends/qr/claim`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ qrToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل ربط الصداقة عبر QR');
    return data;
  },

  // Gemini AI Assistant Methods
  async askAi(message, history = []) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشلت معالجة رسالة الذكاء الاصطناعي');
    return data;
  },

  async summarizeAi(text) {
    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل التلخيص');
    return data;
  },

  async translateAi(text, targetLang = 'en') {
    const res = await fetch(`${API_BASE}/ai/translate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشلت الترجمة');
    return data;
  },

  async smartReplyAi(message) {
    const res = await fetch(`${API_BASE}/ai/smart-reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل توليد الردود الذكية');
    return data;
  },

  async rewriteAi(text, tone = 'professional') {
    const res = await fetch(`${API_BASE}/ai/rewrite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, tone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشلت إعادة الصياغة');
    return data;
  },

  // 100,000 Gifts Universe & Mystery Chest (Once Every 3 Days)
  async getChestStatus() {
    const res = await fetch(`${API_BASE}/gifts/chest/status`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل فحص حالة الصندوق');
    return data;
  },

  async openChest(chestTier = 'daily', forceReset = false) {
    const res = await fetch(`${API_BASE}/gifts/chest/open`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ chestTier, forceReset }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل فتح الصندوق');
    return data;
  },

  async resetChestCooldown() {
    const res = await fetch(`${API_BASE}/gifts/chest/reset-cooldown`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getMyGifts() {
    const res = await fetch(`${API_BASE}/gifts/my-inventory`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب الهدايا');
    return data;
  },

  async sendGift(data) {
    const res = await fetch(`${API_BASE}/gifts/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إرسال الهدية');
    return result;
  },

  async exploreGifts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/gifts/explore?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل استعراض الهدايا');
    return data;
  },

  async getUserGifts(userId) {
    const res = await fetch(`${API_BASE}/gifts/user/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب هدايا المستخدم');
    return data;
  },
};
