import { Transaction } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export default function TransactionList({ transactions, limit = 10 }: TransactionListProps) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </div>
      {transactions.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, limit).map((tx) => (
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
      )}
    </div>
  );
}
