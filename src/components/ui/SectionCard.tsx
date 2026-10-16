import React from "react";
import {
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";

type SectionCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export default function SectionCard({
  children,
  style,
  padded = true,
}: SectionCardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padded: {
    padding: spacing.lg,
  },
});