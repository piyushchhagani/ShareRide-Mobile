import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const recentPlaces = [
  "University",
  "Railway Station",
  "Airport",
];

const popularPlaces = [
  {
    title: "University",
    subtitle: "Campus",
    icon: "🎓",
  },
  {
    title: "Railway Station",
    subtitle: "Transit",
    icon: "🚆",
  },
  {
    title: "Airport",
    subtitle: "Travel",
    icon: "✈️",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>Where are you going?</Text>
          </View>

          <TouchableOpacity
            style={styles.notification}
            onPress={() => router.push("/notifications")}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity
          style={styles.search}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/find-ride")}
        >
          <Text style={styles.searchIcon}>⌕</Text>

          <View>
            <Text style={styles.searchTitle}>Where are you going?</Text>
            <Text style={styles.searchSubtitle}>
              Find a ride with students
            </Text>
          </View>
        </TouchableOpacity>

        {/* Map / Location toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={styles.toggleActive}>
            <Text style={styles.toggleActiveText}>📍 Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggle}>
            <Text style={styles.toggleText}>🗺 Map</Text>
          </TouchableOpacity>
        </View>

        {/* Recent */}
        <SectionHeader title="Recent searches" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {recentPlaces.map((place) => (
            <TouchableOpacity
              key={place}
              style={styles.recentCard}
              onPress={() => router.push("/(tabs)/find-ride")}
            >
              <Text style={styles.recentIcon}>↗</Text>
              <Text style={styles.recentText}>{place}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular */}
        <SectionHeader title="Popular places" />

        <View style={styles.popularGrid}>
          {popularPlaces.map((place) => (
            <TouchableOpacity
              key={place.title}
              style={styles.placeCard}
              onPress={() => router.push("/(tabs)/find-ride")}
            >
              <View style={styles.placeIcon}>
                <Text style={styles.placeIconText}>{place.icon}</Text>
              </View>

              <Text style={styles.placeTitle}>{place.title}</Text>
              <Text style={styles.placeSubtitle}>{place.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Explore */}
        <SectionHeader title="Explore more" />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/find-ride")}
          >
            <Text style={styles.actionIcon}>🔎</Text>
            <Text style={styles.actionTitle}>Find Ride</Text>
            <Text style={styles.actionSubtitle}>
              Find someone going your way
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/offer-ride")}
          >
            <Text style={styles.actionIcon}>🚗</Text>
            <Text style={styles.actionTitle}>Offer Ride</Text>
            <Text style={styles.actionSubtitle}>
              Share your journey
            </Text>
          </TouchableOpacity>
        </View>

        {/* Go places */}
        <SectionHeader title="Go places with ShareRide" />

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Your campus. Your community.
          </Text>

          <Text style={styles.bannerText}>
            Share rides, save money and travel together.
          </Text>

          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => router.push("/(tabs)/find-ride")}
          >
            <Text style={styles.bannerButtonText}>
              Find a ride →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.seeAll}>See all</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    fontSize: 14,
    color: "#64748B",
  },

  name: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  notification: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationIcon: {
    fontSize: 21,
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },

  search: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    fontSize: 30,
    color: "#2563EB",
    marginRight: 14,
  },

  searchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  searchSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  toggleContainer: {
    marginTop: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
  },

  toggleActive: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  toggleActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  toggle: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
  },

  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  horizontalList: {
    gap: 10,
  },

  recentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  recentIcon: {
    color: "#2563EB",
    marginRight: 7,
  },

  recentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  popularGrid: {
    flexDirection: "row",
    gap: 10,
  },

  placeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
  },

  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  placeIconText: {
    fontSize: 19,
  },

  placeTitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  placeSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  actionIcon: {
    fontSize: 25,
  },

  actionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  actionSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  banner: {
    backgroundColor: "#0F172A",
    borderRadius: 22,
    padding: 22,
  },

  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  bannerText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#CBD5E1",
  },

  bannerButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  bannerButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});