
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, radius, spacing, typography } from "@/theme/tokens";
import { goBackSafely } from "@/utils/navigation";

export default function PaymentsScreen() {
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
          <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>
            Manage your payment information for ShareRide.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>₹</Text>
          </View>

          <Text style={styles.cardTitle}>Payment methods</Text>
          <Text style={styles.cardDescription}>
            Payment methods are not available yet. When payment support is
            connected, you’ll be able to manage your supported options here.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Not configured</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ride payments</Text>
          <Text style={styles.infoText}>
            Check your ride details and booking status to understand the
            current status of your trip. This screen does not process
            payments or display transaction history.
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={() => router.push("/my-bookings")}
          >
            <Text style={styles.secondaryButtonText}>View my bookings</Text>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Your payment security</Text>
          <Text style={styles.noticeText}>
            Do not share your UPI PIN, bank password, OTP, or card security
            code with anyone. ShareRide payment processing is not configured
            on this screen.
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
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: layout.minimumTouchTarget,
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
    letterSpacing: 1.2,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...{
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.brand,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
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
  infoCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  infoTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryButtonText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: "700",
  },
  buttonArrow: {
    color: colors.brand,
    fontSize: 25,
  },
  notice: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
  },
  noticeTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});
