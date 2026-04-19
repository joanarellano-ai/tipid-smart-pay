import { useSyncExternalStore } from "react";

export type Utility = "electricity" | "water" | "internet";

export interface BillEntry {
  id: string;
  utility: Utility;
  monthLabel: string; // e.g. "Jan 2026"
  monthIndex: number; // 0 = oldest
  usage: number; // kWh or cubic meters; for internet, plan amount duplicated
  unit: string; // "kWh" | "m³" | "plan"
  amount: number; // in PHP
  dueDay: number; // day of month due (1-28)
}

export interface PredictionResult {
  utility: Utility;
  predictedUsage: number;
  predictedAmount: number;
  trendPercent: number; // positive = increasing
  confidence: number; // 0-100
  nextDueDate: string; // ISO
  unit: string;
  significantChange: boolean;
}

type Listener = () => void;
const STORAGE_KEY = "tipidpay_bill_history";

const utilityMeta: Record<Utility, { unit: string; icon: string; label: string }> = {
  electricity: { unit: "kWh", icon: "⚡", label: "Electricity" },
  water: { unit: "m³", icon: "💧", label: "Water" },
  internet: { unit: "plan", icon: "📡", label: "Internet" },
};

export function getUtilityMeta(u: Utility) {
  return utilityMeta[u];
}

function seedHistory(): BillEntry[] {
  // Last 3 months: Jan, Feb, Mar 2026
  const months = [
    { label: "Jan 2026", idx: 0 },
    { label: "Feb 2026", idx: 1 },
    { label: "Mar 2026", idx: 2 },
  ];
  const entries: BillEntry[] = [];
  // Electricity: gradually rising
  const elecUsage = [240, 265, 285]; // kWh
  const elecAmounts = [2400, 2650, 2850];
  // Water: stable
  const waterUsage = [12, 13, 13];
  const waterAmounts = [620, 650, 680];
  // Internet: fixed plan
  const netAmounts = [1370, 1370, 1370];

  months.forEach((m, i) => {
    entries.push({
      id: `bh-e-${i}`,
      utility: "electricity",
      monthLabel: m.label,
      monthIndex: m.idx,
      usage: elecUsage[i],
      unit: "kWh",
      amount: elecAmounts[i],
      dueDay: 15,
    });
    entries.push({
      id: `bh-w-${i}`,
      utility: "water",
      monthLabel: m.label,
      monthIndex: m.idx,
      usage: waterUsage[i],
      unit: "m³",
      amount: waterAmounts[i],
      dueDay: 10,
    });
    entries.push({
      id: `bh-i-${i}`,
      utility: "internet",
      monthLabel: m.label,
      monthIndex: m.idx,
      usage: 1, // plan
      unit: "plan",
      amount: netAmounts[i],
      dueDay: 5,
    });
  });
  return entries;
}

function load(): BillEntry[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return seedHistory();
}

let entries: BillEntry[] = load();
const listeners = new Set<Listener>();

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  listeners.forEach((l) => l());
}

function nextMonthDueDate(dueDay: number): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(dueDay, 28));
  return next.toISOString();
}

function predict(utility: Utility): PredictionResult {
  const rows = entries
    .filter((e) => e.utility === utility)
    .sort((a, b) => a.monthIndex - b.monthIndex);

  const meta = utilityMeta[utility];

  if (rows.length === 0) {
    return {
      utility,
      predictedUsage: 0,
      predictedAmount: 0,
      trendPercent: 0,
      confidence: 0,
      nextDueDate: nextMonthDueDate(15),
      unit: meta.unit,
      significantChange: false,
    };
  }

  // Linear trend on amounts
  const amounts = rows.map((r) => r.amount);
  const usages = rows.map((r) => r.usage);
  const n = amounts.length;
  const avgAmount = amounts.reduce((s, a) => s + a, 0) / n;
  const lastAmount = amounts[n - 1];
  const firstAmount = amounts[0];
  const trendPercent = firstAmount > 0 ? ((lastAmount - firstAmount) / firstAmount) * 100 : 0;

  // Predicted = last + avg delta
  let avgDelta = 0;
  for (let i = 1; i < n; i++) avgDelta += amounts[i] - amounts[i - 1];
  avgDelta = n > 1 ? avgDelta / (n - 1) : 0;
  const predictedAmount = Math.max(0, Math.round(lastAmount + avgDelta));

  let avgUsageDelta = 0;
  for (let i = 1; i < n; i++) avgUsageDelta += usages[i] - usages[i - 1];
  avgUsageDelta = n > 1 ? avgUsageDelta / (n - 1) : 0;
  const predictedUsage = Math.max(0, Math.round((usages[n - 1] + avgUsageDelta) * 10) / 10);

  // Confidence: lower variance → higher confidence
  const variance =
    amounts.reduce((s, a) => s + Math.pow(a - avgAmount, 2), 0) / n;
  const stddev = Math.sqrt(variance);
  const cv = avgAmount > 0 ? stddev / avgAmount : 1;
  const confidence = Math.max(50, Math.min(98, Math.round(100 - cv * 200)));

  const significantChange = Math.abs(trendPercent) >= 10;

  const dueDay = rows[n - 1].dueDay;

  return {
    utility,
    predictedUsage,
    predictedAmount,
    trendPercent: Math.round(trendPercent * 10) / 10,
    confidence,
    nextDueDate: nextMonthDueDate(dueDay),
    unit: meta.unit,
    significantChange,
  };
}

export const billHistoryStore = {
  getEntries: () => entries,
  getByUtility(u: Utility) {
    return entries.filter((e) => e.utility === u).sort((a, b) => a.monthIndex - b.monthIndex);
  },
  predictAll(): PredictionResult[] {
    return (Object.keys(utilityMeta) as Utility[]).map(predict);
  },
  predict,
  updateEntry(id: string, patch: Partial<Pick<BillEntry, "usage" | "amount" | "dueDay">>) {
    entries = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    emit();
  },
  resetSeed() {
    entries = seedHistory();
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useBillHistory() {
  return useSyncExternalStore(billHistoryStore.subscribe, billHistoryStore.getEntries);
}
