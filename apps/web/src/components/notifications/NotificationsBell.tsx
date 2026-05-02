import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";

export function NotificationsBell() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationCount(isAuthenticated && !isBootstrapping);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      to="/notifications"
      aria-label={unreadCount > 0 ? `${unreadCount} notifications non lues` : "Notifications"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 hover:bg-white/[0.08]"
    >
      <Bell className={`h-5 w-5 ${unreadCount > 0 ? "text-gold" : "text-sand/80"}`} strokeWidth={1.8} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-none text-ink shadow-lg shadow-amber-500/30">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
