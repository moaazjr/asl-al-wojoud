import type { User } from "./types";

export interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  count(): Promise<number>;
}
