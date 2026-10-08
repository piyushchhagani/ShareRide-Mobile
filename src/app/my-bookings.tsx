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
import { useFocusEffect, router } from "expo-router";

import {
  getMyRequests,
  RideRequest,
} from "@/services/rides/request.service";
import { goBackSafely } from "@/utils/navigation";

export default function MyBookingsScreen() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const data = await getMyRequests();

      setRequests(data);
    } catch (error) {
      console.error(
        "MY BOOKINGS ERROR:",
        error
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

  const getStatusStyle = (status: string) => {
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

      {requests.length === 0 ? (
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
            onPress={() => router.push("/find-ride")}
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
            const status =
              getStatusStyle(request.status);

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
                    <Text>🚗</Text>
                  </View>

                  <View style={styles.cardHeaderText}>
                    <Text style={styles.driverName}>
                      {request.passengerName === ""
                        ? "Ride booking"
                        : "Ride request"}
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
                  <Text style={styles.infoLabel}>
                    SEATS
                  </Text>

                  <Text style={styles.infoValue}>
                    {request.requestedSeats}
                  </Text>
                </View>

                {request.status === "PENDING" && (
                  <Text style={styles.pendingText}>
                    Waiting for the driver to respond
                  </Text>
                )}

                {request.status === "ACCEPTED" && (
                  <Text style={styles.acceptedText}>
                    Your ride has been accepted 🎉
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

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  driverName: {
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
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },

  infoValue: {
    color: "#111827",
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    marginTop: 12,
    color: "#64748B",
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