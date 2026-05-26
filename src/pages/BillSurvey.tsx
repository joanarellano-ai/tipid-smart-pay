import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { billHistoryStore, getUtilityMeta, type BillEntry, type Utility } from "@/lib/billHistoryStore";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/tipidpay-logo.png";

/* ── Build the 3 most recent month labels (oldest → newest) ── */
function lastThreeMonths() {
  const now = new Date();
  const months: { label: string; idx: number }[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
    months.push({
      label: d.toLocaleDateString("en-PH", { month: "short", year: "numeric" }),
      idx: 2 - i, // 0 = oldest, 2 = newest
    });
  }
  return months;
}

const utilities: { key: Utility; unit: string; usageLabel: string; placeholderUsage: string; defaultDue: number }[] = [
  { key: "electricity", unit: "kWh", usageLabel: "Usage (kWh)", placeholderUsage: "e.g. 250", defaultDue: 15 },
  { key: "water", unit: "m³", usageLabel: "Usage (cubic meters)", placeholderUsage: "e.g. 13", defaultDue: 10 },
  { key: "internet", unit: "plan", usageLabel: "Plan amount (₱)", placeholderUsage: "e.g. 1499", defaultDue: 5 },
];

/* Per-row schema: usage ≥ 0, amount > 0, due day 1–28 */
const rowSchema = z.object({
  usage: z.coerce.number().min(0, "Required").max(100000, "Too large"),
  amount: z.coerce.number().min(1, "Enter amount").max(1000000, "Too large"),
});
const dueSchema = z.coerce.number().int().min(1, "1–28").max(28, "1–28");

type Row = { usage: string; amount: string };
type StepData = { rows: Row[]; dueDay: string };

export default function BillSurvey() {
  const navigate = useNavigate();
  const months = useMemo(lastThreeMonths, []);
  // Gate: does the user actually pay their own utility bills?
  const [paysBills, setPaysBills] = useState<boolean | null>(null);
  const [step, setStep] = useState(0); // 0,1,2 = utilities, 3 = review
  const totalSteps = utilities.length + 1;

  const [data, setData] = useState<Record<Utility, StepData>>(() => {
    const init = {} as Record<Utility, StepData>;
    utilities.forEach((u) => {
      init[u.key] = {
        rows: [
          { usage: "", amount: "" },
          { usage: "", amount: "" },
          { usage: "", amount: "" },
        ],
        dueDay: String(u.defaultDue),
      };
    });
    return init;
  });

  const current = utilities[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const updateRow = (uKey: Utility, idx: number, field: keyof Row, value: string) => {
    setData((d) => {
      const rows = d[uKey].rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      return { ...d, [uKey]: { ...d[uKey], rows } };
    });
  };

  const updateDue = (uKey: Utility, value: string) => {
    setData((d) => ({ ...d, [uKey]: { ...d[uKey], dueDay: value } }));
  };

  /* ── Validate one utility step ── */
  const validateStep = (uKey: Utility): string | null => {
    const sd = data[uKey];
    for (let i = 0; i < sd.rows.length; i++) {
      const parsed = rowSchema.safeParse(sd.rows[i]);
      if (!parsed.success) {
        return `${months[i].label}: ${parsed.error.errors[0].message}`;
      }
    }
    const due = dueSchema.safeParse(sd.dueDay);
    if (!due.success) return `Due day: ${due.error.errors[0].message}`;
    return null;
  };

  const handleNext = () => {
    if (step < utilities.length) {
      const err = validateStep(current.key);
      if (err) {
        toast.error("Please check your entries", { description: err });
        return;
      }
    }
    setStep((s) => Math.min(s + 1, utilities.length));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    // Validate everything once more
    for (const u of utilities) {
      const err = validateStep(u.key);
      if (err) {
        toast.error("Please check your entries", { description: `${getUtilityMeta(u.key).label} — ${err}` });
        return;
      }
    }

    const entries: BillEntry[] = [];
    utilities.forEach((u) => {
      const sd = data[u.key];
      const dueDay = Number(sd.dueDay);
      sd.rows.forEach((r, i) => {
        entries.push({
          id: `bh-${u.key}-${months[i].idx}-${Date.now()}-${i}`,
          utility: u.key,
          monthLabel: months[i].label,
          monthIndex: months[i].idx,
          usage: u.key === "internet" ? 1 : Number(r.usage),
          unit: u.unit,
          amount: Number(r.amount),
          dueDay,
        });
      });
    });

    billHistoryStore.replaceAll(entries);
    // Survey done — user is no longer "new"
    localStorage.removeItem("tipidpay_new_user");
    toast.success("Bill history saved", { description: "Predictions are ready on your dashboard." });
    navigate("/dashboard");
  };

  /* ── Mandatory entry choice: Survey OR Track Bills ── */
  if (paysBills === null) {
    const startSurvey = () => {
      localStorage.removeItem("tipidpay_skip_bills");
      localStorage.removeItem("tipidpay_track_mode");
      setPaysBills(true);
    };
    const trackInstead = () => {
      // Skip survey but enforce bill tracking mode — wipe any seeded wallet/bill data
      billHistoryStore.replaceAll([]);
      localStorage.removeItem("tipidpay_new_user");
      localStorage.removeItem("tipidpay_skip_bills");
      localStorage.removeItem("tipidpay_wallet");
      localStorage.setItem("tipidpay_track_mode", "1");
      // Force wallet store to reload empty state on next read
      if (typeof window !== "undefined") window.location.assign("/reminders");
      toast.info("Bill tracking enabled", {
        description: "Add at least 1 bill with payment status to unlock predictions.",
      });
    };

    return (
      <div className="flex min-h-screen flex-col px-6 gradient-hero">
        <div className="pt-6 pb-2">
          <Progress value={5} className="h-1.5 bg-border" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-6 text-center">
              <img src={logo} alt="TIPIDPAY" width={48} height={48} className="mx-auto mb-3 drop-shadow-md" />
              <h2 className="text-2xl font-bold text-foreground">Choose how to start</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick one to continue. You'll be able to switch later.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={startSurvey}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 border-primary bg-card p-5 text-left shadow-card transition-all duration-200 hover:shadow-md"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    Start Survey <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Recommended</span>
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Enter past 3 months of bills — predictions ready immediately
                  </span>
                </div>
              </button>

              <button
                onClick={trackInstead}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                  <CheckCircle2 className="h-6 w-6 text-warning" />
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-foreground">Skip Survey – Track Bills Instead</span>
                  <span className="block text-xs text-muted-foreground">
                    Add bills as they come; payment status required on each
                  </span>
                </div>
              </button>
            </div>

            <p className="mt-6 rounded-xl bg-muted p-3 text-center text-[11px] text-muted-foreground">
              Skipping the survey means you must track your bills and payment status to use prediction & analytics features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Review step ── */
  if (step === utilities.length) {
    return (
      <div className="flex min-h-screen flex-col px-6 gradient-hero">
        <div className="pt-6 pb-2">
          <Progress value={progress} className="h-1.5 bg-border" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Review your survey</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use these to predict your next bills.
              </p>
            </div>

            <div className="space-y-3">
              {utilities.map((u) => {
                const meta = getUtilityMeta(u.key);
                const sd = data[u.key];
                const total = sd.rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
                const avg = total / sd.rows.length;
                return (
                  <div key={u.key} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className="font-semibold text-foreground">{meta.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Due day {sd.dueDay}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {sd.rows.map((r, i) => (
                        <div key={i} className="rounded-lg bg-muted p-2">
                          <p className="text-[10px] text-muted-foreground">{months[i].label}</p>
                          <p className="text-sm font-semibold text-foreground">₱{Number(r.amount).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      3-mo avg: <span className="font-semibold text-foreground">₱{Math.round(avg).toLocaleString()}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button variant="hero" size="lg" className="flex-1" onClick={handleSubmit}>
                Save & Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("tipidpay_new_user");
                toast("Skipped — you can add bill history later in Settings.");
                navigate("/dashboard");
              }}
              className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Per-utility step ── */
  const meta = getUtilityMeta(current.key);
  const sd = data[current.key];

  return (
    <div className="flex min-h-screen flex-col px-6 gradient-hero">
      <div className="pt-6 pb-2">
        <Progress value={progress} className="h-1.5 bg-border" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <div className="w-full max-w-sm animate-fade-in" key={step}>
          <div className="mb-6 text-center">
            <img src={logo} alt="TIPIDPAY" width={40} height={40} className="mx-auto mb-3" />
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-2xl">{meta.icon}</span>
              <h2 className="text-xl font-bold text-foreground">{meta.label} – last 3 months</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your bills so we can forecast accurately.
            </p>
          </div>

          <div className="space-y-3">
            {months.map((m, i) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="mb-3 text-sm font-semibold text-foreground">{m.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  {current.key !== "internet" && (
                    <div>
                      <Label htmlFor={`usage-${i}`} className="text-xs text-muted-foreground">
                        {current.usageLabel}
                      </Label>
                      <Input
                        id={`usage-${i}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100000}
                        placeholder={current.placeholderUsage}
                        value={sd.rows[i].usage}
                        onChange={(e) => updateRow(current.key, i, "usage", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div className={current.key === "internet" ? "col-span-2" : ""}>
                    <Label htmlFor={`amount-${i}`} className="text-xs text-muted-foreground">
                      Bill amount (₱)
                    </Label>
                    <Input
                      id={`amount-${i}`}
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={1000000}
                      placeholder="e.g. 2500"
                      value={sd.rows[i].amount}
                      onChange={(e) => updateRow(current.key, i, "amount", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <Label htmlFor="due-day" className="text-xs text-muted-foreground">
                Typical due day of the month (1–28)
              </Label>
              <Input
                id="due-day"
                type="number"
                inputMode="numeric"
                min={1}
                max={28}
                value={sd.dueDay}
                onChange={(e) => updateDue(current.key, e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button variant="hero" size="lg" className="flex-1" onClick={handleNext}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Step {step + 1} of {totalSteps} • You can edit these later in Bill History.
          </p>
        </div>
      </div>
    </div>
  );
}
