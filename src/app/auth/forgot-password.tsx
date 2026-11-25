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
import { router } from "expo-router";

import { forgotPassword, resetPassword } from "@/services/auth/auth.service";
import { goBackSafely } from "@/utils/navigation";
import { colors, layout, radius, spacing, typography } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [devTokenNotice, setDevTokenNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email.trim() || loading) return;

    try {
      setLoading(true);
      const res = await forgotPassword(email.trim());
      if (res.devResetToken) {
        setDevTokenNotice(`Local dev reset code: ${res.devResetToken}`);
        setToken(res.devResetToken);
      } else {
        setDevTokenNotice("");
      }
      setStep("reset");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to send reset code.";
      Alert.alert("Request failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token.trim() || newPassword.length < 6 || loading) return;

    try {
      setLoading(true);
      await resetPassword({ token: token.trim(), newPassword });
      Alert.alert(
        "Password reset",
        "Your password has been updated. Please sign in.",
        [{ text: "Sign in", onPress: () => router.replace("/auth/login") }]
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Invalid or expired reset code.";
      Alert.alert("Reset failed", message);
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
            onPress={() => goBackSafely("/auth/login")}
            style={styles.back}
          >
            <Text style={styles.backText}>‹ Back to login</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
          <Text style={styles.title}>
            {step === "request" ? "Forgot password" : "Reset password"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "request"
              ? "Enter your account email to generate a 6-digit reset code."
              : "Enter the 6-digit reset code and choose a new password."}
          </Text>

          {devTokenNotice ? (
            <View style={styles.devBanner}>
              <Text style={styles.devBannerText}>{devTokenNotice}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            {step === "request" ? (
              <>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                <TouchableOpacity
                  disabled={!email.trim() || loading}
                  onPress={() => void handleRequestCode()}
                  style={[
                    styles.button,
                    (!email.trim() || loading) && styles.buttonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Send reset code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Reset code</Text>
                <TextInput
                  value={token}
                  onChangeText={setToken}
                  placeholder="6-digit code"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.input}
                />

                <Text style={styles.label}>New password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  style={styles.input}
                />

                <TouchableOpacity
                  disabled={!token.trim() || newPassword.length < 6 || loading}
                  onPress={() => void handleReset()}
                  style={[
                    styles.button,
                    (!token.trim() || newPassword.length < 6 || loading) &&
                      styles.buttonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Reset password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
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
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary, fontSize: typography.body, lineHeight: 21 },
  devBanner: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.successSoft, marginBottom: spacing.md },
  devBannerText: { color: colors.success, fontSize: typography.body, fontWeight: "700" },
  card: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: typography.caption, fontWeight: "700", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { minHeight: 48, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: typography.body, color: colors.text },
  button: { minHeight: layout.buttonHeight, marginTop: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: typography.button, fontWeight: "800" },
});
