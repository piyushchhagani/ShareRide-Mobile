import { useCallback, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  cancelRideRequest,
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

type BookingFilter = "ALL" | "PENDING" | "ACCEPTED" | "PAST";

const FILTER_OPTIONS: { key: BookingFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PAST", label: "Past" },
];

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
  CANCELLED: {
    label: "Cancelled",
    message: "You cancelled this booking.",
    background: colors.surfaceSecondary,
    foreground: colors.textSecondary,
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [filter, setFilter] = useState<BookingFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const requestVersion = useRef(0);

  const loadBookings = useCallback(
    async (showLoading = false) => {
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
    },
    [authLoading, isAuthenticated]
  );

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

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return requests;
    if (filter === "PENDING") {
      return requests.filter((r) => r.status === "PENDING");
    }
    if (filter === "ACCEPTED") {
      return requests.filter(
        (r) => r.status === "ACCEPTED" && r.rideStatus !== "COMPLETED" && r.rideStatus !== "CANCELLED"
      );
    }
    return requests.filter(
      (r) =>
        r.status === "REJECTED" ||
        r.status === "CANCELLED" ||
        r.rideStatus === "COMPLETED" ||
        r.rideStatus === "CANCELLED"
    );
  }, [requests, filter]);

  const performCancel = async (request: RideRequest) => {
    try {
      setCancellingId(request.id);
      const updated = await cancelRideRequest(request.id);
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? updated : item))
      );
      Alert.alert("Booking cancelled", "Your ride request has been cancelled.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to cancel this booking.";
      Alert.alert("Cancel failed", message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancel = (request: RideRequest) => {
    if (cancellingId !== null) return;

    const title =
      request.status === "ACCEPTED" ? "Cancel booking?" : "Withdraw request?";
    const body =
      request.status === "ACCEPTED"
        ? "Cancelling this accepted booking will return your reserved seats to the driver."
        : "Are you sure you want to withdraw this ride request?";

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${body}`)) {
        void performCancel(request);
      }
      return;
    }

    Alert.alert(title, body, [
      { text: "Keep", style: "cancel" },
      {
        text: "Confirm cancel",
        style: "destructive",
        onPress: () => {
          void performCancel(request);
        },
      },
    ]);
  };

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

        {!error && requests.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_OPTIONS.map((option) => {
              const selected = filter === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilter(option.key)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selected && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {error ? (
          <View style={styles.stateCard}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.emptyTitle}>Couldn&apos;t load bookings</Text>
            <Text style={styles.secondaryText}>{error}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void loadBookings(true)}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emoji}>🚘</Text>
            <Text style={styles.emptyTitle}>
              {requests.length > 0
                ? `No ${filter.toLowerCase()} bookings`
                : "Your next ride starts here"}
            </Text>
            <Text style={styles.secondaryText}>
              {requests.length > 0
                ? "Switch filters above to view your other bookings."
                : "Find a ride to campus or your next destination."}
            </Text>
            {requests.length === 0 && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/find-ride")}
              >
                <Text style={styles.primaryButtonText}>Find a ride</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.count}>
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"}
            </Text>

            {filteredRequests.map((request) => {
              const status =
                STATUS[request.status as keyof typeof STATUS] ?? STATUS.PENDING;
              const canCancel =
                (request.status === "PENDING" || request.status === "ACCEPTED") &&
                request.rideStatus !== "COMPLETED" &&
                request.rideStatus !== "CANCELLED";
              const isCancelling = cancellingId === request.id;

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
                        {request.driverName ? ` · ${request.driverName}` : ""}
                      </Text>
                      <Text style={styles.date}>
                        {request.departureTime
                          ? `Departs ${formatDate(request.departureTime)}`
                          : `Requested ${formatDate(request.createdAt)}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: status.background },
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: status.foreground }]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {request.pickupAddress && request.destinationAddress ? (
                    <View style={styles.routeSummary}>
                      <Text numberOfLines={1} style={styles.routeLineText}>
                        From: {request.pickupAddress}
                      </Text>
                      <Text numberOfLines={1} style={styles.routeLineText}>
                        To: {request.destinationAddress}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.divider} />

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.label}>SEATS REQUESTED</Text>
                      <Text style={styles.seats}>{request.requestedSeats}</Text>
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
                      {request.rideStatus === "CANCELLED"
                        ? "This ride was cancelled by the driver."
                        : request.rideStatus === "COMPLETED"
                          ? "This ride has been completed."
                          : status.message}
                    </Text>
                  </View>

                  {canCancel && (
                    <TouchableOpacity
                      disabled={cancellingId !== null}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleCancel(request);
                      }}
                      style={[
                        styles.cancelButton,
                        cancellingId !== null && styles.disabledButton,
                      ]}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <Text style={styles.cancelButtonText}>
                          {request.status === "ACCEPTED"
                            ? "Cancel booking"
                            : "Withdraw request"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {request.status === "ACCEPTED" &&
                    request.rideStatus === "COMPLETED" &&
                    request.driverId && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          router.push({
                            pathname: "/rate-ride",
                            params: {
                              rideId: String(request.rideId),
                              ratedUserId: String(request.driverId),
                              ratedUserName: request.driverName || "Driver",
                              roleLabel: "driver",
                            },
                          });
                        }}
                        style={styles.rateButton}
                      >
                        <Text style={styles.rateButtonText}>
                          Rate driver ★
                        </Text>
                      </TouchableOpacity>
                    )}
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
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  filterRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterChipText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
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
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
  routeSummary: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 4,
  },
  routeLineText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
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
  cancelButton: {
    marginTop: spacing.md,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.55,
  },
  rateButton: {
    marginTop: spacing.md,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rateButtonText: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: "800",
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
