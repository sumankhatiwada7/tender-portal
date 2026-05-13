import api from "./axios";

export type NotificationType =
  | "new_bid"
  | "bid_accepted"
  | "bid_rejected"
  | "new_tender"
  | "account_approved"
  | "account_rejected";

export type InAppNotification = {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  meta?: {
    tenderId?: string | null;
    bidId?: string | null;
    userId?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
};

type NotificationsResponse = {
  notifications?: InAppNotification[];
  unreadCount?: number;
};

export async function getMyNotifications() {
  const response = await api.get<NotificationsResponse>("/inappnotification");

  return {
    notifications: response.data.notifications ?? [],
    unreadCount: response.data.unreadCount ?? 0,
  };
}

export async function markNotificationAsRead(notificationId: string) {
  await api.patch(`/inappnotification/${notificationId}/read`);
}

export async function markAllNotificationsAsRead() {
  await api.patch("/inappnotification/read-all");
}

export async function deleteNotification(notificationId: string) {
  await api.delete(`/inappnotification/${notificationId}`);
}
