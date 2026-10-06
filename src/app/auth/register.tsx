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
import { router } from "expo-router";

import { register } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/auth";

export default function RegisterScreen() {
  const setSession = useAuthStore((state) => state.setSession);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    fullName.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.length >= 6;

  async function handleRegister() {
    if (!canSubmit || isLoading) return;

    try {
      setIsLoading(true);

      const response = (await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
      })) as any;

      setSession(response?.token, response?.user);

      router.replace("/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to create your account.";

      Alert.alert("Registration failed", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>ShareRide</Text>

        <Text style={styles.title}>Create account</Text>

        <Text style={styles.subtitle}>
          Join your campus ride-sharing community.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>Account type</Text>

          <View style={styles.roleRow}>
            <TouchableOpacity
              onPress={() => setRole("STUDENT")}
              style={[
                styles.roleButton,
                role === "STUDENT" && styles.roleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "STUDENT" && styles.roleTextActive,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole("FACULTY")}
              style={[
                styles.roleButton,
                role === "FACULTY" && styles.roleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "FACULTY" && styles.roleTextActive,
                ]}
              >
                Faculty
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            disabled={!canSubmit || isLoading}
            onPress={handleRegister}
            style={[
              styles.button,
              (!canSubmit || isLoading) && styles.buttonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 55,
    paddingBottom: 30,
  },

  back: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  logo: {
    marginTop: 35,
    fontSize: 22,
    fontWeight: "900",
    color: "#2563EB",
  },

  title: {
    marginTop: 30,
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
    marginTop: 18,
  },

  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
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

  roleRow: {
    flexDirection: "row",
    gap: 12,
  },

  roleButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  roleButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  roleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  roleTextActive: {
    color: "#2563EB",
  },

  button: {
    height: 56,
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginButton: {
    marginTop: "auto",
    paddingTop: 35,
    alignItems: "center",
  },

  loginText: {
    fontSize: 14,
    color: "#64748B",
  },

  loginLink: {
    color: "#2563EB",
    fontWeight: "800",
  },
});