import { useNavigate } from "react-router-dom";
import NotificationCard from "../components/social/NotificationCard";
import { useNotifications } from "../context/NotificationContext";

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const openNotification = (notification) => {
    const actionUrl = notification.actionUrl;
    if (typeof actionUrl === "string" && actionUrl.startsWith("/") && !actionUrl.startsWith("//")) {
      navigate(actionUrl);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-gray-400">
              You have {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
            </p>
          </div>
          <button type="button" disabled={!unreadCount || loading} onClick={() => markAllAsRead().catch(() => {})}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-violet-300 hover:bg-white/10 disabled:opacity-40">
            Mark all as read
          </button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <section className="mt-7 space-y-3">
          {loading && !notifications.length ? <p className="rounded-xl border border-white/10 bg-gray-900 p-6 text-center text-gray-400">Loading notifications...</p>
            : notifications.length ? notifications.map((notification) => (
              <NotificationCard key={notification.id || notification._id} notification={notification}
                onClick={openNotification}
                onMarkRead={(id) => markAsRead(id).catch(() => {})}
                onDelete={(id) => deleteNotification(id).catch(() => {})} />
            )) : (
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-12 text-center">
                <span className="text-4xl" aria-hidden="true">🔔</span>
                <h2 className="mt-4 font-semibold">You're all caught up</h2>
                <p className="mt-2 text-sm text-gray-400">New notifications will appear here.</p>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}
