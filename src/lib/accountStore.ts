import { useSyncExternalStore } from "react";

export type AccountMode = "solo" | "group";

interface AccountState {
  mode: AccountMode;
  groupName: string;
}

type Listener = () => void;
const STORAGE_KEY = "tipidpay_account";

function load(): AccountState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { mode: "solo", groupName: "My Household" };
}

let state = load();
const listeners = new Set<Listener>();

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const accountStore = {
  getState: () => state,
  setMode(mode: AccountMode) {
    state = { ...state, mode };
    emit();
  },
  setGroupName(name: string) {
    state = { ...state, groupName: name };
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAccount() {
  return useSyncExternalStore(accountStore.subscribe, accountStore.getState);
}
