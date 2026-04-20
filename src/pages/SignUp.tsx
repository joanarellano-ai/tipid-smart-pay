import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { userStore } from "@/lib/userStore";
import logo from "@/assets/tipidpay-logo.png";
import { cn } from "@/lib/utils";

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(values: { fullName: string; email: string; password: string; confirmPassword: string }): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.fullName.trim();
  if (!name) errors.fullName = "Full name is required";
  else if (name.length > 100) errors.fullName = "Name must be under 100 characters";

  const email = values.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  else if (email.length > 255) errors.email = "Email must be under 255 characters";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8) errors.password = "Minimum 8 characters";

  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (values.password && values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const errors = useMemo(
    () => validate({ fullName, email, password, confirmPassword }),
    [fullName, email, password, confirmPassword]
  );

  const isValid = Object.keys(errors).length === 0;

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    // Mark as new user BEFORE stores initialize so wallet & bill history start empty
    localStorage.setItem("tipidpay_new_user", "1");
    localStorage.removeItem("tipidpay_wallet");
    localStorage.removeItem("tipidpay_bill_history");

    // Simulate network request
    await new Promise((r) => setTimeout(r, 1500));

    userStore.set({ fullName: fullName.trim(), email: email.trim() });
    setLoading(false);
    toast.success("Account created successfully!", { description: `Welcome, ${fullName.trim()}! Your wallet starts at ₱0.` });
    navigate("/onboarding");
  };

  const showError = (field: keyof FieldErrors) => touched[field] && errors[field];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-hero">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Back */}
        <button
          onClick={() => navigate("/welcome")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="TIPIDPAY logo" width={64} height={64} className="mb-3 drop-shadow-md" />
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join TIPIDPAY and start saving</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => touch("fullName")}
                className={cn("h-12 rounded-xl pl-10", showError("fullName") && "border-destructive")}
                maxLength={100}
              />
            </div>
            {showError("fullName") && (
              <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Work Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch("email")}
                className={cn("h-12 rounded-xl pl-10", showError("email") && "border-destructive")}
                maxLength={255}
              />
            </div>
            {showError("email") && (
              <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                className={cn("h-12 rounded-xl pl-10 pr-10", showError("password") && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {showError("password") && (
              <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.password}</p>
            )}
            {/* Password strength hints */}
            {touched.password && password.length > 0 && (
              <div className="mt-2 space-y-1 animate-fade-in">
                {passwordRules.map((rule) => {
                  const pass = rule.test(password);
                  return (
                    <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                      {pass ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={pass ? "text-primary" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => touch("confirmPassword")}
                className={cn("h-12 rounded-xl pl-10 pr-10", showError("confirmPassword") && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {showError("confirmPassword") && (
              <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="font-medium text-primary hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
