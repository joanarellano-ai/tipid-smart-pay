import { useSyncExternalStore } from "react";

export type ExpenseCategory =
  | "accommodation"
  | "transportation"
  | "food"
  | "entrance"
  | "activities"
  | "emergency"
  | "others"
  // legacy keys kept for backward compatibility with older data:
  | "fuel"
  | "flights"
  | "shopping"
  | "entertainment"
  | "misc";

export type SplitMode = "equal" | "percentage" | "custom" | "selected";
export type ExpenseStatus = "paid" | "partial" | "unpaid" | "overdue";

export interface TripMember {
  id: string;
  name: string;
  isAdmin?: boolean;
}

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percent?: number;
  custom?: number;
}

export interface ExpensePayment {
  id: string;
  amount: number;
  date: number;
  byMemberId?: string;
  note?: string;
}

export interface AuditEntry {
  id: string;
  at: number;
  by: string; // member name or "System"
  action: string;
  details?: string;
}

export interface TripExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidById: string;
  date: number;
  dueDate?: number;
  mode: SplitMode;
  splits: ExpenseSplit[];
  note?: string;
  receiptName?: string;
  receiptData?: string; // base64 data URL (optional, small)
  payments: ExpensePayment[];
  audit: AuditEntry[];
  deletedAt?: number;
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
const TRASH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
type Listener = () => void;

function migrateExpense(e: any): TripExpense {
  return {
    ...e,
    payments: Array.isArray(e.payments) ? e.payments : [],
    audit: Array.isArray(e.audit) ? e.audit : [],
  };
}

function load(): Trip[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed: Trip[] = JSON.parse(s);
      // migrate & purge expired trash
      const now = Date.now();
      return parsed.map((t) => ({
        ...t,
        expenses: (t.expenses || [])
          .map(migrateExpense)
          .filter((e) => !e.deletedAt || now - e.deletedAt < TRASH_TTL_MS),
      }));
    }
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

function mkAudit(by: string, action: string, details?: string): AuditEntry {
  return { id: newId(), at: Date.now(), by, action, details };
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
      t.id === tripId ? { ...t, members: [...t.members, { id: newId(), name }] } : t
    );
    emit();
  },
  removeMember(tripId: string, memberId: string) {
    state = state.map((t) => {
      if (t.id !== tripId) return t;
      const used = t.expenses.some(
        (e) => e.paidById === memberId || e.splits.some((s) => s.memberId === memberId)
      );
      if (used) return t;
      return { ...t, members: t.members.filter((m) => m.id !== memberId) };
    });
    emit();
  },
  addExpense(tripId: string, expense: TripExpense) {
    const e: TripExpense = {
      ...expense,
      payments: expense.payments || [],
      audit: [...(expense.audit || []), mkAudit("You", "Created expense")],
    };
    state = state.map((t) => (t.id === tripId ? { ...t, expenses: [e, ...t.expenses] } : t));
    emit();
  },
  editExpense(
    tripId: string,
    expenseId: string,
    patch: Partial<TripExpense>,
    by = "You"
  ) {
    state = state.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: t.expenses.map((e) => {
          if (e.id !== expenseId) return e;
          const changed: string[] = [];
          for (const k of Object.keys(patch) as (keyof TripExpense)[]) {
            if ((e as any)[k] !== (patch as any)[k]) changed.push(String(k));
          }
          return {
            ...e,
            ...patch,
            audit: [...e.audit, mkAudit(by, "Edited expense", changed.join(", ") || undefined)],
          };
        }),
      };
    });
    emit();
  },
  addPayment(tripId: string, expenseId: string, payment: Omit<ExpensePayment, "id">) {
    state = state.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: t.expenses.map((e) => {
          if (e.id !== expenseId) return e;
          const p: ExpensePayment = { ...payment, id: newId() };
          const byName =
            (payment.byMemberId && t.members.find((m) => m.id === payment.byMemberId)?.name) ||
            "You";
          return {
            ...e,
            payments: [...e.payments, p],
            audit: [
              ...e.audit,
              mkAudit(byName, "Recorded payment", `₱${p.amount.toFixed(2)}`),
            ],
          };
        }),
      };
    });
    emit();
  },
  removePayment(tripId: string, expenseId: string, paymentId: string) {
    state = state.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: t.expenses.map((e) => {
          if (e.id !== expenseId) return e;
          return {
            ...e,
            payments: e.payments.filter((p) => p.id !== paymentId),
            audit: [...e.audit, mkAudit("You", "Deleted a payment")],
          };
        }),
      };
    });
    emit();
  },
  softDeleteExpense(tripId: string, expenseId: string) {
    state = state.map((t) =>
      t.id === tripId
        ? {
            ...t,
            expenses: t.expenses.map((e) =>
              e.id === expenseId
                ? { ...e, deletedAt: Date.now(), audit: [...e.audit, mkAudit("You", "Moved to trash")] }
                : e
            ),
          }
        : t
    );
    emit();
  },
  restoreExpense(tripId: string, expenseId: string) {
    state = state.map((t) =>
      t.id === tripId
        ? {
            ...t,
            expenses: t.expenses.map((e) =>
              e.id === expenseId
                ? { ...e, deletedAt: undefined, audit: [...e.audit, mkAudit("You", "Restored from trash")] }
                : e
            ),
          }
        : t
    );
    emit();
  },
  removeExpense(tripId: string, expenseId: string) {
    // legacy hard-delete — used as permanent purge from trash
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
  accommodation: { label: "Accommodation", icon: "🏨" },
  transportation: { label: "Transportation", icon: "🚕" },
  food: { label: "Food & Drinks", icon: "🍽️" },
  entrance: { label: "Entrance Fees", icon: "🎟️" },
  activities: { label: "Activities", icon: "🎢" },
  emergency: { label: "Emergency", icon: "🚨" },
  others: { label: "Others", icon: "🧾" },
  // legacy
  fuel: { label: "Fuel", icon: "⛽" },
  flights: { label: "Flights", icon: "✈️" },
  shopping: { label: "Shopping", icon: "🛍️" },
  entertainment: { label: "Entertainment", icon: "🎬" },
  misc: { label: "Misc", icon: "🧾" },
};

/** Categories shown in the picker (new canonical set). */
export const PRIMARY_CATEGORIES: ExpenseCategory[] = [
  "accommodation",
  "transportation",
  "food",
  "entrance",
  "activities",
  "emergency",
  "others",
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

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
  if (mode !== "custom" && splits.length) {
    const sum = splits.reduce((s, x) => s + x.amount, 0);
    const drift = round2(amount - sum);
    if (Math.abs(drift) >= 0.01) {
      splits[splits.length - 1].amount = round2(splits[splits.length - 1].amount + drift);
    }
  }
  return splits;
}

/* -------- Payment / status helpers -------- */
export function expensePaid(e: TripExpense): number {
  return round2((e.payments || []).reduce((s, p) => s + p.amount, 0));
}
export function expenseRemaining(e: TripExpense): number {
  return round2(Math.max(0, e.amount - expensePaid(e)));
}
export function expenseStatus(e: TripExpense): ExpenseStatus {
  const paid = expensePaid(e);
  if (paid >= e.amount - 0.01) return "paid";
  if (e.dueDate && e.dueDate < Date.now() && paid < e.amount - 0.01) return "overdue";
  if (paid > 0.01) return "partial";
  return "unpaid";
}

export interface MemberBalance {
  memberId: string;
  paid: number;
  share: number;
  net: number;
}

export function computeBalances(trip: Trip): MemberBalance[] {
  const map: Record<string, MemberBalance> = {};
  trip.members.forEach((m) => (map[m.id] = { memberId: m.id, paid: 0, share: 0, net: 0 }));
  trip.expenses
    .filter((e) => !e.deletedAt)
    .forEach((e) => {
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
  return round2(
    trip.expenses.filter((e) => !e.deletedAt).reduce((s, e) => s + e.amount, 0)
  );
}

export function outstandingBalance(trip: Trip): number {
  return round2(
    trip.expenses
      .filter((e) => !e.deletedAt)
      .reduce((s, e) => s + expenseRemaining(e), 0)
  );
}

export function pendingPaymentsCount(trip: Trip): number {
  return trip.expenses.filter((e) => !e.deletedAt && expenseStatus(e) !== "paid").length;
}
