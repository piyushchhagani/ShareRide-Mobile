import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { getSavedAccounts, removeSavedAccount, switchStoredAccount, type SavedAccount } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { colors, layout, radius, spacing, typography } from "@/theme/tokens";

export default function ManageAccountsScreen() {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const activeUser = useAuthStore((state) => state.user);
  const setActiveAccount = useAuthStore((state) => state.switchAccount);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAccounts(await getSavedAccounts()); }
    catch { setAccounts([]); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function switchAccount(account: SavedAccount) {
    if (account.id === activeUser?.id) {
      router.replace("/(tabs)/home");
      return;
    }
    setWorkingId(account.id);
    try {
      const session = await switchStoredAccount(account.id);
      setActiveAccount(session.token, session.account);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Unable to switch account", error?.message || "Sign in to this account again.", [
        { text: "Sign in", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
    } finally { setWorkingId(null); }
  }

  function switchToLogin() {
    Alert.alert(
      "Switch account",
      "This will sign out the current account and take you to login. Saved account shortcuts will remain available. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setLoading(true);
              try {
                await useAuthStore.getState().logout();
              } finally {
                // Replace the navigation history so Back cannot reopen private screens.
                router.dismissAll();
                router.replace("/auth/login");
                setLoading(false);
              }
            })();
          },
        },
      ]
    );
  }

  function forgetAccount(account: SavedAccount) {
    Alert.alert("Remove saved account?", `Remove ${account.email} from this device? This does not delete the ShareRide account.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { void (async () => {
        await removeSavedAccount(account.id);
        if (activeUser?.id === account.id) {
          // Keep the active token until the user explicitly logs out; this action only removes its saved-switch entry.
          Alert.alert("Account removed", "The saved account entry was removed. Log out to end its current session.");
        }
        await load();
      })(); } },
    ]);
  }

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/welcome")}><Text style={styles.back}>â€¹ Back</Text></TouchableOpacity>
      <Text style={styles.title}>Manage accounts</Text>
      <Text style={styles.subtitle}>Switch between saved passenger and driver accounts on this device. Passwords are never saved.</Text>
      {loading ? <ActivityIndicator color={colors.brand} size="large" /> : accounts.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No saved accounts yet</Text><Text style={styles.subtitle}>Sign in with each account once. It will appear here for quick switching.</Text></View> : accounts.map((account) => {
        const active = account.id === activeUser?.id;
        const busy = workingId === account.id;
        return <View key={account.id} style={styles.card}>
          <View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{account.name?.charAt(0)?.toUpperCase() || "S"}</Text></View><View style={styles.details}><Text style={styles.name}>{account.name}</Text><Text style={styles.email}>{account.email}</Text><Text style={styles.role}>{account.role}</Text></View>{active && <Text style={styles.active}>ACTIVE</Text>}</View>
          <View style={styles.actions}>
            <TouchableOpacity disabled={active || busy} onPress={() => void switchAccount(account)} style={[styles.button, (active || busy) && styles.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{active ? "Current account" : "Switch to account"}</Text>}</TouchableOpacity>
            <TouchableOpacity onPress={() => forgetAccount(account)} style={styles.remove}><Text style={styles.removeText}>Remove</Text></TouchableOpacity>
          </View>
        </View>;
      })}
      <TouchableOpacity style={styles.add} onPress={switchToLogin}><Text style={styles.addText}>Switch account Â· Sign in with another account</Text></TouchableOpacity>
      <Text style={styles.note}>For security, saved sessions depend on the server token remaining valid. If a session expires, sign in again.</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: layout.screenPadding, gap: spacing.md }, back: { color: colors.brand, fontSize: typography.body, fontWeight: "700" }, title: { color: colors.text, fontSize: typography.screenTitle, fontWeight: "800" }, subtitle: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 22 }, empty: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, gap: spacing.sm }, emptyTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: "800" }, card: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.md }, row: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft }, avatarText: { color: colors.brand, fontSize: 18, fontWeight: "800" }, details: { flex: 1, gap: 2 }, name: { color: colors.text, fontWeight: "800", fontSize: typography.bodyLarge }, email: { color: colors.textSecondary, fontSize: typography.caption }, role: { color: colors.textSecondary, fontSize: typography.caption, textTransform: "capitalize" }, active: { color: colors.success, fontSize: 10, fontWeight: "900" }, actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, button: { flex: 1, minHeight: 44, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }, buttonText: { color: "#fff", fontSize: 13, fontWeight: "800" }, disabled: { opacity: 0.55 }, remove: { padding: spacing.sm }, removeText: { color: colors.danger, fontWeight: "700" }, add: { minHeight: 50, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.md, alignItems: "center", justifyContent: "center" }, addText: { color: colors.brand, fontWeight: "800" }, note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 } });
