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
import { useLocalSearchParams } from "expo-router";

import { createRating } from "@/services/ratings/rating.service";
import { goBackSafely } from "@/utils/navigation";
import { colors, layout, radius, spacing, typography } from "@/theme/tokens";

export default function RateRideScreen() {
  const { rideId, ratedUserId, ratedUserName, roleLabel } = useLocalSearchParams<{
    rideId?: string;
    ratedUserId?: string;
    ratedUserName?: string;
    roleLabel?: string;
  }>();

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const rId = Number(rideId);
    const uId = Number(ratedUserId);
    if (!Number.isFinite(rId) || !Number.isFinite(uId)) {
      Alert.alert("Missing details", "Ride or user information is incomplete.");
      return;
    }

    try {
      setSubmitting(true);
      await createRating({
        rideId: rId,
        ratedUserId: uId,
        score,
        comment: comment.trim() || undefined,
      });
      Alert.alert("Thank you!", "Your rating has been submitted.", [
        { text: "Done", onPress: () => goBackSafely("/profile/ratings") },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to submit rating.";
      Alert.alert("Submission failed", message);
    } finally {
      setSubmitting(false);
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
            onPress={() => goBackSafely()}
            style={styles.back}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>TRIP FEEDBACK</Text>
          <Text style={styles.title}>Rate your ride</Text>
          <Text style={styles.subtitle}>
            Share how your trip with {ratedUserName || roleLabel || "this member"} went on Ride #{rideId || "—"}.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Select rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= score;
                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setScore(star)}
                    style={styles.starButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${star} stars`}
                  >
                    <Text style={[styles.star, active && styles.starActive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.scoreCaption}>{score} out of 5 stars</Text>

            <Text style={styles.sectionLabel}>Comment (optional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Punctual, friendly, smooth ride…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.textArea}
            />

            <TouchableOpacity
              disabled={submitting}
              onPress={() => void handleSubmit()}
              style={[
                styles.submitButton,
                submitting && styles.disabledButton,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Submit rating</Text>
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
  sectionLabel: { fontSize: typography.caption, fontWeight: "700", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm },
  starsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  starButton: { padding: spacing.xs },
  star: { fontSize: 38, color: colors.border },
  starActive: { color: colors.warning },
  scoreCaption: { textAlign: "center", fontSize: typography.body, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  textArea: { minHeight: 110, textAlignVertical: "top", backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: typography.body, color: colors.text },
  submitButton: { minHeight: layout.buttonHeight, marginTop: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  disabledButton: { opacity: 0.6 },
  submitText: { color: colors.white, fontSize: typography.button, fontWeight: "800" },
});
