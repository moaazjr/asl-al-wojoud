import type {
  AuthRepository,
  LoginInput,
  RegisterInput,
} from "@/interfaces/AuthRepository";
import type { User } from "@/interfaces/types";
import { apiFetch } from "./client";

interface AuthResponseBody {
  user: User;
}

export class RestAuthRepository implements AuthRepository {
  async register(input: RegisterInput): Promise<User> {
    const body = await apiFetch<AuthResponseBody>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return body.user;
  }

  async login(input: LoginInput): Promise<User> {
    const body = await apiFetch<AuthResponseBody>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return body.user;
  }

  async logout(): Promise<void> {
    await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
  }

  async getCurrentUser(): Promise<User | null> {
    const body = await apiFetch<{ user: User | null }>("/api/auth/me");
    return body.user;
  }
}
