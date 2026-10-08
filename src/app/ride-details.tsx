import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { getRide, Ride } from "@/services/rides/ride.service";
import { requestRide } from "@/services/rides/request.service";
import { goBackSafely } from "@/utils/navigation";

export default function RideDetailsScreen() {
  const { rideId } = useLocalSearchParams<{
    rideId?: string;
  }>();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRide();
  }, [rideId]);

  const loadRide = async () => {
    if (!rideId) {
      setError("Ride not found.");
      setLoading(false);
      return;
    }

    try {
      const result = await getRide(Number(rideId));

      setRide(result);
    } catch (error) {
      console.error("GET RIDE ERROR:", error);

      setError("Unable to load this ride.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!ride) return;

    try {
      setRequesting(true);

      await requestRide(ride.id, 1);

      Alert.alert(
        "Request sent 🎉",
        "Your ride request has been sent to the driver.",
        [
          {
            text: "View bookings",
            onPress: () =>
              router.replace("/my-bookings"),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "REQUEST RIDE ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        "Request failed",
        error?.response?.data?.message ||
          "Unable to request this ride."
      );
    } finally {
      setRequesting(false);
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (value: string) => {
    return new Date(value).toLocaleString([], {
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
            Loading ride...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ride || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>

          <Text style={styles.errorTitle}>
            Ride unavailable
          </Text>

          <Text style={styles.errorText}>
            {error || "This ride could not be found."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRide}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const score = ride.totalScore ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          onPress={() => goBackSafely()}
        >
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Ride details
        </Text>

        {/* DRIVER */}

        <View style={styles.driverCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {ride.driverName
                ?.charAt(0)
                ?.toUpperCase() || "D"}
            </Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {ride.driverName}
            </Text>

            <Text style={styles.driverVehicle}>
              {ride.vehicleType ||
                "Student vehicle"}
            </Text>

            {ride.vehicleNumber && (
              <Text style={styles.vehicleNumber}>
                {ride.vehicleNumber}
              </Text>
            )}
          </View>

          {score > 0 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchScore}>
                {Math.round(score)}%
              </Text>

              <Text style={styles.matchLabel}>
                match
              </Text>
            </View>
          )}
        </View>

        {/* ROUTE */}

        <Text style={styles.sectionTitle}>
          Route
        </Text>

        <View style={styles.routeCard}>
          <View style={styles.routeColumn}>
            <View style={styles.pickupDot} />

            <View style={styles.routeLine} />

            <View style={styles.destinationDot} />
          </View>

          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>
              PICKUP
            </Text>

            <Text style={styles.location}>
              {ride.pickupAddress}
            </Text>

            <View style={styles.routeGap} />

            <Text style={styles.routeLabel}>
              DESTINATION
            </Text>

            <Text style={styles.location}>
              {ride.destinationAddress}
            </Text>
          </View>
        </View>

        {/* TIME */}

        <Text style={styles.sectionTitle}>
          Departure
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🕐</Text>

          <View>
            <Text style={styles.infoMain}>
              {formatTime(ride.departureTime)}
            </Text>

            <Text style={styles.infoSecondary}>
              {formatDate(ride.departureTime)}
            </Text>
          </View>
        </View>

        {/* SEATS */}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💺</Text>

          <View>
            <Text style={styles.infoMain}>
              {ride.availableSeats}{" "}
              {ride.availableSeats === 1
                ? "seat"
                : "seats"}{" "}
              available
            </Text>

            <Text style={styles.infoSecondary}>
              Request 1 seat
            </Text>
          </View>
        </View>

        {/* REQUEST */}

        <TouchableOpacity
          disabled={
            requesting ||
            ride.availableSeats <= 0
          }
          activeOpacity={0.85}
          style={[
            styles.requestButton,
            ride.availableSeats <= 0 &&
              styles.disabledButton,
          ]}
          onPress={handleRequest}
        >
          {requesting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.requestText}>
              Request this ride
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 22,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 24,
  },

  driverCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2563EB",
  },

  driverInfo: {
    flex: 1,
    marginLeft: 15,
  },

  driverName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  driverVehicle: {
    marginTop: 4,
    color: "#64748B",
  },

  vehicleNumber: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 13,
  },

  matchBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 13,
    alignItems: "center",
  },

  matchScore: {
    color: "#059669",
    fontWeight: "800",
  },

  matchLabel: {
    color: "#64748B",
    fontSize: 10,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    flexDirection: "row",
  },

  routeColumn: {
    width: 22,
    alignItems: "center",
  },

  pickupDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },

  routeLine: {
    width: 2,
    height: 54,
    backgroundColor: "#CBD5E1",
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: "#111827",
  },

  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  routeLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  location: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#1E293B",
  },

  routeGap: {
    height: 35,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    fontSize: 25,
    width: 48,
  },

  infoMain: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  infoSecondary: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  requestButton: {
    height: 62,
    marginTop: 25,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  requestText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
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

  errorIcon: {
    fontSize: 48,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
  },

  retryButton: {
    marginTop: 22,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "#2563EB",
    borderRadius: 15,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});