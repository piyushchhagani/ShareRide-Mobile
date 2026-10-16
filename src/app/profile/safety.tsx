
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

const safetyTips = [
  {
    icon: "👤",
    title: "Check your ride details",
    description:
      "Confirm the driver's details, vehicle, pickup point, and destination before getting in.",
  },
  {
    icon: "📍",
    title: "Meet at the agreed pickup",
    description:
      "Wait in a well-lit, public location and confirm the pickup with your driver.",
  },
  {
    icon: "🤝",
    title: "Travel with respect",
    description:
      "Respect everyone's boundaries and agree on any changes to the route before travelling.",
  },
  {
    icon: "📱",
    title: "Keep your phone accessible",
    description:
      "Make sure your phone has enough battery and that you can contact someone you trust.",
  },
  {
    icon: "🛑",
    title: "Trust your instincts",
    description:
      "If a situation feels unsafe, do not get in or ask to stop somewhere safe.",
  },
];

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>TRAVEL WITH CONFIDENCE</Text>
        <Text style={styles.title}>Your safety matters</Text>
        <Text style={styles.subtitle}>
          A few simple habits can help make every shared journey safer.
        </Text>

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>🛡️</Text>
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Before every ride</Text>
            <Text style={styles.bannerDescription}>
              Verify the vehicle and driver, confirm the destination, and
              let someone you trust know your plans.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ride safety checklist</Text>

        {safetyTips.map((tip, index) => (
          <View key={tip.title} style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipEmoji}>{tip.icon}</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                {index + 1}. {tip.title}
              </Text>
              <Text style={styles.tipDescription}>
                {tip.description}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>If you feel unsafe</Text>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Put your safety first</Text>
          <Text style={styles.emergencyText}>
            Move to a safe public place if possible. Contact someone you trust.
            If you are in immediate danger, contact your local emergency
            services directly.
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() =>
              Alert.alert(
                "Emergency assistance",
                "This screen does not place emergency calls. If you are in immediate danger, contact your local emergency services directly."
              )
            }
          >
            <Text style={styles.emergencyButtonText}>
              Emergency guidance
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push("/profile/help")}
        >
          <Text style={styles.helpButtonText}>Help & support  ›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          ShareRide · Look out for one another.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: "700",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.screenTitle,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.xl,
  },
  bannerIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  bannerEmoji: {
    fontSize: 24,
  },
  bannerText: {
    flex: 1,
    gap: spacing.xs,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  bannerDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  tipDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  emergencyCard: {
    padding: spacing.lg,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#F8D4D1",
  },
  emergencyTitle: {
    color: colors.danger,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  emergencyText: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  emergencyButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyButtonText: {
    color: colors.danger,
    fontSize: typography.button,
    fontWeight: "800",
  },
  helpButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  footer: {
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: "center",
  },
});
