
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
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

const faqs = [
  {
    question: "How do I find a ride?",
    answer:
      "Open Find Ride, choose your pickup and destination, select your departure time and seats, then search for matching rides.",
  },
  {
    question: "How do I offer a ride?",
    answer:
      "Open Offer Ride, enter your route and departure time, provide your vehicle details, and publish your ride.",
  },
  {
    question: "How do booking requests work?",
    answer:
      "When you request a seat, the driver can review your request. Check My Bookings to see the request status.",
  },
  {
    question: "How can I see requests for my ride?",
    answer:
      "Open My Rides, select the ride, and open Passenger Requests to review pending requests.",
  },
  {
    question: "Why can't I see my bookings?",
    answer:
      "Check that you are signed in and connected to the internet. Pull down on the bookings screen to refresh, or try again if an error appears.",
  },
  {
    question: "What should I do if a ride feels unsafe?",
    answer:
      "Put your safety first, move to a safe public location if possible, contact someone you trust, and contact local emergency services if you are in immediate danger.",
  },
];

export default function HelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => (current === index ? null : index));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>WE'RE HERE TO HELP</Text>
        <Text style={styles.title}>Help & support</Text>
        <Text style={styles.subtitle}>
          Quick answers to common questions about using ShareRide.
        </Text>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>💬</Text>
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroDescription}>
            Browse the answers below to learn how rides, bookings, and
            passenger requests work.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently asked questions</Text>

        <View style={styles.faqCard}>
          {faqs.map((faq, index) => {
            const isOpen = expanded === index;

            return (
              <View key={faq.question}>
                {index > 0 && <View style={styles.divider} />}

                <TouchableOpacity
                  style={styles.questionRow}
                  activeOpacity={0.75}
                  onPress={() => toggleFaq(index)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.question}>{faq.question}</Text>
                  <Text style={styles.chevron}>
                    {isOpen ? "−" : "+"}
                  </Text>
                </TouchableOpacity>

                {isOpen && (
                  <Text style={styles.answer}>{faq.answer}</Text>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Quick links</Text>

        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push("/(tabs)/bookings")}
          >
            <Text style={styles.quickEmoji}>🎫</Text>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>My bookings</Text>
              <Text style={styles.quickDescription}>
                Check your ride requests
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push("/(tabs)/rides")}
          >
            <Text style={styles.quickEmoji}>🚘</Text>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>My rides</Text>
              <Text style={styles.quickDescription}>
                Manage rides you offer
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push("/profile/safety")}
          >
            <Text style={styles.quickEmoji}>🛡️</Text>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>Safety guidance</Text>
              <Text style={styles.quickDescription}>
                Tips for safer shared journeys
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Direct customer-support contact details are not configured on
            this screen yet. No support request is sent from this page.
          </Text>
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
    letterSpacing: 1.1,
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
    lineHeight: 22,
  },
  hero: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.xl,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  heroEmoji: {
    fontSize: 26,
  },
  heroTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  heroDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  faqCard: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  questionRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  question: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 21,
  },
  chevron: {
    color: colors.brand,
    fontSize: 24,
    fontWeight: "600",
  },
  answer: {
    paddingBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  quickLinks: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  quickLink: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  quickEmoji: {
    fontSize: 22,
  },
  quickText: {
    flex: 1,
    gap: spacing.xxs,
  },
  quickTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  quickDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
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
  footer: {
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: "center",
  },
});
