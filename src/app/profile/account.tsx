
import { useAuthStore } from "@/store/auth.store";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AccountRowProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function AccountRow({
  icon,
  title,
  description,
  onPress,
}: AccountRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>{icon}</Text>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.muted}>Loading your account…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <Text style={styles.title}>Your account</Text>

          <Text style={styles.muted}>
            Sign in to access your ShareRide account and ride activity.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/login")}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userRecord = user as typeof user & {
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
  };

  const displayName =
    userRecord.name?.trim() ||
    userRecord.fullName?.trim() ||
    [userRecord.firstName, userRecord.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    userRecord.email?.trim() ||
    userRecord.phoneNumber?.trim() ||
    userRecord.phone?.trim() ||
    "ShareRide member";

  const secondaryText =
    userRecord.email?.trim() ||
    userRecord.phoneNumber?.trim() ||
    userRecord.phone?.trim() ||
    "Your ShareRide account";

  const openPage = (path: string) => {
    router.push(path as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>YOUR PROFILE</Text>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>
          Manage your account and preferences in one place.
        </Text>

        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <View style={styles.identityText}>
            <Text style={styles.identityTitle} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.identitySubtitle} numberOfLines={1}>
              {secondaryText}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ride activity</Text>
        <View style={styles.card}>
          <AccountRow
            icon="🚘"
            title="My rides"
            description="Manage rides you offer"
            onPress={() => openPage("/profile/my-rides")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="🎫"
            title="My bookings"
            description="Track requested rides"
            onPress={() => openPage("/my-bookings")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="🔔"
            title="Notifications"
            description="View ride and booking updates"
            onPress={() => openPage("/profile/notifications")}
          />
        </View>

        <Text style={styles.sectionTitle}>Personalisation</Text>
        <View style={styles.card}>
          <AccountRow
            icon="⚙️"
            title="Settings"
            description="Manage app preferences"
            onPress={() => openPage("/profile/settings")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="🛡️"
            title="Safety"
            description="Travel with confidence"
            onPress={() => openPage("/profile/safety")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="💬"
            title="Help & support"
            description="Get help using ShareRide"
            onPress={() => openPage("/profile/help")}
          />
        </View>

        <Text style={styles.sectionTitle}>More from ShareRide</Text>
        <View style={styles.card}>
          <AccountRow
            icon="⭐"
            title="Ratings & reviews"
            description="View your ride feedback"
            onPress={() => openPage("/profile/ratings")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="🎁"
            title="Rewards"
            description="Explore ride rewards"
            onPress={() => openPage("/profile/rewards")}
          />
          <View style={styles.divider} />

          <AccountRow
            icon="💳"
            title="Payments"
            description="Payment information"
            onPress={() => openPage("/profile/payments")}
          />
        </View>

        <Text style={styles.footer}>
          ShareRide · Campus journeys, together.
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
    minHeight: layout.minimumTouchTarget,
    justifyContent: "center",
    paddingRight: spacing.md,
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
    letterSpacing: 1.2,
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
    lineHeight: 21,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 27,
  },
  identityText: {
    flex: 1,
    gap: spacing.xxs,
  },
  identityTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  identitySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  card: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  rowEmoji: {
    fontSize: 20,
  },
  rowContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  rowTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  rowDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 17,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 26,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  muted: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: 21,
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    alignSelf: "stretch",
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
});
