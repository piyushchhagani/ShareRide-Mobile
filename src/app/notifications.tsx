import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notifications</Text>

      <View style={styles.card}>
        <Text style={styles.icon}>🚗</Text>

        <View style={styles.body}>
          <Text style={styles.cardTitle}>Your rides will appear here</Text>
          <Text style={styles.cardText}>
            Ride requests, confirmations and updates will show here.
          </Text>
        </View>
      </View>
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

  title: {
    marginTop: 28,
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  card: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
  },

  icon: {
    fontSize: 26,
    marginRight: 14,
  },

  body: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
});