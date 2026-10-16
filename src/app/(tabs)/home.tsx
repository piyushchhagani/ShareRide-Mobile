import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme/tokens";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Brand and profile */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoGlyph}>S</Text>
            </View>

            <View>
              <Text style={styles.brand}>ShareRide</Text>
              <Text style={styles.brandSubtitle}>CAMPUS MOBILITY</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.profileGlyph}>♙</Text>
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <View style={styles.eyebrow}>
            <View style={styles.statusDot} />
            <Text style={styles.eyebrowText}>YOUR CAMPUS, CONNECTED</Text>
          </View>

          <Text style={styles.heading}>
            Where are you{"\n"}
            <Text style={styles.headingAccent}>heading today?</Text>
          </Text>

          <Text style={styles.description}>
            Share a ride, meet your campus community, and make every journey
            easier.
          </Text>
        </View>

        {/* Main actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Plan your journey</Text>
          <Text style={styles.sectionCaption}>CHOOSE AN ACTION</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/find-ride")}
          style={({ pressed }) => [
            styles.findCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.findIcon}>
              <Text style={styles.findIconText}>⌕</Text>
            </View>

            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>PASSENGER</Text>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.cardCopy}>
              <Text style={styles.findTitle}>Find a ride</Text>
              <Text style={styles.findDescription}>
                Discover rides going your way.
              </Text>
            </View>

            <View style={styles.findArrowCircle}>
              <Text style={styles.findArrow}>↗</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/offer-ride")}
          style={({ pressed }) => [
            styles.offerCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.offerIcon}>
              <Text style={styles.offerIconText}>↗</Text>
            </View>

            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>DRIVER</Text>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.cardCopy}>
              <Text style={styles.offerTitle}>Offer a ride</Text>
              <Text style={styles.offerDescription}>
                Share your journey with others.
              </Text>
            </View>

            <View style={styles.offerArrowCircle}>
              <Text style={styles.offerArrow}>↗</Text>
            </View>
          </View>
        </Pressable>

        {/* Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your ShareRide</Text>
        </View>

        <View style={styles.shortcuts}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/bookings")}
            style={({ pressed }) => [
              styles.shortcutCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.shortcutIcon}>
              <Text style={styles.shortcutGlyph}>▤</Text>
            </View>
            <Text style={styles.shortcutTitle}>My bookings</Text>
            <Text style={styles.shortcutDescription}>
              View your ride requests
            </Text>
            <Text style={styles.shortcutArrow}>→</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/rides")}
            style={({ pressed }) => [
              styles.shortcutCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.shortcutIcon}>
              <Text style={styles.shortcutGlyph}>↗</Text>
            </View>
            <Text style={styles.shortcutTitle}>My rides</Text>
            <Text style={styles.shortcutDescription}>
              Manage your journeys
            </Text>
            <Text style={styles.shortcutArrow}>→</Text>
          </Pressable>
        </View>

        {/* Footer note */}
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Text style={styles.footerIconText}>✓</Text>
          </View>
          <Text style={styles.footerText}>
            Better journeys begin together.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: {
    color: colors.white,
    fontSize: 25,
    fontWeight: "900",
  },
  brand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 3,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  profileGlyph: {
    color: colors.brand,
    fontSize: 26,
  },
  welcome: {
    marginBottom: 30,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  eyebrowText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  heading: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  headingAccent: {
    color: colors.brand,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 13,
    maxWidth: 310,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionCaption: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  findCard: {
    backgroundColor: colors.brand,
    borderRadius: radius.xl,
    padding: 20,
    marginBottom: 14,
    minHeight: 166,
    justifyContent: "space-between",
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 13,
    elevation: 4,
  },
  offerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 30,
    minHeight: 166,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  findIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  findIconText: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 35,
  },
  offerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  offerIconText: {
    color: colors.brand,
    fontSize: 25,
    fontWeight: "700",
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  actionBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  offerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
  offerBadgeText: {
    color: colors.brand,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },
  cardCopy: {
    flex: 1,
  },
  findTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  findDescription: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  offerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  offerDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  findArrowCircle: {
    width: 39,
    height: 39,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  findArrow: {
    color: colors.white,
    fontSize: 23,
  },
  offerArrowCircle: {
    width: 39,
    height: 39,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  offerArrow: {
    color: colors.brand,
    fontSize: 23,
  },
  shortcuts: {
    flexDirection: "row",
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  shortcutIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  shortcutGlyph: {
    color: colors.brand,
    fontSize: 21,
    fontWeight: "700",
  },
  shortcutTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  shortcutDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  shortcutArrow: {
    color: colors.brand,
    fontSize: 19,
    marginTop: 10,
    alignSelf: "flex-end",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 26,
  },
  footerIcon: {
    width: 19,
    height: 19,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  footerIconText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.86,
  },
});