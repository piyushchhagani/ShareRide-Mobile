
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

export default function RatingsScreen() {
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
          <Text style={styles.eyebrow}>YOUR COMMUNITY PROFILE</Text>
          <Text style={styles.title}>Ratings & Reviews</Text>
          <Text style={styles.subtitle}>
            Feedback helps make every ShareRide journey better.
          </Text>
        </View>

        <View style={styles.ratingCard}>
          <View style={styles.ratingIcon}>
            <Text style={styles.star}>★</Text>
          </View>

          <Text style={styles.cardTitle}>Your ride reputation</Text>
          <Text style={styles.description}>
            Your rating and reviews will appear here when rating
            functionality is connected to your account.
          </Text>

          <View style={styles.emptyBadge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>No rating data available</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How ratings work</Text>

          <View style={styles.tipCard}>
            <View style={styles.number}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Complete a ride</Text>
              <Text style={styles.tipText}>
                Participate in a shared journey with another member.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.number}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Share feedback</Text>
              <Text style={styles.tipText}>
                Rate the experience when the app supports post-ride reviews.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.number}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Build trust</Text>
              <Text style={styles.tipText}>
                Helpful feedback can support safer, more reliable rides.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.push("/my-bookings")}
        >
          <Text style={styles.primaryButtonText}>View my bookings</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Ratings and review submission are not yet connected on this screen.
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
    letterSpacing: 1,
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
  ratingCard: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  star: {
    color: colors.warning,
    fontSize: 30,
    fontWeight: "800",
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  emptyBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
    marginRight: spacing.xs,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  number: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    marginRight: spacing.md,
  },
  numberText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: "800",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  tipText: {
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
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    textAlign: "center",
  },
});
