import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import {
  getPaymentHistory,
  markPaymentPaid,
  type PaymentItem,
} from "@/services/payments/payment.service";
import { colors, layout, radius, spacing, typography } from "@/theme/tokens";
import { goBackSafely } from "@/utils/navigation";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PaymentsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setError("");
      const data = await getPaymentHistory();
      setItems(data);
    } catch {
      setError("Unable to load payment history right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  const totals = useMemo(() => {
    let unpaid = 0;
    let paid = 0;
    for (const p of items) {
      const amt = Number(p.amount) || 0;
      if (p.status === "PAID") paid += amt;
      else if (p.status === "UNPAID") unpaid += amt;
    }
    return { unpaid, paid };
  }, [items]);

  const executeMarkPaid = async (payment: PaymentItem) => {
    try {
      setUpdatingId(payment.id);
      const updated = await markPaymentPaid(payment.id);
      setItems((current) =>
        current.map((item) => (item.id === payment.id ? updated : item))
      );
      Alert.alert("Payment updated", `₹${updated.amount} marked as paid.`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to update payment status.";
      Alert.alert("Update failed", message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkPaid = (payment: PaymentItem) => {
    if (updatingId !== null) return;
    const title = "Mark payment as paid?";
    const body = `Confirm ₹${Number(payment.amount).toFixed(0)} for Ride #${payment.rideId} has been settled.`;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${body}`)) {
        void executeMarkPaid(payment);
      }
      return;
    }

    Alert.alert(title, body, [
      { text: "Cancel", style: "cancel" },
      { text: "Mark paid", onPress: () => void executeMarkPaid(payment) },
    ]);
  };

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
              void loadHistory();
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
          <Text style={styles.eyebrow}>FARES & SETTLEMENTS</Text>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>
            Track ride fares and mark shared trips as settled.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>
              ₹{totals.unpaid.toFixed(0)}
            </Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Settled</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              ₹{totals.paid.toFixed(0)}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Couldn&apos;t load payments</Text>
            <Text style={styles.cardDescription}>{error}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setLoading(true);
                void loadHistory();
              }}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>₹</Text>
            </View>
            <Text style={styles.cardTitle}>No transactions yet</Text>
            <Text style={styles.cardDescription}>
              Once a ride request is accepted, the shared fare appears here so both passenger and driver can track settlement.
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
        ) : (
          <View style={styles.list}>
            {items.map((item) => {
              const isPaid = item.status === "PAID";
              const isCancelled = item.status === "CANCELLED";
              const statusBg = isPaid
                ? colors.successSoft
                : isCancelled
                  ? colors.surfaceSecondary
                  : colors.warningSoft;
              const statusFg = isPaid
                ? colors.success
                : isCancelled
                  ? colors.textSecondary
                  : colors.warning;

              return (
                <View key={item.id} style={styles.txCard}>
                  <View style={styles.txTop}>
                    <View style={styles.txTitleGroup}>
                      <Text style={styles.txTitle}>
                        Ride #{item.rideId} · ₹{Number(item.amount).toFixed(0)}
                      </Text>
                      <Text style={styles.txSubtitle}>
                        {item.roleForViewer === "PASSENGER"
                          ? `To driver: ${item.driverName}`
                          : `From passenger: ${item.passengerName}`}{" "}
                        · {item.seats} {item.seats === 1 ? "seat" : "seats"}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.badgeText, { color: statusFg }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text numberOfLines={1} style={styles.routeText}>
                    {item.pickupAddress} → {item.destinationAddress}
                  </Text>
                  <Text style={styles.dateText}>
                    {isPaid && item.paidAt
                      ? `Paid ${formatDate(item.paidAt)}`
                      : `Created ${formatDate(item.createdAt)}`}
                  </Text>

                  {item.status === "UNPAID" && (
                    <TouchableOpacity
                      disabled={updatingId !== null}
                      onPress={() => handleMarkPaid(item)}
                      style={styles.markPaidButton}
                    >
                      {updatingId === item.id ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.markPaidText}>Mark as paid</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Campus cash / UPI settlement</Text>
          <Text style={styles.noticeText}>
            Settle fares directly with your co-traveller via UPI or cash, then tap &ldquo;Mark as paid&rdquo; to keep both trip ledgers in sync.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  backButton: { alignSelf: "flex-start", minHeight: layout.minimumTouchTarget, justifyContent: "center", paddingRight: spacing.md },
  backText: { color: colors.brand, fontSize: typography.bodyLarge, fontWeight: "700" },
  heading: { marginTop: spacing.lg, marginBottom: spacing.lg },
  eyebrow: { color: colors.brand, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.2, marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: typography.screenTitle, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: typography.bodyLarge, lineHeight: 23, marginTop: spacing.xs },
  summaryRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  summaryBox: { flex: 1, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  summaryLabel: { color: colors.textSecondary, fontSize: typography.caption, fontWeight: "700" },
  summaryValue: { marginTop: spacing.xxs, fontSize: typography.sectionTitle, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  icon: { fontSize: 27, fontWeight: "800", color: colors.brand },
  cardTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: "800" },
  cardDescription: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 22, marginTop: spacing.sm },
  list: { gap: spacing.sm },
  txCard: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  txTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  txTitleGroup: { flex: 1 },
  txTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: "800" },
  txSubtitle: { color: colors.textSecondary, fontSize: typography.caption, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill },
  badgeText: { fontSize: 10, fontWeight: "800" },
  routeText: { color: colors.text, fontSize: typography.caption, fontWeight: "600", marginTop: spacing.xxs },
  dateText: { color: colors.textMuted, fontSize: typography.caption },
  markPaidButton: { marginTop: spacing.sm, minHeight: 40, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  markPaidText: { color: colors.white, fontSize: typography.caption, fontWeight: "800" },
  primaryButton: { minHeight: layout.buttonHeight, marginTop: spacing.md, borderRadius: radius.lg, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: colors.white, fontSize: typography.button, fontWeight: "800" },
  secondaryButton: { minHeight: layout.buttonHeight, marginTop: spacing.lg, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secondaryButtonText: { color: colors.brand, fontSize: typography.body, fontWeight: "700" },
  buttonArrow: { color: colors.brand, fontSize: 25 },
  notice: { marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.warningSoft },
  noticeTitle: { color: colors.text, fontSize: typography.body, fontWeight: "800" },
  noticeText: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: 19, marginTop: spacing.xs },
});
