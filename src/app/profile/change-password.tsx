import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { changePassword } from "@/services/auth/auth.service";
import { goBackSafely } from "@/utils/navigation";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword === newPassword &&
    !loading;

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Invalid password", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }

    try {
      setLoading(true);
      await changePassword({ currentPassword, newPassword });
      Alert.alert("Password updated", "Your password has been changed.", [
        { text: "OK", onPress: () => goBackSafely("/profile/settings") },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to update password. Please verify your current password.";
      Alert.alert("Update failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => goBackSafely("/profile/settings")}
            style={styles.back}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>SECURITY</Text>
          <Text style={styles.title}>Change password</Text>
          <Text style={styles.subtitle}>
            Choose a strong password of at least 6 characters.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Current password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>New password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            {confirmPassword.length > 0 && confirmPassword !== newPassword ? (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            ) : null}

            <TouchableOpacity
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={[
                styles.button,
                !canSubmit && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Update password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding, paddingBottom: spacing.xxl },
  back: { alignSelf: "flex-start", paddingVertical: spacing.xs, marginBottom: spacing.lg },
  backText: { color: colors.brand, fontSize: typography.body, fontWeight: "700" },
  eyebrow: { color: colors.brand, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.2 },
  title: { marginTop: spacing.xs, color: colors.text, fontSize: typography.screenTitle, fontWeight: "800" },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl, color: colors.textSecondary, fontSize: typography.body, lineHeight: 21 },
  card: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: typography.caption, fontWeight: "700", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { minHeight: 48, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: typography.body, color: colors.text },
  errorText: { marginTop: spacing.xs, fontSize: typography.caption, color: colors.danger },
  button: { minHeight: layout.buttonHeight, marginTop: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: typography.button, fontWeight: "800" },
});
