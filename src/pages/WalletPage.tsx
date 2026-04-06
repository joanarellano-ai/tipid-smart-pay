import { currentUser, transactions, formatPeso } from "@/lib/data";
import { Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Wallet</h1>

        {/* Balance Card */}
        <div className="mb-6 rounded-2xl gradient-primary p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="mb-1 text-sm text-primary-foreground/70">Available Balance</p>
          <p className="mb-5 text-3xl font-extrabold text-primary-foreground">{formatPeso(currentUser.walletBalance)}</p>
          <div className="flex gap-3">
            <Button size="sm" className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0">
              <Plus className="mr-1 h-4 w-4" /> Top Up
            </Button>
            <Button size="sm" className="flex-1 rounded-xl bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0">
              <ArrowUpRight className="mr-1 h-4 w-4" /> Send
            </Button>
          </div>
        </div>

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
            {transactions.map((tx) => (
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
                  {tx.amount > 0 ? "+" : "-"}{formatPeso(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
