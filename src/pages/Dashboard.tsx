import { TrendingUp, TrendingDown, ArrowRight, Zap, CreditCard, Users, Lightbulb, AlertTriangle, Clock, Sparkles, History, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPeso, alerts } from "@/lib/data";
import { useUser } from "@/lib/userStore";

function greetingForHour(h: number): string {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
import { useAccount } from "@/lib/accountStore";
import { billHistoryStore, useBillHistory, getUtilityMeta } from "@/lib/billHistoryStore";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import NotificationBell from "@/components/NotificationBell";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { usePremium } from "@/lib/premiumStore";
import { Crown } from "lucide-react";
import { useMemo } from "react";

function PremiumBadge() {
  const { isPremium } = usePremium();
  if (!isPremium) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] px-2 py-0.5 text-[9px] font-bold text-[hsl(220_60%_15%)] shadow-sm">
      <Crown className="h-2.5 w-2.5" /> PRO
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const account = useAccount();
  const entries = useBillHistory();
  const displayName = user.fullName || currentUser.name;
  const isSolo = account.mode === "solo";

  // Compute current month total from latest entries + predictions
  const { thisMonthTotal, predictions, chartData } = useMemo(() => {
    const preds = billHistoryStore.predictAll();
    const latestByUtil = (["electricity", "water", "internet"] as const).map((u) => {
      const rows = billHistoryStore.getByUtility(u);
      return rows[rows.length - 1];
    }).filter(Boolean);
    const total = latestByUtil.reduce((s, e) => s + e.amount, 0);

    // Build chart data from history months
    const months = ["Jan", "Feb", "Mar"];
    const chart = months.map((m, idx) => {
      const e = entries.filter((x) => x.monthIndex === idx);
      return {
        month: m,
        electricity: e.find((x) => x.utility === "electricity")?.amount ?? 0,
        water: e.find((x) => x.utility === "water")?.amount ?? 0,
      };
    });
    return { thisMonthTotal: total, predictions: preds, chartData: chart };
  }, [entries]);

  const totalPredicted = predictions.reduce((s, p) => s + (p.predictedAmount || 0), 0);
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((s, p) => s + (p.confidence || 0), 0) / predictions.length)
    : 0;
  const trend = thisMonthTotal > 0 ? Math.round(((totalPredicted - thisMonthTotal) / thisMonthTotal) * 100) : 0;

  const quickActions = isSolo
    ? [
        { icon: CreditCard, label: "Pay Bill", path: "/wallet" },
        { icon: History, label: "History", path: "/bill-history" },
        { icon: Zap, label: "Utilities", path: "/utilities" },
        { icon: Clock, label: "Reminders", path: "/reminders" },
      ]
    : [
        { icon: CreditCard, label: "Pay Bill", path: "/wallet" },
        { icon: Users, label: "Split Bill", path: "/bills" },
        { icon: Zap, label: "Utilities", path: "/utilities" },
        { icon: Clock, label: "Reminders", path: "/reminders" },
      ];

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">Good morning,</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{displayName.split(" ")[0]} 👋</h1>
              <PremiumBadge />
            </div>
            <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {isSolo ? "🏠 Solo Mode" : `👥 ${account.groupName}`}
            </span>
          </div>
          <NotificationBell />
        </div>

        {/* Premium Banner */}
        <PremiumBanner />

        {/* Alerts — only when user has bill data */}
        {entries.length > 0 && (
          <div className="mb-5 space-y-2 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
                  a.type === "warning" ? "bg-warning/10 text-warning" : "bg-accent text-accent-foreground"
                }`}
              >
                {a.type === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total Bill Card / Empty state */}
        {entries.length === 0 ? (() => {
          const trackMode = localStorage.getItem("tipidpay_track_mode") === "1";
          return (
            <div className="mb-5 rounded-2xl border border-dashed border-border bg-card p-5 text-center shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-1 text-base font-bold text-foreground">
                {trackMode ? "Tracking mode active" : "Predictions locked"}
              </h3>
              <p className="mb-4 text-xs text-muted-foreground">
                {trackMode
                  ? "Add at least 1 bill with payment status to unlock predictions and analytics."
                  : "Complete the 3-month bill survey to unlock smart forecasts."}
              </p>
              <button
                onClick={() => navigate(trackMode ? "/reminders" : "/bill-survey")}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                {trackMode ? "Add a bill" : "Take the bill survey"}
              </button>
            </div>
          );
        })() : (
          <div className="mb-5 rounded-2xl gradient-primary p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <p className="mb-1 text-sm text-primary-foreground/70">This Month's Total</p>
            <p className="mb-4 text-3xl font-extrabold text-primary-foreground animate-count-up">
              {formatPeso(thisMonthTotal)}
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/bill-history")}
                className="flex items-center gap-1 rounded-lg bg-primary-foreground/15 px-2.5 py-1 text-xs text-primary-foreground hover:bg-primary-foreground/25 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Predicted: {formatPeso(totalPredicted)} ({trend >= 0 ? "+" : ""}{trend}%)
              </button>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] text-primary-foreground">
                {avgConfidence}% confidence
              </span>
            </div>
            {entries.length < 9 && (
              <p className="mt-3 rounded-lg bg-primary-foreground/10 px-2.5 py-1.5 text-[10px] text-primary-foreground/90">
                ⚠ Partial data — accuracy will improve as more bills are added.
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-5 grid grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-card transition-all duration-200 hover:shadow-soft active:scale-95"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                <a.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Vacation / Group Trips */}
        <button
          onClick={() => navigate("/trips")}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card transition-all hover:shadow-soft active:scale-[0.99] animate-fade-in"
          style={{ animationDelay: "0.18s" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Vacation & Group Expenses</p>
            <p className="text-[11px] text-muted-foreground">Plan trips, split fairly, settle smart</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Usage Chart — only when user has bill data */}
        {entries.length > 0 && (
          <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Usage Trends</h3>
              <button onClick={() => navigate("/analytics")} className="text-xs text-primary hover:underline">
                See all <ArrowRight className="inline h-3 w-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 16px -2px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="electricity" stroke="hsl(160, 84%, 39%)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="water" stroke="hsl(224, 73%, 33%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bills Breakdown */}
        {entries.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">This Month's Bills</h3>
              <button onClick={() => navigate("/bill-history")} className="text-xs text-primary hover:underline">
                History →
              </button>
            </div>
            {predictions.map((p) => {
              const meta = getUtilityMeta(p.utility);
              const rows = billHistoryStore.getByUtility(p.utility);
              const latest = rows[rows.length - 1];
              const trend = p.trendPercent;
              return (
                <button
                  key={p.utility}
                  onClick={() => navigate("/bill-history")}
                  className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-soft active:scale-[0.99]"
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{meta.label}</p>
                    <p className="text-sm text-muted-foreground">{formatPeso(latest?.amount ?? 0)}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? "text-destructive" : trend < 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {trend > 0 ? "+" : ""}{trend}%
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
