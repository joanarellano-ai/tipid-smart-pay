import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface PaymentMethod {
  id: string;
  type: "gcash" | "maya" | "card";
  label: string;
  details: string; // masked e.g. ****1234
  cardBrand?: "visa" | "mastercard";
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: "bill" | "topup" | "sent" | "received";
  status: "success" | "failed" | "pending";
}

export interface BillReminder {
  id: string;
  category: string;
  icon: string;
  amount: number;
  dueDate: string; // ISO date
  status: "paid" | "upcoming" | "overdue";
  autoPay: boolean;
  snoozed: boolean;
  /** ISO date when the bill was marked paid. */
  paidDate?: string;
  /** True when added via "Track Bills" mode (vs. seeded/forecast). */
  tracked?: boolean;
}

interface WalletState {
  balance: number;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  reminders: BillReminder[];
}

const STORAGE_KEY = "tipidpay_wallet";

function loadState(): WalletState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // New users (or users who skipped the survey via Track Bills mode)
  // start with a clean slate — no balance, no transactions, no reminders.
  if (
    localStorage.getItem("tipidpay_new_user") === "1" ||
    localStorage.getItem("tipidpay_track_mode") === "1"
  ) {
    return getEmptyState();
  }
  return getDefaultState();
}

function getEmptyState(): WalletState {
  return {
    balance: 0,
    paymentMethods: [],
    transactions: [],
    reminders: [],
  };
}

function getDefaultState(): WalletState {
  const today = new Date();
  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);
  const in1Day = new Date(today);
  in1Day.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    balance: 4250,
    paymentMethods: [
      { id: "pm1", type: "gcash", label: "GCash", details: "****7890", isDefault: true },
      { id: "pm2", type: "maya", label: "Maya", details: "****4567", isDefault: false },
    ],
    transactions: [
      { id: "t1", label: "Electricity - March", amount: -2850, date: "Mar 15", type: "bill", status: "success" },
      { id: "t2", label: "Wallet Top-up", amount: 5000, date: "Mar 12", type: "topup", status: "success" },
      { id: "t3", label: "Water - March", amount: -680, date: "Mar 10", type: "bill", status: "success" },
      { id: "t4", label: "Mia paid share", amount: 1225, date: "Mar 8", type: "received", status: "success" },
      { id: "t5", label: "Internet - March", amount: -1370, date: "Mar 5", type: "bill", status: "success" },
    ],
    reminders: [
      { id: "r1", category: "Electricity", icon: "⚡", amount: 2850, dueDate: in3Days.toISOString(), status: "upcoming", autoPay: false, snoozed: false },
      { id: "r2", category: "Water", icon: "💧", amount: 680, dueDate: in1Day.toISOString(), status: "upcoming", autoPay: false, snoozed: false },
      { id: "r3", category: "Internet", icon: "📡", amount: 1370, dueDate: yesterday.toISOString(), status: "overdue", autoPay: true, snoozed: false },
    ],
  };
}

let state = loadState();
const listeners = new Set<Listener>();

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const walletStore = {
  getState: () => state,

  resetEmpty() {
    state = getEmptyState();
    emit();
  },

  topUp(amount: number) {
    state = {
      ...state,
      balance: state.balance + amount,
      transactions: [
        { id: `t${Date.now()}`, label: "Wallet Top-up", amount, date: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" }), type: "topup", status: "success" },
        ...state.transactions,
      ],
    };
    emit();
  },

  sendMoney(recipientName: string, amount: number, note?: string) {
    if (amount > state.balance) return false;
    state = {
      ...state,
      balance: state.balance - amount,
      transactions: [
        { id: `t${Date.now()}`, label: `Sent to ${recipientName}${note ? ` - ${note}` : ""}`, amount: -amount, date: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" }), type: "sent", status: "success" },
        ...state.transactions,
      ],
    };
    emit();
    return true;
  },

  payBill(reminderId: string) {
    const reminder = state.reminders.find((r) => r.id === reminderId);
    if (!reminder || reminder.amount > state.balance) return false;
    state = {
      ...state,
      balance: state.balance - reminder.amount,
      reminders: state.reminders.map((r) => r.id === reminderId ? { ...r, status: "paid" as const } : r),
      transactions: [
        { id: `t${Date.now()}`, label: `${reminder.category} Bill Payment`, amount: -reminder.amount, date: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" }), type: "bill", status: "success" },
        ...state.transactions,
      ],
    };
    emit();
    return true;
  },

  addPaymentMethod(method: Omit<PaymentMethod, "id">) {
    const id = `pm${Date.now()}`;
    const isFirst = state.paymentMethods.length === 0;
    state = {
      ...state,
      paymentMethods: [...state.paymentMethods, { ...method, id, isDefault: isFirst || method.isDefault }],
    };
    if (method.isDefault) {
      state.paymentMethods = state.paymentMethods.map((pm) => ({ ...pm, isDefault: pm.id === id }));
    }
    emit();
  },

  removePaymentMethod(id: string) {
    const wasDefault = state.paymentMethods.find((pm) => pm.id === id)?.isDefault;
    state = {
      ...state,
      paymentMethods: state.paymentMethods.filter((pm) => pm.id !== id),
    };
    if (wasDefault && state.paymentMethods.length > 0) {
      state.paymentMethods[0].isDefault = true;
    }
    emit();
  },

  setDefaultPaymentMethod(id: string) {
    state = {
      ...state,
      paymentMethods: state.paymentMethods.map((pm) => ({ ...pm, isDefault: pm.id === id })),
    };
    emit();
  },

  toggleAutoPay(reminderId: string) {
    state = {
      ...state,
      reminders: state.reminders.map((r) => r.id === reminderId ? { ...r, autoPay: !r.autoPay } : r),
    };
    emit();
  },

  snoozeReminder(reminderId: string) {
    state = {
      ...state,
      reminders: state.reminders.map((r) => r.id === reminderId ? { ...r, snoozed: true } : r),
    };
    emit();
  },

  /** Add a tracked bill (Track Bills mode). status is REQUIRED. */
  addReminder(input: { category: string; icon?: string; amount: number; dueDate: string; status: "paid" | "upcoming" | "overdue" }) {
    const id = `r${Date.now()}`;
    const reminder: BillReminder = {
      id,
      category: input.category,
      icon: input.icon || "🧾",
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      autoPay: false,
      snoozed: false,
      tracked: true,
      paidDate: input.status === "paid" ? new Date().toISOString() : undefined,
    };
    state = { ...state, reminders: [reminder, ...state.reminders] };
    emit();
    return id;
  },

  setReminderStatus(reminderId: string, status: "paid" | "upcoming" | "overdue") {
    state = {
      ...state,
      reminders: state.reminders.map((r) =>
        r.id === reminderId
          ? { ...r, status, paidDate: status === "paid" ? new Date().toISOString() : undefined }
          : r
      ),
    };
    emit();
  },

  removeReminder(reminderId: string) {
    state = { ...state, reminders: state.reminders.filter((r) => r.id !== reminderId) };
    emit();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useWallet() {
  return useSyncExternalStore(walletStore.subscribe, walletStore.getState);
}
