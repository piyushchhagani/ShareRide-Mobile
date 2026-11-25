import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { useNotificationStore } from "@/store/notification.store";
import type { NotificationItem } from "@/services/notifications/notification.service";
import { goBackSafely } from "@/utils/navigation";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type Category = "All" | "Bookings" | "Rides" | "Updates";

const FILTERS: Category[] = ["All", "Bookings", "Rides", "Updates"];

function getCategory(type: string): Exclude<Category, "All"> {
  if (
    type === "REQUEST_ACCEPTED" ||
    type === "REQUEST_REJECTED" ||
    type === "RIDE_CANCELLED" ||
    type === "RIDE_COMPLETED"
  ) {
    return "Bookings";
  }
  if (type === "REQUEST_RECEIVED" || type === "REQUEST_CANCELLED") {
    return "Rides";
  }
  return "Updates";
}

function getIcon(type: string): string {
  switch (type) {
    case "REQUEST_RECEIVED":
      return "🙋";
    case "REQUEST_ACCEPTED":
      return "✅";
    case "REQUEST_REJECTED":
      return "❌";
    case "REQUEST_CANCELLED":
    case "RIDE_CANCELLED":
      return "🚫";
    case "RIDE_COMPLETED":
      return "🏁";
    default:
      return "🔔";
  }
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [filter, setFilter] = useState<Category>("All");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchNotifications();
    }, [fetchNotifications])
  );

  const visibleNotices = useMemo(() => {
    if (filter === "All") return notifications;
    return notifications.filter((n) => getCategory(n.type) === filter);
  }, [filter, notifications]);

  const handlePressNotice = async (notice: NotificationItem) => {
    await markAsRead(notice.id);
    if (notice.rideId) {
      if (notice.type === "REQUEST_RECEIVED" || notice.type === "REQUEST_CANCELLED") {
        router.push({
          pathname: "/driver-requests",
          params: { rideId: String(notice.rideId) },
        });
      } else {
        router.push({
          pathname: "/ride-details",
          params: { rideId: String(notice.rideId) },
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.brand}
            onRefresh={() => {
              setRefreshing(true);
              void fetchNotifications().finally(() => setRefreshing(false));
            }}
          />
        }
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => goBackSafely("/(tabs)/home")}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <Text style={styles.eyebrow}>YOUR INBOX</Text>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Important ride and booking updates in one place.
            </Text>
          </View>

          <View style={styles.bell}>
            <Text style={styles.bellEmoji}>🔔</Text>
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Unread</Text>
            <Text style={styles.summaryCount}>{unreadCount}</Text>
          </View>

          <TouchableOpacity
            onPress={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            style={[
              styles.readButton,
              unreadCount === 0 && styles.disabledButton,
            ]}
          >
            <Text style={styles.readButtonText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => {
            const selected = item === filter;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filter, selected && styles.selectedFilter]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.selectedFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sampleLabel}>
            {notifications.length} TOTAL
          </Text>
        </View>

        {loading && notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.emptyText}>Loading notifications…</Text>
          </View>
        ) : error && notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyTitle}>Couldn&apos;t load inbox</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void fetchNotifications()}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : visibleNotices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>
              Ride requests, acceptances, cancellations, and trip updates will appear here automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.noticeList}>
            {visibleNotices.map((notice) => {
              const category = getCategory(notice.type);
              return (
                <TouchableOpacity
                  key={notice.id}
                  activeOpacity={0.8}
                  onPress={() => void handlePressNotice(notice)}
                  style={[
                    styles.noticeCard,
                    !notice.read && styles.unreadCard,
                  ]}
                >
                  <View style={styles.noticeIcon}>
                    <Text style={styles.noticeEmoji}>
                      {getIcon(notice.type)}
                    </Text>
                  </View>

                  <View style={styles.noticeContent}>
                    <View style={styles.noticeHeading}>
                      <Text style={styles.noticeTitle}>{notice.title}</Text>
                      {!notice.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.noticeMessage}>{notice.message}</Text>

                    <View style={styles.noticeFooter}>
                      <Text style={styles.noticeTime}>
                        {formatTime(notice.createdAt)}
                      </Text>
                      <Text style={styles.categoryLabel}>{category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => router.push("/(tabs)/bookings")}
        >
          <Text style={styles.bookingsButtonText}>View my bookings  ›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>ShareRide · Stay in the loop.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleContent: {
    flex: 1,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.screenTitle,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  bell: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bellEmoji: {
    fontSize: 24,
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  summaryCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  summaryCount: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  readButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  readButtonText: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.45,
  },
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedFilter: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  selectedFilterText: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  sampleLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  noticeList: {
    gap: spacing.sm,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  noticeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeEmoji: {
    fontSize: 21,
  },
  noticeContent: {
    flex: 1,
    gap: spacing.sm,
  },
  noticeHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  noticeTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  noticeMessage: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  noticeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  noticeTime: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  categoryLabel: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 38,
  },
  emptyTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
  bookingsButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingsButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  footer: {
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: "center",
  },
});
