import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DateTimePicker from "@expo/ui/community/datetime-picker";

import LocationSelector from "@/components/location/LocationSelector";
import { useRideStore } from "@/store/ride.store";
import { createRide } from "@/services/rides/ride.service";
import { goBackSafely } from "@/utils/navigation";

export default function OfferRideScreen() {
  const { pickup, destination } = useRideStore();

  const [selectedDate, setSelectedDate] =
    useState(() => {
      const date = new Date();

      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      date.setHours(date.getHours() + 1);

      return date;
    });

  const [showPicker, setShowPicker] =
    useState(false);

  const [seats, setSeats] = useState(1);

  const [vehicleType, setVehicleType] =
    useState("");

  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const canPublish =
    !!pickup &&
    !!destination &&
    vehicleType.trim().length > 0 &&
    vehicleNumber.trim().length > 0 &&
    seats > 0;

  const formattedDate =
    selectedDate.toLocaleString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  const publishRide = async () => {
    if (
      !canPublish ||
      !pickup ||
      !destination ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      await createRide({
        pickupAddress: pickup.address,
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,

        destinationAddress:
          destination.address,
        destinationLatitude:
          destination.latitude,
        destinationLongitude:
          destination.longitude,

        departureTime:
          selectedDate.toISOString(),

        availableSeats: seats,

        vehicleType:
          vehicleType.trim(),

        vehicleNumber:
          vehicleNumber.trim(),
      });

      Alert.alert(
        "Ride published 🎉",
        "Your ride is now available to students.",
        [
          {
            text: "View my rides",
            onPress: () => {
              router.replace(
                "/profile/my-rides"
              );
            },
          },
          {
            text: "Done",
            style: "cancel",
            onPress: () =>
              goBackSafely(),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "CREATE RIDE ERROR:",
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Unable to publish",
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={10}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              goBackSafely()
            }
          >
            <Text style={styles.back}>
              ‹ Back
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>
              Offer a ride
            </Text>

            <Text style={styles.subtitle}>
              Share your journey with
              fellow students.
            </Text>
          </View>

          <LocationSelector />

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              setShowPicker(true)
            }
          >
            <Text style={styles.calendar}>
              ◷
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Departure
              </Text>

              <Text style={styles.value}>
                {formattedDate}
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <View
              style={
                styles.pickerContainer
              }
            >
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                presentation="dialog"
                onValueChange={(
                  _,
                  date
                ) => {
                  if (date) {
                    setSelectedDate(
                      date
                    );
                    setShowPicker(
                      false
                    );
                  }
                }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Available seats
            </Text>

            <View
              style={styles.seatSelector}
            >
              <TouchableOpacity
                style={styles.seatButton}
                onPress={() =>
                  setSeats(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
              >
                <Text
                  style={
                    styles.seatButtonText
                  }
                >
                  −
                </Text>
              </TouchableOpacity>

              <View
                style={styles.seatCenter}
              >
                <Text
                  style={styles.seatCount}
                >
                  {seats}
                </Text>

                <Text
                  style={styles.seatLabel}
                >
                  {seats === 1
                    ? "seat"
                    : "seats"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.seatButton}
                onPress={() =>
                  setSeats(
                    (current) =>
                      Math.min(
                        8,
                        current + 1
                      )
                  )
                }
              >
                <Text
                  style={
                    styles.seatButtonText
                  }
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Vehicle details
            </Text>

            <TextInput
              value={vehicleType}
              onChangeText={
                setVehicleType
              }
              placeholder="Vehicle type (e.g. Bike, Car)"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <TextInput
              value={vehicleNumber}
              onChangeText={
                setVehicleNumber
              }
              placeholder="Vehicle number"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              !canPublish ||
              loading
            }
            onPress={publishRide}
            style={[
              styles.button,
              (!canPublish ||
                loading) &&
                styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Publish ride
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  back: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  header: {
    marginTop: 24,
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 15,
    color: "#64748B",
  },

  card: {
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  calendar: {
    width: 34,
    fontSize: 25,
    color: "#2563EB",
  },

  field: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 5,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
  },

  pickerContainer: {
    position: "absolute",
    width: 1,
    height: 1,
  },

  section: {
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  seatSelector: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seatButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  seatButtonText: {
    fontSize: 25,
    color: "#2563EB",
  },

  seatCenter: {
    alignItems: "center",
  },

  seatCount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  seatLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 15,
    color: "#0F172A",
  },

  button: {
    height: 56,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});