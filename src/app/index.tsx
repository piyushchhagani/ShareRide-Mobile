import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth.store";

export default function SplashScreen() {
  const { isLoading, isAuthenticated, restoreSession } =
    useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/auth/login");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoIcon}>S</Text>
      </View>

      <Text style={styles.logo}>ShareRide</Text>

      <Text style={styles.tagline}>
        Your campus. Your ride. Together.
      </Text>

      <View style={styles.loader}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },

  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  logoIcon: {
    fontSize: 44,
    fontWeight: "900",
    color: "#2563EB",
  },

  logo: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: "#DBEAFE",
    fontWeight: "500",
  },

  loader: {
    position: "absolute",
    bottom: 70,
    flexDirection: "row",
    gap: 7,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
});