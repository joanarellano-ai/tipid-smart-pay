import { useEffect, useState } from "react";

export type PremiumPlan = "free" | "premium" | "admin";
export type BillingCycle = "monthly" | "yearly";

export interface PaymentRecord {
  id: string;
  amount: number;
  cycle: BillingCycle;
  date: string; // ISO
  method: string;
  status: "paid" | "refunded";
}

interface PremiumState {
  plan: PremiumPlan;
  cycle: BillingCycle;
  since?: string;       // ISO start
  expiresAt?: string;   // ISO end (premium only)
  autoRenew: boolean;
  payments: PaymentRecord[];
}

const KEY = "tipidpay_premium";
const EVT = "tipidpay:premium";

const DEFAULT: PremiumState = {
  plan: "free",
  cycle: "monthly",
  autoRenew: true,
  payments: [],
};

function load(): PremiumState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = { ...DEFAULT, ...JSON.parse(raw) } as PremiumState;
      // Auto-revert if premium subscription expired
      if (parsed.plan === "premium" && parsed.expiresAt) {
        const exp = new Date(parsed.expiresAt).getTime();
        if (exp < Date.now()) {
          parsed.plan = "free";
          parsed.expiresAt = undefined;
        }
      }
      return parsed;
    }
  } catch {}
  return { ...DEFAULT };
}

let state: PremiumState = load();
const listeners = new Set<() => void>();

function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(EVT));
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export const PREMIUM_PRICE_MONTHLY = 149;
export const PREMIUM_PRICE_YEARLY = 1430;

export const premiumStore = {
  get: () => state,
  upgrade(cycle: BillingCycle = "monthly", method: string = "GCash") {
    const now = new Date();
    const days = cycle === "monthly" ? 30 : 365;
    const amount = cycle === "monthly" ? PREMIUM_PRICE_MONTHLY : PREMIUM_PRICE_YEARLY;
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount,
      cycle,
      date: now.toISOString(),
      method,
      status: "paid",
    };
    state = {
      ...state,
      plan: "premium",
      cycle,
      since: now.toISOString(),
      expiresAt: addDays(now, days).toISOString(),
      autoRenew: true,
      payments: [payment, ...state.payments],
    };
    emit();
  },
  cancel() {
    // Stop auto-renew but keep premium until expiry (real-SaaS behaviour)
    state = { ...state, autoRenew: false };
    emit();
  },
  endNow() {
    // Force revert to free immediately
    state = { ...state, plan: "free", expiresAt: undefined, autoRenew: false };
    emit();
  },
  setRole(plan: PremiumPlan) {
    state = { ...state, plan };
    if (plan === "free") state.expiresAt = undefined;
    emit();
  },
  /** Simulate expiry (for prototype demos). */
  simulateExpire() {
    state = { ...state, plan: "free", expiresAt: undefined, autoRenew: false };
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
    // Re-check expiry every minute while mounted
    const t = window.setInterval(() => {
      if (state.plan === "premium" && state.expiresAt && new Date(state.expiresAt).getTime() < Date.now()) {
        premiumStore.endNow();
      }
    }, 60_000);
    return () => {
      unsub();
      window.removeEventListener(EVT, fn);
      window.removeEventListener("storage", fn);
      window.clearInterval(t);
    };
  }, []);
  return {
    ...s,
    isPremium: s.plan === "premium",
    isAdmin: s.plan === "admin",
    isFree: s.plan === "free",
  };
}

/** Feature flags — single source of truth for gating. */
export const PREMIUM_FEATURES = {
  aiPrediction: ["premium", "admin"],
  autoPay: ["premium", "admin"],
  unlimitedSplitMembers: ["premium", "admin"],
  advancedAnalytics: ["premium", "admin"],
  exportReports: ["premium", "admin"],
  aiCoach: ["premium", "admin"],
  premiumThemes: ["premium", "admin"],
  noAds: ["premium", "admin"],
  adminTools: ["admin"],
} as const;

export type FeatureKey = keyof typeof PREMIUM_FEATURES;

export function hasFeature(plan: PremiumPlan, feature: FeatureKey): boolean {
  return (PREMIUM_FEATURES[feature] as readonly PremiumPlan[]).includes(plan);
}

export const FREE_SPLIT_MEMBER_LIMIT = 3;
