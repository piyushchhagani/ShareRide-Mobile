import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth.store";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>
              {user?.name || "ShareRide User"}
            </Text>

            <Text style={styles.email}>
              {user?.email || "No email"}
            </Text>

            <View style={styles.verified}>
              <Text style={styles.verifiedText}>
                ✓ Student account
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your activity</Text>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push("/my-bookings")}
        >
          <Text style={styles.menuIcon}>🎫</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Bookings</Text>
            <Text style={styles.menuSubtitle}>
              View rides you've requested
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push("/profile/my-rides")}
        >
          <Text style={styles.menuIcon}>🚗</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Rides</Text>
            <Text style={styles.menuSubtitle}>
              Manage rides you've offered
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push("/account")}
        >
          <Text style={styles.menuIcon}>👤</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Account details</Text>
            <Text style={styles.menuSubtitle}>
              Personal information
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.menuIcon}>⚙️</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Settings</Text>
            <Text style={styles.menuSubtitle}>
              App preferences
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push("/help")}
        >
          <Text style={styles.menuIcon}>❓</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help & Support</Text>
            <Text style={styles.menuSubtitle}>
              Get help with ShareRide
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          ShareRide • Student Mobility
        </Text>
      </ScrollView>
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

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 24,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  userInfo: {
    flex: 1,
    marginLeft: 17,
  },

  name: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },

  email: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 14,
  },

  verified: {
    alignSelf: "flex-start",
    marginTop: 9,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  verifiedText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  menuCard: {
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 25,
    width: 42,
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  arrow: {
    fontSize: 28,
    color: "#CBD5E1",
  },

  logoutButton: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: "#FEF2F2",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 17,
    fontWeight: "800",
  },

  version: {
    textAlign: "center",
    marginTop: 24,
    color: "#94A3B8",
    fontSize: 12,
  },
});