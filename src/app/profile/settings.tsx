import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  getCurrentUser,
  updatePreferences,
  updateProfile,
} from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { goBackSafely } from "@/utils/navigation";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type PreferenceRowProps = {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

function PreferenceRow({
  icon,
  title,
  description,
  value,
  disabled,
  onChange,
}: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.preferenceText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{
          false: colors.border,
          true: colors.brand,
        }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [rideUpdates, setRideUpdates] = useState(
    user?.rideUpdatesEnabled ?? true
  );
  const [bookingUpdates, setBookingUpdates] = useState(
    user?.bookingUpdatesEnabled ?? true
  );
  const [productUpdates, setProductUpdates] = useState(
    user?.productUpdatesEnabled ?? false
  );
  const [locationHelp, setLocationHelp] = useState(
    user?.locationAssistanceEnabled ?? true
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const fresh = await getCurrentUser();
        if (!active) return;
        updateUser(fresh);
        setName(fresh.name ?? "");
        setPhone(fresh.phone ?? "");
        setAvatarUrl(fresh.avatarUrl ?? "");
        setRideUpdates(fresh.rideUpdatesEnabled ?? true);
        setBookingUpdates(fresh.bookingUpdatesEnabled ?? true);
        setProductUpdates(fresh.productUpdatesEnabled ?? false);
        setLocationHelp(fresh.locationAssistanceEnabled ?? true);
      } catch {
        // Keep cached store values if offline.
      }
    })();
    return () => {
      active = false;
    };
  }, [updateUser]);

  const handleSaveProfile = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Invalid name", "Name must be at least 2 characters.");
      return;
    }

    try {
      setSavingProfile(true);
      const updated = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      updateUser(updated);
      Alert.alert("Profile saved", "Your profile information has been updated.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to update profile right now.";
      Alert.alert("Save failed", message);
    } finally {
      setSavingProfile(false);
    }
  };

  const togglePreference = async (
    patch: {
      rideUpdatesEnabled?: boolean;
      bookingUpdatesEnabled?: boolean;
      productUpdatesEnabled?: boolean;
      locationAssistanceEnabled?: boolean;
    },
    revert: () => void
  ) => {
    try {
      setSavingPrefs(true);
      const updated = await updatePreferences(patch);
      updateUser(updated);
    } catch {
      revert();
      Alert.alert("Save failed", "Could not save preference. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => goBackSafely("/(tabs)/profile")}
          style={styles.back}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>ACCOUNT & PREFERENCES</Text>
        <Text style={styles.title}>Account settings</Text>
        <Text style={styles.subtitle}>
          Update your profile details, security, and app preferences.
        </Text>

        <Text style={styles.sectionTitle}>Profile details</Text>
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +91 98765 43210"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Profile photo URL (optional)</Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://example.com/avatar.jpg"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TouchableOpacity
            disabled={savingProfile}
            onPress={() => void handleSaveProfile()}
            style={[
              styles.saveButton,
              savingProfile && styles.disabledButton,
            ]}
          >
            {savingProfile ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save profile</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push("/profile/change-password")}
          >
            <View style={styles.securityLeft}>
              <Text style={styles.rowTitle}>Change password</Text>
              <Text style={styles.rowDescription}>
                Update your account password
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <PreferenceRow
            icon="🚘"
            title="Ride updates"
            description="Changes to rides you offer"
            value={rideUpdates}
            disabled={savingPrefs}
            onChange={(value) => {
              const prev = rideUpdates;
              setRideUpdates(value);
              void togglePreference(
                { rideUpdatesEnabled: value },
                () => setRideUpdates(prev)
              );
            }}
          />
          <View style={styles.divider} />
          <PreferenceRow
            icon="🎫"
            title="Booking updates"
            description="Responses to your ride requests"
            value={bookingUpdates}
            disabled={savingPrefs}
            onChange={(value) => {
              const prev = bookingUpdates;
              setBookingUpdates(value);
              void togglePreference(
                { bookingUpdatesEnabled: value },
                () => setBookingUpdates(prev)
              );
            }}
          />
          <View style={styles.divider} />
          <PreferenceRow
            icon="✨"
            title="Product announcements"
            description="New features and app news"
            value={productUpdates}
            disabled={savingPrefs}
            onChange={(value) => {
              const prev = productUpdates;
              setProductUpdates(value);
              void togglePreference(
                { productUpdatesEnabled: value },
                () => setProductUpdates(prev)
              );
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>Ride experience</Text>
        <View style={styles.card}>
          <PreferenceRow
            icon="📍"
            title="Location assistance"
            description="Use location features when you choose"
            value={locationHelp}
            disabled={savingPrefs}
            onChange={(value) => {
              const prev = locationHelp;
              setLocationHelp(value);
              void togglePreference(
                { locationAssistanceEnabled: value },
                () => setLocationHelp(prev)
              );
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert("ShareRide", "Campus journeys, together.")
            }
          >
            <Text style={styles.rowTitle}>About ShareRide</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert(
                "Privacy",
                "Your contact details and trip records are used only for campus ride coordination."
              )
            }
          >
            <Text style={styles.rowTitle}>Privacy information</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>ShareRide · Settings</Text>
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
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  formCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    minHeight: 48,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  saveButton: {
    minHeight: layout.buttonHeight,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "800",
  },
  card: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preferenceRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  icon: {
    fontSize: 19,
  },
  preferenceText: {
    flex: 1,
    gap: spacing.xxs,
  },
  securityLeft: {
    flex: 1,
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
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
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  linkRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 25,
  },
  footer: {
    marginTop: spacing.xl,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: typography.caption,
  },
});
