import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { notificationsService } from '@/lib/supabase/notificationsService';
import { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { Sparkles, CheckCheck, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export const NotificationsPage: React.FC = () => {
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
      } catch (err) {
        console.warn('Error loading notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifs();

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

  const markAllRead = async () => {
    if (!currentUser?.id) return;
    await notificationsService.markAllAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClickNotif = async (n: Notification) => {
    if (!n.isRead) {
      await notificationsService.markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    if (n.link) navigate(n.link);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Alerts & Milestones
          </h1>
          <p className="text-xs text-slate-500">
            Live Supabase Realtime alerts: Challenge validations, university assignments, and field outcomes.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button size="sm" variant="outline" onClick={markAllRead} className="text-xs gap-1 cursor-pointer">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          type="no-notifications"
          title="No notifications yet"
          description="You will receive alerts here as projects advance through research, prototyping, and deployment."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => handleClickNotif(n)}
              className={`cursor-pointer hover:border-emerald-500/50 transition-all border-slate-200 dark:border-slate-800 ${
                !n.isRead ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {n.body}
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
