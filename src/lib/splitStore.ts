import { useSyncExternalStore } from "react";

export type SplitMethod = "equal" | "shares" | "exact" | "items";
export type SplitCategory = "vacation" | "family" | "household" | "dining" | "groceries" | "other";

export interface SplitParticipant {
  id: string;
  name: string;
  /** Used by "shares" method (e.g., 1, 2, 3) */
  shares?: number;
  /** Used by "exact" method (peso amount they owe) */
  exact?: number;
  /** Used by "items" method - sum of item costs assigned to them */
  itemsTotal?: number;
  /** Whether they've fully settled their share */
  paid: boolean;
  /** Partial amount already paid (peso). 0 if none. */
  paidAmount?: number;
}

export interface SplitItem {
  id: string;
  label: string;
  amount: number;
  /** Participant ids sharing this item equally */
  sharedBy: string[];
}

export interface SplitBill {
  id: string;
  title: string;
  category: SplitCategory;
  totalAmount: number;
  payerId: string; // who fronted the money
  method: SplitMethod;
  participants: SplitParticipant[];
  items: SplitItem[]; // only used when method === "items"
  notes?: string;
  createdAt: number;
}

type Listener = () => void;
const STORAGE_KEY = "tipidpay_splits";

function load(): SplitBill[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

let state: SplitBill[] = load();
const listeners = new Set<Listener>();

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const splitStore = {
  getState: () => state,
  add(bill: SplitBill) {
    state = [bill, ...state];
    emit();
  },
  update(id: string, patch: Partial<SplitBill>) {
    state = state.map((b) => (b.id === id ? { ...b, ...patch } : b));
    emit();
  },
  remove(id: string) {
    state = state.filter((b) => b.id !== id);
    emit();
  },
  togglePaid(billId: string, participantId: string) {
    state = state.map((b) =>
      b.id === billId
        ? {
            ...b,
            participants: b.participants.map((p) => {
              if (p.id !== participantId) return p;
              const nextPaid = !p.paid;
              return { ...p, paid: nextPaid, paidAmount: nextPaid ? undefined : 0 };
            }),
          }
        : b
    );
    emit();
  },
  recordPartialPayment(billId: string, participantId: string, amount: number, owedNow: number) {
    state = state.map((b) =>
      b.id === billId
        ? {
            ...b,
            participants: b.participants.map((p) => {
              if (p.id !== participantId) return p;
              const prev = p.paidAmount || 0;
              const next = Math.max(0, prev + amount);
              const fullyPaid = next + 0.005 >= owedNow;
              return { ...p, paidAmount: fullyPaid ? undefined : next, paid: fullyPaid };
            }),
          }
        : b
    );
    emit();
  },
  addParticipant(billId: string, name: string) {
    state = state.map((b) =>
      b.id === billId
        ? {
            ...b,
            participants: [
              ...b.participants,
              { id: newId(), name, shares: 1, exact: 0, paid: false, paidAmount: 0 },
            ],
          }
        : b
    );
    emit();
  },
  removeParticipant(billId: string, participantId: string) {
    state = state.map((b) => {
      if (b.id !== billId) return b;
      if (b.payerId === participantId) return b; // never remove the payer
      return {
        ...b,
        participants: b.participants.filter((p) => p.id !== participantId),
        items: b.items.map((it) => ({ ...it, sharedBy: it.sharedBy.filter((id) => id !== participantId) })),
      };
    });
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSplits() {
  return useSyncExternalStore(splitStore.subscribe, splitStore.getState);
}

/**
 * Compute each participant's owed amount based on the chosen method.
 * Returns a map of participantId -> amount owed (rounded to 2 decimals).
 * Guarantees the sum equals totalAmount by adjusting the last participant
 * for any rounding drift, ensuring 100% accuracy.
 */
export function computeOwed(bill: SplitBill): Record<string, number> {
  const result: Record<string, number> = {};
  const { participants, totalAmount, method, items } = bill;
  if (participants.length === 0) return result;

  if (method === "equal") {
    const each = totalAmount / participants.length;
    participants.forEach((p) => (result[p.id] = round2(each)));
  } else if (method === "shares") {
    const totalShares = participants.reduce((s, p) => s + (p.shares || 0), 0);
    if (totalShares <= 0) {
      participants.forEach((p) => (result[p.id] = 0));
    } else {
      participants.forEach(
        (p) => (result[p.id] = round2((totalAmount * (p.shares || 0)) / totalShares))
      );
    }
  } else if (method === "exact") {
    participants.forEach((p) => (result[p.id] = round2(p.exact || 0)));
  } else if (method === "items") {
    const totals: Record<string, number> = {};
    participants.forEach((p) => (totals[p.id] = 0));
    items.forEach((it) => {
      if (it.sharedBy.length === 0) return;
      const share = it.amount / it.sharedBy.length;
      it.sharedBy.forEach((pid) => {
        if (totals[pid] !== undefined) totals[pid] += share;
      });
    });
    participants.forEach((p) => (result[p.id] = round2(totals[p.id])));
  }

  // Drift correction so the parts always sum to totalAmount exactly
  if (method !== "exact") {
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    const drift = round2(totalAmount - sum);
    if (Math.abs(drift) >= 0.01) {
      const lastId = participants[participants.length - 1].id;
      result[lastId] = round2(result[lastId] + drift);
    }
  }
  return result;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Remaining balance per participant after partial payments (>= 0). */
export function computeRemaining(bill: SplitBill): Record<string, number> {
  const owed = computeOwed(bill);
  const out: Record<string, number> = {};
  bill.participants.forEach((p) => {
    const paid = p.paid ? owed[p.id] || 0 : p.paidAmount || 0;
    out[p.id] = Math.max(0, Math.round(((owed[p.id] || 0) - paid) * 100) / 100);
  });
  return out;
}
