import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("shareride_auth_token");

  console.log("========== API REQUEST ==========");
  console.log("METHOD:", config.method?.toUpperCase());
  console.log("URL:", `${config.baseURL}${config.url}`);
  console.log("TOKEN EXISTS:", !!token);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log("AUTH HEADER ATTACHED: YES");
  } else {
    console.log("AUTH HEADER ATTACHED: NO");
  }

  return config;
});