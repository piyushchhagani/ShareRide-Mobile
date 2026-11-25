import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import {
  getMyRatings,
  type UserRatingSummary,
} from "@/services/ratings/rating.service";
import { getMyRequests, type RideRequest } from "@/services/rides/request.service";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { goBackSafely } from "@/utils/navigation";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RatingsScreen() {
  const [summary, setSummary] = useState<UserRatingSummary | null>(null);
  const [completedBookings, setCompletedBookings] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [ratingSummary, myRequests] = await Promise.all([
        getMyRatings(),
        getMyRequests(["ACCEPTED"]),
      ]);
      setSummary(ratingSummary);
      setCompletedBookings(
        myRequests.filter((req) => req.rideStatus === "COMPLETED")
      );
    } catch {
      setError("Unable to load ratings right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.brand}
            onRefresh={() => {
              setRefreshing(true);
              void loadData();
            }}
          />
        }
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => goBackSafely("/(tabs)/profile")}
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

        {loading ? (
          <View style={styles.ratingCard}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : error ? (
          <View style={styles.ratingCard}>
            <Text style={styles.cardTitle}>Couldn&apos;t load ratings</Text>
            <Text style={styles.description}>{error}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setLoading(true);
                void loadData();
              }}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.ratingCard}>
              <View style={styles.ratingTopRow}>
                <View style={styles.ratingIcon}>
                  <Text style={styles.star}>★</Text>
                </View>

                <View style={styles.ratingStats}>
                  <Text style={styles.bigScore}>
                    {summary?.averageRating != null
                      ? `${summary.averageRating.toFixed(1)} / 5.0`
                      : "No ratings yet"}
                  </Text>
                  <Text style={styles.description}>
                    {summary?.totalRatings || 0}{" "}
                    {summary?.totalRatings === 1 ? "review" : "reviews"} ·{" "}
                    {summary?.totalCompletedRides || 0} completed{" "}
                    {summary?.totalCompletedRides === 1 ? "trip" : "trips"}
                  </Text>
                </View>
              </View>
            </View>

            {completedBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed trips to rate</Text>
                {completedBookings.map((booking) => (
                  <View key={booking.id} style={styles.tipCard}>
                    <View style={styles.tipContent}>
                      <Text style={styles.tipTitle}>
                        Ride #{booking.rideId} · {booking.driverName || "Driver"}
                      </Text>
                      <Text style={styles.tipText}>
                        {booking.pickupAddress || "Campus trip"} →{" "}
                        {booking.destinationAddress || ""}
                      </Text>
                    </View>
                    {booking.driverId ? (
                      <TouchableOpacity
                        style={styles.rateChip}
                        onPress={() =>
                          router.push({
                            pathname: "/rate-ride",
                            params: {
                              rideId: String(booking.rideId),
                              ratedUserId: String(booking.driverId),
                              ratedUserName: booking.driverName || "Driver",
                              roleLabel: "driver",
                            },
                          })
                        }
                      >
                        <Text style={styles.rateChipText}>Rate ★</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews received</Text>

              {!summary || summary.ratings.length === 0 ? (
                <View style={styles.tipCard}>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>No reviews yet</Text>
                    <Text style={styles.tipText}>
                      Complete a shared ride and reviews from fellow students will appear here.
                    </Text>
                  </View>
                </View>
              ) : (
                summary.ratings.map((item) => (
                  <View key={item.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{item.raterName}</Text>
                      <Text style={styles.reviewStars}>
                        {"★".repeat(item.score)}
                        {"☆".repeat(Math.max(0, 5 - item.score))}
                      </Text>
                    </View>
                    {item.comment ? (
                      <Text style={styles.reviewComment}>{item.comment}</Text>
                    ) : null}
                    <Text style={styles.reviewMeta}>
                      Ride #{item.rideId} · {formatDate(item.createdAt)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.push("/my-bookings")}
        >
          <Text style={styles.primaryButtonText}>View my bookings</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  backButton: { minHeight: layout.minimumTouchTarget, alignSelf: "flex-start", justifyContent: "center", paddingRight: spacing.md },
  backText: { color: colors.brand, fontSize: typography.bodyLarge, fontWeight: "700" },
  heading: { marginTop: spacing.lg, marginBottom: spacing.xl },
  eyebrow: { color: colors.brand, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1, marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: typography.screenTitle, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: typography.bodyLarge, lineHeight: 23, marginTop: spacing.xs },
  ratingCard: { padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  ratingTopRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ratingIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", backgroundColor: colors.warningSoft, borderRadius: radius.lg },
  star: { color: colors.warning, fontSize: 30, fontWeight: "800" },
  ratingStats: { flex: 1 },
  bigScore: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: "800" },
  cardTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: "800" },
  description: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 22, marginTop: spacing.xxs },
  section: { marginTop: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: "800", marginBottom: spacing.md },
  tipCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  tipContent: { flex: 1 },
  tipTitle: { color: colors.text, fontSize: typography.body, fontWeight: "800" },
  tipText: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: 19, marginTop: spacing.xxs },
  rateChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: colors.warningSoft },
  rateChipText: { color: colors.warning, fontSize: typography.caption, fontWeight: "800" },
  reviewCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewAuthor: { color: colors.text, fontSize: typography.body, fontWeight: "800" },
  reviewStars: { color: colors.warning, fontSize: typography.body, fontWeight: "800" },
  reviewComment: { color: colors.text, fontSize: typography.body, lineHeight: 20 },
  reviewMeta: { color: colors.textMuted, fontSize: typography.caption },
  primaryButton: { minHeight: layout.buttonHeight, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.brand, borderRadius: radius.lg },
  primaryButtonText: { color: colors.white, fontSize: typography.button, fontWeight: "800" },
  arrow: { color: colors.white, fontSize: 26 },
});
