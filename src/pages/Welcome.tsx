import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TipidPayLogo } from "@/components/brand/TipidPayLogo";


export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-6 py-12 gradient-hero">
      {/* Spacer */}
      <div />

      {/* Center content */}
      <div className="w-full max-w-sm flex flex-col items-center animate-scale-in">
        <TipidPayLogo variant="icon" size={104} className="mb-5 drop-shadow-lg" />
        <div className="mb-2">
          <TipidPayLogo variant="wordmark" size={56} />
        </div>


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
            onClick={() => navigate("/signup")}
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
