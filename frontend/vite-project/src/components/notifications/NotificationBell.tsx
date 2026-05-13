import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type InAppNotification,
} from "../../api/notification.api";
import { authStorageKey, useAuthStore } from "../../store/auth.store";
import { DashboardIcon } from "../../features/dashboard/components/DashboardUi";

type NotificationBellProps = {
  tone?: "green" | "sky" | "teal";
  compact?: boolean;
};

const toneClasses = {
  green: {
    button: "border-green-main/20 bg-white text-green-main hover:border-green-main/40",
    badge: "bg-green-main text-white",
    unread: "bg-green-light/70",
    dot: "bg-green-main",
    action: "text-green-main hover:bg-green-light",
  },
  sky: {
    button: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
    badge: "bg-sky-500 text-white",
    unread: "bg-sky-50",
    dot: "bg-sky-500",
    action: "text-sky-700 hover:bg-sky-50",
  },
  teal: {
    button: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
    badge: "bg-teal-500 text-white",
    unread: "bg-teal-50",
    dot: "bg-teal-500",
    action: "text-teal-700 hover:bg-teal-50",
  },
};

const legacyAuthStorageKey = "queue-system-auth";

function hasStoredAccessToken() {
  for (const key of [authStorageKey, legacyAuthStorageKey]) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        return true;
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return false;
}

function formatNotificationTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function NotificationBell({ tone = "green", compact = false }: NotificationBellProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const canUseNotifications = isAuthenticated || hasStoredAccessToken();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const classes = toneClasses[tone];

  const loadNotifications = useCallback(async () => {
    if (!canUseNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [canUseNotifications]);

  useEffect(() => {
    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  if (!canUseNotifications) {
    return null;
  }

  async function handleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await loadNotifications();
    }
  }

  async function handleNotificationClick(notification: InAppNotification) {
    if (!notification.isRead) {
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      try {
        await markNotificationAsRead(notification._id);
      } catch {
        void loadNotifications();
      }
    }

    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  }

  async function handleMarkAll() {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead();
    } catch {
      void loadNotifications();
    }
  }

  async function handleDelete(notificationId: string) {
    const target = notifications.find((notification) => notification._id === notificationId);
    setNotifications((current) => current.filter((notification) => notification._id !== notificationId));
    if (target && !target.isRead) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
    try {
      await deleteNotification(notificationId);
    } catch {
      void loadNotifications();
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Open notifications"
        aria-expanded={open}
        className={[
          "relative inline-flex items-center justify-center border transition focus:outline-none focus:ring-2 focus:ring-offset-2",
          compact ? "h-11 w-11 rounded-full" : "h-11 w-11 rounded-2xl",
          classes.button,
        ].join(" ")}
        type="button"
        onClick={() => void handleOpen()}
      >
        <DashboardIcon className="h-5 w-5" name="bell" />
        {unreadCount > 0 ? (
          <span
            className={[
              "absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold leading-none",
              classes.badge,
            ].join(" ")}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[90] mt-3 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Notifications</p>
              <p className="mt-0.5 text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            <button
              className={["rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-40", classes.action].join(" ")}
              type="button"
              disabled={unreadCount === 0}
              onClick={() => void handleMarkAll()}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  className={[
                    "grid grid-cols-[1fr_auto] gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0",
                    notification.isRead ? "bg-white" : classes.unread,
                  ].join(" ")}
                  key={notification._id}
                >
                  <button
                    className="min-w-0 text-left"
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.isRead ? <span className={["mt-1.5 h-2 w-2 shrink-0 rounded-full", classes.dot].join(" ")} /> : null}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{notification.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                        {notification.createdAt ? (
                          <p className="mt-2 text-[11px] font-medium text-slate-400">{formatNotificationTime(notification.createdAt)}</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                  <button
                    aria-label="Delete notification"
                    className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    type="button"
                    onClick={() => void handleDelete(notification._id)}
                  >
                    <DashboardIcon className="h-4 w-4" name="trash" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
