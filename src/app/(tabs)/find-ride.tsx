import { useState } from "react";
import {
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

export default function FindRideScreen() {
 const [destination, setDestination] = useState("");
 const [selectedDate, setSelectedDate] = useState(() => {
  const date = new Date();
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setHours(date.getHours() + 1);
  return date;
});

  const [showPicker, setShowPicker] = useState(false);

  const canContinue = destination.trim().length > 0;

  const formattedDate = selectedDate.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Find a ride</Text>
        <Text style={styles.subtitle}>
          Find students travelling your way.
        </Text>
      </View>
    <LocationSelector
      label="Pickup location"
      value="Using your current location"
      />
      {/* Destination */}
      <TouchableOpacity
  style={styles.card}
  onPress={() => router.push("/location")}
>
  <View style={styles.dot} />

  <View style={styles.field}>
    <Text style={styles.label}>Destination</Text>
    <Text style={styles.value}>
      {destination || "Where are you going?"}
    </Text>
  </View>

  <Text style={styles.arrow}>›</Text>
</TouchableOpacity>

      {/* Date & Time */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.calendar}>◷</Text>

        <View style={styles.field}>
          <Text style={styles.label}>When</Text>

          <Text style={styles.value}>
            {showPicker ? "Select date & time" : formattedDate}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* Native picker */}
      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            presentation="dialog"
            onValueChange={(_, date) => {
              if (date) {
                setSelectedDate(date);
                setShowPicker(false);
              }
            }}
          />
        </View>
      )}

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferenceRow}>
          <TouchableOpacity style={styles.preference}>
            <Text style={styles.preferenceIcon}>👥</Text>
            <Text style={styles.preferenceText}>Any rider</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.preference}>
            <Text style={styles.preferenceIcon}>💺</Text>
            <Text style={styles.preferenceText}>1 seat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        disabled={!canContinue}
        style={[
          styles.button,
          !canContinue && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>Find Matches</Text>
      </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  header: {
    marginTop: 28,
    marginBottom: 24,
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

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginRight: 14,
  },

  calendar: {
    width: 30,
    fontSize: 24,
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

  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    padding: 0,
  },

  value: {
    fontSize: 16,
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
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  preferenceRow: {
    flexDirection: "row",
    gap: 12,
  },

  preference: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  preferenceIcon: {
    fontSize: 22,
    marginBottom: 8,
  },

  preferenceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  spacer: {
    flex: 1,
  },

  button: {
    height: 56,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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