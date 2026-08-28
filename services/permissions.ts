import type { Message, Role } from "@/interfaces/types";

export const permissions = {
  canReadBook: () => true,
  canSearch: () => true,
  canCreateComment: () => true,
  canReply: (role: Role) => role === "admin",
  canResolve: (role: Role) => role === "admin",
  canReopen: (role: Role) => role === "admin",
  canPin: (role: Role) => role === "admin",
  canDeleteOwn: () => true,
  canDeleteAny: (role: Role) => role === "admin",
  canAccessAdmin: (role: Role) => role === "admin",
  canManageUsers: (role: Role) => role === "admin",
  canManageSettings: (role: Role) => role === "admin",
  canDisableComments: (role: Role) => role === "admin",
  canLockSection: (role: Role) => role === "admin",
} as const;

export function canEditMessage(
  role: Role,
  message: Message,
  userId: string,
): boolean {
  if (role === "admin" && message.authorRole === "admin") return true;
  return message.authorId === userId;
}

export function canDeleteMessage(
  role: Role,
  message: Message,
  userId: string,
): boolean {
  if (role === "admin") return true;
  return message.authorId === userId;
}
