import * as SecureStore from "expo-secure-store";
import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

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

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginResponse = User & {
  token: string;
};

export async function register(
  payload: RegisterPayload
): Promise<void> {
  await api.post(ENDPOINTS.AUTH.REGISTER, payload);
}

export async function login(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    ENDPOINTS.AUTH.LOGIN,
    payload
  );

  await SecureStore.setItemAsync(TOKEN_KEY, data.token);

  return data;
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>(ENDPOINTS.AUTH.ME);
  return data;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}