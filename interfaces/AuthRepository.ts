import type { User } from "./types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthRepository {
  register(input: RegisterInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
