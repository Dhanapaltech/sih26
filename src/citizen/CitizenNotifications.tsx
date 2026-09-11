import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { notificationsService } from '@/lib/supabase/notificationsService';
import { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Sparkles, Loader2, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export const CitizenNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    async function loadNotifs() {
      setIsLoading(true);
      try {
        const data = await notificationsService.getNotifications(currentUser!.id);
        setNotifications(data);
      } catch (e) {
        console.warn('Error loading notifications:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifs();

    // Subscribe to realtime notifications
    const unsubscribe = notificationsService.subscribeToUserNotifications(
      currentUser.id,
      (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    await notificationsService.markAllAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClickNotif = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationsService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Notifications & Updates
          </h2>
          <p className="text-xs text-slate-500">
            Live updates and notifications via Supabase Realtime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <Badge variant="outline" className="text-xs">
            {notifications.length} Total
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          type="no-notifications"
          title="No notifications yet"
          description="You will receive alerts here when the government reviews your challenges or a university begins an engineering pilot."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleClickNotif(notif)}
              className={`cursor-pointer hover:border-emerald-500/40 transition-all border-slate-200 dark:border-slate-800 ${
                !notif.isRead ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {notif.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
