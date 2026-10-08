import { router } from "expo-router";

export function goBackSafely(fallback = "/(tabs)/home") {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}