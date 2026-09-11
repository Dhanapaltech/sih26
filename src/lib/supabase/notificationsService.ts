import { supabase } from './supabaseClient';
import { Notification } from '@/types';

export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await (supabase.from('notifications') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code !== 'PGRST205') {
        console.warn('Notifications table not yet available or error:', error.message || error);
      }
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      body: n.message,
      link: n.entity_id ? `/app/challenges/${n.entity_id}` : undefined,
      isRead: n.is_read,
      metadata: n.metadata,
      createdAt: n.created_at,
    }));
  },

  async markAsRead(id: string): Promise<void> {
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('id', id);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  subscribeToUserNotifications(userId: string, onNotification: (notif: Notification) => void) {
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as any;
          onNotification({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            body: n.message,
            link: n.entity_id ? `/app/challenges/${n.entity_id}` : undefined,
            isRead: n.is_read,
            metadata: n.metadata,
            createdAt: n.created_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
