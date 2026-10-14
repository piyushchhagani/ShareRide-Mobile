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
    await SecureStore.setItemAsync(key, value);
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
    return SecureStore.getItemAsync(key);
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
    await SecureStore.deleteItemAsync(key);
  }
}
