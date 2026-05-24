import { useSyncExternalStore } from "react";

export type ExpenseCategory =
  | "accommodation"
  | "food"
  | "transportation"
  | "fuel"
  | "flights"
  | "activities"
  | "shopping"
  | "emergency"
  | "entertainment"
  | "misc";

export type SplitMode = "equal" | "percentage" | "custom" | "selected";

export interface TripMember {
  id: string;
  name: string;
  isAdmin?: boolean;
}

export interface ExpenseSplit {
  memberId: string;
  /** Computed peso amount this member owes for the expense */
  amount: number;
  /** Used when mode === "percentage" */
  percent?: number;
  /** Used when mode === "custom" */
  custom?: number;
}

export interface TripExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidById: string;
  date: number;
  mode: SplitMode;
  splits: ExpenseSplit[];
  note?: string;
  receiptName?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  coverEmoji?: string;
  budget: number;
  members: TripMember[];
  expenses: TripExpense[];
  createdAt: number;
}

const STORAGE_KEY = "tipidpay_trips";
type Listener = () => void;

function load(): Trip[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

let state: Trip[] = load();
const listeners = new Set<Listener>();

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export const vacationStore = {
  getState: () => state,
  add(trip: Trip) {
    state = [trip, ...state];
    emit();
  },
  update(id: string, patch: Partial<Trip>) {
    state = state.map((t) => (t.id === id ? { ...t, ...patch } : t));
    emit();
  },
  remove(id: string) {
    state = state.filter((t) => t.id !== id);
    emit();
  },
  addMember(tripId: string, name: string) {
    state = state.map((t) =>
      t.id === tripId
        ? { ...t, members: [...t.members, { id: newId(), name }] }
        : t
    );
    emit();
  },
  removeMember(tripId: string, memberId: string) {
    state = state.map((t) => {
      if (t.id !== tripId) return t;
      // Don't remove if they've paid for expenses or appear in splits
      const used = t.expenses.some(
        (e) => e.paidById === memberId || e.splits.some((s) => s.memberId === memberId)
      );
      if (used) return t;
      return { ...t, members: t.members.filter((m) => m.id !== memberId) };
    });
    emit();
  },
  addExpense(tripId: string, expense: TripExpense) {
    state = state.map((t) =>
      t.id === tripId ? { ...t, expenses: [expense, ...t.expenses] } : t
    );
    emit();
  },
  removeExpense(tripId: string, expenseId: string) {
    state = state.map((t) =>
      t.id === tripId ? { ...t, expenses: t.expenses.filter((e) => e.id !== expenseId) } : t
    );
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useTrips() {
  return useSyncExternalStore(vacationStore.subscribe, vacationStore.getState);
}

export const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: string }> = {
  accommodation: { label: "Hotel", icon: "🏨" },
  food: { label: "Food", icon: "🍽️" },
  transportation: { label: "Transport", icon: "🚕" },
  fuel: { label: "Fuel", icon: "⛽" },
  flights: { label: "Flights", icon: "✈️" },
  activities: { label: "Activities", icon: "🎢" },
  shopping: { label: "Shopping", icon: "🛍️" },
  emergency: { label: "Emergency", icon: "🚨" },
  entertainment: { label: "Entertainment", icon: "🎬" },
  misc: { label: "Misc", icon: "🧾" },
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Compute splits from amount + mode + raw inputs.
 * For "equal" and "selected": pass `selectedIds`.
 * For "percentage": pass `percents` keyed by memberId (should sum to ~100).
 * For "custom": pass `customs` keyed by memberId (should sum to amount).
 * Drift correction guarantees the splits sum to `amount`.
 */
export function buildSplits(
  amount: number,
  mode: SplitMode,
  memberIds: string[],
  opts: {
    selectedIds?: string[];
    percents?: Record<string, number>;
    customs?: Record<string, number>;
  } = {}
): ExpenseSplit[] {
  let splits: ExpenseSplit[] = [];
  if (mode === "equal") {
    const each = amount / memberIds.length;
    splits = memberIds.map((id) => ({ memberId: id, amount: round2(each) }));
  } else if (mode === "selected") {
    const ids = opts.selectedIds && opts.selectedIds.length ? opts.selectedIds : memberIds;
    const each = amount / ids.length;
    splits = ids.map((id) => ({ memberId: id, amount: round2(each) }));
  } else if (mode === "percentage") {
    const pcts = opts.percents || {};
    splits = memberIds
      .filter((id) => (pcts[id] || 0) > 0)
      .map((id) => ({
        memberId: id,
        percent: pcts[id],
        amount: round2((amount * (pcts[id] || 0)) / 100),
      }));
  } else if (mode === "custom") {
    const cs = opts.customs || {};
    splits = memberIds
      .filter((id) => (cs[id] || 0) > 0)
      .map((id) => ({ memberId: id, custom: cs[id], amount: round2(cs[id] || 0) }));
  }
  // Drift correction (except custom — user-defined exact amounts)
  if (mode !== "custom" && splits.length) {
    const sum = splits.reduce((s, x) => s + x.amount, 0);
    const drift = round2(amount - sum);
    if (Math.abs(drift) >= 0.01) {
      splits[splits.length - 1].amount = round2(splits[splits.length - 1].amount + drift);
    }
  }
  return splits;
}

export interface MemberBalance {
  memberId: string;
  paid: number; // total they paid up-front
  share: number; // total they owe across all expenses
  net: number; // paid - share (positive => owed money, negative => owes money)
}

export function computeBalances(trip: Trip): MemberBalance[] {
  const map: Record<string, MemberBalance> = {};
  trip.members.forEach((m) => (map[m.id] = { memberId: m.id, paid: 0, share: 0, net: 0 }));
  trip.expenses.forEach((e) => {
    if (map[e.paidById]) map[e.paidById].paid += e.amount;
    e.splits.forEach((s) => {
      if (map[s.memberId]) map[s.memberId].share += s.amount;
    });
  });
  Object.values(map).forEach((b) => (b.net = round2(b.paid - b.share)));
  Object.values(map).forEach((b) => {
    b.paid = round2(b.paid);
    b.share = round2(b.share);
  });
  return trip.members.map((m) => map[m.id]);
}

export interface SettlementSuggestion {
  fromId: string;
  toId: string;
  amount: number;
}

/** Greedy minimum-transactions settlement. */
export function computeSettlements(trip: Trip): SettlementSuggestion[] {
  const balances = computeBalances(trip).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < -0.01).sort((a, b) => a.net - b.net);
  const creditors = balances.filter((b) => b.net > 0.01).sort((a, b) => b.net - a.net);
  const out: SettlementSuggestion[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debt = -debtors[i].net;
    const credit = creditors[j].net;
    const amt = round2(Math.min(debt, credit));
    if (amt > 0) out.push({ fromId: debtors[i].memberId, toId: creditors[j].memberId, amount: amt });
    debtors[i].net = round2(debtors[i].net + amt);
    creditors[j].net = round2(creditors[j].net - amt);
    if (Math.abs(debtors[i].net) < 0.01) i++;
    if (Math.abs(creditors[j].net) < 0.01) j++;
  }
  return out;
}

export function totalSpent(trip: Trip): number {
  return round2(trip.expenses.reduce((s, e) => s + e.amount, 0));
}
