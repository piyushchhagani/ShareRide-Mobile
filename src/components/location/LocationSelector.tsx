import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useRideStore } from "@/store/ride.store";

export default function LocationSelector() {
  const { pickup, destination } = useRideStore();

  return (
    <View style={styles.container}>
      {/* Pickup */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.row}
        onPress={() => router.push("/location?type=pickup")}
      >
        <View style={styles.iconColumn}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>PICKUP</Text>

          <Text
            numberOfLines={1}
            style={[
              styles.value,
              !pickup && styles.placeholder,
            ]}
          >
            {pickup?.address || "Choose pickup location"}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Destination */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.row}
        onPress={() =>
          router.push("/location?type=destination")
        }
      >
        <View style={styles.iconColumn}>
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>DESTINATION</Text>

          <Text
            numberOfLines={1}
            style={[
              styles.value,
              !destination && styles.placeholder,
            ]}
          >
            {destination?.address || "Where are you going?"}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 6,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  iconColumn: {
    width: 28,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 4,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: "#0F172A",
  },

  routeLine: {
    width: 2,
    height: 27,
    backgroundColor: "#CBD5E1",
    marginTop: 3,
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#94A3B8",
    marginBottom: 5,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
    fontWeight: "500",
  },

  arrow: {
    fontSize: 28,
    color: "#CBD5E1",
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 54,
    marginRight: 16,
  },
});