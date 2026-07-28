import type { UserRepository } from "@/interfaces/UserRepository";
import type { StoredUser, User } from "@/interfaces/types";
import { readJSON, STORAGE_KEYS } from "./storage";

function strip(u: StoredUser): User {
  const { passwordHash: _passwordHash, ...rest } = u;
  void _passwordHash;
  return rest;
}

async function load(): Promise<StoredUser[]> {
  return readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
}

export class LocalStorageUserRepository implements UserRepository {
  async getAll(): Promise<User[]> {
    const users = await load();
    return users
      .map(strip)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getById(id: string): Promise<User | null> {
    const users = await load();
    const u = users.find((x) => x.id === id);
    return u ? strip(u) : null;
  }

  async count(): Promise<number> {
    return (await load()).length;
  }
}

export function createUserRepository(): UserRepository {
  return new LocalStorageUserRepository();
}
