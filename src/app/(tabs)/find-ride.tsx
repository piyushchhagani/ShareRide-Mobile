import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DateTimePicker from "@expo/ui/community/datetime-picker";

import LocationSelector from "@/components/location/LocationSelector";
import LocationMap from "@/components/maps/LocationMap";
import { useRideStore } from "@/store/ride.store";
import { goBackSafely } from "@/utils/navigation";
import { colors, radius, spacing } from "@/theme/tokens";

type PickerMode = "date" | "time";

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

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function FindRideScreen() {
  const { pickup, destination } = useRideStore();

  const [departure, setDeparture] = useState(() => {
    const initial = new Date();
    initial.setMinutes(0, 0, 0);
    initial.setHours(initial.getHours() + 1);
    return initial;
  });

  const [seats, setSeats] = useState(1);
  const [pickerMode, setPickerMode] = useState<PickerMode>("date");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [dateError, setDateError] = useState("");
  const [searchError, setSearchError] = useState("");

  const canSearch = Boolean(pickup && destination);
  const isPastDeparture = departure.getTime() <= Date.now();

  const openPicker = (mode: PickerMode) => {
    setPickerMode(mode);
    setPickerVisible(true);
    setDateError("");
  };

  const updateDeparture = (value: Date) => {
    const next = new Date(departure);

    if (pickerMode === "date") {
      next.setFullYear(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );
    } else {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }

    if (next.getTime() <= Date.now()) {
      setDateError("Choose a future departure date and time.");
    } else {
      setDateError("");
    }

    setDeparture(next);
  };

  const handleSearch = () => {
    setSearchError("");

    if (!pickup || !destination) {
      setSearchError("Choose both pickup and destination to continue.");
      return;
    }

    if (pickup === destination) {
      setSearchError("Pickup and destination must be different.");
      return;
    }

    if (departure.getTime() <= Date.now()) {
      setSearchError("Choose a future departure date and time.");
      return;
    }

    router.push({
      pathname: "/ride/results",
      params: {
        departureTime: formatLocalDateTime(departure),
        seats: String(seats),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.eyebrowText}>CAMPUS TRAVEL</Text>
          </View>

          <Text style={styles.title}>Find your ride</Text>
          <Text style={styles.subtitle}>
            Find a ride that fits your route and schedule.
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
                Select your pickup and destination to preview the route.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Departure</Text>
          <Text style={styles.sectionHint}>02 / SCHEDULE</Text>
        </View>

        <View style={styles.scheduleCard}>
          <Pressable
            accessibilityRole="button"
            onPress={() => openPicker("date")}
            style={({ pressed }) => [
              styles.scheduleRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.scheduleIcon}>
              <Text style={styles.scheduleIconText}>▦</Text>
            </View>

            <View style={styles.scheduleCopy}>
              <Text style={styles.fieldLabel}>Travel date</Text>
              <Text style={styles.fieldValue}>{formatDate(departure)}</Text>
            </View>

            <Text style={styles.editText}>Change</Text>
          </Pressable>

          <View style={styles.cardDivider} />

          <Pressable
            accessibilityRole="button"
            onPress={() => openPicker("time")}
            style={({ pressed }) => [
              styles.scheduleRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.scheduleIcon}>
              <Text style={styles.scheduleIconText}>◷</Text>
            </View>

            <View style={styles.scheduleCopy}>
              <Text style={styles.fieldLabel}>Departure time</Text>
              <Text style={styles.fieldValue}>{formatTime(departure)}</Text>
            </View>

            <Text style={styles.editText}>Change</Text>
          </Pressable>
        </View>

        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Passengers</Text>
          <Text style={styles.sectionHint}>03 / SEATS</Text>
        </View>

        <View style={styles.seatsCard}>
          <View style={styles.seatsCopy}>
            <Text style={styles.seatsTitle}>Seats needed</Text>
            <Text style={styles.seatsSubtitle}>
              How many passengers are travelling?
            </Text>
          </View>

          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove one seat"
              accessibilityState={{ disabled: seats <= 1 }}
              disabled={seats <= 1}
              onPress={() => setSeats((current) => Math.max(1, current - 1))}
              style={({ pressed }) => [
                styles.stepperButton,
                seats <= 1 && styles.stepperDisabled,
                pressed && seats > 1 && styles.pressed,
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
              accessibilityLabel="Add one seat"
              accessibilityState={{ disabled: seats >= 6 }}
              disabled={seats >= 6}
              onPress={() => setSeats((current) => Math.min(6, current + 1))}
              style={({ pressed }) => [
                styles.stepperButton,
                seats >= 6 && styles.stepperDisabled,
                pressed && seats < 6 && styles.pressed,
              ]}
            >
              <Text style={styles.stepperSymbol}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.seatNote}>Choose between 1 and 6 passengers.</Text>
        </View>

        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>i</Text>
          <Text style={styles.infoText}>
            Ride availability and final seat confirmation depend on the driver.
          </Text>
        </View>

        {searchError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {searchError}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSearch || isPastDeparture}
          onPress={handleSearch}
          style={({ pressed }) => [
            styles.searchButton,
            (!canSearch || isPastDeparture) && styles.searchButtonDisabled,
            pressed && canSearch && !isPastDeparture && styles.pressed,
          ]}
        >
          <Text style={styles.searchButtonText}>Find available rides</Text>
          <Text style={styles.searchButtonArrow}>→</Text>
        </Pressable>

        <Text style={styles.footerText}>
          Review your route and departure before searching.
        </Text>
      </ScrollView>

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

            <Text style={styles.modalTitle}>
              {pickerMode === "date"
                ? "Choose travel date"
                : "Choose departure time"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {formatDate(departure)} · {formatTime(departure)}
            </Text>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={departure}
                mode={pickerMode}
                presentation="inline"
                minimumDate={
                  pickerMode === "date" ? startOfToday() : undefined
                }
                onValueChange={(_, value) => {
                  if (value) updateDeparture(value);
                }}
                onDismiss={() => setPickerVisible(false)}
              />
            </View>

            {dateError ? (
              <Text style={styles.errorText}>{dateError}</Text>
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
          mode={pickerMode}
          presentation="dialog"
          minimumDate={
            pickerMode === "date" ? startOfToday() : undefined
          }
          onValueChange={(_, value) => {
            if (value) updateDeparture(value);
          }}
          onDismiss={() => setPickerVisible(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    letterSpacing: 1.4,
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
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleRow: {
    minHeight: 78,
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
    color: colors.textSecondary,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  seatsCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seatsCopy: {
    gap: 5,
  },
  seatsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  seatsSubtitle: {
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
  errorText: {
    marginTop: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
    color: colors.danger,
  },
  searchButton: {
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
  searchButtonDisabled: {
    opacity: 0.45,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  searchButtonArrow: {
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