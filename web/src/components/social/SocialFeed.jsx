import React, { useState, useEffect } from 'react';
import { 
  Heart, Flame, MessageSquare, Share2, Image as ImageIcon, 
  Send, MoreHorizontal, Plus, Loader2, Sparkles, Users, Lock, 
  Smile, SmilePlus, Globe, Star, Home
} from 'lucide-react';
import { api } from '../../services/api';

export default function SocialFeed({ currentUser, onOpenContactProfile }) {
  const [posts, setPosts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState('all'); // 'all', 'public', 'close_friends', 'family'
  const [postCircle, setPostCircle] = useState('public');

  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  // Daily Note creation modal / inline
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    loadPosts(selectedCircle);
    loadNotes();
  }, [selectedCircle]);

  const loadPosts = async (circle) => {
    try {
      setLoadingPosts(true);
      const res = await api.getPosts(circle);
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await api.getNotes();
      let n = res.notes || [];
      if (n.length === 0) {
        n = [
          {
            id: 'demo-note-1',
            userId: 'user-sarah',
            userName: 'سارة خالد',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            content: 'قهوة الصباح وسعادة لا تنتهي ☕✨',
            emoji: '☕',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-note-2',
            userId: 'user-omar',
            userName: 'عمر التميمي',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            content: 'في قمة التركيز على إطلاق مشروعنا 🚀',
            emoji: '🔥',
            createdAt: new Date().toISOString(),
          }
        ];
      }
      setNotes(n);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage.trim()) return;

    setSubmittingPost(true);
    try {
      const res = await api.createPost(newPostText.trim(), newPostImage.trim() || null, postCircle);
      setPosts(prev => [res.post, ...prev]);
      setNewPostText('');
      setNewPostImage('');
      setShowImageInput(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      const res = await api.saveNote(newNoteText.trim(), '💭');
      setNotes(prev => [res.note, ...prev.filter(n => n.userId !== currentUser.id)]);
      setNewNoteText('');
      setShowNoteModal(false);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? res.post : p));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    try {
      const res = await api.addComment(postId, commentText);
      setPosts(prev => prev.map(p => p.id === postId ? res.post : p));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to comment on post:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-3 sm:px-4 space-y-5 text-white">
      
      {/* 1. DAILY NOTES (24h Floating Status Bubbles like Instagram) */}
      <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <SmilePlus className="w-4 h-4 text-cyan-400" />
            <span>الملاحظات الحية (Daily Notes - 24 ساعة)</span>
          </span>
          <button
            onClick={() => setShowNoteModal(true)}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>أضف ملاحظتك</span>
          </button>
        </div>

        {/* Note Bubbles Row */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {/* Current User Note Trigger */}
          <div 
            onClick={() => setShowNoteModal(true)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl ring-2 ring-purple-500/40 object-cover" />
              <div className="absolute -top-3 -right-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full p-1 shadow-glow group-hover:scale-110 transition">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-300 mt-1">ملاحظتك</span>
          </div>

          {/* Friends Notes */}
          {notes.map(note => (
            <div 
              key={note.id} 
              onClick={() => onOpenContactProfile && onOpenContactProfile({
                id: note.userId,
                firstName: note.userName?.split(' ')[0] || note.userName,
                lastName: note.userName?.split(' ')[1] || '',
                avatar: note.userAvatar,
                bio: note.content
              })}
              className="flex flex-col items-center flex-shrink-0 relative group cursor-pointer hover:opacity-90 transition"
              title="عرض الملف الشخصي"
            >
              {/* Floating Thought Bubble */}
              <div className="mb-1 max-w-[110px] bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-2xl text-[10px] text-white text-center truncate shadow-sm">
                <span>{note.emoji} {note.content}</span>
              </div>
              <img src={note.userAvatar} alt={note.userName} className="w-11 h-11 rounded-2xl ring-2 ring-cyan-400/40 object-cover" />
              <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[80px]">{note.userName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CIRCLES FILTER (الدوائر المخصصة) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 text-[11px] font-bold ml-1">الدوائر:</span>
        {[
          { key: 'all', label: 'الكل 🌐', icon: Globe },
          { key: 'public', label: 'عام 📣', icon: Users },
          { key: 'close_friends', label: 'الأصدقاء المقربون ⭐', icon: Star },
          { key: 'family', label: 'العائلة 🏠', icon: Home },
        ].map(circle => (
          <button
            key={circle.key}
            onClick={() => setSelectedCircle(circle.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
              selectedCircle === circle.key
                ? 'bg-purple-600 border-purple-400 text-white shadow-glow'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{circle.label}</span>
          </button>
        ))}
      </div>

      {/* 3. CREATE POST CARD WITH CIRCLE SELECTOR */}
      <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl ring-1 ring-purple-500/40 object-cover" />
          <input
            type="text"
            placeholder={`ما الجديد في دائرتك يا ${currentUser.firstName}؟`}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition text-right"
          />
        </div>

        {showImageInput && (
          <div className="pt-1">
            <input
              type="url"
              placeholder="ضع رابط صورة المنشور (Image URL)..."
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-right"
            />
          </div>
        )}

        <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-xs font-semibold text-gray-300 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setShowImageInput(!showImageInput)}
              className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>إرفاق صورة</span>
            </button>

            {/* Circle target selector */}
            <select
              value={postCircle}
              onChange={(e) => setPostCircle(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-purple-300 focus:outline-none"
            >
              <option value="public" className="bg-[#0f172a] text-white">دائرة: عام (للجميع)</option>
              <option value="close_friends" className="bg-[#0f172a] text-white">دائرة: المقربون ⭐</option>
              <option value="family" className="bg-[#0f172a] text-white">دائرة: العائلة 🏠</option>
            </select>
          </div>

          <button 
            type="button"
            onClick={handleCreatePost}
            disabled={submittingPost || (!newPostText.trim() && !newPostImage.trim())}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-glow disabled:opacity-40"
          >
            {submittingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>نشر</span>
          </button>
        </div>
      </div>

      {/* 4. POSTS FEED */}
      <div className="space-y-4">
        {loadingPosts ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center text-xs text-gray-400">جاري تحميل المنشورات...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center text-xs text-gray-400">
            لا توجد منشورات في هذه الدائرة حالياً.
          </div>
        ) : (
          posts.map(post => {
            const hasLiked = post.likes?.includes(currentUser.id);
            const timeAgo = new Date(post.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={post.id} className="bg-[#1e293b]/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden hover:border-white/20 transition">
                
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div 
                    onClick={() => onOpenContactProfile && onOpenContactProfile({
                      id: post.authorId || 'author-' + post.id,
                      firstName: post.authorName?.split(' ')[0] || post.authorName,
                      lastName: post.authorName?.split(' ')[1] || '',
                      avatar: post.authorAvatar,
                      bio: 'ناشر نشط في مجتمع دردشة ✨'
                    })}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="عرض الملف الشخصي"
                  >
                    <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-2xl ring-1 ring-purple-400/30 object-cover group-hover:ring-cyan-400 transition" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs group-hover:text-cyan-300 transition flex items-center gap-1.5">
                          <span>{post.authorName}</span>
                          <span className="text-[9px] text-cyan-400/80 bg-cyan-500/10 px-1 py-0.2 rounded border border-cyan-500/20 font-normal">الملف</span>
                        </h4>
                        {post.circle && post.circle !== 'public' && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[9px] font-bold">
                            {post.circle === 'close_friends' ? '⭐ المقربون' : '🏠 العائلة'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{timeAgo}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap text-right">{post.content}</p>
                </div>

                {/* Image */}
                {post.imageUrl && (
                  <div className="max-h-96 overflow-hidden bg-black/40">
                    <img src={post.imageUrl} alt="Media" className="w-full object-cover" />
                  </div>
                )}

                {/* Stats */}
                <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-purple-300 font-bold">
                    <span>✦</span> {post.likes?.length || 0} تفاعل
                  </span>
                  <span>{post.comments?.length || 0} تعليق</span>
                </div>

                {/* Actions */}
                <div className="px-2 py-1 border-t border-white/5 flex items-center justify-around text-xs font-semibold text-gray-300">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                      hasLiked ? 'text-rose-400 bg-rose-500/10 font-bold' : 'hover:bg-white/5'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>تفاعل</span>
                  </button>

                  <button className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>تعليق</span>
                  </button>

                  <button className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span>مشاركة</span>
                  </button>
                </div>

                {/* Comments */}
                <div className="p-4 bg-black/20 border-t border-white/5 space-y-2.5">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="flex items-start gap-2 text-xs">
                          <img src={comm.authorAvatar} alt="Commenter" className="w-6 h-6 rounded-xl mt-0.5 object-cover" />
                          <div className="bg-white/5 border border-white/5 rounded-2xl px-3 py-1.5 flex-1 text-right">
                            <span className="font-bold text-cyan-300 block text-[11px]">{comm.authorName}</span>
                            <span className="text-gray-300">{comm.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2 pt-1">
                    <img src={currentUser.avatar} alt="User" className="w-6 h-6 rounded-xl object-cover" />
                    <input
                      type="text"
                      placeholder="اكتب تعليقاً في دردشة..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-right"
                    />
                    <button
                      type="submit"
                      disabled={!commentInputs[post.id]?.trim()}
                      className="p-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-30 transition"
                    >
                      <Send className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </form>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ADD NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm bg-[#0f172a] rounded-3xl border border-cyan-500/30 p-5 text-white animate-in zoom-in-95">
            <h4 className="font-bold text-sm mb-1 text-right">ملاحظتك الحية (24 ساعة) 💭</h4>
            <p className="text-xs text-gray-400 mb-3 text-right">شارك فكرة أو كلمة قصيرة تظهر فوق صورتك لأصدقائك:</p>
            
            <form onSubmit={handleCreateNote} className="space-y-3">
              <input
                type="text"
                maxLength={45}
                placeholder="مثال: أستمع لشيء رائع، مشغول حالياً..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-right"
              />
              <div className="flex items-center justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-5 py-1.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-glow disabled:opacity-40"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
