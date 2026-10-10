import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { mobileApi } from '../services/api';

export default function ChatScreen({ currentUser }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await mobileApi.getContacts();
      setContacts(res.contacts || []);
    } catch (err) {
      console.warn('Failed to fetch contacts:', err);
    }
  };

  const loadHistory = async (contact) => {
    setSelectedContact(contact);
    setLoading(true);
    try {
      const res = await mobileApi.getChatHistory(contact.id);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedContact) return;
    const text = inputText.trim();
    setInputText('');

    const temp = {
      id: 'temp-' + Date.now(),
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, temp]);

    try {
      await mobileApi.sendMessage(selectedContact.id, text);
    } catch (err) {
      console.warn('Failed to send:', err);
    }
  };

  if (selectedContact) {
    return (
      <View style={styles.chatContainer}>
        {/* Contact Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← العودة</Text>
          </TouchableOpacity>
          <Text style={styles.contactHeaderTitle}>
            {selectedContact.firstName} {selectedContact.lastName}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages List */}
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color="#1877f2" />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isMine = item.senderId === currentUser.id;
              return (
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={styles.bubbleText}>{item.content}</Text>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="اكتب رسالة..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
            <Text style={styles.sendBtnText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>المحادثات المباشرة</Text>
      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem} onPress={() => loadHistory(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.firstName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.contactSub}>{item.email}</Text>
            </View>
            <Text style={styles.onlineDot}>●</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد محادثات حتى الآن</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1c1e21', marginBottom: 15, textAlign: 'right' },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f2f5' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1877f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  contactName: { fontSize: 15, fontWeight: 'bold', color: '#1c1e21', textAlign: 'right' },
  contactSub: { fontSize: 12, color: '#777', textAlign: 'right' },
  onlineDot: { color: '#00a400', fontSize: 16, marginLeft: 8 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },
  chatContainer: { flex: 1, backgroundColor: '#efeae2' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderColor: '#ddd' },
  backBtn: { padding: 4 },
  backText: { color: '#1877f2', fontWeight: 'bold', fontSize: 14 },
  contactHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#1c1e21' },
  messagesList: { padding: 16 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 10 },
  myBubble: { backgroundColor: '#d9fdd3', alignSelf: 'flex-start', borderTopRightRadius: 2 },
  theirBubble: { backgroundColor: '#fff', alignSelf: 'flex-end', borderTopLeftRadius: 2 },
  bubbleText: { fontSize: 14, color: '#1c1e21', textAlign: 'right' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, textAlign: 'right' },
  sendBtn: { marginLeft: 10, backgroundColor: '#1877f2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
