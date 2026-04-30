import { useState, useEffect, useCallback } from 'react';
import { notifAPI } from '../services/api';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await notifAPI.unread();
      setUnread(data.unread);
    } catch {}
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await notifAPI.list();
      setNotifs(data.results || data);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  const markAllRead = async () => {
    await notifAPI.markAllRead();
    setUnread(0);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id) => {
    await notifAPI.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return { unread, notifs, fetchAll, markAllRead, markRead };
}