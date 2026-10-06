export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: User;
};