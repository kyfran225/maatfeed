import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { PushNotificationToggle } from "../components/ui/PushNotificationToggle";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications
} from "../hooks/useNotifications";
import {
  getNotificationUrl,
  isNotificationUnread,
  type NotificationItem
} from "../services/notificationService";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications({ limit: 50 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  const groupedNotifications = useMemo(() => notifications, [notifications]);

  const handleOpenNotification = async (notification: NotificationItem) => {
    if (isNotificationUnread(notification)) {
      await markAsReadMutation.mutateAsync(notification._id);
    }

    navigate(getNotificationUrl(notification));
  };

  return (
    <>
      <SEO 
        pageKey="notifications"
        title={hasUnread ? `Notifications (${unreadCount} non lues)` : "Notifications"}
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sand/45">Centre d’alertes</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Notifications</h1>
            <p className="mt-2 text-sm text-sand/60">
              Réponses, mentions et activité autour de vos débats.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-sand/80 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-60"
              >
                <CheckCheck className="h-4 w-4" />
                Tout lire
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <PushNotificationToggle />
        </div>

        <div className="mt-6 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="h-4 w-48 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-full rounded bg-white/10" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && groupedNotifications.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
                <Bell className="h-6 w-6 text-sand/45" />
              </div>
              <p className="mt-4 text-sm text-sand/70">Aucune notification pour le moment.</p>
              <p className="mt-1 text-xs text-sand/45">
                Les réponses et mentions dans les débats apparaîtront ici.
              </p>
            </div>
          )}

          {groupedNotifications.map((notification) => {
            const unread = isNotificationUnread(notification);

            return (
              <button
                key={notification._id}
                type="button"
                onClick={() => void handleOpenNotification(notification)}
                className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                  unread
                    ? "border-gold/20 bg-gold/[0.06] hover:border-gold/35 hover:bg-gold/[0.09]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
                }`}
              >
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${unread ? "bg-gold shadow-[0_0_12px_rgba(212,175,55,0.55)]" : "bg-white/10"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-sand/72">{notification.message}</p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-sand/35 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-sand/45">
                    <span>{formatTimeAgo(notification.createdAt)}</span>
                    {unread && <span className="rounded-full bg-gold/12 px-2 py-0.5 text-[11px] font-medium text-gold">Nouveau</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

function formatTimeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = Math.max(0, now - then);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `Il y a ${diffDays}j`;
  if (diffHours > 0) return `Il y a ${diffHours}h`;
  if (diffMin > 0) return `Il y a ${diffMin}min`;
  return "À l’instant";
}
