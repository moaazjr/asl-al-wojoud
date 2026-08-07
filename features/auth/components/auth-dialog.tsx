"use client";

import * as React from "react";
import { AtSign, KeyRound, Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "../use-auth";

export function AuthDialog() {
  const { authDialogOpen, setAuthDialogOpen } = useAuth();
  const [tab, setTab] = React.useState("login");

  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-amiri text-2xl">حسابك</DialogTitle>
          <DialogDescription>
            سجّل الدخول للمشاركة في التعليقات
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                تسجيل الدخول
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                حساب جديد
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-5">
              <LoginForm onDone={() => setAuthDialogOpen(false)} />
            </TabsContent>
            <TabsContent value="register" className="mt-5">
              <RegisterForm onDone={() => setAuthDialogOpen(false)} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="font-kufi text-sm text-rose-600 dark:text-rose-400">
      {message}
    </p>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
      {children}
    </span>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login({ email, password });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="login-email">البريد الإلكتروني</Label>
        <div className="relative">
          <FieldIcon>
            <AtSign className="h-4 w-4" />
          </FieldIcon>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ps-9"
            placeholder="you@example.com"
            dir="ltr"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">كلمة المرور</Label>
        <div className="relative">
          <FieldIcon>
            <KeyRound className="h-4 w-4" />
          </FieldIcon>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ps-9"
            dir="ltr"
            required
          />
        </div>
      </div>
      <FormError message={error} />
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        دخول
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const { register } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({ name, email, password });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إنشاء الحساب");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="reg-name">الاسم</Label>
        <div className="relative">
          <FieldIcon>
            <User className="h-4 w-4" />
          </FieldIcon>
          <Input
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ps-9"
            placeholder="اسمك"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email">البريد الإلكتروني</Label>
        <div className="relative">
          <FieldIcon>
            <AtSign className="h-4 w-4" />
          </FieldIcon>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ps-9"
            placeholder="you@example.com"
            dir="ltr"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">كلمة المرور</Label>
        <div className="relative">
          <FieldIcon>
            <KeyRound className="h-4 w-4" />
          </FieldIcon>
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ps-9"
            dir="ltr"
            required
          />
        </div>
      </div>
      <FormError message={error} />
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        إنشاء الحساب
      </Button>
    </form>
  );
}
