import { useMemo, useState } from "react";
import { formatPeso } from "@/lib/data";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { History, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBillHistory, getUtilityMeta } from "@/lib/billHistoryStore";

const categories = ["All", "Electricity", "Water", "Internet"] as const;
type Category = typeof categories[number];
type Utility = "electricity" | "water" | "internet";

export default function Utilities() {
  const [active, setActive] = useState<Category>("All");
  const navigate = useNavigate();
  const entries = useBillHistory();
  const hasData = entries.length > 0;

  const monthlyBills = useMemo(() => {
    return (["electricity", "water", "internet"] as Utility[]).map((u) => {
      const rows = entries.filter((e) => e.utility === u);
      const latest = rows[rows.length - 1];
      const meta = getUtilityMeta(u);
      return {
        category: meta.label,
        utility: u,
        icon: meta.icon,
        amount: latest?.amount ?? 0,
      };
    });
  }, [entries]);

  const usageTrends = useMemo(() => {
    const months = ["Jan", "Feb", "Mar"];
    return months.map((m, idx) => {
      const e = entries.filter((x) => x.monthIndex === idx);
      return {
        month: m,
        electricity: e.find((x) => x.utility === "electricity")?.amount ?? 0,
        water: e.find((x) => x.utility === "water")?.amount ?? 0,
        internet: e.find((x) => x.utility === "internet")?.amount ?? 0,
      };
    });
  }, [entries]);

  const filtered = active === "All" ? monthlyBills : monthlyBills.filter((b) => b.category === active);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground">Utility Tracking</h1>
            <p className="text-sm text-muted-foreground">Monitor your consumption</p>
          </div>
          <Button variant="soft" size="sm" onClick={() => navigate("/bill-history")}>
            <History className="mr-1 h-4 w-4" /> History
          </Button>
        </div>

        {!hasData && (
          <div className="mb-5 rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-card animate-fade-in">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mb-1 text-base font-bold text-foreground">No utility data available yet</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Complete setup or add your first utility record to start tracking.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl" onClick={() => navigate("/bill-survey")}>
                Complete Setup
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/reminders")}>
                <Plus className="mr-1 h-4 w-4" /> Add Entry
              </Button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                active === c ? "gradient-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="mb-5 space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {filtered.map((bill) => (
            <div key={bill.category} className="rounded-2xl bg-card p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bill.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{bill.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {hasData ? "Latest entry" : "No data yet"}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground num">{formatPeso(bill.amount)}</p>
              </div>
              {hasData ? (
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageTrends}>
                      <Line
                        type="monotone"
                        dataKey={bill.utility}
                        stroke="hsl(160, 84%, 39%)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[80px] items-center justify-center rounded-xl bg-muted/40 text-[11px] text-muted-foreground">
                  Add your first record to see usage trends
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Monthly Comparison */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Monthly Comparison</h3>
          {hasData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={usageTrends}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px -2px rgba(0,0,0,0.08)", fontSize: 12 }} />
                <Bar dataKey="electricity" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="water" fill="hsl(224, 73%, 33%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[180px] flex-col items-center justify-center rounded-xl bg-muted/30 text-center">
              <p className="text-sm font-medium text-foreground">No spending insights available</p>
              <p className="mt-1 text-xs text-muted-foreground">Add at least one bill to compare months.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
