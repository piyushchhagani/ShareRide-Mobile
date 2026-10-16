import { ReactNode, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router, useSegments } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";

type Props = {
  children: ReactNode;
};

export default function AuthGate({ children }: Props) {
  const segments = useSegments();

  const {
    isAuthenticated,
    isLoading,
    restoreSession,
  } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const isWelcomeScreen = segments[0] === "welcome";

    if (!isAuthenticated && !inAuthGroup && !isWelcomeScreen) {
      router.replace("/welcome");
      return;
    }

    if (isAuthenticated && (inAuthGroup || isWelcomeScreen)) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});