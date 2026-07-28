import type {
  AuthRepository,
  LoginInput,
  RegisterInput,
} from "@/interfaces/AuthRepository";
import type { Session, StoredUser, User } from "@/interfaces/types";
import {
  clearSession,
  hashPassword,
  readJSON,
  readSessionJSON,
  STORAGE_KEYS,
  uid,
  writeJSON,
  writeSessionJSON,
} from "./storage";

const SESSION_TTL = 1000 * 60 * 60 * 24 * 30;

const ADMIN_SEED = {
  name: "المشرف",
  email: "admin@asl-alwujud.local",
  password: "admin123",
};

function strip(u: StoredUser): User {
  const { passwordHash: _passwordHash, ...rest } = u;
  void _passwordHash;
  return rest;
}

async function ensureSeeded(): Promise<void> {
  const users = readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
  if (users.some((u) => u.email === ADMIN_SEED.email)) return;
  const admin: StoredUser = {
    id: uid(),
    name: ADMIN_SEED.name,
    email: ADMIN_SEED.email,
    role: "admin",
    createdAt: Date.now(),
    passwordHash: hashPassword(ADMIN_SEED.password),
  };
  users.push(admin);
  writeJSON(STORAGE_KEYS.users, users);
}

function findUserByEmail(email: string): StoredUser | undefined {
  const users = readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
  return users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
}

function findUserById(id: string): StoredUser | undefined {
  const users = readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
  return users.find((u) => u.id === id);
}

function writeSession(userId: string): void {
  const session: Session = {
    userId,
    token: uid(),
    expiresAt: Date.now() + SESSION_TTL,
  };
  writeSessionJSON(session);
}

function readSession(): Session | null {
  const session = readSessionJSON<Session | null>(null);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    clearSession();
    return null;
  }
  return session;
}

export class LocalStorageAuthRepository implements AuthRepository {
  async register(input: RegisterInput): Promise<User> {
    await ensureSeeded();
    if (findUserByEmail(input.email)) {
      throw new Error("البريد الإلكتروني مُستخدم بالفعل");
    }
    const user: StoredUser = {
      id: uid(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: "user",
      createdAt: Date.now(),
      passwordHash: hashPassword(input.password),
    };
    const users = readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
    users.push(user);
    writeJSON(STORAGE_KEYS.users, users);
    writeSession(user.id);
    return strip(user);
  }

  async login(input: LoginInput): Promise<User> {
    await ensureSeeded();
    const stored = findUserByEmail(input.email);
    if (!stored || stored.passwordHash !== hashPassword(input.password)) {
      throw new Error("بيانات الدخول غير صحيحة");
    }
    writeSession(stored.id);
    return strip(stored);
  }

  async logout(): Promise<void> {
    clearSession();
  }

  async getCurrentUser(): Promise<User | null> {
    await ensureSeeded();
    const session = readSession();
    if (!session) return null;
    const stored = findUserById(session.userId);
    return stored ? strip(stored) : null;
  }
}

export function createAuthRepository(): AuthRepository {
  return new LocalStorageAuthRepository();
}
