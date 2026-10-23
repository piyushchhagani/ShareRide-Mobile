
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { getMyRides, updateRideStatus, type Ride } from "@/services/rides/ride.service";
import { goBackSafely } from "@/utils/navigation";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusColors(status: string) {
  if (status === "ACTIVE") {
    return { background: colors.successSoft, text: colors.success };
  }
  if (status === "FULL") {
    return { background: colors.warningSoft, text: colors.warning };
  }
  if (status === "COMPLETED") {
    return { background: colors.brandSoft, text: colors.brand };
  }
  if (status === "CANCELLED") {
    return { background: colors.dangerSoft, text: colors.danger };
  }
  return { background: colors.surfaceSecondary, text: colors.textSecondary };
}

export default function RidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRides = useCallback(async () => {
    try {
      setError("");
      const data = await getMyRides();
      setRides(data);
    } catch {
      setError("Unable to load your rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadRides();
    }, [loadRides])
  );

  const openRequests = (rideId: number) => {
    router.push({
      pathname: "/driver-requests",
      params: { rideId: String(rideId) },
    });
  };

  const changeStatus = (ride: Ride, status: "COMPLETED" | "CANCELLED") => {
    const verb = status === "COMPLETED" ? "complete" : "cancel";
    Alert.alert(
      `${status === "COMPLETED" ? "Complete" : "Cancel"} ride?`,
      `Are you sure you want to ${verb} ride #${ride.id}?`,
      [
        { text: "Keep ride", style: "cancel" },
        {
          text: status === "COMPLETED" ? "Complete ride" : "Cancel ride",
          style: status === "CANCELLED" ? "destructive" : "default",
          onPress: () => {
            void (async () => {
              try {
                const updated = await updateRideStatus(ride.id, status);
                setRides((current) => current.map((item) => item.id === ride.id ? updated : item));
                Alert.alert("Ride updated", `Ride #${ride.id} is now ${status.toLowerCase()}.`);
              } catch (error: any) {
                const message = error?.response?.data?.message || "Could not update this ride. Please try again.";
                Alert.alert("Update failed", message);
              }
            })();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.secondary}>Loading your rides…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={rides}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          rides.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.brand}
            onRefresh={() => {
              setRefreshing(true);
              void loadRides();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => goBackSafely()}
              style={styles.back}
            >
              <Text style={styles.backText}>‹  Back</Text>
            </TouchableOpacity>

            <Text style={styles.eyebrow}>DRIVER DASHBOARD</Text>
            <Text style={styles.title}>My rides</Text>
            <Text style={styles.subtitle}>
              Manage your offered rides and passenger requests.
            </Text>

            {!error && rides.length > 0 && (
              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryNumber}>{rides.length}</Text>
                  <Text style={styles.summaryLabel}>Rides offered</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View>
                  <Text style={styles.summaryNumber}>
                    {rides.filter((ride) => ride.status === "ACTIVE").length}
                  </Text>
                  <Text style={styles.summaryLabel}>Active rides</Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>{error ? "⚠️" : "🚘"}</Text>
            <Text style={styles.emptyTitle}>
              {error ? "Couldn't load your rides" : "Your rides start here"}
            </Text>
            <Text style={styles.secondary}>
              {error ||
                "Offer a ride to campus and let other students request a seat."}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (error) {
                  setLoading(true);
                  void loadRides();
                } else {
                  router.push("/(tabs)/offer-ride");
                }
              }}
            >
              <Text style={styles.primaryText}>
                {error ? "Try again" : "Offer a ride"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const status = statusColors(item.status);

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.carIcon}>
                  <Text style={styles.carEmoji}>🚗</Text>
                </View>

                <View style={styles.cardHeading}>
                  <Text style={styles.cardTitle}>Ride #{item.id}</Text>
                  <Text style={styles.date}>
                    {formatDate(item.departureTime)}
                  </Text>
                </View>

                <View style={[styles.badge, { backgroundColor: status.background }]}>
                  <Text style={[styles.badgeText, { color: status.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.route}>
                <View style={styles.routeTrack}>
                  <View style={styles.pickupDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.destinationDot} />
                </View>

                <View style={styles.routeText}>
                  <Text style={styles.label}>PICKUP</Text>
                  <Text style={styles.address}>{item.pickupAddress}</Text>

                  <View style={styles.destinationBlock}>
                    <Text style={styles.label}>DESTINATION</Text>
                    <Text style={styles.address}>{item.destinationAddress}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.label}>SEATS AVAILABLE</Text>
                  <Text style={styles.seatCount}>
                    {item.availableSeats}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => openRequests(item.id)} accessibilityRole="button">
                  <Text style={styles.viewRequests}>Passenger requests  ›</Text>
                </TouchableOpacity>
              </View>

              {(item.status === "ACTIVE" || item.status === "FULL") && (
                <View style={styles.statusActions}>
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => changeStatus(item, "COMPLETED")}
                    accessibilityRole="button"
                  >
                    <Text style={styles.completeButtonText}>Mark completed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => changeStatus(item, "CANCELLED")}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel ride</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.lg,
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
  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryNumber: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  summaryLabel: {
    marginTop: spacing.xxs,
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.border,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  carIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  carEmoji: {
    fontSize: 21,
  },
  cardHeading: {
    flex: 1,
    gap: spacing.xxs,
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
  route: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  routeTrack: {
    width: 18,
    alignItems: "center",
    paddingTop: 4,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  routeLine: {
    width: 2,
    height: 38,
    backgroundColor: colors.border,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
  routeText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  address: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: "600",
  },
  destinationBlock: {
    marginTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  seatCount: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.bodyLarge,
    fontWeight: "800",
  },
  viewRequests: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  statusActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  completeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  emptyCard: {
    flex: 1,
    minHeight: 270,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    textAlign: "center",
  },
  secondary: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    alignSelf: "stretch",
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
});
