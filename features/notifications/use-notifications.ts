"use client";

import { useContext } from "react";
import { NotificationsContext } from "./notifications-provider";

export function useNotifications() {
  return useContext(NotificationsContext);
}
