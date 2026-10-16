
import { useCallback, useRef, useState } from "react";
import { isAxiosError } from "axios";
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

import {
  getMyRequests,
  type RideRequest,
} from "@/services/rides/request.service";
import { useAuthStore } from "@/store/auth.store";
import { goBackSafely } from "@/utils/navigation";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

const STATUS = {
  PENDING: {
    label: "Pending",
    message: "Waiting for the driver to respond.",
    background: colors.warningSoft,
    foreground: colors.warning,
  },
  ACCEPTED: {
    label: "Accepted",
    message: "Your ride request was accepted.",
    background: colors.successSoft,
    foreground: colors.success,
  },
  REJECTED: {
    label: "Rejected",
    message: "This ride request was rejected.",
    background: colors.dangerSoft,
    foreground: colors.danger,
  },
} as const;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MyBookingsScreen() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const authLoading = useAuthStore((state) => state.isLoading);

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestVersion = useRef(0);

  const loadBookings = useCallback(async (showLoading = false) => {
    if (authLoading || !isAuthenticated) return;

    const version = ++requestVersion.current;

    if (showLoading) setLoading(true);

    try {
      setError("");
      const data = await getMyRequests();

      if (requestVersion.current === version) {
        setRequests(data);
      }
    } catch (requestError) {
      if (requestVersion.current !== version) return;

      const status = isAxiosError(requestError)
        ? requestError.response?.status
        : undefined;

      setError(
        status === 401
          ? "Your session has expired. Please sign in again."
          : "Unable to load your bookings. Please try again."
      );
    } finally {
      if (requestVersion.current === version) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!isAuthenticated) {
        requestVersion.current += 1;
        setRequests([]);
        setError("");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      void loadBookings(true);

      return () => {
        requestVersion.current += 1;
      };
    }, [authLoading, isAuthenticated, loadBookings])
  );

  const openRide = (rideId: number) => {
    router.push({
      pathname: "/ride-details",
      params: { rideId: String(rideId) },
    });
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.secondaryText}>Loading your bookings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
          <Text style={styles.secondaryText}>
            Your ride requests will appear here after you sign in.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadBookings();
            }}
            tintColor={colors.brand}
          />
        }
      >
        <TouchableOpacity onPress={() => goBackSafely()} style={styles.back}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>YOUR RIDES</Text>
        <Text style={styles.title}>My bookings</Text>
        <Text style={styles.subtitle}>
          Track your ride requests and driver responses.
        </Text>

        {error ? (
          <View style={styles.stateCard}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.emptyTitle}>Couldn't load bookings</Text>
            <Text style={styles.secondaryText}>{error}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void loadBookings(true)}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emoji}>🚘</Text>
            <Text style={styles.emptyTitle}>Your next ride starts here</Text>
            <Text style={styles.secondaryText}>
              Find a ride to campus or your next destination.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(tabs)/find-ride")}
            >
              <Text style={styles.primaryButtonText}>Find a ride</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.count}>
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </Text>

            {requests.map((request) => {
              const status =
                STATUS[request.status as keyof typeof STATUS] ??
                STATUS.PENDING;

              return (
                <TouchableOpacity
                  key={request.id}
                  activeOpacity={0.88}
                  style={styles.card}
                  onPress={() => openRide(request.rideId)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.rideIcon}>
                      <Text style={styles.rideEmoji}>🚗</Text>
                    </View>

                    <View style={styles.cardHeading}>
                      <Text style={styles.cardTitle}>
                        Ride #{request.rideId}
                      </Text>
                      <Text style={styles.date}>
                        Requested {formatDate(request.createdAt)}
                      </Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: status.background }]}>
                      <Text style={[styles.badgeText, { color: status.foreground }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.label}>SEATS REQUESTED</Text>
                      <Text style={styles.seats}>
                        {request.requestedSeats}
                      </Text>
                    </View>
                    <Text style={styles.viewRide}>View ride  ›</Text>
                  </View>

                  <View style={styles.statusMessage}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: status.foreground },
                      ]}
                    />
                    <Text style={styles.statusMessageText}>
                      {status.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    flexGrow: 1,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.brand,
    fontSize: typography.bodyLarge,
    fontWeight: "700",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.screenTitle,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  list: {
    gap: spacing.md,
  },
  count: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...{
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rideIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  rideEmoji: {
    fontSize: 21,
  },
  cardHeading: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  date: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  seats: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: "800",
  },
  viewRide: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: "800",
  },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusMessageText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  stateCard: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    alignSelf: "stretch",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
});
