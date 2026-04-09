import { useState } from "react";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { walletStore, PaymentMethod } from "@/lib/walletStore";
import { toast } from "sonner";
import PinDialog from "@/components/PinDialog";

const quickAmounts = [100, 500, 1000, 2000];

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMethod?: PaymentMethod;
}

export default function TopUpDialog({ open, onOpenChange, defaultMethod }: TopUpDialogProps) {
  const [amount, setAmount] = useState(0);
  const [custom, setCustom] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  const handleSelect = (amt: number) => {
    setAmount(amt);
    setCustom("");
  };

  const handleCustom = (v: string) => {
    const num = parseInt(v.replace(/\D/g, ""));
    setCustom(v.replace(/\D/g, ""));
    setAmount(isNaN(num) ? 0 : num);
  };

  const initiate = () => {
    if (amount <= 0) { toast.error("Enter a valid amount"); return; }
    setPinOpen(true);
  };

  const execute = () => {
    walletStore.topUp(amount);
    toast.success(`${formatPeso(amount)} added to wallet`);
    onOpenChange(false);
    setAmount(0);
    setCustom("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>
              {defaultMethod ? `Using ${defaultMethod.label} ${defaultMethod.details}` : "Add a payment method first"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === amt && !custom ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => handleSelect(amt)}
                >
                  {formatPeso(amt)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Custom Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                <Input className="rounded-xl pl-7" placeholder="0" value={custom} onChange={(e) => handleCustom(e.target.value)} />
              </div>
            </div>
            <Button className="w-full rounded-xl" size="lg" onClick={initiate} disabled={amount <= 0}>
              Top Up {amount > 0 && formatPeso(amount)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={execute} />
    </>
  );
}
