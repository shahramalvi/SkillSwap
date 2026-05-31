import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../../hooks/useNotifications";
import { cn, formatRelativeTime } from "../../../lib/utils";
import type { AppNotification } from "../../../types";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const recent = notifications.slice(0, 8);

  const openChat = async (exchangeRequestId: string, notificationId: string) => {
    await markRead(notificationId);
    setOpen(false);
    navigate(`/chat/${exchangeRequestId}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white border border-white shadow-card text-navy hover:border-border transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,320px)] bg-white rounded-2xl shadow-soft border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-navy">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-semibold text-teal-dark hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="text-sm text-muted px-4 py-6 text-center">No notifications yet</p>
            ) : (
              recent.map((n: AppNotification) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void openChat(n.exchangeRequestId, n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors",
                    !n.read && "bg-teal/5",
                  )}
                >
                  <p className="text-sm font-semibold text-navy line-clamp-1">{n.title}</p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted mt-1">
                    {formatRelativeTime(n.createdAt.toDate())}
                  </p>
                </button>
              ))
            )}
          </div>

          <Link
            to="/messages"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-semibold text-teal-dark py-3 hover:bg-slate-50"
          >
            View all messages
          </Link>
        </div>
      )}
    </div>
  );
}
