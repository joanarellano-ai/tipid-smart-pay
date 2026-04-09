import { useState } from "react";
import { useWallet } from "@/lib/walletStore";
import { CreditCard, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "@/components/wallet/BalanceCard";
import TopUpDialog from "@/components/wallet/TopUpDialog";
import SendMoneyDialog from "@/components/wallet/SendMoneyDialog";
import PayBillsDialog from "@/components/wallet/PayBillsDialog";
import UpcomingBills from "@/components/wallet/UpcomingBills";
import TransactionList from "@/components/wallet/TransactionList";

export default function WalletPage() {
  const wallet = useWallet();
  const navigate = useNavigate();

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [payBillsOpen, setPayBillsOpen] = useState(false);

  const defaultMethod = wallet.paymentMethods.find((pm) => pm.isDefault);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Wallet</h1>

        {/* Balance Card */}
        <BalanceCard
          balance={wallet.balance}
          onTopUp={() => setTopUpOpen(true)}
          onSend={() => setSendOpen(true)}
          onPayBills={() => setPayBillsOpen(true)}
        />

        {/* Payment Method shortcut */}
        <button
          onClick={() => navigate("/payment-methods")}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-soft active:scale-[0.99] animate-fade-in"
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

        {/* Reminders shortcut */}
        <button
          onClick={() => navigate("/reminders")}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-soft active:scale-[0.99] animate-fade-in"
          style={{ animationDelay: "0.09s" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Bill Reminders</p>
            <p className="text-xs text-muted-foreground">
              {wallet.reminders.filter((r) => r.status !== "paid").length} upcoming bills
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Upcoming Bills */}
        <UpcomingBills reminders={wallet.reminders} />

        {/* Transactions */}
        <TransactionList transactions={wallet.transactions} />
      </div>

      {/* Dialogs */}
      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} defaultMethod={defaultMethod} />
      <SendMoneyDialog open={sendOpen} onOpenChange={setSendOpen} balance={wallet.balance} />
      <PayBillsDialog open={payBillsOpen} onOpenChange={setPayBillsOpen} />
    </div>
  );
}
