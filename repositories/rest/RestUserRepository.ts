import type { UserRepository } from "@/interfaces/UserRepository";
import type { User } from "@/interfaces/types";
import { apiFetch } from "./client";

export class RestUserRepository implements UserRepository {
  async getAll(): Promise<User[]> {
    return apiFetch<User[]>("/api/users");
  }

  async getById(id: string): Promise<User | null> {
    return apiFetch<User | null>(`/api/users/${id}`);
  }

  async count(): Promise<number> {
    const body = await apiFetch<{ count: number }>("/api/users/count");
    return body.count;
  }
}
