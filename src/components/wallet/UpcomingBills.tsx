import { BillReminder } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface UpcomingBillsProps {
  reminders: BillReminder[];
}

function getDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function UpcomingBills({ reminders }: UpcomingBillsProps) {
  const unpaid = reminders.filter((r) => r.status !== "paid").slice(0, 3);

  if (unpaid.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.12s" }}>
      <h3 className="mb-3 font-semibold text-foreground">Upcoming Bills</h3>
      <div className="space-y-2">
        {unpaid.map((r) => {
          const days = getDaysUntil(r.dueDate);
          const isOverdue = r.status === "overdue";
          const dueLabel = new Date(r.dueDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

          return (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-card p-3 shadow-card",
                isOverdue && "border border-destructive/20"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                isOverdue ? "bg-destructive/10" : "bg-warning/10"
              )}>
                {r.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{r.category}</p>
                <p className="text-xs text-muted-foreground">
                  {isOverdue ? (
                    <span className="text-destructive font-medium">Overdue</span>
                  ) : days === 0 ? (
                    <span className="text-warning font-medium">Due today</span>
                  ) : days === 1 ? (
                    "Due tomorrow"
                  ) : (
                    `Due ${dueLabel}`
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-foreground">{formatPeso(r.amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
