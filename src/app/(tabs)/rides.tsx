import { useCallback, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";

import {
  getMyRides,
  Ride,
} from "@/services/rides/ride.service";
import { goBackSafely } from "@/utils/navigation";

export default function RidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRides = async () => {
    try {
      setError("");

      const data = await getMyRides();

      setRides(data);
    } catch (requestError) {
      console.error(
        "MY RIDES ERROR:",
        requestError
      );

      setError(
        "Unable to load your rides."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [])
  );

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

          <Text style={styles.loadingText}>
            Loading your rides...
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
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          My Rides
        </Text>

        <Text style={styles.subtitle}>
          Rides you've offered
        </Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>
            ⚠️
          </Text>

          <Text style={styles.emptyTitle}>
            Something went wrong
          </Text>

          <Text style={styles.emptyText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRides}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            🚗
          </Text>

          <Text style={styles.emptyTitle}>
            No rides offered yet
          </Text>

          <Text style={styles.emptyText}>
            Offer a ride and passengers can
            request seats from you.
          </Text>

          <TouchableOpacity
            style={styles.offerButton}
            onPress={() =>
              router.push(
                "/(tabs)/offer-ride"
              )
            }
          >
            <Text style={styles.offerText}>
              Offer a Ride
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) =>
            item.id.toString()
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRides();
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname:
                    "/driver-requests",
                  params: {
                    rideId:
                      item.id.toString(),
                  },
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.carIcon}>
                  <Text style={styles.carEmoji}>
                    🚗
                  </Text>
                </View>

                <View
                  style={styles.headerContent}
                >
                  <Text style={styles.rideTitle}>
                    Ride #{item.id}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status ===
                        "ACTIVE" &&
                        styles.activeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status ===
                          "ACTIVE" &&
                          styles.activeText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.route}>
                <View style={styles.routeLine}>
                  <View
                    style={styles.pickupDot}
                  />
                  <View
                    style={styles.verticalLine}
                  />
                  <View
                    style={styles.destinationDot}
                  />
                </View>

                <View
                  style={styles.routeLabels}
                >
                  <View>
                    <Text
                      style={
                        styles.routeLabel
                      }
                    >
                      PICKUP
                    </Text>

                    <Text
                      style={
                        styles.address
                      }
                      numberOfLines={1}
                    >
                      {item.pickupAddress}
                    </Text>
                  </View>

                  <View
                    style={styles.destinationBlock}
                  >
                    <Text
                      style={
                        styles.routeLabel
                      }
                    >
                      DESTINATION
                    </Text>

                    <Text
                      style={
                        styles.address
                      }
                      numberOfLines={1}
                    >
                      {item.destinationAddress}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text
                    style={styles.infoLabel}
                  >
                    DEPARTURE
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {formatDate(
                      item.departureTime
                    )}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text
                    style={styles.infoLabel}
                  >
                    SEATS
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {item.availableSeats}
                  </Text>
                </View>
              </View>

              <View
                style={styles.requestsButton}
              >
                <Text
                  style={
                    styles.requestsButtonText
                  }
                >
                  View Passenger Requests →
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  carIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  carEmoji: {
    fontSize: 21,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rideTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },

  activeBadge: {
    backgroundColor: "#ECFDF5",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },

  activeText: {
    color: "#059669",
  },

  route: {
    flexDirection: "row",
    marginTop: 22,
  },

  routeLine: {
    width: 20,
    alignItems: "center",
    paddingTop: 5,
  },

  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },

  verticalLine: {
    width: 1,
    height: 37,
    backgroundColor: "#CBD5E1",
  },

  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  routeLabels: {
    flex: 1,
    marginLeft: 8,
  },

  routeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
  },

  address: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  destinationBlock: {
    marginTop: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  requestsButton: {
    marginTop: 17,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  requestsButtonText: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 13,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
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
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  offerButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 15,
    backgroundColor: "#2563EB",
    borderRadius: 16,
  },

  offerText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  errorIcon: {
    fontSize: 45,
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
});