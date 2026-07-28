import type {
  AuthRepository,
  LoginInput,
  RegisterInput,
} from "@/interfaces/AuthRepository";
import type { User } from "@/interfaces/types";

export interface AuthResult {
  user: User;
}

export class AuthService {
  constructor(private readonly authRepo: AuthRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2) throw new Error("الاسم مطلوب");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("بريد إلكتروني غير صالح");
    if (input.password.length < 6)
      throw new Error("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");

    const user = await this.authRepo.register({ ...input, name, email });
    return { user };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.authRepo.login({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    return { user };
  }

  async logout(): Promise<void> {
    await this.authRepo.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authRepo.getCurrentUser();
  }
}
