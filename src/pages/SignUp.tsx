import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, X, Cake } from "lucide-react";
import { toast } from "sonner";
import { userStore, capitalize } from "@/lib/userStore";
import logo from "@/assets/tipidpay-logo.png";
import { cn } from "@/lib/utils";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormValues {
  firstName: string;
  middleInitial: string;
  lastName: string;
  birthday: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const MIN_AGE_YEARS = 13;

function validate(v: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.firstName.trim()) errors.firstName = "First name is required";
  else if (v.firstName.trim().length > 50) errors.firstName = "Max 50 characters";

  if (!v.lastName.trim()) errors.lastName = "Last name is required";
  else if (v.lastName.trim().length > 50) errors.lastName = "Max 50 characters";

  if (!v.birthday) errors.birthday = "Birthday is required";
  else {
    const d = new Date(v.birthday);
    if (isNaN(d.getTime())) errors.birthday = "Invalid date";
    else {
      const now = new Date();
      const minDob = new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate());
      if (d > now) errors.birthday = "Birthday can't be in the future";
      else if (d > minDob) errors.birthday = `You must be at least ${MIN_AGE_YEARS} years old`;
    }
  }

  const email = v.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  else if (email.length > 255) errors.email = "Email must be under 255 characters";

  if (!v.password) errors.password = "Password is required";
  else if (v.password.length < 8) errors.password = "Minimum 8 characters";

  if (!v.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (v.password && v.confirmPassword !== v.password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const values: FormValues = { firstName, middleInitial, lastName, birthday, email, password, confirmPassword };
  const errors = useMemo(() => validate(values), [firstName, middleInitial, lastName, birthday, email, password, confirmPassword]);
  const isValid = Object.keys(errors).length === 0;

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const todayIso = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    localStorage.setItem("tipidpay_new_user", "1");
    localStorage.removeItem("tipidpay_wallet");
    localStorage.removeItem("tipidpay_bill_history");

    await new Promise((r) => setTimeout(r, 1200));

    const f = capitalize(firstName);
    const l = capitalize(lastName);
    const mi = middleInitial.trim().charAt(0).toUpperCase();

    userStore.set({ firstName: f, middleInitial: mi, lastName: l, birthday, email: email.trim() });
    setLoading(false);
    toast.success("Account created successfully!", { description: `Welcome, ${f}! Your wallet starts at ₱0.` });
    navigate("/onboarding");
  };

  const showError = (field: keyof FieldErrors) => touched[field] && errors[field];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 gradient-hero">
      <div className="w-full max-w-sm animate-scale-in">
        <button
          onClick={() => navigate("/welcome")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-6 flex flex-col items-center">
          <img src={logo} alt="TIPIDPAY logo" width={64} height={64} className="mb-3 drop-shadow-md" />
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join TIPIDPAY and start saving</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Personal Information */}
          <section className="space-y-3 rounded-2xl bg-card/60 p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Personal Information
            </h2>

            <div className="grid grid-cols-[1fr_72px] gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">First Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => touch("firstName")}
                    className={cn("h-11 rounded-xl pl-10", showError("firstName") && "border-destructive")}
                    maxLength={50}
                    autoComplete="given-name"
                  />
                </div>
                {showError("firstName") && (
                  <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">M.I.</Label>
                <Input
                  placeholder="—"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 1))}
                  className="mt-1 h-11 rounded-xl text-center uppercase"
                  maxLength={1}
                  autoComplete="additional-name"
                  aria-label="Middle initial (if applicable)"
                  title="Enter your middle initial (if applicable)"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Middle initial is optional — leave blank if not applicable.
            </p>

            <div>
              <Label className="text-xs text-muted-foreground">Last Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => touch("lastName")}
                  className={cn("h-11 rounded-xl pl-10", showError("lastName") && "border-destructive")}
                  maxLength={50}
                  autoComplete="family-name"
                />
              </div>
              {showError("lastName") && (
                <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.lastName}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Birthday</Label>
              <div className="relative mt-1">
                <Cake className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  onBlur={() => touch("birthday")}
                  max={todayIso}
                  min="1900-01-01"
                  className={cn("h-11 rounded-xl pl-10", showError("birthday") && "border-destructive")}
                  autoComplete="bday"
                />
              </div>
              {showError("birthday") && (
                <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.birthday}</p>
              )}
            </div>
          </section>

          {/* Account */}
          <section className="space-y-3 rounded-2xl bg-card/60 p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Account
            </h2>

            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch("email")}
                  className={cn("h-11 rounded-xl pl-10", showError("email") && "border-destructive")}
                  maxLength={255}
                  autoComplete="email"
                />
              </div>
              {showError("email") && (
                <p className="mt-1 text-xs text-destructive animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="At least 8 characters"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch("password")}
                  className={cn("h-11 rounded-xl pl-10 pr-10", showError("password") && "border-destructive")}
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
              {touched.password && password.length > 0 && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  {passwordRules.map((rule) => {
                    const pass = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        {pass ? <Check className="h-3 w-3 text-primary" /> : <X className="h-3 w-3 text-muted-foreground" />}
                        <span className={pass ? "text-primary" : "text-muted-foreground"}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Re-enter password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => touch("confirmPassword")}
                  className={cn("h-11 rounded-xl pl-10 pr-10", showError("confirmPassword") && "border-destructive")}
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
          </section>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!isValid || loading}>
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
