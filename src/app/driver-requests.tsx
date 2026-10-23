
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  getRideRequests,
  type RideRequest,
  updateRideRequest,
} from "@/services/rides/request.service";
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
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DriverRequestsScreen() {
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    if (!rideId || !Number.isFinite(Number(rideId))) {
      setError("A valid ride ID is required.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError("");
      const data = await getRideRequests(Number(rideId));
      setRequests(data);
    } catch (requestError: any) {
      const data = requestError?.response?.data;
      setError(
        typeof data === "string"
          ? data
          : data?.message || "Unable to load ride requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rideId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadRequests();
    }, [loadRequests])
  );

  const respond = async (
    requestId: number,
    action: "ACCEPT" | "REJECT"
  ) => {
    if (processing !== null) return;

    try {
      setProcessing(requestId);

      const updated = await updateRideRequest(requestId, action);

      setRequests((current) =>
        current.map((item) =>
          item.id === requestId ? updated : item
        )
      );

      Alert.alert(
        action === "ACCEPT" ? "Request accepted" : "Request rejected",
        action === "ACCEPT"
          ? "The passenger request has been accepted."
          : "The passenger request has been rejected."
      );

      await loadRequests();
    } catch (requestError: any) {
      const data = requestError?.response?.data;
      const status = requestError?.response?.status;
      const message = typeof data === "string"
        ? data
        : data?.message || requestError?.message || "Please try again.";
      const errorId = typeof data === "object" ? data?.errorId : undefined;
      Alert.alert(
        status ? `Unable to update request (${status})` : "Unable to update request",
        `${String(message)}${errorId ? `\nReference: ${errorId}` : ""}`
      );
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = requests.filter(
    (item) => item.status === "PENDING"
  ).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.secondary}>Loading ride requests…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBackSafely("/(tabs)/rides")}
          style={styles.back}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>DRIVER DASHBOARD</Text>
        <Text style={styles.title}>Ride requests</Text>
        <Text style={styles.subtitle}>
          Ride #{rideId || "—"} · {pendingCount} pending
        </Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <Text style={styles.stateTitle}>Couldn&apos;t load requests</Text>
          <Text style={styles.secondary}>{error}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setLoading(true);
              void loadRequests();
            }}
          >
            <Text style={styles.primaryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            requests.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={colors.brand}
              onRefresh={() => {
                setRefreshing(true);
                void loadRequests();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.stateIcon}>🚘</Text>
              <Text style={styles.stateTitle}>No requests yet</Text>
              <Text style={styles.secondary}>
                Passenger requests for this ride will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPending = item.status === "PENDING";
            const isAccepted = item.status === "ACCEPTED";
            const busy = processing === item.id;

            const statusColor = isAccepted
              ? colors.success
              : item.status === "REJECTED"
                ? colors.danger
                : colors.warning;

            const statusBackground = isAccepted
              ? colors.successSoft
              : item.status === "REJECTED"
                ? colors.dangerSoft
                : colors.warningSoft;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.passengerName?.charAt(0).toUpperCase() || "P"}
                    </Text>
                  </View>

                  <View style={styles.passenger}>
                    <Text style={styles.name}>
                      {item.passengerName || "Passenger"}
                    </Text>
                    <Text style={styles.secondary}>
                      {item.requestedSeats}{" "}
                      {item.requestedSeats === 1 ? "seat" : "seats"} requested
                    </Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: statusBackground }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.date}>
                  Requested {formatDate(item.createdAt)}
                </Text>

                {isPending ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      disabled={processing !== null}
                      style={[
                        styles.actionButton,
                        styles.rejectButton,
                        processing !== null && styles.disabled,
                      ]}
                      onPress={() => void respond(item.id, "REJECT")}
                    >
                      {busy ? (
                        <ActivityIndicator color={colors.danger} />
                      ) : (
                        <Text style={styles.rejectText}>Reject</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={processing !== null}
                      style={[
                        styles.actionButton,
                        styles.acceptButton,
                        processing !== null && styles.disabled,
                      ]}
                      onPress={() => void respond(item.id, "ACCEPT")}
                    >
                      {busy ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={styles.acceptText}>Accept request</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[styles.finalStatus, { color: statusColor }]}>
                    {isAccepted
                      ? "This passenger request has been accepted."
                      : "This request is no longer pending."}
                  </Text>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
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
  },
  list: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.brand,
    fontSize: typography.bodyLarge,
    fontWeight: "800",
  },
  passenger: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  secondary: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: 21,
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
  date: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: layout.buttonHeight - 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  rejectText: {
    color: colors.danger,
    fontSize: typography.button,
    fontWeight: "800",
  },
  acceptButton: {
    backgroundColor: colors.brand,
  },
  acceptText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.6,
  },
  finalStatus: {
    marginTop: spacing.md,
    fontSize: typography.body,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  stateIcon: {
    fontSize: 42,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
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
});
