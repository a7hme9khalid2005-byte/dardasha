import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, Heart, Clock, Shield, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markNotificationsRead();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0f172a] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[85vh] animate-in slide-in-from-left sm:slide-in-from-top duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">مركز الإشعارات والتنبيهات</h3>
              <p className="text-[10px] text-gray-400">آخر التفاعلات والنشاطات في حسابك</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Action bar */}
        <div className="px-4 py-2 border-b border-white/5 bg-[#0b0f19] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === 'unread' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              غير مقروءة
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تعيين الكل كمقروء</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 space-y-1">
              <Bell className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p>لا توجد إشعارات جديدة حالياً</p>
            </div>
          ) : (
            filtered.map(item => {
              const isUnread = !item.read;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl flex items-start gap-3 transition ${
                    isUnread ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.type === 'like' && <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />}
                    {item.type === 'schedule' && <Clock className="w-4 h-4 text-purple-400" />}
                    {item.type === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
                    {item.type === 'ai' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    {!['like', 'schedule', 'shield', 'ai'].includes(item.type) && <MessageCircle className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{item.content}</p>
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2"></span>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
