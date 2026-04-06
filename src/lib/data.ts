// Simulated data for TIPIDPAY

export const currentUser = {
  name: "Alex Santos",
  avatar: "",
  walletBalance: 4250.0,
  groupName: "Unit 7B Crew",
};

export const roommates = [
  { id: "1", name: "Alex Santos", avatar: "", paid: true, amount: 1225 },
  { id: "2", name: "Mia Cruz", avatar: "", paid: true, amount: 1225 },
  { id: "3", name: "Jake Reyes", avatar: "", paid: false, amount: 1225 },
  { id: "4", name: "Sam Lim", avatar: "", paid: false, amount: 1225 },
];

export const monthlyBills = [
  { category: "Electricity", amount: 2850, icon: "⚡", trend: +8, color: "primary" as const },
  { category: "Water", amount: 680, icon: "💧", trend: -3, color: "info" as const },
  { category: "Internet", amount: 1370, icon: "📡", trend: 0, color: "secondary" as const },
];

export const totalBill = monthlyBills.reduce((s, b) => s + b.amount, 0);

export const predictedBill = {
  amount: 5280,
  change: +8,
  confidence: 87,
};

export const usageTrends = [
  { month: "Oct", electricity: 2400, water: 620, internet: 1370 },
  { month: "Nov", electricity: 2650, water: 650, internet: 1370 },
  { month: "Dec", electricity: 2900, water: 700, internet: 1370 },
  { month: "Jan", electricity: 2750, water: 680, internet: 1370 },
  { month: "Feb", electricity: 2600, water: 660, internet: 1370 },
  { month: "Mar", electricity: 2850, water: 680, internet: 1370 },
];

export const transactions = [
  { id: "1", label: "Electricity - March", amount: -2850, date: "Mar 15", type: "bill" as const },
  { id: "2", label: "Wallet Top-up", amount: 5000, date: "Mar 12", type: "topup" as const },
  { id: "3", label: "Water - March", amount: -680, date: "Mar 10", type: "bill" as const },
  { id: "4", label: "Mia paid share", amount: 1225, date: "Mar 8", type: "received" as const },
  { id: "5", label: "Internet - March", amount: -1370, date: "Mar 5", type: "bill" as const },
];

export const alerts = [
  { type: "warning" as const, message: "Your electricity may increase by 12% next month" },
  { type: "success" as const, message: "You saved ₱350 this month vs last month!" },
];

export const badges = [
  { id: "1", name: "Energy Saver", icon: "🌱", earned: true, description: "Reduced energy 10%" },
  { id: "2", name: "Bill Splitter", icon: "🤝", earned: true, description: "Split 5 bills" },
  { id: "3", name: "Early Bird", icon: "🐦", earned: false, description: "Pay before due date 3x" },
  { id: "4", name: "Eco Warrior", icon: "🌍", earned: false, description: "3 months of savings" },
];

export const spendingBreakdown = [
  { name: "Electricity", value: 2850, fill: "hsl(160, 84%, 39%)" },
  { name: "Water", value: 680, fill: "hsl(224, 73%, 33%)" },
  { name: "Internet", value: 1370, fill: "hsl(38, 92%, 50%)" },
];

export const savingsTrend = [
  { month: "Oct", saved: 120 },
  { month: "Nov", saved: 200 },
  { month: "Dec", saved: -50 },
  { month: "Jan", saved: 180 },
  { month: "Feb", saved: 280 },
  { month: "Mar", saved: 350 },
];

export function formatPeso(amount: number): string {
  return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
