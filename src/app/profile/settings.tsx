
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

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
  onChange: (value: boolean) => void;
};

function PreferenceRow({
  icon,
  title,
  description,
  value,
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
  const [rideUpdates, setRideUpdates] = useState(true);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [locationHelp, setLocationHelp] = useState(true);

  const showNotConnected = () => {
    Alert.alert(
      "Not connected yet",
      "This setting is currently stored only while this screen is open. Persistent preferences will be connected in a later phase."
    );
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
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>PREFERENCES</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Personalise how ShareRide works for you.
        </Text>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <PreferenceRow
            icon="🚘"
            title="Ride updates"
            description="Changes to rides you offer"
            value={rideUpdates}
            onChange={(value) => {
              setRideUpdates(value);
              showNotConnected();
            }}
          />
          <View style={styles.divider} />
          <PreferenceRow
            icon="🎫"
            title="Booking updates"
            description="Responses to your ride requests"
            value={bookingUpdates}
            onChange={(value) => {
              setBookingUpdates(value);
              showNotConnected();
            }}
          />
          <View style={styles.divider} />
          <PreferenceRow
            icon="✨"
            title="Product announcements"
            description="New features and app news"
            value={productUpdates}
            onChange={(value) => {
              setProductUpdates(value);
              showNotConnected();
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
            onChange={(value) => {
              setLocationHelp(value);
              showNotConnected();
            }}
          />
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            These controls are previews. Their selections are not saved
            between visits and do not yet change notification delivery or
            device permissions.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert(
                "ShareRide",
                "Campus journeys, together."
              )
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
                "Privacy information will be provided here when the app's privacy policy is configured."
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
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.lg,
  },
  noticeIcon: {
    fontSize: 18,
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
  },
  linkRow: {
    minHeight: 56,
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
