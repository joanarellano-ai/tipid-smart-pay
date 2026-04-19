import { Bell, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWallet, walletStore } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const wallet = useWallet();
  const navigate = useNavigate();

  const items = [
    ...wallet.reminders
      .filter((r) => r.status !== "paid")
      .map((r) => ({
        id: `rem-${r.id}`,
        type: r.status as "overdue" | "upcoming",
        title: `${r.category} ${r.status === "overdue" ? "overdue" : "due soon"}`,
        message: `${formatPeso(r.amount)} due`,
        action: () => {
          const ok = walletStore.payBill(r.id);
          if (ok) toast.success("Bill marked as paid");
          else toast.error("Insufficient balance");
        },
        actionLabel: "Mark Paid",
      })),
    ...wallet.transactions.slice(0, 2).map((t) => ({
      id: `tx-${t.id}`,
      type: "info" as const,
      title: t.label,
      message: `${t.amount > 0 ? "+" : ""}${formatPeso(t.amount)} · ${t.date}`,
      action: () => navigate("/wallet"),
      actionLabel: "View",
    })),
  ];

  const unread = wallet.reminders.filter((r) => r.status !== "paid").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border p-3">
          <h3 className="text-sm font-bold text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">{unread} unread</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
          )}
          {items.map((n) => {
            const Icon = n.type === "overdue" ? AlertTriangle : n.type === "upcoming" ? Clock : CheckCircle2;
            return (
              <div key={n.id} className="flex items-start gap-3 border-b border-border p-3 last:border-0">
                <div className={cn(
                  "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg",
                  n.type === "overdue" ? "bg-destructive/10 text-destructive" :
                  n.type === "upcoming" ? "bg-warning/10 text-warning" :
                  "bg-accent text-accent-foreground"
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground">{n.message}</p>
                  <button
                    onClick={n.action}
                    className="mt-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    {n.actionLabel} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-2">
          <button
            onClick={() => navigate("/reminders")}
            className="block w-full rounded-lg py-2 text-center text-xs font-semibold text-primary hover:bg-accent"
          >
            View all reminders
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
