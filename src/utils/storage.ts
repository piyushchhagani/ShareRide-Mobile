import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("Web localStorage setItem failed:", error);
    }
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("SecureStore setItemAsync failed:", error);
    }
  }
}

export async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn("Web localStorage getItem failed:", error);
      return null;
    }
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore getItemAsync failed:", error);
      return null;
    }
  }
}

export async function deleteStorageItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("Web localStorage removeItem failed:", error);
    }
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore deleteItemAsync failed:", error);
    }
  }
}
