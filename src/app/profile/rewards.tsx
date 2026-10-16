
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { goBackSafely } from "@/utils/navigation";

export default function RewardsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => goBackSafely("/profile/account")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>SHARERIDE BENEFITS</Text>
          <Text style={styles.title}>Rewards</Text>
          <Text style={styles.subtitle}>
            Make every shared journey count.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.rewardIcon}>
            <Text style={styles.gift}>✦</Text>
          </View>

          <Text style={styles.heroTitle}>Your rewards journey</Text>
          <Text style={styles.heroDescription}>
            Your points, rewards, and eligible offers will appear here when
            the ShareRide rewards program is available.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Rewards not activated</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ways to get started</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>🚗</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Share a ride</Text>
            <Text style={styles.featureDescription}>
              Explore available rides or publish a journey.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>🤝</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Build trust</Text>
            <Text style={styles.featureDescription}>
              Be considerate, communicate clearly, and travel responsibly.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>⭐</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Share feedback</Text>
            <Text style={styles.featureDescription}>
              Ratings and reviews can help build a better community when
              that feature becomes available.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text style={styles.primaryButtonText}>Explore ShareRide</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Points, rewards, and redemption are not connected to a backend
          on this screen.
        </Text>
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
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    minHeight: layout.minimumTouchTarget,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingRight: spacing.md,
  },
  backText: {
    color: colors.brand,
    fontSize: typography.bodyLarge,
    fontWeight: "700",
  },
  heading: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.screenTitle,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  gift: {
    color: colors.brand,
    fontSize: 34,
    fontWeight: "800",
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  heroDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
    marginRight: spacing.xs,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  featureDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  arrow: {
    color: colors.white,
    fontSize: 26,
  },
  footer: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
