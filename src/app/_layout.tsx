import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import QueryProvider from "@/providers/QueryProvider";
import AuthGate from "@/components/auth/AuthGate";

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthGate>
        <StatusBar style="dark" />

        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthGate>
    </QueryProvider>
  );
}