import type { User, Session } from "@/types/auth";
import { getItem, setItem } from "@/lib/storage";
import { USERS_KEY, SESSION_KEY } from "@/lib/constants";

export function getUsers(): User[] {
  return getItem<User[]>(USERS_KEY) || [];
}

export function saveUsers(users: User[]) {
  setItem(USERS_KEY, users);
}

export function setSession(session: Session) {
  setItem(SESSION_KEY, session);
}

export function getSession(): Session | null {
  return getItem<Session>(SESSION_KEY);
}