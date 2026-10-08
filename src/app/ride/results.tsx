import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { useRideStore } from "@/store/ride.store";
import { findRides, Ride } from "@/services/rides/ride.service";
import { goBackSafely } from "@/utils/navigation";

export default function RideResultsScreen() {
  const { pickup, destination } = useRideStore();

  const {
    departureTime,
    seats,
  } = useLocalSearchParams<{
    departureTime?: string;
    seats?: string;
  }>();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRides = async () => {
    if (!pickup || !destination) {
      setError("Pickup and destination are required.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const results = await findRides({
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        departureTime:
          departureTime || new Date().toISOString(),
        seats: Number(seats || 1),
      });

      setRides(results);
    } catch (err) {
      console.error("FIND RIDES ERROR:", err);
      setError("Unable to find rides right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const formatTime = (value: string) => {
    return new Date(value).toLocaleString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderRide = ({ item }: { item: Ride }) => {
    const score =
      (item as Partial<{
        totalScore?: number;
        matchScore?: number;
        score?: number;
      }>).totalScore ??
      (item as Partial<{
        totalScore?: number;
        matchScore?: number;
        score?: number;
      }>).matchScore ??
      (item as Partial<{
        totalScore?: number;
        matchScore?: number;
        score?: number;
      }>).score ??
      0;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/ride-details",
            params: {
              rideId: item.id.toString(),
            },
          })
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.driverName?.charAt(0)?.toUpperCase() || "D"}
            </Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {item.driverName || "Driver"}
            </Text>

            <Text style={styles.vehicle}>
              {item.vehicleType || "Student ride"}
            </Text>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              {Math.round(score)}%
            </Text>

            <Text style={styles.scoreLabel}>match</Text>
          </View>
        </View>

        <View style={styles.route}>
          <View style={styles.routeColumn}>
            <View style={styles.pickupDot} />
            <View style={styles.routeLine} />
            <View style={styles.destinationDot} />
          </View>

          <View style={styles.routeContent}>
            <Text numberOfLines={1} style={styles.location}>
              {item.pickupAddress}
            </Text>

            <View style={styles.routeSpacer} />

            <Text numberOfLines={1} style={styles.location}>
              {item.destinationAddress}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <Text style={styles.time}>
            🕐 {formatTime(item.departureTime)}
          </Text>

          <Text style={styles.seats}>
            💺 {item.availableSeats} seats
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.loadingText}>
            Finding rides for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBackSafely()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Matching rides</Text>

          <Text style={styles.subtitle}>
            {rides.length} {rides.length === 1 ? "ride" : "rides"} found
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚠️</Text>

          <Text style={styles.emptyTitle}>
            Something went wrong
          </Text>

          <Text style={styles.emptyText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRides}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>

          <Text style={styles.emptyTitle}>
            No matching rides
          </Text>

          <Text style={styles.emptyText}>
            Try another time or create your own ride.
          </Text>

          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => router.push("/offer-ride")}
          >
            <Text style={styles.offerText}>
              Offer a Ride
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRide}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
            />
          }
        />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  back: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 15,
  },

  list: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2563EB",
  },

  driverInfo: {
    flex: 1,
    marginLeft: 13,
  },

  driverName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  vehicle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 13,
  },

  scoreBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },

  scoreText: {
    color: "#059669",
    fontWeight: "800",
    fontSize: 15,
  },

  scoreLabel: {
    color: "#64748B",
    fontSize: 10,
  },

  route: {
    flexDirection: "row",
    marginTop: 22,
  },

  routeColumn: {
    width: 20,
    alignItems: "center",
  },

  pickupDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },

  routeLine: {
    height: 38,
    width: 2,
    backgroundColor: "#CBD5E1",
  },

  destinationDot: {
    width: 11,
    height: 11,
    borderRadius: 3,
    backgroundColor: "#111827",
  },

  routeContent: {
    flex: 1,
    marginLeft: 10,
  },

  location: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  routeSpacer: {
    height: 38,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 17,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  time: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },

  seats: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 16,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  offerButton: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 16,
  },

  offerText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});