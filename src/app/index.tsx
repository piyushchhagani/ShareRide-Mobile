import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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
        <View style={styles.loaderDot} />
        <View style={styles.loaderDot} />
        <View style={styles.loaderDot} />
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
    letterSpacing: -1,
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

  loaderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
});