import axios from "axios";
import { getStorageItem, deleteStorageItem } from "@/utils/storage";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getStorageItem("shareride_auth_token");

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? "";

    if (
      status === 401 &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/auth/register")
    ) {
      await deleteStorageItem("shareride_auth_token");
      console.log("AUTH TOKEN CLEARED AFTER 401");
    }

    return Promise.reject(error);
  }
);

