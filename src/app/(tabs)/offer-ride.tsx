import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LocationSelector from "@/components/location/LocationSelector";

export default function OfferRideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Offer a ride</Text>

      <Text style={styles.subtitle}>
        Share your journey with fellow students.
      </Text>

      {/* Pickup */}
      <LocationSelector
        label="Pickup location"
        value="Choose your starting point"
      />

      {/* Destination */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push("/location")}
      >
        <View style={styles.field}>
          <Text style={styles.label}>Destination</Text>

          <Text style={styles.placeholder}>
            Where are you going?
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },

  title: {
    marginTop: 28,
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 15,
    color: "#64748B",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },

  field: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  placeholder: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
    marginLeft: 10,
  },

  spacer: {
    flex: 1,
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});