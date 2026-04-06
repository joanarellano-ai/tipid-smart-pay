// Simple reactive user store (no external deps)
type Listener = () => void;

interface UserData {
  fullName: string;
  email: string;
}

let userData: UserData = { fullName: "", email: "" };
const listeners = new Set<Listener>();

export const userStore = {
  get: () => userData,
  set: (data: UserData) => {
    userData = data;
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// React hook
import { useSyncExternalStore } from "react";
export function useUser() {
  return useSyncExternalStore(userStore.subscribe, userStore.get);
}
