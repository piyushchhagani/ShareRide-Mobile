
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { useRideStore } from "@/store/ride.store";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export default function LocationSelector() {
  const { pickup, destination } = useRideStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.row}
        onPress={() => router.push("/location?type=pickup")}
        accessibilityRole="button"
      >
        <View style={styles.iconColumn}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>PICKUP</Text>
          <Text
            numberOfLines={2}
            style={[styles.value, !pickup && styles.placeholder]}
          >
            {pickup?.address || "Choose pickup location"}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.row}
        onPress={() => router.push("/location?type=destination")}
        accessibilityRole="button"
      >
        <View style={styles.iconColumn}>
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>DESTINATION</Text>
          <Text
            numberOfLines={2}
            style={[styles.value, !destination && styles.placeholder]}
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
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconColumn: {
    width: 28,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 4,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: colors.border,
    marginTop: 3,
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 26,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 54,
    marginRight: spacing.md,
  },
});
