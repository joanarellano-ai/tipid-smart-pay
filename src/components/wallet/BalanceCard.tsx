import { formatPeso } from "@/lib/data";
import { Plus, ArrowUpRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  balance: number;
  onTopUp: () => void;
  onSend: () => void;
  onPayBills: () => void;
}

export default function BalanceCard({ balance, onTopUp, onSend, onPayBills }: BalanceCardProps) {
  return (
    <div className="mb-6 rounded-2xl gradient-primary p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.05s" }}>
      <p className="mb-1 text-sm text-primary-foreground/70">Available Balance</p>
      <p className="mb-5 text-3xl font-extrabold text-primary-foreground">{formatPeso(balance)}</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
          onClick={onTopUp}
        >
          <Plus className="mr-1 h-4 w-4" /> Top Up
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
          onClick={onSend}
        >
          <ArrowUpRight className="mr-1 h-4 w-4" /> Send
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
          onClick={onPayBills}
        >
          <Receipt className="mr-1 h-4 w-4" /> Pay Bills
        </Button>
      </div>
    </div>
  );
}
