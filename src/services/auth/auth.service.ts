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
  const { data } = await api.post<LoginResponse>(
    ENDPOINTS.AUTH.LOGIN,
    {
      email: payload.email.trim(),
      password: payload.password,
    }
  );

  if (!data?.token) {
    throw new Error("Backend returned no token.");
  }

  await setStorageItem(TOKEN_KEY, data.token);
  return data;
}

export async function register(
  payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
): Promise<void> {
  await api.post(ENDPOINTS.AUTH.REGISTER, {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
    phone: payload.phone?.trim() || undefined,
  });
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
