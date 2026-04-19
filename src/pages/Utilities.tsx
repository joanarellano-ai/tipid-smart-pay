import { useState } from "react";
import { monthlyBills, usageTrends, formatPeso } from "@/lib/data";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Electricity", "Water", "Internet"];

export default function Utilities() {
  const [active, setActive] = useState("All");
  const navigate = useNavigate();

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
                    <p className="text-xs text-muted-foreground">March 2026</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">{formatPeso(bill.amount)}</p>
              </div>
              <div className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageTrends}>
                    <Line
                      type="monotone"
                      dataKey={bill.category.toLowerCase()}
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Comparison */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={usageTrends}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px -2px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Bar dataKey="electricity" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="water" fill="hsl(224, 73%, 33%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
