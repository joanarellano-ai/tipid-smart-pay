import { useState } from "react";
import { useWallet, walletStore, BillReminder } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Clock, Receipt } from "lucide-react";
import { toast } from "sonner";
import PinDialog from "@/components/PinDialog";

const statusConfig = {
  paid: { label: "Paid", dot: "🟢", bgClass: "bg-accent" },
  upcoming: { label: "Upcoming", dot: "🟡", bgClass: "bg-warning/10" },
  overdue: { label: "Overdue", dot: "🔴", bgClass: "bg-destructive/10" },
};

interface PayBillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayBillsDialog({ open, onOpenChange }: PayBillsDialogProps) {
  const wallet = useWallet();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const unpaidBills = wallet.reminders.filter((r) => r.status !== "paid");
  const selectedBills = unpaidBills.filter((r) => selected.has(r.id));
  const totalSelected = selectedBills.reduce((s, r) => s + r.amount, 0);

  const toggleBill = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === unpaidBills.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(unpaidBills.map((r) => r.id)));
    }
  };

  const initiate = () => {
    if (selected.size === 0) { toast.error("Select at least one bill"); return; }
    if (totalSelected > wallet.balance) { toast.error("Insufficient balance"); return; }
    setConfirmOpen(true);
  };

  const confirm = () => {
    setConfirmOpen(false);
    setPinOpen(true);
  };

  const execute = () => {
    let successCount = 0;
    selectedBills.forEach((bill) => {
      const ok = walletStore.payBill(bill.id);
      if (ok) successCount++;
    });
    if (successCount > 0) {
      toast.success(`${successCount} bill${successCount > 1 ? "s" : ""} paid successfully!`);
    }
    if (successCount < selectedBills.length) {
      toast.error(`${selectedBills.length - successCount} bill(s) failed — insufficient balance`);
    }
    setSelected(new Set());
    onOpenChange(false);
  };

  const getDueLabel = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days}d`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Pay Utility Bills
            </DialogTitle>
            <DialogDescription>Select bills to pay from your wallet</DialogDescription>
          </DialogHeader>

          {unpaidBills.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">All bills are paid! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Select all */}
              <button
                onClick={selectAll}
                className="flex w-full items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                <Checkbox
                  checked={selected.size === unpaidBills.length && unpaidBills.length > 0}
                  className="h-4 w-4"
                />
                {selected.size === unpaidBills.length ? "Deselect All" : "Select All"}
              </button>

              {/* Bill cards */}
              <div className="space-y-2">
                {unpaidBills.map((bill) => {
                  const cfg = statusConfig[bill.status];
                  const isSelected = selected.has(bill.id);
                  return (
                    <button
                      key={bill.id}
                      onClick={() => toggleBill(bill.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200",
                        isSelected
                          ? "bg-primary/5 ring-2 ring-primary/30 shadow-card"
                          : "bg-card shadow-card hover:shadow-soft",
                        bill.status === "overdue" && "border border-destructive/20"
                      )}
                    >
                      <Checkbox checked={isSelected} className="h-5 w-5 shrink-0" />
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-lg shrink-0", cfg.bgClass)}>
                        {bill.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{bill.category}</span>
                          <Badge variant="outline" className={cn("h-5 text-[10px] shrink-0", bill.status === "overdue" ? "text-destructive border-destructive/30" : "text-warning border-warning/30")}>
                            {cfg.dot} {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{getDueLabel(bill.dueDate)}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground shrink-0">{formatPeso(bill.amount)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Total & pay button */}
              <div className="rounded-xl bg-muted p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{selected.size} bill{selected.size !== 1 ? "s" : ""} selected</span>
                  <span className="text-xs text-muted-foreground">Balance: {formatPeso(wallet.balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className={cn("text-lg font-extrabold", totalSelected > wallet.balance ? "text-destructive" : "text-foreground")}>
                    {formatPeso(totalSelected)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full rounded-xl"
                size="lg"
                onClick={initiate}
                disabled={selected.size === 0 || totalSelected > wallet.balance}
              >
                Pay Selected Bills
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Confirm Payment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-center">
            <p className="text-3xl font-extrabold text-foreground">{formatPeso(totalSelected)}</p>
            <p className="text-sm text-muted-foreground">
              Paying {selectedBills.length} bill{selectedBills.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-1">
              {selectedBills.map((b) => (
                <p key={b.id} className="text-xs text-muted-foreground">
                  {b.icon} {b.category}: {formatPeso(b.amount)}
                </p>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl" onClick={confirm}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={execute} title="Confirm Payment" description="Enter PIN to pay selected bills" />
    </>
  );
}
