import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/tipidpay-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-6 py-12 gradient-hero">
      {/* Spacer */}
      <div />

      {/* Center content */}
      <div className="w-full max-w-sm flex flex-col items-center animate-scale-in">
        <img
          src={logo}
          alt="TIPIDPAY logo"
          width={120}
          height={120}
          className="mb-4 drop-shadow-lg"
        />

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">
          TIPIDPAY
        </h1>

        <p className="mb-10 text-center text-muted-foreground text-sm leading-relaxed max-w-xs">
          AI-powered app that helps you track utility usage, predict bills, and manage payments easily. Stay in control and save smarter every month.
        </p>

        <div className="w-full space-y-3">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/onboarding")}
          >
            Sign Up <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
        Manage your bills smarter 💡
      </p>
    </div>
  );
}
