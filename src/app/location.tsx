import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LocationMap from "@/components/maps/LocationMap";

export default function LocationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose location</Text>
      </View>

      <View style={styles.mapContainer}>
        <LocationMap />
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.label}>Your current location</Text>

        <Text style={styles.location}>
          Using your device location
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Use this location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },

  back: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  location: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  button: {
    marginTop: 16,
    height: 54,
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