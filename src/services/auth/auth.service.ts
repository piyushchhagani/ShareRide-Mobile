import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
  deleteStorageItem,
  getStorageItem,
  setStorageItem,
} from "@/utils/storage";

const TOKEN_KEY = "shareride_auth_token";
const ACCOUNTS_KEY = "shareride_saved_accounts";
const accountTokenKey = (id: number) => `shareride_account_token_${id}`;

export type SavedAccount = Pick<User, "id" | "name" | "email" | "role">;

async function readSavedAccounts(): Promise<SavedAccount[]> {
  const raw = await getStorageItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && Number.isFinite(Number(item.id)) && item.email)
      : [];
  } catch {
    return [];
  }
}

async function writeSavedAccounts(accounts: SavedAccount[]): Promise<void> {
  await setStorageItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function saveAccount(account: SavedAccount, token: string): Promise<void> {
  const accounts = await readSavedAccounts();
  const next = [account, ...accounts.filter((item) => item.id !== account.id)];
  await setStorageItem(accountTokenKey(account.id), token);
  await writeSavedAccounts(next);
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return readSavedAccounts();
}

export async function switchStoredAccount(accountId: number): Promise<{ account: SavedAccount; token: string }> {
  const accounts = await readSavedAccounts();
  const account = accounts.find((item) => item.id === accountId);
  if (!account) throw new Error("This account is no longer saved on this device.");
  const token = await getStorageItem(accountTokenKey(accountId));
  if (!token) throw new Error("This account session has expired. Sign in again to add it.");
  await setStorageItem(TOKEN_KEY, token);
  return { account, token };
}

export async function removeSavedAccount(accountId: number): Promise<void> {
  const accounts = await readSavedAccounts();
  await deleteStorageItem(accountTokenKey(accountId));
  await writeSavedAccounts(accounts.filter((item) => item.id !== accountId));
}

export async function storeCurrentAccount(account: SavedAccount, token: string): Promise<void> {
  await setStorageItem(TOKEN_KEY, token);
  await saveAccount(account, token);
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  rideUpdatesEnabled?: boolean;
  bookingUpdatesEnabled?: boolean;
  productUpdatesEnabled?: boolean;
  locationAssistanceEnabled?: boolean;
};

export type UpdateProfilePayload = {
  name: string;
  phone?: string;
  avatarUrl?: string;
};

export type UpdatePreferencesPayload = {
  rideUpdatesEnabled?: boolean;
  bookingUpdatesEnabled?: boolean;
  productUpdatesEnabled?: boolean;
  locationAssistanceEnabled?: boolean;
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

  const account: SavedAccount = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
  await storeCurrentAccount(account, data.token);
  return data;
}

export async function register(
  payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "STUDENT" | "FACULTY";
  }
): Promise<void> {
  await api.post(ENDPOINTS.AUTH.REGISTER, {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
    phone: payload.phone?.trim() || undefined,
    role: payload.role,
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

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<User> {
  const { data } = await api.put<User>(ENDPOINTS.AUTH.PROFILE, {
    name: payload.name.trim(),
    phone: payload.phone?.trim() || null,
    avatarUrl: payload.avatarUrl?.trim() || null,
  });
  return data;
}

export async function updatePreferences(
  payload: UpdatePreferencesPayload
): Promise<User> {
  const { data } = await api.put<User>(ENDPOINTS.AUTH.PREFERENCES, payload);
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    ENDPOINTS.AUTH.PASSWORD,
    payload
  );
  return data;
}

export async function forgotPassword(
  email: string
): Promise<{ message: string; devResetToken?: string }> {
  const { data } = await api.post<{ message: string; devResetToken?: string }>(
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    { email: email.trim() }
  );
  return data;
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    ENDPOINTS.AUTH.RESET_PASSWORD,
    {
      token: payload.token.trim(),
      newPassword: payload.newPassword,
    }
  );
  return data;
}

export async function logout(): Promise<void> {
  await deleteStorageItem(TOKEN_KEY);
}
