import { createAuthRepository } from "@/repositories/LocalStorageAuthRepository";
import { createCommentRepository } from "@/repositories/LocalStorageCommentRepository";
import { createNotificationRepository } from "@/repositories/LocalStorageNotificationRepository";
import { createUserRepository } from "@/repositories/LocalStorageUserRepository";
import { RestAuthRepository } from "@/repositories/rest/RestAuthRepository";
import { RestCommentRepository } from "@/repositories/rest/RestCommentRepository";
import { RestNotificationRepository } from "@/repositories/rest/RestNotificationRepository";
import { RestUserRepository } from "@/repositories/rest/RestUserRepository";
import type { AuthRepository } from "@/interfaces/AuthRepository";
import type { CommentRepository } from "@/interfaces/CommentRepository";
import type { NotificationRepository } from "@/interfaces/NotificationRepository";
import type { UserRepository } from "@/interfaces/UserRepository";
import { AuthService } from "./AuthService";
import { CommentService } from "./CommentService";
import { NotificationService } from "./NotificationService";

const USE_PRISMA = process.env.NEXT_PUBLIC_DATA_BACKEND === "prisma";

let _auth: AuthService | null = null;
let _comments: CommentService | null = null;
let _notifications: NotificationService | null = null;
let _users: UserRepository | null = null;

function authRepo(): AuthRepository {
  return USE_PRISMA ? new RestAuthRepository() : createAuthRepository();
}

function commentRepo(): CommentRepository {
  return USE_PRISMA ? new RestCommentRepository() : createCommentRepository();
}

function notificationRepo(): NotificationRepository {
  return USE_PRISMA
    ? new RestNotificationRepository()
    : createNotificationRepository();
}

function userRepo(): UserRepository {
  return USE_PRISMA ? new RestUserRepository() : createUserRepository();
}

export function getUserRepository(): UserRepository {
  if (!_users) _users = userRepo();
  return _users;
}

export function getAuthService(): AuthService {
  if (!_auth) _auth = new AuthService(authRepo());
  return _auth;
}

export function getNotificationService(): NotificationService {
  if (!_notifications)
    _notifications = new NotificationService(notificationRepo());
  return _notifications;
}

export function getCommentService(): CommentService {
  if (!_comments)
    _comments = new CommentService(commentRepo(), getNotificationService());
  return _comments;
}
