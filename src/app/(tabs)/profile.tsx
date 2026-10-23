
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth.store";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type MenuItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.menuEmoji}>{icon}</Text>
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const authLoading = useAuthStore(
    (state) => state.isLoading
  );
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [opening, setOpening] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = (path: string) => {
    if (opening) return;

    setOpening(true);
    router.push(path as never);

    // Reset on the next render cycle without delaying navigation.
    setOpening(false);
  };

  const handleLogout = () => {
    if (loggingOut) return;

    Alert.alert(
      "Log out",
      "Are you sure you want to log out of ShareRide?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setLoggingOut(true);

              try {
                await logout();
              } catch {
                // The store resets in-memory authentication in its finally block.
              } finally {
                setLoggingOut(false);
                router.replace("/auth/login");
              }
            })();
          },
        },
      ]
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.secondary}>Loading your account…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.title}>Your account</Text>
          <Text style={styles.secondary}>
            Sign in to manage your rides, requests, and account.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage your ShareRide experience.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <View style={styles.profileText}>
            <Text style={styles.profileName}>{user?.name?.trim() || "ShareRide member"}</Text>
            <Text style={styles.profileDescription}>
              {user?.email || "Signed in to ShareRide"}
            </Text>
          </View>

          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>MEMBER</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your activity</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="🚘"
            title="My rides"
            subtitle="Manage rides you've offered"
            onPress={() => navigate("/(tabs)/rides")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="🎫"
            title="My bookings"
            subtitle="Track your ride requests"
            onPress={() => navigate("/(tabs)/bookings")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="➕"
            title="Offer a ride"
            subtitle="Share your journey with students"
            onPress={() => navigate("/(tabs)/offer-ride")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="🔎"
            title="Find a ride"
            subtitle="Search available rides"
            onPress={() => navigate("/(tabs)/find-ride")}
          />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="👥"
            title="Manage accounts"
            subtitle="Switch between your saved accounts"
            onPress={() => navigate("/profile/accounts")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="⚙️"
            title="Account settings"
            subtitle="Profile and preferences"
            onPress={() => {
              Alert.alert(
                "Account settings",
                "The settings screen will be connected to your existing profile and account services in the next phase."
              );
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="🛡️"
            title="Safety & support"
            subtitle="Ride safely and get help"
            onPress={() => {
              Alert.alert(
                "Safety & support",
                "Support options will be added in a later phase."
              );
            }}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log out of ShareRide"
          disabled={loggingOut}
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            loggingOut && styles.logoutButtonDisabled,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={styles.logoutButtonText}>Log out</Text>
          )}
        </TouchableOpacity>

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
  eyebrow: {
    color: colors.brand,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.3,
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: {
    width: 82,
    height: 82,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 29,
  },
  profileText: {
    flex: 1,
    gap: spacing.xxs,
  },
  profileName: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "800",
  },
  profileDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  memberBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  memberBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  menuCard: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  menuItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  menuTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  menuSubtitle: {
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
  logoutButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: typography.button,
    fontWeight: "800",
  },
  footer: {
    marginTop: spacing.xxl,
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  secondary: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: 22,
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
