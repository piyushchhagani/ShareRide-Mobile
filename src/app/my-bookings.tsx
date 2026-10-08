import { useCallback, useState } from "react";
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
  RideRequest,
} from "@/services/rides/request.service";
import { goBackSafely } from "@/utils/navigation";

export default function MyBookingsScreen() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setError("");

      const data = await getMyRequests();

      setRequests(data);
    } catch (requestError) {
      console.error(
        "MY BOOKINGS ERROR:",
        requestError
      );

      setError(
        "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const getStatusStyle = (
    status: RideRequest["status"]
  ) => {
    switch (status) {
      case "ACCEPTED":
        return {
          backgroundColor: "#ECFDF5",
          color: "#059669",
        };

      case "REJECTED":
        return {
          backgroundColor: "#FEF2F2",
          color: "#DC2626",
        };

      default:
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        };
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loading}>
            Loading bookings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBackSafely()}
        >
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          My Bookings
        </Text>

        <Text style={styles.subtitle}>
          Rides you've requested
        </Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>
            ⚠️
          </Text>

          <Text style={styles.errorTitle}>
            Something went wrong
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadBookings}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            🎫
          </Text>

          <Text style={styles.emptyTitle}>
            No bookings yet
          </Text>

          <Text style={styles.emptyText}>
            Find a ride and request a seat.
          </Text>

          <TouchableOpacity
            style={styles.findButton}
            onPress={() =>
              router.push("/(tabs)/find-ride")
            }
          >
            <Text style={styles.findText}>
              Find a Ride
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadBookings();
              }}
            />
          }
        >
          {requests.map((request) => {
            const status = getStatusStyle(
              request.status
            );

            return (
              <TouchableOpacity
                key={request.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/ride-details",
                    params: {
                      rideId:
                        request.rideId.toString(),
                    },
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.ticketIcon}>
                    <Text style={styles.ticketEmoji}>
                      🚗
                    </Text>
                  </View>

                  <View
                    style={styles.cardHeaderText}
                  >
                    <Text
                      style={styles.bookingTitle}
                    >
                      Ride #{request.rideId}
                    </Text>

                    <Text style={styles.date}>
                      Requested{" "}
                      {formatDate(
                        request.createdAt
                      )}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.status,
                      {
                        backgroundColor:
                          status.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: status.color },
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.bookingInfo}>
                  <View>
                    <Text
                      style={styles.infoLabel}
                    >
                      SEATS
                    </Text>

                    <Text
                      style={styles.infoValue}
                    >
                      {request.requestedSeats}
                    </Text>
                  </View>

                  <View style={styles.viewDetails}>
                    <Text
                      style={styles.viewDetailsText}
                    >
                      View ride →
                    </Text>
                  </View>
                </View>

                {request.status ===
                  "PENDING" && (
                  <Text
                    style={styles.pendingText}
                  >
                    Waiting for the driver to
                    respond
                  </Text>
                )}

                {request.status ===
                  "ACCEPTED" && (
                  <Text
                    style={styles.acceptedText}
                  >
                    Your ride has been
                    accepted 🎉
                  </Text>
                )}

                {request.status ===
                  "REJECTED" && (
                  <Text
                    style={styles.rejectedText}
                  >
                    This ride request was
                    rejected.
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  header: {
    padding: 20,
    paddingBottom: 12,
  },

  back: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    color: "#64748B",
  },

  list: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  ticketIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  ticketEmoji: {
    fontSize: 21,
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  bookingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  bookingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 3,
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  viewDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },

  viewDetailsText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  },

  pendingText: {
    marginTop: 15,
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  acceptedText: {
    marginTop: 15,
    color: "#059669",
    fontSize: 13,
    fontWeight: "700",
  },

  rejectedText: {
    marginTop: 15,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loading: {
    marginTop: 12,
    color: "#64748B",
  },

  errorIcon: {
    fontSize: 45,
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 13,
    backgroundColor: "#2563EB",
    borderRadius: 15,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
  },

  emptyIcon: {
    fontSize: 50,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
  },

  findButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 15,
    backgroundColor: "#2563EB",
    borderRadius: 16,
  },

  findText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});