import { useState } from "react";

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import LocationSelector from "@/components/location/LocationSelector";
import { useRideStore } from "@/store/ride.store";
import { goBackSafely } from "@/utils/navigation";

/**
 * Converts a Date into a local date-time string.
 *
 * IMPORTANT:
 * Do not use toISOString() here.
 *
 * Example:
 * 5:00 PM local time
 * -> 2026-10-08T17:00:00
 */
function formatLocalDateTime(date: Date): string {
  const pad = (value: number) =>
    value.toString().padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:00`,
  ].join("T");
}

function formatDate(date: Date): string {
  return date.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FindRideScreen() {
  const { pickup, destination } =
    useRideStore();

  const [selectedDate, setSelectedDate] =
    useState(() => {
      const date = new Date();

      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      date.setHours(
        date.getHours() + 1
      );

      return date;
    });

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [seats, setSeats] =
    useState(1);

  const canContinue =
    !!pickup && !!destination;

  const changeTime = (hour: number) => {
    const next = new Date(
      selectedDate
    );

    next.setHours(hour);
    next.setMinutes(0);
    next.setSeconds(0);
    next.setMilliseconds(0);

    setSelectedDate(next);
    setShowTimePicker(false);
  };

  const handleFindMatches = () => {
    if (!pickup || !destination) {
      return;
    }

    const departureTime =
      formatLocalDateTime(
        selectedDate
      );

    console.log(
      "FIND RIDE:",
      {
        pickup,
        destination,
        selectedDate:
          selectedDate.toString(),
        departureTime,
        seats,
      }
    );

    router.push({
      pathname: "/ride/results",
      params: {
        departureTime,
        seats: seats.toString(),
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            goBackSafely()
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Find a ride
        </Text>

        <Text style={styles.subtitle}>
          Find students travelling your
          way.
        </Text>

        <LocationSelector />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.timeCard}
          onPress={() =>
            setShowTimePicker(true)
          }
        >
          <View style={styles.timeIcon}>
            <Text
              style={styles.timeIconText}
            >
              ◷
            </Text>
          </View>

          <View
            style={styles.timeContent}
          >
            <Text
              style={styles.timeLabel}
            >
              When
            </Text>

            <Text
              style={styles.timeValue}
            >
              {formatDate(
                selectedDate
              )}
              {", "}
              {formatTime(
                selectedDate
              )}
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.sectionTitle}
        >
          Preferences
        </Text>

        <View
          style={styles.preferenceRow}
        >
          <View
            style={styles.preferenceCard}
          >
            <Text
              style={styles.preferenceIcon}
            >
              👥
            </Text>

            <Text
              style={styles.preferenceTitle}
            >
              Any rider
            </Text>

            <Text
              style={
                styles.preferenceSubtitle
              }
            >
              Student community
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.preferenceCard,
              seats === 2 &&
                styles.preferenceCardActive,
            ]}
            onPress={() =>
              setSeats(
                seats === 1
                  ? 2
                  : 1
              )
            }
          >
            <Text
              style={styles.preferenceIcon}
            >
              💺
            </Text>

            <Text
              style={styles.preferenceTitle}
            >
              {seats}{" "}
              {seats === 1
                ? "seat"
                : "seats"}
            </Text>

            <Text
              style={
                styles.preferenceSubtitle
              }
            >
              Tap to change
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!canContinue}
          activeOpacity={0.85}
          style={[
            styles.findButton,
            !canContinue &&
              styles.findButtonDisabled,
          ]}
          onPress={
            handleFindMatches
          }
        >
          <Text
            style={styles.findButtonText}
          >
            Find Matches
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowTimePicker(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.timeModal}
          >
            <View
              style={styles.modalHandle}
            />

            <Text
              style={styles.modalTitle}
            >
              Choose departure time
            </Text>

            <Text
              style={styles.modalSubtitle}
            >
              {formatDate(
                selectedDate
              )}
            </Text>

            <View
              style={styles.timeGrid}
            >
              {[
                7, 8, 9, 10,
                11, 12, 13, 14,
                15, 16, 17, 18,
                19, 20, 21, 22,
              ].map((hour) => {
                const displayHour =
                  hour > 12
                    ? hour - 12
                    : hour === 0
                      ? 12
                      : hour;

                const suffix =
                  hour >= 12
                    ? "PM"
                    : "AM";

                const active =
                  selectedDate.getHours() ===
                  hour;

                return (
                  <TouchableOpacity
                    key={hour}
                    activeOpacity={0.8}
                    style={[
                      styles.timeOption,
                      active &&
                        styles.timeOptionActive,
                    ]}
                    onPress={() =>
                      changeTime(hour)
                    }
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        active &&
                          styles.timeOptionTextActive,
                      ]}
                    >
                      {displayHour}:00{" "}
                      {suffix}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setShowTimePicker(
                  false
                )
              }
            >
              <Text
                style={styles.cancelText}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  backButton: {
    marginBottom: 24,
  },

  backText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },

  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 18,
    color: "#64748B",
  },

  timeCard: {
    marginTop: 24,
    minHeight: 112,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  timeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },

  timeIconText: {
    fontSize: 28,
    color: "#2563EB",
  },

  timeContent: {
    flex: 1,
    marginLeft: 18,
  },

  timeLabel: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 6,
  },

  timeValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  arrow: {
    fontSize: 32,
    color: "#CBD5E1",
  },

  sectionTitle: {
    marginTop: 34,
    marginBottom: 16,
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },

  preferenceRow: {
    flexDirection: "row",
    gap: 14,
  },

  preferenceCard: {
    flex: 1,
    minHeight: 145,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },

  preferenceCardActive: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },

  preferenceIcon: {
    fontSize: 30,
    marginBottom: 18,
  },

  preferenceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  preferenceSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#94A3B8",
  },

  findButton: {
    marginTop: 42,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },

  findButtonDisabled: {
    backgroundColor: "#94A3B8",
  },

  findButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
  },

  timeModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 34,
  },

  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  modalSubtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 15,
    color: "#64748B",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeOption: {
    width: "23%",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },

  timeOptionActive: {
    backgroundColor: "#2563EB",
  },

  timeOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  timeOptionTextActive: {
    color: "#FFFFFF",
  },

  cancelButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 12,
  },

  cancelText: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "700",
  },
});