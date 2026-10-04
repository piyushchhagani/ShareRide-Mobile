import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

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

      <View style={styles.card}>
        <Text style={styles.label}>Pickup</Text>
        <Text style={styles.placeholder}>Where will you start?</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Destination</Text>
        <Text style={styles.placeholder}>Where are you going?</Text>
      </View>

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
    fontSize: 15,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
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
  button: {
    marginTop: 24,
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
