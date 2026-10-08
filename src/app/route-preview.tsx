import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";

import { useRideStore } from "@/store/ride.store";
import {
  calculateRoute,
  RouteResponse,
} from "@/services/routes/route.service";
import { goBackSafely } from "@/utils/navigation";

export default function RoutePreviewScreen() {
  const { pickup, destination } =
    useRideStore();

  const [route, setRoute] =
    useState<RouteResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    if (!pickup || !destination) {
      setError(
        "Pickup and destination are required."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const result =
        await calculateRoute({
          pickupLatitude:
            pickup.latitude,
          pickupLongitude:
            pickup.longitude,
          destinationLatitude:
            destination.latitude,
          destinationLongitude:
            destination.longitude,
        });

      setRoute(result);
    } catch (error) {
      console.log(
        "ROUTE ERROR:",
        error
      );

      setError(
        "Unable to calculate route."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!pickup || !destination) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>
          Select pickup and destination first.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            goBackSafely()
          }
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const coordinates =
    route?.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude,
      })
    ) || [];

  const distanceKm =
    route
      ? (route.distanceMeters / 1000).toFixed(1)
      : "0";

  const durationMinutes =
    route
      ? Math.round(
          route.durationSeconds / 60
        )
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            goBackSafely()
          }
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Your route
        </Text>

        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Calculating best route...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={loadRoute}
          >
            <Text style={styles.buttonText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude:
                (pickup.latitude +
                  destination.latitude) /
                2,
              longitude:
                (pickup.longitude +
                  destination.longitude) /
                2,
              latitudeDelta:
                Math.abs(
                  pickup.latitude -
                    destination.latitude
                ) * 2.2 + 0.02,
              longitudeDelta:
                Math.abs(
                  pickup.longitude -
                    destination.longitude
                ) * 2.2 + 0.02,
            }}
          >
            <Marker
              coordinate={{
                latitude:
                  pickup.latitude,
                longitude:
                  pickup.longitude,
              }}
              title="Pickup"
              description={
                pickup.address
              }
            />

            <Marker
              coordinate={{
                latitude:
                  destination.latitude,
                longitude:
                  destination.longitude,
              }}
              title="Destination"
              description={
                destination.address
              }
            />

            {coordinates.length > 0 && (
              <Polyline
                coordinates={coordinates}
                strokeWidth={5}
                strokeColor="#2563EB"
              />
            )}
          </MapView>

          <View style={styles.bottomCard}>
            <Text style={styles.routeTitle}>
              Route calculated
            </Text>

            <View style={styles.stats}>
              <View>
                <Text style={styles.statValue}>
                  {distanceKm} km
                </Text>

                <Text style={styles.statLabel}>
                  Distance
                </Text>
              </View>

              <View>
                <Text style={styles.statValue}>
                  {durationMinutes} min
                </Text>

                <Text style={styles.statLabel}>
                  Estimated time
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push(
                  "/ride-results"
                )
              }
            >
              <Text style={styles.buttonText}>
                Find Matching Rides
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  back: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  map: {
    flex: 1,
  },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  routeTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  stats: {
    flexDirection: "row",
    gap: 50,
    marginTop: 14,
    marginBottom: 18,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
  },

  statLabel: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
  },

  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 15,
  },
});