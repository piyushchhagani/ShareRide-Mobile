import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

export default function MyRidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await getMyRides();
      setRides(data);
    } catch (error) {
      console.log("MY RIDES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>My Rides</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            No rides yet
          </Text>

          <Text style={styles.emptyText}>
            Your published rides will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <Text style={styles.status}>
                  {item.status}
                </Text>

                <Text style={styles.time}>
                  {new Date(
                    item.departureTime
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <Text style={styles.location}>
                {item.pickupAddress}
              </Text>

              <Text style={styles.arrow}>↓</Text>

              <Text style={styles.location}>
                {item.destinationAddress}
              </Text>

              <View style={styles.bottom}>
                <Text style={styles.seats}>
                  {item.availableSeats} seats
                </Text>

                <Text style={styles.vehicle}>
                  {item.vehicleType || "Vehicle"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },

  back: {
    marginTop: 8,
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    marginTop: 25,
    marginBottom: 20,
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 7,
    color: "#64748B",
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  status: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  time: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  location: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  arrow: {
    marginVertical: 5,
    color: "#2563EB",
  },

  bottom: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  seats: {
    fontSize: 13,
    color: "#64748B",
  },

  vehicle: {
    fontSize: 13,
    color: "#64748B",
  },
});