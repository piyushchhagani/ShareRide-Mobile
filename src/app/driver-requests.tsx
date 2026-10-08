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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  getRideRequests,
  RideRequest,
  updateRideRequest,
} from "@/services/rides/request.service";

export default function DriverRequestsScreen() {
  const { rideId } = useLocalSearchParams<{
    rideId?: string;
  }>();

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  const loadRequests = async () => {
    if (!rideId) {
      setLoading(false);
      setError("Ride not found.");
      return;
    }

    try {
      setError("");

      const data = await getRideRequests(
        Number(rideId)
      );

      setRequests(data);
    } catch (requestError: any) {
      console.log(
        "DRIVER REQUESTS ERROR:",
        requestError
      );

      setError(
        requestError?.response?.data ||
          "Unable to load ride requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    if (processing !== null) {
      return;
    }

    console.log(
      "DRIVER REQUEST ACTION:",
      action,
      "requestId:",
      requestId,
      "rideId:",
      rideId
    );

    try {
      setProcessing(requestId);

      const updatedRequest =
        await updateRideRequest(
          requestId,
          action
        );

      console.log(
        "DRIVER REQUEST UPDATED:",
        updatedRequest
      );

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? updatedRequest
            : request
        )
      );

      Alert.alert(
        action === "ACCEPT"
          ? "Ride Accepted"
          : "Request Rejected",
        action === "ACCEPT"
          ? "The passenger has been added to the ride."
          : "The passenger request was rejected."
      );

      await loadRequests();
    } catch (requestError: any) {
      console.log(
        "DRIVER REQUEST ACTION ERROR:",
        requestError
      );

      console.log(
        "STATUS:",
        requestError?.response?.status
      );

      console.log(
        "DATA:",
        requestError?.response?.data
      );

      Alert.alert(
        "Unable to update",
        String(
          requestError?.response?.data ||
            requestError?.message ||
            "Unable to process this request."
        )
      );
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Loading requests...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            Ride Requests
          </Text>

          <Text style={styles.rideLabel}>
            Ride #{rideId}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>
            ⚠️
          </Text>

          <Text style={styles.emptyTitle}>
            Unable to load requests
          </Text>

          <Text style={styles.emptyText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRequests}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            requests.length === 0 &&
              styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRequests();
              }}
            />
          }
          ListHeaderComponent={
            requests.length > 0 ? (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>
                  Passenger Requests
                </Text>

                <Text style={styles.summaryText}>
                  {
                    requests.filter(
                      (item) =>
                        item.status ===
                        "PENDING"
                    ).length
                  }{" "}
                  pending request
                  {requests.filter(
                    (item) =>
                      item.status ===
                      "PENDING"
                  ).length !== 1
                    ? "s"
                    : ""}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>
                🎉
              </Text>

              <Text style={styles.emptyTitle}>
                No requests yet
              </Text>

              <Text style={styles.emptyText}>
                Passenger requests for this
                ride will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isProcessing =
              processing === item.id;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text
                      style={styles.avatarText}
                    >
                      {item.passengerName
                        ?.charAt(0)
                        .toUpperCase() || "P"}
                    </Text>
                  </View>

                  <View
                    style={styles.passengerInfo}
                  >
                    <Text style={styles.name}>
                      {item.passengerName ||
                        "Passenger"}
                    </Text>

                    <Text
                      style={styles.requested}
                    >
                      Requested{" "}
                      {item.requestedSeats} seat
                      {item.requestedSeats > 1
                        ? "s"
                        : ""}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.status,
                      item.status ===
                        "ACCEPTED" &&
                        styles.acceptedStatus,
                      item.status ===
                        "REJECTED" &&
                        styles.rejectedStatus,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status ===
                          "ACCEPTED" &&
                          styles.acceptedStatusText,
                        item.status ===
                          "REJECTED" &&
                          styles.rejectedStatusText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text
                  style={styles.requestDate}
                >
                  Requested{" "}
                  {new Date(
                    item.createdAt
                  ).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>

                {item.status === "PENDING" ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.reject}
                      disabled={isProcessing}
                      onPress={() =>
                        respond(
                          item.id,
                          "REJECT"
                        )
                      }
                    >
                      {isProcessing ? (
                        <ActivityIndicator
                          color="#DC2626"
                        />
                      ) : (
                        <Text
                          style={
                            styles.rejectText
                          }
                        >
                          Reject
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.accept}
                      disabled={isProcessing}
                      onPress={() =>
                        respond(
                          item.id,
                          "ACCEPT"
                        )
                      }
                    >
                      {isProcessing ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                        />
                      ) : (
                        <Text
                          style={
                            styles.acceptText
                          }
                        >
                          Accept
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.completedText,
                      item.status ===
                        "ACCEPTED" &&
                        styles.completedAccepted,
                      item.status ===
                        "REJECTED" &&
                        styles.completedRejected,
                    ]}
                  >
                    {item.status ===
                    "ACCEPTED"
                      ? "Passenger accepted for this ride."
                      : "Request has been rejected."}
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
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  back: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "700",
  },

  headerCenter: {
    alignItems: "center",
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  rideLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  headerSpacer: {
    width: 50,
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  emptyList: {
    flexGrow: 1,
  },

  summary: {
    marginBottom: 14,
  },

  summaryTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryText: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  passengerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  requested: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  acceptedStatus: {
    backgroundColor: "#ECFDF5",
  },

  rejectedStatus: {
    backgroundColor: "#FEF2F2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  acceptedStatusText: {
    color: "#059669",
  },

  rejectedStatusText: {
    color: "#DC2626",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 15,
  },

  requestDate: {
    fontSize: 12,
    color: "#94A3B8",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  reject: {
    flex: 1,
    height: 46,
    borderRadius: 13,
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
    borderRadius: 13,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  completedText: {
    marginTop: 15,
    fontSize: 13,
    fontWeight: "700",
  },

  completedAccepted: {
    color: "#059669",
  },

  completedRejected: {
    color: "#DC2626",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },

  emptyIcon: {
    fontSize: 48,
  },

  errorIcon: {
    fontSize: 44,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#2563EB",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});