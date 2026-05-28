import { spendingBreakdown, savingsTrend, totalBill, formatPeso } from "@/lib/data";
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar } from "recharts";
import { TrendingDown, Target, Leaf, Lock, Sparkles, Bot, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBillHistory } from "@/lib/billHistoryStore";
import { useWallet } from "@/lib/walletStore";
import { Button } from "@/components/ui/button";
import { usePremium, hasFeature } from "@/lib/premiumStore";
import { LockedFeature } from "@/components/premium/PremiumBanner";
import { toast } from "sonner";

const budgetLimit = 6000;

export default function Analytics() {
  const navigate = useNavigate();
  const billHistory = useBillHistory();
  const wallet = useWallet();
  const { plan } = usePremium();
  const advancedUnlocked = hasFeature(plan, "advancedAnalytics");
  const canExport = hasFeature(plan, "exportReports");
  const trackedCount = wallet.reminders.filter((r) => r.tracked).length;
  const hasData = billHistory.length > 0 || trackedCount > 0;
  const trackMode = typeof window !== "undefined" && localStorage.getItem("tipidpay_track_mode") === "1";

  if (!hasData) {
    return (
      <div className="px-4 pt-14 pb-4">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-1 text-xl font-bold text-foreground animate-fade-in">Analytics</h1>
          <p className="mb-5 text-sm text-muted-foreground animate-fade-in">Your spending insights</p>

          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-card animate-fade-in">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mb-1 text-base font-bold text-foreground">Analytics locked</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {trackMode
                ? "Add at least 1 bill with payment status to unlock analytics."
                : "Take the bill survey or start tracking bills to see insights."}
            </p>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl" onClick={() => navigate(trackMode ? "/reminders" : "/bill-survey")}>
                {trackMode ? "Add a bill" : "Take the survey"}
              </Button>
              {!trackMode && (
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/reminders")}>
                  Track bills
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const budgetPercent = Math.round((totalBill / budgetLimit) * 100);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-bold text-foreground animate-fade-in">Analytics</h1>
        <p className="mb-5 text-sm text-muted-foreground animate-fade-in">Your spending insights</p>

        {trackMode && trackedCount < 3 && (
          <div className="mb-4 rounded-2xl bg-accent p-3 text-xs text-accent-foreground animate-fade-in">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
            System is learning from your bill tracking. Add more data to improve accuracy.
          </div>
        )}

        {/* Spending Breakdown */}
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Spending Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={spendingBreakdown} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={3}>
                  {spendingBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {spendingBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: s.fill }} />
                  <span className="text-sm text-muted-foreground">{s.name}</span>
                  <span className="ml-auto text-sm font-medium text-foreground">{formatPeso(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Tracker */}
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Budget</h3>
            </div>
            <span className="text-sm text-muted-foreground">{formatPeso(totalBill)} / {formatPeso(budgetLimit)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-700"
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{Math.max(0, 100 - budgetPercent)}% remaining this month</p>
        </div>

        {/* Savings Trend */}
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Savings Trend</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingDown className="h-3 w-3" /> +₱350 this month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={savingsTrend}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px -2px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Bar dataKey="saved" radius={[6, 6, 0, 0]}>
                {savingsTrend.map((entry, i) => (
                  <Cell key={i} fill={entry.saved >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Eco Impact */}
        <div className="rounded-2xl gradient-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="mb-3 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Eco Impact</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">You reduced energy usage by 10% this month 🌱</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-card/60 p-3">
              <span className="text-muted-foreground">💡 Switch to LED bulbs</span>
              <span className="text-xs font-medium text-primary">Save ~₱200/mo</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-card/60 p-3">
              <span className="text-muted-foreground">🔌 Unplug idle devices</span>
              <span className="text-xs font-medium text-primary">Save ~₱150/mo</span>
            </div>
          </div>
        </div>

        {/* Premium-gated: AI Financial Coach */}
        <div className="mt-5">
          {advancedUnlocked ? (
            <div className="rounded-2xl border border-[hsl(var(--gold))]/30 bg-gradient-to-br from-card to-[hsl(var(--gold)/0.05)] p-5 shadow-card animate-fade-in">
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-5 w-5 text-[hsl(var(--gold))]" />
                <h3 className="font-semibold text-foreground">AI Financial Coach</h3>
                <span className="ml-auto rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[9px] font-bold uppercase text-[hsl(var(--gold))]">PRO</span>
              </div>
              <p className="text-sm text-muted-foreground">Your electricity spend is trending 12% above your 3-month average. Try shifting AC use to off-peak (10 PM–6 AM) to save an estimated ₱420 next month.</p>
            </div>
          ) : (
            <LockedFeature
              title="AI Financial Coach"
              description="Personalized weekly insights powered by your bill patterns. Premium only."
            >
              <div className="p-5">
                <div className="mb-3 h-4 w-3/4 rounded bg-muted" />
                <div className="mb-2 h-3 w-full rounded bg-muted" />
                <div className="mb-2 h-3 w-5/6 rounded bg-muted" />
                <div className="h-3 w-4/6 rounded bg-muted" />
              </div>
            </LockedFeature>
          )}
        </div>

        {/* Export reports */}
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-2xl"
          onClick={() => {
            if (!canExport) {
              toast.error("PDF export is a Premium feature", { action: { label: "Upgrade", onClick: () => navigate("/premium") } });
              return;
            }
            toast.success("Report exported", { description: "Your PDF is being prepared." });
          }}
        >
          <FileBarChart className="mr-1 h-4 w-4" />
          Export PDF report
          {!canExport && <Lock className="ml-2 h-3 w-3 text-[hsl(var(--gold))]" />}
        </Button>
      </div>
    </div>
  );
}
