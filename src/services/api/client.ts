import { create } from "axios";
import { getStorageItem, deleteStorageItem } from "@/utils/storage";

let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, ""),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getStorageItem("shareride_auth_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
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
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);
