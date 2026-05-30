import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { TipidPayLogo } from "@/components/brand/TipidPayLogo";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-hero">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center">
          <TipidPayLogo variant="icon" size={72} className="mb-4 drop-shadow-md" />
          <h1 className="text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Login to your TipidPay account</p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                placeholder="Enter your email address"
                type="email"
                className="h-12 rounded-xl pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                className="h-12 rounded-xl pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => toast.info("Password recovery coming soon.")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="font-medium text-primary hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
