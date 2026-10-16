import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../../theme/tokens";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  fullWidth = true,
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "outline" && styles.outline,
    variant === "danger" && styles.danger,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "outline" && styles.outlineText,
    variant === "danger" && styles.dangerText,
  ];

  return React.createElement(
    Pressable,
    {
      accessibilityRole: "button",
      accessibilityLabel: accessibilityLabel ?? title,
      accessibilityState: {
        disabled: isDisabled,
        busy: loading,
      },
      disabled: isDisabled,
      onPress,
      style: ({ pressed }: { pressed: boolean }) => [
        ...buttonStyle,
        pressed && !isDisabled && styles.pressed,
      ],
    },
    loading
      ? React.createElement(ActivityIndicator, {
          color:
            variant === "primary" || variant === "danger"
              ? colors.white
              : colors.brand,
        })
      : React.createElement(Text, { style: textStyle }, title),
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandSoft,
  },
  outline: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.brand,
  },
  outlineText: {
    color: colors.text,
  },
  dangerText: {
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});