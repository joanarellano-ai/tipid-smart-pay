// Reactive user store with localStorage persistence
import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface UserData {
  firstName: string;
  middleInitial: string;
  lastName: string;
  email: string;
  /** ISO date string YYYY-MM-DD */
  birthday: string;
  /** Derived "First M. Last" — kept for backward compat */
  fullName: string;
}

const STORAGE_KEY = "tipidpay_user";

const empty: UserData = { firstName: "", middleInitial: "", lastName: "", email: "", birthday: "", fullName: "" };

function formatFullName(first: string, mi: string, last: string): string {
  const parts = [first.trim(), mi.trim() ? `${mi.trim().charAt(0).toUpperCase()}.` : "", last.trim()].filter(Boolean);
  return parts.join(" ");
}

function load(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    const firstName = parsed.firstName ?? "";
    const middleInitial = parsed.middleInitial ?? "";
    const lastName = parsed.lastName ?? "";
    // Migrate legacy { fullName } records
    if (!firstName && !lastName && parsed.fullName) {
      const tokens = String(parsed.fullName).trim().split(/\s+/);
      const f = tokens[0] ?? "";
      const l = tokens.length > 1 ? tokens[tokens.length - 1] : "";
      const m = tokens.length > 2 ? tokens[1].charAt(0) : "";
      return { firstName: f, middleInitial: m, lastName: l, email: parsed.email ?? "", birthday: parsed.birthday ?? "", fullName: formatFullName(f, m, l) };
    }
    return {
      firstName,
      middleInitial,
      lastName,
      email: parsed.email ?? "",
      birthday: parsed.birthday ?? "",
      fullName: formatFullName(firstName, middleInitial, lastName),
    };
  } catch {
    return empty;
  }
}

let userData: UserData = load();
const listeners = new Set<Listener>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch {
    // ignore quota errors
  }
}

export const userStore = {
  get: () => userData,
  set: (data: Partial<Omit<UserData, "fullName">>) => {
    const firstName = (data.firstName ?? userData.firstName).trim();
    const middleInitial = (data.middleInitial ?? userData.middleInitial).trim();
    const lastName = (data.lastName ?? userData.lastName).trim();
    const email = (data.email ?? userData.email).trim();
    const birthday = (data.birthday ?? userData.birthday).trim();
    userData = {
      firstName,
      middleInitial,
      lastName,
      email,
      birthday,
      fullName: formatFullName(firstName, middleInitial, lastName),
    };
    persist();
    listeners.forEach((l) => l());
  },
  clear: () => {
    userData = empty;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useUser() {
  return useSyncExternalStore(userStore.subscribe, userStore.get);
}

export function capitalize(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
