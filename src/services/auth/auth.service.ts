import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
  deleteStorageItem,
  getStorageItem,
  setStorageItem,
} from "@/utils/storage";

const TOKEN_KEY = "shareride_auth_token";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function login(
  payload: LoginPayload
): Promise<LoginResponse> {
  console.log("========== LOGIN DEBUG ==========");
  console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
  console.log("LOGIN URL:", `${process.env.EXPO_PUBLIC_API_URL}${ENDPOINTS.AUTH.LOGIN}`);
  console.log("EMAIL:", payload.email);

  try {
    const response = await api.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      {
        email: payload.email.trim(),
        password: payload.password,
      }
    );

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", response.data);

    if (!response.data?.token) {
      throw new Error("Backend returned no token.");
    }

    await setStorageItem(
      TOKEN_KEY,
      response.data.token
    );

    console.log("TOKEN SAVED");

    return response.data;
  } catch (error: any) {
    console.log("========== LOGIN ERROR ==========");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    console.log("URL:", error?.config?.url);
    console.log("BASE URL:", error?.config?.baseURL);

    throw error;
  }
}

export async function register(
  payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
): Promise<void> {
  console.log("========== REGISTER DEBUG ==========");
  console.log("EMAIL:", payload.email);

  try {
    await api.post(
      ENDPOINTS.AUTH.REGISTER,
      {
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
        phone: payload.phone?.trim() || undefined,
      }
    );
    console.log("REGISTER SUCCESS");
  } catch (error: any) {
    console.log("========== REGISTER ERROR ==========");
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    console.log("MESSAGE:", error?.message);
    throw error;
  }
}

export async function getStoredToken() {
  return getStorageItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>(
    ENDPOINTS.AUTH.ME
  );

  return data;
}

export async function logout(): Promise<void> {
  await deleteStorageItem(TOKEN_KEY);
}