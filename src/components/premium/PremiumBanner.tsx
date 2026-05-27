import { Crown, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "@/lib/premiumStore";

export function PremiumBanner() {
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  if (isPremium) {
    return (
      <button
        onClick={() => navigate("/premium")}
        className="group relative mb-5 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[hsl(var(--gold))]/30 bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-card to-[hsl(var(--gold)/0.12)] p-4 text-left shadow-card transition-all hover:shadow-elevated active:scale-[0.99] animate-fade-in"
      >
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[hsl(var(--gold)/0.18)] blur-2xl" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary))] shadow-md">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div className="relative flex-1">
          <p className="text-sm font-bold text-foreground">TipidPay Premium</p>
          <p className="text-[11px] text-muted-foreground">Active · All features unlocked</p>
        </div>
        <span className="relative rounded-full bg-[hsl(var(--gold)/0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[hsl(var(--gold))]">
          Active
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/premium")}
      className="group relative mb-5 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[hsl(var(--gold))]/40 bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.92)] to-[hsl(220_45%_18%)] p-4 text-left shadow-elevated transition-all hover:shadow-lg active:scale-[0.99] animate-fade-in"
    >
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--gold)/0.25)] blur-3xl" />
      <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-[hsl(var(--primary-glow)/0.3)] blur-2xl" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] shadow-lg">
        <Crown className="h-6 w-6 text-white" />
      </div>
      <div className="relative flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-white">Upgrade to Premium</p>
          <Sparkles className="h-3 w-3 text-[hsl(var(--gold))]" />
        </div>
        <p className="text-[11px] text-white/75">Unlock AI forecasts · Unlimited groups · No ads</p>
      </div>
      <div className="relative flex items-center gap-1 rounded-full bg-[hsl(var(--gold))] px-3 py-1.5 text-[11px] font-bold text-[hsl(220_60%_15%)] shadow-md">
        ₱149/mo
        <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

interface LockedFeatureProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function LockedFeature({ title, description, children }: LockedFeatureProps) {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {children && (
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-card via-card/95 to-card/70 p-5 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary))] shadow-md">
          <Lock className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="max-w-xs text-[11px] text-muted-foreground">{description}</p>
        <button
          onClick={() => navigate("/premium")}
          className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(38_70%_42%)] px-3 py-1.5 text-[11px] font-bold text-[hsl(220_60%_15%)] shadow-md transition-transform hover:scale-105"
        >
          <Crown className="h-3 w-3" /> Unlock with Premium
        </button>
      </div>
    </div>
  );
}
