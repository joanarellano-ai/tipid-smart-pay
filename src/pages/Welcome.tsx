import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/tipidpay-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-hero">
      <div className="w-full max-w-sm flex flex-col items-center animate-scale-in">
        <img
          src={logo}
          alt="TIPIDPAY logo"
          width={160}
          height={160}
          className="mb-6"
        />

        <p className="mb-10 text-center text-muted-foreground text-base">
          AI-powered utility tracking &amp; bill splitting for modern living.
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
            Create Account <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          By continuing you agree to our Terms of Service &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}
