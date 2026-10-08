import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { api } from "@/services/api/client";
import {
  RideRequest,
  updateRideRequest,
} from "@/services/rides/request.service";

export default function DriverRequestsScreen() {
  const { rideId } = useLocalSearchParams<{
    rideId?: string;
  }>();

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadRequests = async () => {
    if (!rideId) return;

    try {
      setLoading(true);

      const { data } = await api.get<RideRequest[]>(
        `/api/ride-requests/ride/${rideId}`
      );

      setRequests(data);
    } catch (error) {
      console.log("DRIVER REQUESTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [rideId])
  );

  const respond = async (
    requestId: number,
    action: "ACCEPT" | "REJECT"
  ) => {
    try {
      setProcessing(requestId);

      await updateRideRequest(
        requestId,
        action
      );

      Alert.alert(
        action === "ACCEPT"
          ? "Ride Accepted"
          : "Request Rejected"
      );

      await loadRequests();
    } catch (error: any) {
      Alert.alert(
        "Error",
        String(
          error?.response?.data ||
          "Unable to process request."
        )
      );
    } finally {
      setProcessing(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Ride Requests
        </Text>

        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) =>
            item.id.toString()
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                No pending requests
              </Text>

              <Text style={styles.emptyText}>
                New passenger requests will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.passengerName}
              </Text>

              <Text style={styles.seats}>
                {item.requestedSeats} seat
                {item.requestedSeats > 1
                  ? "s"
                  : ""}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.reject}
                  disabled={processing === item.id}
                  onPress={() =>
                    respond(
                      item.id,
                      "REJECT"
                    )
                  }
                >
                  <Text style={styles.rejectText}>
                    Reject
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accept}
                  disabled={processing === item.id}
                  onPress={() =>
                    respond(
                      item.id,
                      "ACCEPT"
                    )
                  }
                >
                  {processing === item.id ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.acceptText}>
                      Accept
                    </Text>
                  )}
                </TouchableOpacity>
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
  },

  header: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "700",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  list: {
    padding: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  seats: {
    marginTop: 5,
    color: "#64748B",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  reject: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  rejectText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  accept: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748B",
  },
});