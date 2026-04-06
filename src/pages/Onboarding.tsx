import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Brain,
  CreditCard,
  Users,
  User,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [livingType, setLivingType] = useState<string | null>(null);

  const totalSteps = 4; // 3 info + 1 preference
  const progressValue = ((step + 1) / totalSteps) * 100;

  /* ── Steps 0-2: feature walkthrough ── */
  if (step < 3) {
    const s = steps[step];
    return (
      <div className="flex min-h-screen flex-col px-6 gradient-hero">
        {/* Progress bar */}
        <div className="pt-6 pb-2">
          <Progress value={progressValue} className="h-1.5 bg-border" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div
            className="w-full max-w-sm text-center animate-fade-in"
            key={step}
          >
            {/* Icon */}
            <div
              className={cn(
                "mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br shadow-xl transition-transform duration-500",
                s.color
              )}
            >
              <s.icon className="h-14 w-14 text-primary-foreground" />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-foreground">
              {s.title}
            </h2>
            <p className="mb-12 text-muted-foreground leading-relaxed">
              {s.description}
            </p>

            {/* Dot indicators */}
            <div className="mb-8 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === step
                      ? "w-8 bg-primary"
                      : i < step
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-border"
                  )}
                />
              ))}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => setStep(step + 1)}
            >
              {step < 2 ? "Next" : "Get Started"}{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 3: living preference ── */
  return (
    <div className="flex min-h-screen flex-col px-6 gradient-hero">
      {/* Progress bar */}
      <div className="pt-6 pb-2">
        <Progress value={progressValue} className="h-1.5 bg-border" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            How do you live?
          </h2>
          <p className="mb-8 text-muted-foreground">
            This helps us personalize your experience
          </p>

          <div className="space-y-3">
            {[
              { value: "alone", icon: User, label: "I live alone" },
              {
                value: "roommates",
                icon: Users,
                label: "I have roommates",
              },
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
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    livingType === opt.value
                      ? "gradient-primary"
                      : "bg-muted"
                  )}
                >
                  <opt.icon
                    className={cn(
                      "h-6 w-6",
                      livingType === opt.value
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <span className="font-semibold text-foreground">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Group actions (shown when roommates selected) */}
          {livingType === "roommates" && (
            <div className="mt-6 space-y-3 animate-fade-in">
              <p className="text-sm font-medium text-foreground">
                Set up your group
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="default"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  <UserPlus className="mr-1 h-4 w-4" /> Create Group
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  <LogIn className="mr-1 h-4 w-4" /> Join Group
                </Button>
              </div>
            </div>
          )}

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
    </div>
  );
}
