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

export default function FeedScreen({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await mobileApi.getPosts();
      setPosts(res.posts || []);
    } catch (err) {
      console.warn('Failed to load posts:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await mobileApi.createPost(content.trim());
      setPosts(prev => [res.post, ...prev]);
      setContent('');
    } catch (err) {
      console.warn('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await mobileApi.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? res.post : p));
    } catch (err) {
      console.warn('Failed to like post:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>مساحة المجتمع والمنشورات</Text>

      {/* Create Post Input */}
      <View style={styles.createCard}>
        <TextInput
          style={styles.postInput}
          placeholder={`بماذا تفكر يا ${currentUser?.firstName || 'صديقنا'}؟`}
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity
          style={styles.postBtn}
          onPress={handleCreatePost}
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postBtnText}>نشر المنشور</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Posts Stream */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const hasLiked = item.likes?.includes(currentUser?.id);
          return (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.authorName?.[0] || 'D'}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{item.authorName}</Text>
                  <Text style={styles.postTime}>الآن</Text>
                </View>
              </View>

              <Text style={styles.postBody}>{item.content}</Text>

              <View style={styles.statsRow}>
                <Text style={styles.statsText}>👍 {item.likes?.length || 0} إعجاب</Text>
                <Text style={styles.statsText}>{item.comments?.length || 0} تعليق</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleLike(item.id)}
                >
                  <Text style={[styles.actionBtnText, hasLiked && styles.likedText]}>
                    {hasLiked ? '❤️ أعجبني' : '🤍 إعجاب'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>💬 تعليق</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد منشورات بعد</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 14 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1c1e21', marginBottom: 12, textAlign: 'right' },
  createCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  postInput: { backgroundColor: '#f5f6f7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, textAlign: 'right', marginBottom: 10 },
  postBtn: { backgroundColor: '#1877f2', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1877f2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  authorName: { fontSize: 14, fontWeight: 'bold', color: '#1c1e21' },
  postTime: { fontSize: 11, color: '#888' },
  postBody: { fontSize: 14, color: '#1c1e21', lineHeight: 20, textAlign: 'right', marginVertical: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#f0f2f5', paddingTop: 8, marginTop: 8 },
  statsText: { fontSize: 12, color: '#777' },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#f0f2f5', paddingTop: 8, marginTop: 8 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  actionBtnText: { fontSize: 13, color: '#606770', fontWeight: '600' },
  likedText: { color: '#e41e3f', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30 },
});
