import { create } from "zustand";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/services/notifications/notification.service";

type NotificationState = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: "",

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: "" });
      const items = await getNotifications();
      const unreadCount = items.filter((n) => !n.read).length;
      set({ notifications: items, unreadCount, loading: false });
    } catch {
      set({
        loading: false,
        error: "Unable to load notifications right now.",
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadNotificationCount();
      set({ unreadCount: count });
    } catch {
      // Non-blocking background count refresh.
    }
  },

  markAsRead: async (id: number) => {
    const existing = get().notifications.find((n) => n.id === id);
    if (!existing || existing.read) return;

    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });

    try {
      await markNotificationRead(id);
    } catch {
      // Revert if server call failed.
      await get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      await markAllNotificationsRead();
    } catch {
      await get().fetchNotifications();
    }
  },
}));
