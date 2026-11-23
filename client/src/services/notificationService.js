
import api from "./api";

const notificationService = {
  getNotifications(params = {}) {
    return api.get("/notifications", params);
  },

  getUnreadCount() {
    return api.get("/notifications/unread-count");
  },

  markAsRead(notificationId) {
    return api.patch(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {}
    );
  },

  markAllAsRead() {
    return api.patch("/notifications/read-all", {});
  },

  deleteNotification(notificationId) {
    return api.delete(
      `/notifications/${encodeURIComponent(notificationId)}`
    );
  },

};

export default notificationService;
