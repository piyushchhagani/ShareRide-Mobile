/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
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

type VehicleFilter = "ALL" | "Car" | "Bike" | "Auto";
type SortOption = "MATCH_SCORE" | "PRICE_ASC" | "DEPARTURE_ASC";

const VEHICLE_FILTERS: VehicleFilter[] = ["ALL", "Car", "Bike", "Auto"];
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "MATCH_SCORE", label: "Best match" },
  { key: "PRICE_ASC", label: "Lowest fare" },
  { key: "DEPARTURE_ASC", label: "Earliest" },
];
const PAGE_SIZE = 10;

export default function RideResultsScreen() {
  const { pickup, destination } = useRideStore();

  const { departureTime, seats } = useLocalSearchParams<{
    departureTime?: string;
    seats?: string;
  }>();

  const [rides, setRides] = useState<Ride[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("MATCH_SCORE");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRides = async (targetPage = 0, append = false) => {
    if (!pickup || !destination) {
      setError("Pickup and destination are required.");
      setLoading(false);
      return;
    }

    try {
      const results = await findRides({
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        departureTime: departureTime || new Date().toISOString(),
        seats: Number(seats || 1),
        vehicleType: vehicleType === "ALL" ? undefined : vehicleType,
        sortBy,
        page: targetPage,
        size: PAGE_SIZE,
      });

      setError("");
      setRides((prev) => (append ? [...prev, ...results] : results));
      setPage(targetPage);
      setHasMore(results.length === PAGE_SIZE);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to find rides right now.";
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!pickup || !destination) {
        if (active) {
          setError("Pickup and destination are required.");
          setLoading(false);
        }
        return;
      }

      try {
        const results = await findRides({
          pickupLatitude: pickup.latitude,
          pickupLongitude: pickup.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
          departureTime: departureTime || new Date().toISOString(),
          seats: Number(seats || 1),
          vehicleType: vehicleType === "ALL" ? undefined : vehicleType,
          sortBy,
          page: 0,
          size: PAGE_SIZE,
        });

        if (active) {
          setError("");
          setRides(results);
          setPage(0);
          setHasMore(results.length === PAGE_SIZE);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to find rides right now.";
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [
    pickup?.latitude,
    pickup?.longitude,
    destination?.latitude,
    destination?.longitude,
    departureTime,
    seats,
    vehicleType,
    sortBy,
  ]);

  const refresh = () => {
    setRefreshing(true);
    void loadRides(0, false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void loadRides(page + 1, true);
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
              requestedSeats: String(seats || 1),
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
              {item.driverAverageRating != null
                ? ` · ★ ${item.driverAverageRating.toFixed(1)}`
                : ""}
            </Text>

            <Text style={styles.vehicle}>
              {item.vehicleType || "Student ride"}
            </Text>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{Math.round(score)}%</Text>
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
          <Text style={styles.time}>🕐 {formatTime(item.departureTime)}</Text>

          <Text style={styles.seats}>
            💺 {item.availableSeats} seats
            {item.pricePerSeat != null
              ? ` · ₹${Number(item.pricePerSeat).toFixed(0)}`
              : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBackSafely()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Matching rides</Text>

          <Text style={styles.subtitle}>
            {loading
              ? "Searching…"
              : `${rides.length} ${rides.length === 1 ? "ride" : "rides"} found`}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {VEHICLE_FILTERS.map((v) => {
            const active = vehicleType === v;
            return (
              <TouchableOpacity
                key={v}
                onPress={() => {
                  if (vehicleType !== v) {
                    setLoading(true);
                    setVehicleType(v);
                  }
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {v === "ALL" ? "All vehicles" : v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  if (sortBy !== opt.key) {
                    setLoading(true);
                    setSortBy(opt.key);
                  }
                }}
                style={[styles.sortChip, active && styles.sortChipActive]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    active && styles.sortChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Finding rides for you...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadRides(0, false)}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>No matching rides</Text>
          <Text style={styles.emptyText}>
            {vehicleType !== "ALL"
              ? `No ${vehicleType} rides matched. Try "All vehicles" or another time.`
              : "Try another time or create your own ride."}
          </Text>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => router.push("/offer-ride")}
          >
            <Text style={styles.offerText}>Offer a Ride</Text>
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
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={loadMore}
                disabled={loadingMore}
                style={styles.loadMoreButton}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more rides</Text>
                )}
              </TouchableOpacity>
            ) : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#2563EB", fontSize: 18, fontWeight: "700", marginBottom: 14 },
  title: { fontSize: 30, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, color: "#64748B", fontSize: 15, marginBottom: 10 },
  chipsRow: { gap: 8, paddingVertical: 5 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  chipTextActive: { color: "#FFFFFF" },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "#EEF2F7" },
  sortChipActive: { backgroundColor: "#DBEAFE" },
  sortChipText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  sortChipTextActive: { color: "#1D4ED8" },
  list: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 19, fontWeight: "800", color: "#2563EB" },
  driverInfo: { flex: 1, marginLeft: 13 },
  driverName: { fontSize: 17, fontWeight: "800", color: "#111827" },
  vehicle: { marginTop: 3, color: "#64748B", fontSize: 13 },
  scoreBadge: { alignItems: "center", backgroundColor: "#ECFDF5", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  scoreText: { color: "#059669", fontWeight: "800", fontSize: 15 },
  scoreLabel: { color: "#64748B", fontSize: 10 },
  route: { flexDirection: "row", marginTop: 22 },
  routeColumn: { width: 20, alignItems: "center" },
  pickupDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 3, borderColor: "#2563EB", backgroundColor: "#FFFFFF" },
  routeLine: { height: 38, width: 2, backgroundColor: "#CBD5E1" },
  destinationDot: { width: 11, height: 11, borderRadius: 3, backgroundColor: "#111827" },
  routeContent: { flex: 1, marginLeft: 10 },
  location: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  routeSpacer: { height: 38 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 17 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between" },
  time: { color: "#475569", fontSize: 14, fontWeight: "600" },
  seats: { color: "#475569", fontSize: 14, fontWeight: "600" },
  loadMoreButton: { marginTop: 4, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "#2563EB", alignItems: "center", backgroundColor: "#FFFFFF" },
  loadMoreText: { color: "#2563EB", fontWeight: "800", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 14, color: "#64748B", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 35 },
  emptyIcon: { fontSize: 48, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#111827", textAlign: "center" },
  emptyText: { marginTop: 8, color: "#64748B", textAlign: "center", lineHeight: 22 },
  retryButton: { marginTop: 24, backgroundColor: "#2563EB", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  offerButton: { marginTop: 24, backgroundColor: "#2563EB", paddingHorizontal: 28, paddingVertical: 15, borderRadius: 16 },
  offerText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
