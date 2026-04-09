import { useWallet, walletStore } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Clock, CheckCircle2, AlertTriangle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import PinDialog from "@/components/PinDialog";

function getDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getSmartMessage(category: string, daysUntil: number, amount: number): string {
  if (daysUntil < 0) return `Your ${category.toLowerCase()} bill is overdue!`;
  if (daysUntil === 0) return `Your ${category.toLowerCase()} bill is due today`;
  if (daysUntil === 1) return `Your ${category.toLowerCase()} bill is due tomorrow`;
  return `Your ${category.toLowerCase()} bill is due in ${daysUntil} days`;
}

const statusConfig = {
  paid: { label: "Paid", icon: CheckCircle2, color: "bg-accent text-accent-foreground", dot: "🟢" },
  upcoming: { label: "Upcoming", icon: Clock, color: "bg-warning/10 text-warning", dot: "🟡" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "bg-destructive/10 text-destructive", dot: "🔴" },
};

export default function Reminders() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  // Show toast notifications for upcoming bills
  useEffect(() => {
    wallet.reminders.forEach((r) => {
      if (r.status === "paid" || r.snoozed) return;
      const days = getDaysUntil(r.dueDate);
      if (days <= 3 && days >= 0) {
        toast.info(getSmartMessage(r.category, days, r.amount), {
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
    const ok = walletStore.payBill(payingId);
    if (ok) {
      toast.success("Bill paid successfully!");
    } else {
      toast.error("Insufficient balance");
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
          <Bell className="ml-auto h-5 w-5 text-muted-foreground" />
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-2xl gradient-primary p-5 shadow-lg animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="mb-1 text-sm text-primary-foreground/70">Total Upcoming</p>
          <p className="text-2xl font-extrabold text-primary-foreground">
            {formatPeso(wallet.reminders.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amount, 0))}
          </p>
          <p className="mt-1 text-xs text-primary-foreground/60">
            {wallet.reminders.filter((r) => r.status === "overdue").length} overdue · {wallet.reminders.filter((r) => r.status === "upcoming").length} upcoming
          </p>
        </div>

        {/* Reminders */}
        <div className="space-y-3">
          {sortedReminders.map((r, i) => {
            const days = getDaysUntil(r.dueDate);
            const cfg = statusConfig[r.status];
            const StatusIcon = cfg.icon;
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{r.category}</p>
                      <Badge variant="outline" className={cn("h-5 text-[10px]", cfg.color)}>
                        {cfg.dot} {cfg.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getSmartMessage(r.category, days, r.amount)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due: {dueLabel} · Estimated: <span className="font-semibold text-foreground">{formatPeso(r.amount)}</span>
                    </p>

                    {/* Actions */}
                    {r.status !== "paid" && (
                      <div className="mt-3 flex items-center gap-3">
                        <Button size="sm" className="rounded-xl" onClick={() => handlePay(r.id)}>
                          Pay Now
                        </Button>

                        <div className="flex items-center gap-2">
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

                        {!r.snoozed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 gap-1 text-xs text-muted-foreground"
                            onClick={() => {
                              walletStore.snoozeReminder(r.id);
                              toast.info("Reminder snoozed");
                            }}
                          >
                            <BellOff className="h-3 w-3" /> Snooze
                          </Button>
                        )}
                      </div>
                    )}

                    {r.status === "paid" && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Payment confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={executePay} title="Confirm Payment" description="Enter PIN to confirm bill payment" />
    </div>
  );
}
