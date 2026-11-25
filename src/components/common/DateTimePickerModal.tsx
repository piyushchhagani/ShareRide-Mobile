import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";

export type DateTimePickerModalProps = {
  visible: boolean;
  value: Date;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  title?: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayPill(date: Date, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function DateTimePickerModal({
  visible,
  value,
  mode = "datetime",
  minimumDate,
  title,
  onConfirm,
  onCancel,
}: DateTimePickerModalProps) {
  const [draftOverride, setDraftOverride] = useState<Date | null>(null);
  const draft = draftOverride ?? value;

  const days = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, []);

  const currentHour24 = draft.getHours();
  const isPm = currentHour24 >= 12;
  const currentHour12 = currentHour24 % 12 === 0 ? 12 : currentHour24 % 12;
  const currentMinute = Math.round(draft.getMinutes() / 5) * 5 % 60;

  const setDay = (day: Date) => {
    const next = new Date(draft);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setDraftOverride(next);
  };

  const setHour12 = (hour12: number, pm: boolean) => {
    const next = new Date(draft);
    let hour24 = hour12 % 12;
    if (pm) hour24 += 12;
    next.setHours(hour24, next.getMinutes(), 0, 0);
    setDraftOverride(next);
  };

  const setMinute = (minute: number) => {
    const next = new Date(draft);
    next.setMinutes(minute, 0, 0);
    setDraftOverride(next);
  };

  const handleCancel = () => {
    setDraftOverride(null);
    onCancel();
  };

  const handleConfirm = () => {
    const selected = new Date(draft);
    setDraftOverride(null);
    onConfirm(selected);
  };

  const isBeforeMin = Boolean(
    minimumDate && draft.getTime() < minimumDate.getTime()
  );

  const showDate = mode === "date" || mode === "datetime";
  const showTime = mode === "time" || mode === "datetime";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close picker"
          style={styles.backdrop}
          onPress={handleCancel}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            {title ||
              (mode === "date"
                ? "Choose travel date"
                : mode === "time"
                  ? "Choose departure time"
                  : "Set departure")}
          </Text>
          <Text style={styles.subtitle}>
            {draft.toLocaleDateString([], {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            ·{" "}
            {draft.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>

          {showDate && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DATE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
              >
                {days.map((day, idx) => {
                  const selected = isSameDay(day, draft);
                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => setDay(day)}
                      style={[styles.pill, selected && styles.pillActive]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selected && styles.pillTextActive,
                        ]}
                      >
                        {formatDayPill(day, idx)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {showTime && (
            <>
              <View style={styles.section}>
                <View style={styles.timeHeader}>
                  <Text style={styles.sectionLabel}>HOUR</Text>
                  <View style={styles.ampmRow}>
                    <Pressable
                      onPress={() => setHour12(currentHour12, false)}
                      style={[
                        styles.ampmButton,
                        !isPm && styles.ampmButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ampmText,
                          !isPm && styles.ampmTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setHour12(currentHour12, true)}
                      style={[
                        styles.ampmButton,
                        isPm && styles.ampmButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ampmText,
                          isPm && styles.ampmTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.row}
                >
                  {HOURS_12.map((h) => {
                    const selected = currentHour12 === h;
                    return (
                      <Pressable
                        key={h}
                        onPress={() => setHour12(h, isPm)}
                        style={[
                          styles.timeChip,
                          selected && styles.pillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selected && styles.pillTextActive,
                          ]}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>MINUTE</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.row}
                >
                  {MINUTES.map((m) => {
                    const selected = currentMinute === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setMinute(m)}
                        style={[
                          styles.timeChip,
                          selected && styles.pillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selected && styles.pillTextActive,
                          ]}
                        >
                          {String(m).padStart(2, "0")}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          )}

          {isBeforeMin ? (
            <Text style={styles.errorText}>
              Choose a future date and time.
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isBeforeMin}
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                isBeforeMin && styles.confirmButtonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    alignSelf: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  ampmRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  ampmButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  ampmButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  ampmTextActive: {
    color: colors.white,
  },
  row: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  timeChip: {
    minWidth: 46,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  pillTextActive: {
    color: colors.white,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
  },
  confirmButtonDisabled: {
    opacity: 0.45,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
});
