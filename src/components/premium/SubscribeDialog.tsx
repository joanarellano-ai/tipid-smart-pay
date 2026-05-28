import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles, ShieldCheck, CreditCard, Smartphone, Loader2 } from "lucide-react";
import { premiumStore, PREMIUM_PRICE_MONTHLY, PREMIUM_PRICE_YEARLY, BillingCycle } from "@/lib/premiumStore";
import { formatPeso } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCycle?: BillingCycle;
}

type Step = "plan" | "pay" | "processing" | "success";
type Method = "GCash" | "Maya" | "Card";

const METHODS: { key: Method; icon: any; sub: string }[] = [
  { key: "GCash", icon: Smartphone, sub: "•••• 4521" },
  { key: "Maya", icon: Smartphone, sub: "•••• 8830" },
  { key: "Card", icon: CreditCard, sub: "Visa •••• 1234" },
];

export default function SubscribeDialog({ open, onOpenChange, defaultCycle = "monthly" }: Props) {
  const [step, setStep] = useState<Step>("plan");
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const [method, setMethod] = useState<Method>("GCash");

  useEffect(() => {
    if (open) {
      setStep("plan");
      setCycle(defaultCycle);
      setMethod("GCash");
    }
  }, [open, defaultCycle]);

  const price = cycle === "monthly" ? PREMIUM_PRICE_MONTHLY : PREMIUM_PRICE_YEARLY;
  const renewLabel = cycle === "monthly" ? "month" : "year";

  const confirmPay = () => {
    setStep("processing");
    // Simulate gateway latency, then activate
    setTimeout(() => {
      premiumStore.upgrade(cycle, method);
      setStep("success");
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step === "processing") return; onOpenChange(v); }}>
      <DialogContent className="max-w-sm overflow-hidden rounded-3xl border-[hsl(var(--gold))]/30 p-0">
        {/* Gold header */}
        <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(220_50%_22%)] to-[hsl(220_55%_14%)] px-5 pt-5 pb-4">
          <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl" />
          <div className="relative flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] shadow">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--gold))]">TipidPay Premium</p>
              <p className="text-sm font-bold text-white">
                {step === "success" ? "You're In!" : step === "processing" ? "Processing payment…" : step === "pay" ? "Confirm payment" : "Choose your plan"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {step === "plan" && (
            <div className="space-y-3 animate-fade-in">
              {(["monthly", "yearly"] as BillingCycle[]).map((c) => {
                const p = c === "monthly" ? PREMIUM_PRICE_MONTHLY : PREMIUM_PRICE_YEARLY;
                const monthly = c === "yearly" ? Math.round(PREMIUM_PRICE_YEARLY / 12) : PREMIUM_PRICE_MONTHLY;
                const save = Math.round((1 - PREMIUM_PRICE_YEARLY / (PREMIUM_PRICE_MONTHLY * 12)) * 100);
                const selected = cycle === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-md"
                        : "border-border bg-card hover:border-[hsl(var(--gold))]/40"
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground capitalize">
                        {c}
                        {c === "yearly" && (
                          <span className="ml-2 rounded-full bg-[hsl(var(--gold))] px-2 py-0.5 text-[9px] font-bold text-[hsl(220_60%_15%)]">
                            SAVE {save}%
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {c === "yearly" ? `≈ ${formatPeso(monthly)}/mo` : "Billed monthly"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-foreground">{formatPeso(p)}</p>
                      <p className="text-[10px] text-muted-foreground">/{c === "monthly" ? "mo" : "yr"}</p>
                    </div>
                  </button>
                );
              })}
              <ul className="mt-2 space-y-1.5 rounded-2xl bg-muted/40 p-3 text-[11px]">
                {["Full AI bill prediction", "Unlimited shared groups", "Auto-pay & PDF exports", "Ad-free experience"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-foreground">
                    <Check className="h-3 w-3 text-[hsl(var(--gold))]" /> {f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => setStep("pay")} className="h-11 w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] font-bold text-[hsl(220_60%_15%)] shadow-md hover:brightness-110">
                Continue — {formatPeso(price)}/{cycle === "monthly" ? "mo" : "yr"}
              </Button>
            </div>
          )}

          {step === "pay" && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl bg-muted/40 p-3">
                <p className="text-[11px] text-muted-foreground">You'll be charged</p>
                <p className="text-2xl font-extrabold text-foreground">{formatPeso(price)}</p>
                <p className="text-[11px] text-muted-foreground">Then renews every {renewLabel} · Cancel anytime</p>
              </div>
              <p className="text-xs font-semibold text-foreground">Payment method</p>
              {METHODS.map((m) => {
                const selected = method === m.key;
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all",
                      selected ? "border-[hsl(var(--primary))] bg-accent" : "border-border bg-card hover:border-[hsl(var(--primary))]/40"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{m.key}</p>
                      <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                    </div>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
              <div className="flex items-center gap-1.5 rounded-xl bg-primary/5 p-2 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-primary" /> Encrypted & PCI-DSS protected
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setStep("plan")}>Back</Button>
                <Button onClick={confirmPay} className="flex-1 rounded-2xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] font-bold text-[hsl(220_60%_15%)]">
                  Pay {formatPeso(price)}
                </Button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-3 py-10 animate-fade-in">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">Securely processing {method}…</p>
              <p className="text-[11px] text-muted-foreground">Do not close this window.</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--gold)/0.4)]" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
              </div>
              <p className="text-lg font-extrabold text-foreground">Welcome to Premium! 🎉</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                All premium features just unlocked. Your subscription renews in {cycle === "monthly" ? "30 days" : "1 year"}.
              </p>
              <div className="flex w-full flex-wrap justify-center gap-1.5 pt-1">
                {["AI Forecasts", "Unlimited Splits", "Auto-Pay", "PDF Export", "No Ads"].map((b) => (
                  <span key={b} className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--gold))]">
                    <Sparkles className="mr-0.5 inline h-2.5 w-2.5" /> {b}
                  </span>
                ))}
              </div>
              <Button onClick={() => onOpenChange(false)} className="mt-2 h-11 w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] font-bold text-[hsl(220_60%_15%)]">
                Start exploring Premium
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
