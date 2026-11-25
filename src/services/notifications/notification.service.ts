import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  rideId: number | null;
  read: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationItem[]>(ENDPOINTS.NOTIFICATIONS.BASE);
  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<{ unreadCount: number }>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );
  return data.unreadCount ?? 0;
}

export async function markNotificationRead(
  id: number
): Promise<NotificationItem> {
  const { data } = await api.patch<NotificationItem>(
    ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
}
