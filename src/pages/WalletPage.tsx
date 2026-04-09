import { useState } from "react";
import { useWallet, walletStore } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { roommates } from "@/lib/data";
import { Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, CreditCard, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PinDialog from "@/components/PinDialog";

const quickAmounts = [100, 500, 1000, 2000];

export default function WalletPage() {
  const wallet = useWallet();
  const navigate = useNavigate();

  // Top Up state
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [topUpCustom, setTopUpCustom] = useState("");

  // Send Money state
  const [sendOpen, setSendOpen] = useState(false);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);

  // PIN
  const [pinOpen, setPinOpen] = useState(false);
  const [pinAction, setPinAction] = useState<"topup" | "send">("topup");

  const handleTopUpSelect = (amt: number) => {
    setTopUpAmount(amt);
    setTopUpCustom("");
  };

  const handleTopUpCustom = (v: string) => {
    const num = parseInt(v.replace(/\D/g, ""));
    setTopUpCustom(v.replace(/\D/g, ""));
    setTopUpAmount(isNaN(num) ? 0 : num);
  };

  const initiateTopUp = () => {
    if (topUpAmount <= 0) { toast.error("Enter a valid amount"); return; }
    setPinAction("topup");
    setPinOpen(true);
  };

  const executeTopUp = () => {
    walletStore.topUp(topUpAmount);
    toast.success(`${formatPeso(topUpAmount)} added to wallet`);
    setTopUpOpen(false);
    setTopUpAmount(0);
    setTopUpCustom("");
  };

  const initiateSend = () => {
    const amt = parseFloat(sendAmount);
    if (!sendRecipient) { toast.error("Select a recipient"); return; }
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > wallet.balance) { toast.error("Insufficient balance"); return; }
    setConfirmSend(true);
  };

  const confirmSendMoney = () => {
    setConfirmSend(false);
    setPinAction("send");
    setPinOpen(true);
  };

  const executeSend = () => {
    const amt = parseFloat(sendAmount);
    const ok = walletStore.sendMoney(sendRecipient, amt, sendNote || undefined);
    if (ok) {
      toast.success(`${formatPeso(amt)} sent to ${sendRecipient}`);
    } else {
      toast.error("Transaction failed");
    }
    setSendOpen(false);
    setSendRecipient("");
    setSendAmount("");
    setSendNote("");
  };

  const handlePinConfirm = () => {
    if (pinAction === "topup") executeTopUp();
    else executeSend();
  };

  const defaultMethod = wallet.paymentMethods.find((pm) => pm.isDefault);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Wallet</h1>

        {/* Balance Card */}
        <div className="mb-6 rounded-2xl gradient-primary p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="mb-1 text-sm text-primary-foreground/70">Available Balance</p>
          <p className="mb-5 text-3xl font-extrabold text-primary-foreground">{formatPeso(wallet.balance)}</p>
          <div className="flex gap-3">
            <Button size="sm" className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0" onClick={() => setTopUpOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Top Up
            </Button>
            <Button size="sm" className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0" onClick={() => setSendOpen(true)}>
              <ArrowUpRight className="mr-1 h-4 w-4" /> Send
            </Button>
          </div>
        </div>

        {/* Payment Method shortcut */}
        <button
          onClick={() => navigate("/payment-methods")}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-md active:scale-[0.99] animate-fade-in"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Payment Methods</p>
            <p className="text-xs text-muted-foreground">
              {defaultMethod ? `${defaultMethod.label} ${defaultMethod.details}` : "Add a method"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Quick Pay */}
        <div className="mb-6 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="mb-3 font-semibold text-foreground">Quick Pay Bills</h3>
          <div className="flex gap-3">
            {[
              { label: "⚡ Electric", amount: "₱2,850" },
              { label: "💧 Water", amount: "₱680" },
              { label: "📡 Internet", amount: "₱1,370" },
            ].map((b) => (
              <button
                key={b.label}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-accent p-3 text-center transition-all duration-200 hover:shadow-card active:scale-95"
              >
                <span className="text-lg">{b.label.split(" ")[0]}</span>
                <span className="text-[10px] text-muted-foreground">{b.label.split(" ")[1]}</span>
                <span className="text-xs font-semibold text-foreground">{b.amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Transactions</h3>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {wallet.transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  tx.amount > 0 ? "bg-accent" : "bg-destructive/10"
                )}>
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="h-4 w-4 text-accent-foreground" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <p className={cn("text-sm font-semibold", tx.amount > 0 ? "text-primary" : "text-foreground")}>
                  {tx.amount > 0 ? "+" : "-"}{formatPeso(Math.abs(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
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
                  variant={topUpAmount === amt && !topUpCustom ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => handleTopUpSelect(amt)}
                >
                  {formatPeso(amt)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Custom Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                <Input
                  className="rounded-xl pl-7"
                  placeholder="0"
                  value={topUpCustom}
                  onChange={(e) => handleTopUpCustom(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full rounded-xl" size="lg" onClick={initiateTopUp} disabled={topUpAmount <= 0}>
              Top Up {topUpAmount > 0 && formatPeso(topUpAmount)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Money Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>Send to a contact or roommate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={sendRecipient} onValueChange={setSendRecipient}>
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
                <Input
                  className="rounded-xl pl-7"
                  placeholder="0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input className="rounded-xl" placeholder="e.g. Share for electricity" value={sendNote} onChange={(e) => setSendNote(e.target.value)} />
            </div>
            <Button className="w-full rounded-xl" size="lg" onClick={initiateSend}>
              <Send className="mr-2 h-4 w-4" /> Review Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-center">
            <p className="text-3xl font-extrabold text-foreground">{formatPeso(parseFloat(sendAmount) || 0)}</p>
            <p className="text-sm text-muted-foreground">to <span className="font-semibold text-foreground">{sendRecipient}</span></p>
            {sendNote && <p className="text-xs text-muted-foreground italic">"{sendNote}"</p>}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmSend(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl" onClick={confirmSendMoney}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Dialog */}
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onConfirm={handlePinConfirm} />
    </div>
  );
}
