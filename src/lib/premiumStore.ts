import { useEffect, useState } from "react";

export type PremiumPlan = "free" | "premium";
export type BillingCycle = "monthly" | "yearly";

interface PremiumState {
  plan: PremiumPlan;
  cycle: BillingCycle;
  since?: string;
}

const KEY = "tipidpay_premium";
const EVT = "tipidpay:premium";

function load(): PremiumState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { plan: "free", cycle: "monthly" };
}

let state: PremiumState = load();
const listeners = new Set<() => void>();

function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(EVT));
}

export const premiumStore = {
  get: () => state,
  upgrade(cycle: BillingCycle = "monthly") {
    state = { plan: "premium", cycle, since: new Date().toISOString() };
    emit();
  },
  cancel() {
    state = { plan: "free", cycle: "monthly" };
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function usePremium() {
  const [s, setS] = useState(state);
  useEffect(() => {
    const fn = () => setS({ ...state });
    const unsub = premiumStore.subscribe(fn);
    window.addEventListener(EVT, fn);
    window.addEventListener("storage", fn);
    return () => {
      unsub();
      window.removeEventListener(EVT, fn);
      window.removeEventListener("storage", fn);
    };
  }, []);
  return { ...s, isPremium: s.plan === "premium" };
}

export const PREMIUM_PRICE_MONTHLY = 149;
export const PREMIUM_PRICE_YEARLY = 1430; // ~2 months free
