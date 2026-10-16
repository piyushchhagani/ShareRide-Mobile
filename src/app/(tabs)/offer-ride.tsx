import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DateTimePicker from "@expo/ui/community/datetime-picker";

import LocationSelector from "@/components/location/LocationSelector";
import LocationMap from "@/components/maps/LocationMap";
import { useRideStore } from "@/store/ride.store";
import { createRide } from "@/services/rides/ride.service";
import { goBackSafely } from "@/utils/navigation";
import { colors, radius, spacing } from "@/theme/tokens";

function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function VehicleField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = "sentences",
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null]}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function OfferRideScreen() {
  const { pickup, destination } = useRideStore();

  const [departure, setDeparture] = useState(() => {
    const date = new Date();
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);
    return date;
  });

  const [seats, setSeats] = useState(1);
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [vehicleTypeError, setVehicleTypeError] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");

  const canPublish =
    Boolean(pickup && destination) &&
    vehicleType.trim().length > 0 &&
    vehicleNumber.trim().length > 0 &&
    departure.getTime() > Date.now() &&
    !loading;

  const handlePublish = async () => {
    setFormError("");

    const typeError = vehicleType.trim()
      ? ""
      : "Enter your vehicle type.";

    const numberError = vehicleNumber.trim()
      ? ""
      : "Enter your vehicle registration number.";

    setVehicleTypeError(typeError);
    setVehicleNumberError(numberError);

    if (!pickup || !destination) {
      setFormError("Choose both pickup and destination.");
      return;
    }

    if (pickup === destination) {
      setFormError("Pickup and destination must be different.");
      return;
    }

    if (departure.getTime() <= Date.now()) {
      setFormError("Choose a future departure date and time.");
      return;
    }

    if (typeError || numberError) {
      setFormError("Complete the required vehicle details.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      await createRide({
        pickupAddress: pickup.address,
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        destinationAddress: destination.address,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        departureTime: formatLocalDateTime(departure),
        availableSeats: seats,
        vehicleType: vehicleType.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
      });

      Alert.alert(
        "Ride published",
        "Your ride has been submitted successfully.",
        [
          {
            text: "View my rides",
            onPress: () => router.replace("/profile/my-rides"),
          },
          {
            text: "Done",
            style: "cancel",
            onPress: () => goBackSafely(),
          },
        ]
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      Alert.alert(
        "Unable to publish ride",
        message || "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => goBackSafely()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.headingBlock}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>DRIVER · CAMPUS TRAVEL</Text>
            </View>

            <Text style={styles.title}>Offer a ride</Text>
            <Text style={styles.subtitle}>
              Share your journey with fellow students.
            </Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Your route</Text>
            <Text style={styles.sectionHint}>01 / ROUTE</Text>
          </View>

          <View style={styles.routeCard}>
            <LocationSelector />
          </View>

          {pickup && destination ? (
            <View style={styles.mapSection}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Route preview</Text>
                <Text style={styles.sectionHint}>MAP</Text>
              </View>

              <View style={styles.mapPreview}>
                <LocationMap
                  pickup={pickup}
                  destination={destination}
                  showCurrentLocation
                />
              </View>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderIcon}>⌖</Text>
              <View style={styles.mapPlaceholderCopy}>
                <Text style={styles.mapPlaceholderTitle}>
                  Your route will appear here
                </Text>
                <Text style={styles.mapPlaceholderText}>
                  Select pickup and destination to preview your route.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Departure</Text>
            <Text style={styles.sectionHint}>02 / SCHEDULE</Text>
          </View>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Text style={styles.scheduleIconText}>▦</Text>
              </View>

              <View style={styles.scheduleCopy}>
                <Text style={styles.fieldLabel}>Travel date</Text>
                <Text style={styles.fieldValue}>{formatDate(departure)}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Text style={styles.scheduleIconText}>◷</Text>
              </View>

              <View style={styles.scheduleCopy}>
                <Text style={styles.fieldLabel}>Departure time</Text>
                <Text style={styles.fieldValue}>{formatTime(departure)}</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [
                styles.changeDateButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.changeDateText}>
                Change date & time
              </Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Available seats</Text>
            <Text style={styles.sectionHint}>03 / CAPACITY</Text>
          </View>

          <View style={styles.seatsCard}>
            <Text style={styles.seatsTitle}>Seats for passengers</Text>
            <Text style={styles.seatsSubtitle}>
              Set how many passengers can join your ride.
            </Text>

            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove one available seat"
                accessibilityState={{ disabled: seats <= 1 }}
                disabled={seats <= 1}
                onPress={() => setSeats((current) => Math.max(1, current - 1))}
                style={[
                  styles.stepperButton,
                  seats <= 1 && styles.stepperDisabled,
                ]}
              >
                <Text style={styles.stepperSymbol}>−</Text>
              </Pressable>

              <View style={styles.seatCount}>
                <Text style={styles.seatCountValue}>{seats}</Text>
                <Text style={styles.seatCountLabel}>
                  {seats === 1 ? "seat" : "seats"}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add one available seat"
                accessibilityState={{ disabled: seats >= 8 }}
                disabled={seats >= 8}
                onPress={() => setSeats((current) => Math.min(8, current + 1))}
                style={[
                  styles.stepperButton,
                  seats >= 8 && styles.stepperDisabled,
                ]}
              >
                <Text style={styles.stepperSymbol}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.seatNote}>
              Choose between 1 and 8 available seats.
            </Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Vehicle details</Text>
            <Text style={styles.sectionHint}>04 / VEHICLE</Text>
          </View>

          <View style={styles.vehicleCard}>
            <VehicleField
              label="Vehicle type"
              value={vehicleType}
              onChangeText={(value) => {
                setVehicleType(value);
                if (value.trim()) setVehicleTypeError("");
              }}
              placeholder="e.g. Bike, Car"
              error={vehicleTypeError}
            />

            <VehicleField
              label="Registration number"
              value={vehicleNumber}
              onChangeText={(value) => {
                setVehicleNumber(value.toUpperCase());
                if (value.trim()) setVehicleNumberError("");
              }}
              placeholder="e.g. MH12AB1234"
              error={vehicleNumberError}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.infoNote}>
            <Text style={styles.infoIcon}>i</Text>
            <Text style={styles.infoText}>
              Double-check your route, departure, seat capacity, and vehicle
              details before publishing.
            </Text>
          </View>

          {formError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {formError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPublish, busy: loading }}
            disabled={!canPublish}
            onPress={handlePublish}
            style={({ pressed }) => [
              styles.publishButton,
              !canPublish && styles.publishButtonDisabled,
              pressed && canPublish && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.publishButtonText}>Publish ride</Text>
                <Text style={styles.publishButtonArrow}>→</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            Your ride will be published using your account.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerVisible && Platform.OS !== "android"}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close date and time picker"
            style={styles.modalBackdrop}
            onPress={() => setPickerVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Set departure</Text>
            <Text style={styles.modalSubtitle}>
              {formatDate(departure)} · {formatTime(departure)}
            </Text>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={departure}
                mode="datetime"
                presentation={Platform.OS === "android" ? "dialog" : "inline"}
                minimumDate={new Date()}
                onValueChange={(_, value) => {
                  if (!value) return;

                  if (value.getTime() > Date.now()) {
                    setDeparture(value);
                    setFormError("");
                  } else {
                    setFormError("Choose a future departure date and time.");
                  }
                }}
                onDismiss={() => setPickerVisible(false)}
              />
            </View>

            {departure.getTime() <= Date.now() ? (
              <Text style={styles.errorText}>
                Choose a future departure date and time.
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerVisible(false)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {Platform.OS === "android" && pickerVisible ? (
        <DateTimePicker
          value={departure}
          mode="datetime"
          presentation="dialog"
          minimumDate={new Date()}
          onValueChange={(_, value) => {
            if (!value) return;

            if (value.getTime() > Date.now()) {
              setDeparture(value);
              setFormError("");
            } else {
              setFormError("Choose a future departure date and time.");
            }
          }}
          onDismiss={() => setPickerVisible(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 36,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    minHeight: 44,
    gap: 7,
    marginBottom: spacing.md,
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 32,
    color: colors.brand,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand,
  },
  headingBlock: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  sectionHint: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
  },
  routeCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapSection: {
    marginTop: spacing.lg,
  },
  mapPreview: {
    height: 230,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
  },
  mapPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapPlaceholderIcon: {
    fontSize: 28,
    color: colors.brand,
  },
  mapPlaceholderCopy: {
    flex: 1,
    gap: 4,
  },
  mapPlaceholderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  mapPlaceholderText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  scheduleCard: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  scheduleIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleIconText: {
    fontSize: 23,
    color: colors.brand,
  },
  scheduleCopy: {
    flex: 1,
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  changeDateButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
  changeDateText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.brand,
  },
  seatsCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seatsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  seatsSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  stepperDisabled: {
    opacity: 0.35,
  },
  stepperSymbol: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.brand,
  },
  seatCount: {
    minWidth: 54,
    alignItems: "center",
    gap: 1,
  },
  seatCountValue: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.text,
  },
  seatCountLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  seatNote: {
    marginTop: spacing.md,
    fontSize: 11,
    color: colors.textMuted,
  },
  vehicleCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 14,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    color: colors.danger,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
  infoIcon: {
    width: 20,
    height: 20,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  publishButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
  },
  publishButtonDisabled: {
    opacity: 0.45,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  publishButtonArrow: {
    fontSize: 21,
    color: colors.white,
  },
  footerText: {
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: 11,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    maxHeight: "88%",
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    alignSelf: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.border,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
  },
  modalSubtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    overflow: "hidden",
  },
  doneButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
});