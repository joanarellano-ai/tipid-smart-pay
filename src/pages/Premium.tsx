import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles, Zap, Users, BarChart3, Bell, Shield, Palette, Bot, TrendingUp, FileBarChart, X, Calendar, Receipt, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { premiumStore, usePremium, PREMIUM_PRICE_MONTHLY, PREMIUM_PRICE_YEARLY, BillingCycle } from "@/lib/premiumStore";
import { formatPeso } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SubscribeDialog from "@/components/premium/SubscribeDialog";

const premiumFeatures = [
  { icon: Bot, title: "AI Bill Prediction", desc: "Smart 3-month forecasts with confidence scoring" },
  { icon: TrendingUp, title: "Advanced Analytics", desc: "Heatmaps, trends & utility consumption insights" },
  { icon: Zap, title: "Auto-Pay System", desc: "Never miss a due date again" },
  { icon: Users, title: "Unlimited Shared Groups", desc: "Add as many roommates or trip mates as you need" },
  { icon: BarChart3, title: "Smart Budget Planner", desc: "AI-built monthly budgets tuned to your habits" },
  { icon: Sparkles, title: "AI Financial Coach", desc: "Personalized savings tips & weekly check-ins" },
  { icon: FileBarChart, title: "Export Reports", desc: "Download PDF/CSV statements anytime" },
  { icon: Palette, title: "Premium Themes", desc: "Exclusive gold, midnight & aurora skins" },
  { icon: Bell, title: "Real-time Notifications", desc: "Live bill alerts across all devices" },
  { icon: Shield, title: "Priority Support", desc: "Skip the line — answers within 2 hours" },
];

const freeFeatures = [
  "Basic expense tracking",
  "Basic bill monitoring",
  "Up to 3 shared members",
  "Basic reminders",
  "Limited AI insights",
];

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export default function Premium() {
  const navigate = useNavigate();
  const { plan, isPremium, isAdmin, cycle: activeCycle, expiresAt, autoRenew, payments } = usePremium();
  const [cycle, setCycle] = useState<BillingCycle>(activeCycle);
  const [subOpen, setSubOpen] = useState(false);

  const price = cycle === "monthly" ? PREMIUM_PRICE_MONTHLY : PREMIUM_PRICE_YEARLY;
  const monthlyEq = cycle === "yearly" ? Math.round(PREMIUM_PRICE_YEARLY / 12) : PREMIUM_PRICE_MONTHLY;
  const savePct = Math.round((1 - PREMIUM_PRICE_YEARLY / (PREMIUM_PRICE_MONTHLY * 12)) * 100);

  const handleCancel = () => {
    premiumStore.cancel();
    toast.success("Auto-renew turned off", { description: `Premium remains active until ${fmtDate(expiresAt)}.` });
  };
  const handleEndNow = () => {
    premiumStore.endNow();
    toast("Reverted to Free plan", { description: "Your data is preserved." });
  };
  const handleAdminToggle = () => {
    if (isAdmin) {
      premiumStore.setRole("free");
      toast("Admin role removed");
    } else {
      premiumStore.setRole("admin");
      toast.success("Dorm Admin role activated", { description: "Multi-tenant tools unlocked." });
      setTimeout(() => navigate("/admin"), 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--accent)/0.3)] to-[hsl(var(--background))] px-4 pt-12 pb-24">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">TipidPay Premium</h1>
        </div>

        {/* Hero card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(220_50%_22%)] to-[hsl(220_55%_14%)] p-6 shadow-elevated animate-fade-in">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl" />
          <div className="absolute -left-8 -bottom-12 h-40 w-40 rounded-full bg-[hsl(var(--primary-glow)/0.35)] blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <Crown className="h-3 w-3 text-[hsl(var(--gold))]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                {isAdmin ? "Dorm Admin" : isPremium ? "Premium Active" : "Premium"}
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold leading-tight text-white">
              Smarter money,<br />less effort.
            </h2>
            <p className="mb-5 text-sm text-white/75">
              AI forecasts, unlimited splitting, auto-pay and premium insights — built for shared living.
            </p>

            {!isPremium && !isAdmin && (
              <>
                {/* Cycle toggle */}
                <div className="mb-5 inline-flex rounded-full bg-white/10 p-1 backdrop-blur-sm">
                  {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCycle(c)}
                      className={cn(
                        "relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                        cycle === c ? "bg-[hsl(var(--gold))] text-[hsl(220_60%_15%)] shadow-md" : "text-white/80"
                      )}
                    >
                      {c === "monthly" ? "Monthly" : "Yearly"}
                      {c === "yearly" && cycle !== "yearly" && (
                        <span className="ml-1 rounded-full bg-[hsl(var(--gold)/0.25)] px-1.5 text-[9px] font-bold text-[hsl(var(--gold))]">
                          -{savePct}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">{formatPeso(price)}</span>
                  <span className="text-sm text-white/70">/{cycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                {cycle === "yearly" && (
                  <p className="mt-1 text-[11px] text-[hsl(var(--gold))]">
                    ≈ {formatPeso(monthlyEq)}/mo · Save {savePct}%
                  </p>
                )}

                <Button
                  onClick={() => setSubOpen(true)}
                  className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] text-base font-bold text-[hsl(220_60%_15%)] shadow-lg hover:brightness-110"
                >
                  <Crown className="mr-1 h-4 w-4" /> Subscribe — {formatPeso(price)}
                </Button>
              </>
            )}

            {(isPremium || isAdmin) && (
              <div className="mt-2 rounded-2xl border border-[hsl(var(--gold)/0.4)] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold text-white">
                  ✓ {isAdmin ? "Dorm Admin active" : "Premium active"}
                </p>
                {isPremium && (
                  <>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                      <Calendar className="h-3 w-3" /> Renews {fmtDate(expiresAt)} ({activeCycle})
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60">
                      Auto-renew: {autoRenew ? "On" : "Off — ends at renewal date"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subscription management */}
        {(isPremium || isAdmin) && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-card animate-fade-in">
            <h3 className="mb-3 text-sm font-bold text-foreground">Manage subscription</h3>
            <div className="grid grid-cols-2 gap-2">
              {isPremium && autoRenew && (
                <Button variant="outline" className="rounded-xl text-xs" onClick={handleCancel}>
                  Cancel renewal
                </Button>
              )}
              {isPremium && !autoRenew && (
                <Button variant="outline" className="rounded-xl text-xs" onClick={() => premiumStore.upgrade(activeCycle)}>
                  Resume renewal
                </Button>
              )}
              <Button variant="outline" className="rounded-xl text-xs text-destructive hover:text-destructive" onClick={handleEndNow}>
                Downgrade to Free
              </Button>
            </div>

            {/* Payment history */}
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Receipt className="h-3.5 w-3.5" /> Payment history
              </div>
              {payments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No payments yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {payments.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{formatPeso(p.amount)} <span className="font-normal text-muted-foreground">· {p.method}</span></p>
                        <p className="text-[10px] text-muted-foreground">{fmtDate(p.date)} · {p.cycle}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Dorm Admin role */}
        <div className="mb-6 rounded-2xl border border-[hsl(var(--gold))]/30 bg-gradient-to-br from-card to-[hsl(var(--gold)/0.05)] p-4 shadow-card animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(38_70%_42%)]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Dorm Admin Mode</p>
              <p className="text-[11px] text-muted-foreground">Multi-tenant tracking, bulk billing & building analytics.</p>
            </div>
          </div>
          <Button
            onClick={handleAdminToggle}
            variant={isAdmin ? "outline" : "default"}
            className="mt-3 h-9 w-full rounded-xl text-xs"
          >
            {isAdmin ? "Disable Dorm Admin" : "Activate Dorm Admin (Demo)"}
          </Button>
          {isAdmin && (
            <Button onClick={() => navigate("/admin")} className="mt-2 h-9 w-full rounded-xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] text-xs font-bold text-[hsl(220_60%_15%)]">
              Open Admin Dashboard
            </Button>
          )}
        </div>

        {/* Features */}
        <h3 className="mb-3 px-1 text-sm font-bold text-foreground">Premium includes</h3>
        <div className="mb-6 grid grid-cols-1 gap-2 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {premiumFeatures.map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-card transition-all hover:border-[hsl(var(--gold))]/40 hover:shadow-soft"
              style={{ animationDelay: `${0.05 + i * 0.02}s` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold)/0.15)] to-[hsl(var(--primary)/0.1)]">
                <f.icon className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
              <Check className="h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
            </div>
          ))}
        </div>

        {/* Comparison */}
        <h3 className="mb-3 px-1 text-sm font-bold text-foreground">Compare plans</h3>
        <div className="mb-6 grid grid-cols-2 gap-3 animate-fade-in">
          {/* Free */}
          <div className={cn("rounded-2xl border bg-card p-4 shadow-card", plan === "free" && "border-primary")}>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Free</p>
            <p className="my-2 text-2xl font-extrabold text-foreground">₱0</p>
            <p className="mb-3 text-[10px] text-muted-foreground">Forever</p>
            <ul className="space-y-1.5">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-1.5 text-[11px] text-muted-foreground line-through">
                <X className="mt-0.5 h-3 w-3 shrink-0" />
                Ads enabled
              </li>
            </ul>
          </div>
          {/* Premium */}
          <div className={cn("relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-card to-[hsl(var(--gold)/0.06)] p-4 shadow-elevated", isPremium ? "border-[hsl(var(--gold))]" : "border-[hsl(var(--gold))]/60")}>
            <span className="absolute right-2 top-2 rounded-full bg-[hsl(var(--gold))] px-2 py-0.5 text-[9px] font-bold text-[hsl(220_60%_15%)]">
              {isPremium ? "ACTIVE" : "BEST"}
            </span>
            <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--gold))]">Premium</p>
            <p className="my-2 text-2xl font-extrabold text-foreground">₱{monthlyEq}</p>
            <p className="mb-3 text-[10px] text-muted-foreground">per month</p>
            <ul className="space-y-1.5">
              {["Everything in Free", "Full AI prediction", "Unlimited groups", "Auto-pay & exports", "No ads"].map((t) => (
                <li key={t} className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[hsl(var(--gold))]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-4 text-center shadow-card">
          <p className="text-[11px] text-muted-foreground">
            🔒 Cancel anytime · Secure billing · Local Philippine support
          </p>
        </div>
      </div>

      <SubscribeDialog open={subOpen} onOpenChange={setSubOpen} defaultCycle={cycle} />
    </div>
  );
}
