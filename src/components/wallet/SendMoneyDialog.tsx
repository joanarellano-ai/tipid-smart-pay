import { useState } from "react";
import { formatPeso, roommates } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { walletStore } from "@/lib/walletStore";
import { Send } from "lucide-react";
import { toast } from "sonner";
import PinDialog from "@/components/PinDialog";

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
}

export default function SendMoneyDialog({ open, onOpenChange, balance }: SendMoneyDialogProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const initiate = () => {
    const amt = parseFloat(amount);
    if (!recipient) { toast.error("Select a recipient"); return; }
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > balance) { toast.error("Insufficient balance"); return; }
    setConfirmOpen(true);
  };

  const confirm = () => {
    setConfirmOpen(false);
    setPinOpen(true);
  };

  const execute = () => {
    const amt = parseFloat(amount);
    const ok = walletStore.sendMoney(recipient, amt, note || undefined);
    if (ok) toast.success(`${formatPeso(amt)} sent to ${recipient}`);
    else toast.error("Transaction failed");
    reset();
  };

  const reset = () => {
    onOpenChange(false);
    setRecipient("");
    setAmount("");
    setNote("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>Send to a contact or roommate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select recipient" /></SelectTrigger>
                <SelectContent>
                  {roommates.filter((r) => r.name !== "Alex Santos").map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₱)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                <Input className="rounded-xl pl-7" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input className="rounded-xl" placeholder="e.g. Share for electricity" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="w-full rounded-xl" size="lg" onClick={initiate}>
              <Send className="mr-2 h-4 w-4" /> Review Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Confirm Transfer</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-center">
            <p className="text-3xl font-extrabold text-foreground">{formatPeso(parseFloat(amount) || 0)}</p>
            <p className="text-sm text-muted-foreground">to <span className="font-semibold text-foreground">{recipient}</span></p>
            {note && <p className="text-xs text-muted-foreground italic">"{note}"</p>}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl" onClick={confirm}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={execute} />
    </>
  );
}
