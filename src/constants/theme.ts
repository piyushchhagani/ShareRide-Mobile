import type { ViewStyle } from "react-native";

export const colors = {
  primary: "#0F766E",
  primaryDark: "#115E59",
  primarySurface: "#DDF7F0",
  primaryBorder: "#B8E8DC",

  background: "#F7F9FC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F7",

  text: "#102A43",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",

  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  round: 999,
} as const;

export const typography = {
  caption: 12,
  body: 15,
  subtitle: 18,
  title: 24,
  display: 32,
} as const;

export const shadows = {
  card: {
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } satisfies ViewStyle,
} as const;
