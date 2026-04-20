import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { accountStore } from "@/lib/accountStore";
import { toast } from "sonner";
import {
  BarChart3,
  Brain,
  CreditCard,
  User,
  Users,
  UserPlus,
  LogIn,
  ArrowRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/tipidpay-logo.png";

/* ── Onboarding walkthrough steps ── */
const steps = [
  {
    icon: BarChart3,
    title: "Track your utility usage",
    description:
      "Monitor electricity, water, and internet consumption all in one place.",
    color: "from-primary to-primary/60",
  },
  {
    icon: Brain,
    title: "Predict your bills",
    description:
      "Get AI-powered predictions for your upcoming monthly bills.",
    color: "from-secondary to-secondary/60",
  },
  {
    icon: CreditCard,
    title: "Pay and split easily",
    description:
      "Manage payments and share bills with roommates effortlessly.",
    color: "from-primary to-secondary",
  },
];

/* ── Living-situation options ── */
const livingOptions = [
  {
    value: "alone",
    icon: User,
    label: "I live alone",
    description: "Track and pay your own bills",
  },
  {
    value: "few",
    icon: Users,
    label: "With 1–2 friends",
    description: "Split bills easily between a small group",
  },
  {
    value: "many",
    icon: Home,
    label: "3+ friends / shared house",
    description: "Manage group expenses and shared utilities",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [livingType, setLivingType] = useState<string | null>(null);

  const totalSteps = 4;
  const progressValue = ((step + 1) / totalSteps) * 100;

  /* ── Steps 0-2: feature walkthrough ── */
  if (step < 3) {
    const s = steps[step];
    return (
      <div className="flex min-h-screen flex-col px-6 gradient-hero">
        <div className="pt-6 pb-2">
          <Progress value={progressValue} className="h-1.5 bg-border" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-sm text-center animate-fade-in" key={step}>
            <div
              className={cn(
                "mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br shadow-xl transition-transform duration-500",
                s.color
              )}
            >
              <s.icon className="h-14 w-14 text-primary-foreground" />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-foreground">{s.title}</h2>
            <p className="mb-12 text-muted-foreground leading-relaxed">{s.description}</p>

            <div className="mb-8 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-border"
                  )}
                />
              ))}
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={() => setStep(step + 1)}>
              {step < 2 ? "Next" : "Get Started"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <button
              onClick={() => {
                const next = localStorage.getItem("tipidpay_new_user") === "1" ? "/bill-survey" : "/dashboard";
                navigate(next);
              }}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 3: Living situation ── */
  return (
    <div className="flex min-h-screen flex-col px-6 gradient-hero">
      <div className="pt-6 pb-2">
        <Progress value={progressValue} className="h-1.5 bg-border" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Header */}
          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="TIPIDPAY"
              width={48}
              height={48}
              className="mx-auto mb-4 drop-shadow-md"
            />
            <h2 className="text-2xl font-bold text-foreground">
              Welcome to TIPIDPAY!
            </h2>
            <p className="mt-1 text-muted-foreground">
              Let's personalize your experience
            </p>
          </div>

          {/* Question */}
          <p className="mb-4 text-sm font-medium text-foreground text-center">
            Do you live alone or with friends / roommates?
          </p>

          {/* Selection cards */}
          <div className="space-y-3">
            {livingOptions.map((opt) => {
              const selected = livingType === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setLivingType(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                    selected
                      ? "border-primary bg-accent shadow-card scale-[1.02]"
                      : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                      selected ? "gradient-primary" : "bg-muted"
                    )}
                  >
                    <opt.icon
                      className={cn(
                        "h-6 w-6 transition-colors duration-200",
                        selected ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-semibold text-foreground">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group actions for roommate options */}
          {(livingType === "few" || livingType === "many") && (
            <div className="mt-5 space-y-3 animate-fade-in">
              <p className="text-sm font-medium text-foreground text-center">
                Set up your group
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="default" className="flex-1" onClick={() => {
                  accountStore.setMode("group");
                  accountStore.setGroupName("My Group");
                  toast.success("Group created");
                  const next = localStorage.getItem("tipidpay_new_user") === "1" ? "/bill-survey" : "/dashboard";
                  navigate(next);
                }}>
                  <UserPlus className="mr-1 h-4 w-4" /> Create Group
                </Button>
                <Button variant="outline" size="default" className="flex-1" onClick={() => {
                  accountStore.setMode("group");
                  toast.success("Joined group");
                  const next = localStorage.getItem("tipidpay_new_user") === "1" ? "/bill-survey" : "/dashboard";
                  navigate(next);
                }}>
                  <LogIn className="mr-1 h-4 w-4" /> Join Group
                </Button>
              </div>
            </div>
          )}

          {/* Continue */}
          <Button
            variant="hero"
            size="lg"
            className="mt-8 w-full"
            disabled={!livingType}
            onClick={() => {
              const mode = livingType === "alone" ? "solo" : "group";
              accountStore.setMode(mode);
              toast.success(mode === "solo" ? "Solo mode activated" : "Group mode activated");
              const next = localStorage.getItem("tipidpay_new_user") === "1" ? "/bill-survey" : "/dashboard";
              navigate(next);
            }}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          {/* Footer tip */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            This helps us suggest the best way to split bills and manage payments
          </p>
        </div>
      </div>
    </div>
  );
}
