import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { login } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0;

  async function handleLogin() {
    if (!canSubmit || isLoading) return;

    try {
      setIsLoading(true);

      const response = await login({
        email: email.trim(),
        password,
      });

      console.log("LOGIN SCREEN SUCCESS:", response);

      setSession(response.token, {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      });

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("LOGIN SCREEN ERROR:", error);
      console.log(
        "LOGIN SCREEN RESPONSE:",
        error?.response?.data
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login. Please try again.";

      Alert.alert("Login failed", String(message));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.logo}>ShareRide</Text>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Sign in to continue your journey.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TouchableOpacity
            disabled={!canSubmit || isLoading}
            onPress={handleLogin}
            style={[
              styles.button,
              (!canSubmit || isLoading) && styles.buttonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={styles.registerButton}
        >
          <Text style={styles.registerText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.registerLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 70,
    paddingBottom: 35,
  },

  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563EB",
    marginBottom: 45,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748B",
  },

  form: {
    marginTop: 30,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0F172A",
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  registerButton: {
    alignItems: "center",
  },

  registerText: {
    color: "#64748B",
    fontSize: 14,
  },

  registerLink: {
    color: "#2563EB",
    fontWeight: "800",
  },
});