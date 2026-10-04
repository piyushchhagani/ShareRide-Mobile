import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.title}>Where are you going?</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>P</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchCard}
        onPress={() => router.push("/find-ride")}
        >
        <View style={styles.locationDot} />
        <View>
          <Text style={styles.searchLabel}>Find a ride</Text>
          <Text style={styles.searchPlaceholder}>
            Enter your destination
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/find-ride")}
        >
          <Text style={styles.actionIcon}>🚗</Text>
          <Text style={styles.actionTitle}>Find Ride</Text>
          <Text style={styles.actionSubtitle}>Share a ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/offer-ride")}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>Offer Ride</Text>
          <Text style={styles.actionSubtitle}>Drive together</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming ride</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🛣️</Text>
        <Text style={styles.emptyTitle}>No upcoming rides</Text>
        <Text style={styles.emptyText}>
          Find or offer a ride to get started.
        </Text>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 28,
  },

  greeting: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 5,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  searchCard: {
    height: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginRight: 14,
  },

  searchLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  searchPlaceholder: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    marginLeft: "auto",
    fontSize: 30,
    color: "#94A3B8",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  actionIcon: {
    fontSize: 25,
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  actionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
    textAlign: "center",
  },
});