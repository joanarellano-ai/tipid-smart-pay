import { Bell, TrendingUp, TrendingDown, ArrowRight, Zap, CreditCard, Users, Lightbulb, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { currentUser, totalBill, predictedBill, monthlyBills, alerts, formatPeso } from "@/lib/data";
import { useUser } from "@/lib/userStore";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { usageTrends } from "@/lib/data";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const displayName = user.fullName || currentUser.name;

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">Good morning,</p>
            <h1 className="text-xl font-bold text-foreground">{displayName.split(" ")[0]} 👋</h1>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          </button>
        </div>

        {/* Alerts */}
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

        {/* Total Bill Card */}
        <div className="mb-5 rounded-2xl gradient-primary p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="mb-1 text-sm text-primary-foreground/70">Total Monthly Bill</p>
          <p className="mb-4 text-3xl font-extrabold text-primary-foreground animate-count-up">
            {formatPeso(totalBill)}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-primary-foreground/15 px-2.5 py-1 text-xs text-primary-foreground">
              <TrendingUp className="h-3 w-3" />
              AI Predicted: {formatPeso(predictedBill.amount)} (+{predictedBill.change}%)
            </div>
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] text-primary-foreground">
              {predictedBill.confidence}% confidence
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-5 grid grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {[
            { icon: CreditCard, label: "Pay Bill", path: "/wallet" },
            { icon: Users, label: "Split Bill", path: "/bills" },
            { icon: Zap, label: "Add Bill", path: "/utilities" },
            { icon: Clock, label: "Reminders", path: "/reminders" },
          ].map((a) => (
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

        {/* Usage Chart */}
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Usage Trends</h3>
            <button onClick={() => navigate("/analytics")} className="text-xs text-primary hover:underline">
              See all <ArrowRight className="inline h-3 w-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={usageTrends}>
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

        {/* Bills Breakdown */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <h3 className="font-semibold text-foreground">This Month's Bills</h3>
          {monthlyBills.map((bill) => (
            <div key={bill.category} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
              <span className="text-2xl">{bill.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{bill.category}</p>
                <p className="text-sm text-muted-foreground">{formatPeso(bill.amount)}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${bill.trend > 0 ? "text-destructive" : bill.trend < 0 ? "text-primary" : "text-muted-foreground"}`}>
                {bill.trend > 0 ? <TrendingUp className="h-3 w-3" /> : bill.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                {bill.trend > 0 ? "+" : ""}{bill.trend}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
