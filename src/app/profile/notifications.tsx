
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type Category = "All" | "Bookings" | "Rides" | "Updates";

type Notice = {
  id: string;
  category: Exclude<Category, "All">;
  icon: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTICES: Notice[] = [
  {
    id: "sample-booking",
    category: "Bookings",
    icon: "🎫",
    title: "Booking updates",
    message:
      "Your ride request updates will appear here when notification services are connected.",
    time: "Sample",
    unread: true,
  },
  {
    id: "sample-ride",
    category: "Rides",
    icon: "🚘",
    title: "Ride reminders",
    message:
      "Ride-related reminders will be shown here when supported by your account.",
    time: "Sample",
    unread: true,
  },
  {
    id: "sample-update",
    category: "Updates",
    icon: "✨",
    title: "Welcome to ShareRide",
    message:
      "Keep your ride details up to date and check your bookings for request status changes.",
    time: "Welcome",
    unread: false,
  },
];

const FILTERS: Category[] = [
  "All",
  "Bookings",
  "Rides",
  "Updates",
];

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<Category>("All");
  const [notices, setNotices] = useState(INITIAL_NOTICES);

  const visibleNotices = useMemo(
    () =>
      filter === "All"
        ? notices
        : notices.filter((notice) => notice.category === filter),
    [filter, notices]
  );

  const unreadCount = notices.filter((notice) => notice.unread).length;

  const markAllRead = () => {
    setNotices((current) =>
      current.map((notice) => ({ ...notice, unread: false }))
    );
  };

  const markRead = (id: string) => {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === id ? { ...notice, unread: false } : notice
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <Text style={styles.eyebrow}>YOUR INBOX</Text>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Important updates in one place.
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
            onPress={markAllRead}
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
                style={[
                  styles.filter,
                  selected && styles.selectedFilter,
                ]}
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
          <Text style={styles.sampleLabel}>PREVIEW</Text>
        </View>

        {visibleNotices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Notifications in this category will appear here when available.
            </Text>
          </View>
        ) : (
          <View style={styles.noticeList}>
            {visibleNotices.map((notice) => (
              <TouchableOpacity
                key={notice.id}
                activeOpacity={0.8}
                onPress={() => markRead(notice.id)}
                style={[
                  styles.noticeCard,
                  notice.unread && styles.unreadCard,
                ]}
              >
                <View style={styles.noticeIcon}>
                  <Text style={styles.noticeEmoji}>{notice.icon}</Text>
                </View>

                <View style={styles.noticeContent}>
                  <View style={styles.noticeHeading}>
                    <Text style={styles.noticeTitle}>
                      {notice.title}
                    </Text>
                    {notice.unread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.noticeMessage}>
                    {notice.message}
                  </Text>

                  <View style={styles.noticeFooter}>
                    <Text style={styles.noticeTime}>{notice.time}</Text>
                    <Text style={styles.categoryLabel}>
                      {notice.category}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Preview notifications are stored only in this screen&apos;s local
            state. Real booking alerts and push notifications require an
            integrated notification service.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => router.push("/(tabs)/bookings")}
        >
          <Text style={styles.bookingsButtonText}>
            View my bookings  ›
          </Text>
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
    borderColor: colors.brandSoft,
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
  },
  emptyEmoji: {
    fontSize: 38,
  },
  emptyTitle: {
    marginTop: spacing.md,
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
  },
  infoIcon: {
    fontSize: 17,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
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
