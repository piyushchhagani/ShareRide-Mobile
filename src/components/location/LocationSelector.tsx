import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

type Props = {
  label?: string;
  value?: string;
};

export default function LocationSelector({
  label = "Current location",
  value = "Using your device location",
}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => router.push("/location")}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>●</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 16,
    color: "#2563EB",
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
    marginLeft: 8,
  },
});