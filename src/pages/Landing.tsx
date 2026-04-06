import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, CreditCard, Shield, TrendingDown, Users } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-hero px-6 pt-16 pb-20">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TIPIDPAY</span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-foreground animate-fade-in">
            Smart bills.{" "}
            <span className="text-gradient">Split easy.</span>
            <br />
            Save more.
          </h1>

          <p className="mb-8 text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            AI-powered utility tracking and bill splitting for modern living. Know what you'll pay before you pay it.
          </p>

          <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")} className="flex-1">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")} className="flex-1">
              Log In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-lg space-y-4">
          {[
            { icon: Brain, title: "AI Bill Prediction", desc: "Know next month's bill before it arrives" },
            { icon: Users, title: "Smart Splitting", desc: "Split bills with roommates effortlessly" },
            { icon: TrendingDown, title: "Save More", desc: "AI insights to reduce your utility costs" },
            { icon: Shield, title: "Secure Payments", desc: "Pay bills instantly from your wallet" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl bg-card p-5 shadow-card animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-lg rounded-2xl gradient-primary p-8 text-center">
          <CreditCard className="mx-auto mb-4 h-10 w-10 text-primary-foreground/80" />
          <h2 className="mb-2 text-2xl font-bold text-primary-foreground">Ready to save?</h2>
          <p className="mb-6 text-primary-foreground/80">Join thousands of smart renters already using TIPIDPAY</p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          >
            Start Free <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
