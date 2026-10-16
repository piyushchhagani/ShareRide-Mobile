export const colors = {
  brand: "#2457E6",
  brandDark: "#1944BF",
  brandSoft: "#EAF0FF",

  background: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceSecondary: "#EEF2F7",

  text: "#151C2C",
  textSecondary: "#667085",
  textMuted: "#98A2B3",

  border: "#E4E8EF",
  divider: "#EDF0F5",

  success: "#16845B",
  successSoft: "#E8F7EF",
  warning: "#B76E00",
  warningSoft: "#FFF4DB",
  danger: "#D92D20",
  dangerSoft: "#FEECEB",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  screenTitle: 28,
  sectionTitle: 19,
  cardTitle: 16,
  body: 14,
  bodyLarge: 16,
  caption: 12,
  button: 15,
} as const;

export const layout = {
  screenPadding: 20,
  inputHeight: 54,
  buttonHeight: 54,
  minimumTouchTarget: 44,
  iconSize: 22,
  cardGap: 14,
} as const;

export const shadows = {
  card: {
    shadowColor: "#15213B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: "#15213B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  layout,
  shadows,
} as const;

export type ShareRideTheme = typeof theme;