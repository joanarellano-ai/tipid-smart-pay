import { useNavigate } from "react-router-dom";
import { Building2, Users, Zap, BarChart3, ArrowLeft, Crown, Bell, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/lib/premiumStore";
import { formatPeso } from "@/lib/data";

const tenants = [
  { id: "t1", name: "Room 101 — Lopez", kwh: 142, dueAmt: 1820, status: "Paid" as const },
  { id: "t2", name: "Room 102 — Cruz", kwh: 188, dueAmt: 2310, status: "Pending" as const },
  { id: "t3", name: "Room 103 — Reyes", kwh: 96, dueAmt: 1240, status: "Overdue" as const },
  { id: "t4", name: "Room 104 — Santos", kwh: 215, dueAmt: 2640, status: "Pending" as const },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = usePremium();

  if (!isAdmin) {
    return (
      <div className="px-4 pt-14 pb-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard locked</h1>
          <p className="mb-5 text-sm text-muted-foreground">Requires a Dorm Admin subscription.</p>
          <Button className="rounded-xl" onClick={() => navigate("/premium")}>
            <Crown className="mr-1 h-4 w-4" /> View plans
          </Button>
        </div>
      </div>
    );
  }

  const totalCollected = tenants.filter((t) => t.status === "Paid").reduce((s, t) => s + t.dueAmt, 0);
  const totalPending = tenants.filter((t) => t.status !== "Paid").reduce((s, t) => s + t.dueAmt, 0);
  const totalKwh = tenants.reduce((s, t) => s + t.kwh, 0);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center gap-2 animate-fade-in">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-card shadow-card">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--gold))]">Dorm Admin</p>
            <h1 className="text-lg font-bold text-foreground">Building Overview</h1>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-4 grid grid-cols-3 gap-2 animate-fade-in">
          <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(220_50%_22%)] p-3 text-white shadow-card">
            <p className="text-[10px] opacity-80">Collected</p>
            <p className="text-base font-extrabold">{formatPeso(totalCollected)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="text-[10px] text-muted-foreground">Pending</p>
            <p className="text-base font-extrabold text-warning">{formatPeso(totalPending)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="text-[10px] text-muted-foreground">Total kWh</p>
            <p className="text-base font-extrabold text-foreground">{totalKwh}</p>
          </div>
        </div>

        {/* Tools */}
        <div className="mb-4 grid grid-cols-2 gap-2 animate-fade-in">
          {[
            { icon: Bell, label: "Send Reminders" },
            { icon: BarChart3, label: "Admin Analytics" },
            { icon: Zap, label: "Bulk Billing" },
            { icon: TrendingUp, label: "Forecast Tools" },
          ].map((t) => (
            <button key={t.label} className="flex items-center gap-2 rounded-2xl bg-card p-3 text-left shadow-card hover:shadow-soft active:scale-[0.99]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                <t.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tenants */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Tenants ({tenants.length})</h3>
          <span className="text-[11px] text-muted-foreground"><Users className="mr-1 inline h-3 w-3" />Live</span>
        </div>
        <div className="space-y-2 animate-fade-in">
          {tenants.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.kwh} kWh · {formatPeso(t.dueAmt)}</p>
              </div>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[10px] font-bold " +
                  (t.status === "Paid"
                    ? "bg-primary/10 text-primary"
                    : t.status === "Overdue"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning")
                }
              >
                {t.status}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
