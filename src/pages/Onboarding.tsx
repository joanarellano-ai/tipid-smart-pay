import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, CreditCard, Users, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: BarChart3,
    title: "Track Your Utilities",
    description: "Monitor electricity, water, and internet usage in one place",
    color: "from-primary to-primary/70",
  },
  {
    icon: Brain,
    title: "AI Predicts Your Bills",
    description: "Get accurate estimates before your bill arrives",
    color: "from-secondary to-secondary/70",
  },
  {
    icon: CreditCard,
    title: "Pay & Split Instantly",
    description: "Pay bills and split costs with roommates seamlessly",
    color: "from-primary to-secondary",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [livingType, setLivingType] = useState<string | null>(null);

  if (step < 3) {
    const s = steps[step];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-hero">
        <div className="w-full max-w-sm text-center animate-fade-in" key={step}>
          <div className={cn("mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg", s.color)}>
            <s.icon className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">{s.title}</h2>
          <p className="mb-10 text-muted-foreground">{s.description}</p>

          <div className="mb-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-2 rounded-full transition-all duration-300", i === step ? "w-8 bg-primary" : "w-2 bg-border")} />
            ))}
          </div>

          <Button variant="hero" size="lg" className="w-full" onClick={() => setStep(step + 1)}>
            {step < 2 ? "Next" : "Let's go"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          <button onClick={() => navigate("/dashboard")} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-hero">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <h2 className="mb-2 text-2xl font-bold text-foreground">How do you live?</h2>
        <p className="mb-8 text-muted-foreground">This helps us personalize your experience</p>

        <div className="space-y-3">
          {[
            { value: "alone", icon: User, label: "I live alone" },
            { value: "roommates", icon: Users, label: "I have roommates" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLivingType(opt.value)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 p-5 transition-all duration-200",
                livingType === opt.value
                  ? "border-primary bg-accent shadow-card"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                livingType === opt.value ? "gradient-primary" : "bg-muted"
              )}>
                <opt.icon className={cn("h-6 w-6", livingType === opt.value ? "text-primary-foreground" : "text-muted-foreground")} />
              </div>
              <span className="font-semibold text-foreground">{opt.label}</span>
            </button>
          ))}
        </div>

        <Button
          variant="hero"
          size="lg"
          className="mt-8 w-full"
          disabled={!livingType}
          onClick={() => navigate("/dashboard")}
        >
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
