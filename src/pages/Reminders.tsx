import { useWallet, walletStore } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Plus, Trash2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import PinDialog from "@/components/PinDialog";

function getDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getSmartMessage(category: string, daysUntil: number): string {
  if (daysUntil < 0) return `Your ${category.toLowerCase()} bill is overdue!`;
  if (daysUntil === 0) return `Your ${category.toLowerCase()} bill is due today`;
  if (daysUntil === 1) return `Your ${category.toLowerCase()} bill is due tomorrow`;
  return `Your ${category.toLowerCase()} bill is due in ${daysUntil} days`;
}

const statusConfig = {
  paid: { label: "Paid", icon: CheckCircle2, color: "bg-accent text-accent-foreground", dot: "🟢" },
  upcoming: { label: "Unpaid", icon: Clock, color: "bg-warning/10 text-warning", dot: "🟡" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "bg-destructive/10 text-destructive", dot: "🔴" },
};

const CATEGORY_OPTIONS = [
  { value: "Electricity", icon: "⚡" },
  { value: "Water", icon: "💧" },
  { value: "Internet", icon: "📡" },
  { value: "Rent", icon: "🏠" },
  { value: "Cable TV", icon: "📺" },
  { value: "Phone", icon: "📱" },
  { value: "Other", icon: "🧾" },
];

export default function Reminders() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const trackMode = typeof window !== "undefined" && localStorage.getItem("tipidpay_track_mode") === "1";
  const trackedCount = useMemo(() => wallet.reminders.filter((r) => r.tracked).length, [wallet.reminders]);
  const justifiedTracking = trackedCount >= 1;

  // Auto-open Add Bill dialog the first time a track-mode user lands here with no bills
  useEffect(() => {
    if (trackMode && wallet.reminders.length === 0) setAddOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show toast notifications for upcoming bills
  useEffect(() => {
    wallet.reminders.forEach((r) => {
      if (r.status === "paid" || r.snoozed) return;
      const days = getDaysUntil(r.dueDate);
      if (r.status === "overdue") {
        toast.error(`${r.category} is overdue`, {
          description: `Estimated amount: ${formatPeso(r.amount)}`,
          duration: 5000,
        });
      } else if (days <= 3 && days >= 0) {
        toast.info(getSmartMessage(r.category, days), {
          description: `Estimated amount: ${formatPeso(r.amount)}`,
          duration: 5000,
        });
      }
    });
  }, []); // once on mount

  const handlePay = (id: string) => {
    setPayingId(id);
    setPinOpen(true);
  };

  const executePay = () => {
    if (!payingId) return;
    const r = wallet.reminders.find((x) => x.id === payingId);
    // Tracked bills (no balance flow) just flip status; seeded bills go through wallet
    if (r?.tracked) {
      walletStore.setReminderStatus(payingId, "paid");
      toast.success("Marked as paid");
    } else {
      const ok = walletStore.payBill(payingId);
      if (ok) toast.success("Bill paid successfully!");
      else toast.error("Insufficient balance");
    }
    setPayingId(null);
  };

  const sortedReminders = [...wallet.reminders].sort((a, b) => {
    const order = { overdue: 0, upcoming: 1, paid: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center gap-3 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Bill Reminders</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="rounded-xl" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Bill
            </Button>
          </div>
        </div>

        {/* Track-mode banners */}
        {trackMode && !justifiedTracking && (
          <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Since you skipped the survey, you must track your bills and payment status to use predictions & analytics.
                <span className="mt-1 block text-xs opacity-80">Add at least 1 bill to unlock those features.</span>
              </p>
            </div>
          </div>
        )}
        {trackMode && justifiedTracking && (
          <div className="mb-4 rounded-2xl bg-accent p-4 text-sm text-accent-foreground animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                System is learning from your bill tracking. Add more data to improve accuracy.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {wallet.reminders.length > 0 && (
          <div className="mb-6 rounded-2xl gradient-primary p-5 shadow-lg animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <p className="mb-1 text-sm text-primary-foreground/70">Total Unpaid + Overdue</p>
            <p className="text-2xl font-extrabold text-primary-foreground">
              {formatPeso(wallet.reminders.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amount, 0))}
            </p>
            <p className="mt-1 text-xs text-primary-foreground/60">
              {wallet.reminders.filter((r) => r.status === "overdue").length} overdue · {wallet.reminders.filter((r) => r.status === "upcoming").length} unpaid · {wallet.reminders.filter((r) => r.status === "paid").length} paid
            </p>
          </div>
        )}

        {/* Empty */}
        {wallet.reminders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-card animate-fade-in">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
              <Bell className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="mb-1 text-base font-bold text-foreground">No bills yet</h2>
            <p className="mb-4 text-xs text-muted-foreground">Add your first bill to start tracking.</p>
            <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add a bill
            </Button>
          </div>
        )}

        {/* Reminders */}
        <div className="space-y-3">
          {sortedReminders.map((r, i) => {
            const days = getDaysUntil(r.dueDate);
            const cfg = statusConfig[r.status];
            const dueLabel = new Date(r.dueDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-2xl bg-card p-4 shadow-card animate-fade-in",
                  r.status === "overdue" && "border border-destructive/20"
                )}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-xl", r.status === "paid" ? "bg-accent" : r.status === "overdue" ? "bg-destructive/10" : "bg-warning/10")}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{r.category}</p>
                      <Badge variant="outline" className={cn("h-5 text-[10px]", cfg.color)}>
                        {cfg.dot} {cfg.label}
                      </Badge>
                      {r.tracked && (
                        <Badge variant="outline" className="h-5 text-[10px]">tracked</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getSmartMessage(r.category, days)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due: {dueLabel} · Amount: <span className="font-semibold text-foreground">{formatPeso(r.amount)}</span>
                    </p>
                    {r.status === "paid" && r.paidDate && (
                      <p className="mt-1 text-[11px] text-primary">
                        Paid on {new Date(r.paidDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}

                    {/* Status action row */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={r.status === "paid" ? "secondary" : "default"}
                        className="h-7 rounded-lg text-xs"
                        onClick={() => handlePay(r.id)}
                        disabled={r.status === "paid"}
                      >
                        Mark as Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-lg text-xs"
                        onClick={() => {
                          walletStore.setReminderStatus(r.id, "upcoming");
                          toast.info("Marked as unpaid");
                        }}
                        disabled={r.status === "upcoming"}
                      >
                        Mark as Unpaid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-lg text-xs text-destructive border-destructive/30"
                        onClick={() => {
                          walletStore.setReminderStatus(r.id, "overdue");
                          toast.error("Flagged as overdue", { description: `Reminder triggered for ${r.category}` });
                        }}
                        disabled={r.status === "overdue"}
                      >
                        Mark as Overdue
                      </Button>

                      {r.status !== "paid" && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <Switch
                            checked={r.autoPay}
                            onCheckedChange={() => {
                              walletStore.toggleAutoPay(r.id);
                              toast.info(r.autoPay ? "Auto-pay disabled" : "Auto-pay enabled");
                            }}
                            className="scale-75"
                          />
                          <span className="text-[10px] text-muted-foreground">Auto-pay</span>
                        </div>
                      )}
                    </div>

                    {r.status !== "paid" && !r.snoozed && (
                      <button
                        onClick={() => {
                          walletStore.snoozeReminder(r.id);
                          toast.info("Reminder snoozed");
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <BellOff className="h-3 w-3" /> Snooze reminder
                      </button>
                    )}
                    {r.tracked && (
                      <button
                        onClick={() => {
                          walletStore.removeReminder(r.id);
                          toast.success("Bill removed");
                        }}
                        className="mt-2 ml-3 inline-flex items-center gap-1 text-[11px] text-destructive/80 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={executePay} title="Confirm Payment" description="Enter PIN to confirm bill payment" />
      <AddBillDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

/* ─────────── Add Bill dialog ─────────── */

function AddBillDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [category, setCategory] = useState("Electricity");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<"paid" | "upcoming" | "overdue" | "">("");

  const reset = () => {
    setCategory("Electricity");
    setAmount("");
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 10));
    setStatus("");
  };

  const submit = () => {
    if (!category) return toast.error("Pick a category");
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Amount must be greater than 0");
    if (amt > 1_000_000) return toast.error("Amount too large");
    if (!dueDate) return toast.error("Pick a due date");
    if (!status) return toast.error("Payment status is required", { description: "Choose Paid, Unpaid, or Overdue." });

    const icon = CATEGORY_OPTIONS.find((c) => c.value === category)?.icon || "🧾";
    walletStore.addReminder({
      category,
      icon,
      amount: amt,
      dueDate: new Date(dueDate).toISOString(),
      status,
    });
    toast.success(`${category} bill added`, { description: `Status: ${status}` });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add a Bill</DialogTitle>
          <DialogDescription>Payment status is required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.icon} {c.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (₱)</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              max={1000000}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label>
              Payment status <span className="text-destructive">*</span>
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Required — choose one" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">🟢 Paid</SelectItem>
                <SelectItem value="upcoming">🟡 Unpaid</SelectItem>
                <SelectItem value="overdue">🔴 Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full rounded-xl" onClick={submit}>Save bill</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
