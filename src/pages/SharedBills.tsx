import { roommates, totalBill, formatPeso, currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Send, UserPlus, Check, Clock, Home as HomeIcon, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/accountStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SharedBills() {
  const account = useAccount();
  const navigate = useNavigate();
  const perPerson = Math.ceil(totalBill / roommates.length);

  // Solo mode: show empty state with switch option
  if (account.mode === "solo") {
    return (
      <div className="px-4 pt-14 pb-4">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Shared Bills</h1>
          <div className="rounded-2xl bg-card p-8 text-center shadow-card animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <HomeIcon className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-foreground">You're in Solo Mode</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Bill splitting is disabled. Switch to Group Mode to share bills with roommates.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/splits")} className="w-full">
                <HomeIcon className="mr-1 h-4 w-4" /> Split a trip or family expense
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")} className="w-full">
                Switch to Group Mode
              </Button>
              <Button variant="ghost" onClick={() => navigate("/bill-history")} className="w-full">
                View My Bill History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-foreground">Shared Bills</h1>
            <p className="text-sm text-muted-foreground">{account.groupName || currentUser.groupName}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/splits")}>
              <Plane className="mr-1 h-4 w-4" /> Trips & more
            </Button>
            <Button size="sm" variant="soft" onClick={() => toast.success("Invite link copied to clipboard!")}>
              <UserPlus className="mr-1 h-4 w-4" /> Invite
            </Button>
          </div>
        </div>

        {/* Split Summary */}
        <div className="mb-5 rounded-2xl gradient-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Bill</p>
            <p className="text-lg font-bold text-foreground">{formatPeso(totalBill)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Per person (equal split)</p>
            <p className="font-semibold text-primary">{formatPeso(perPerson)}</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${(roommates.filter((r) => r.paid).length / roommates.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {roommates.filter((r) => r.paid).length} of {roommates.length} paid
          </p>
        </div>

        {/* Roommates */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-semibold text-foreground">Roommates</h3>
          {roommates.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {r.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{formatPeso(r.amount)}</p>
              </div>
              {r.paid ? (
                <span className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  <Check className="h-3 w-3" /> Paid
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                  <button
                    onClick={() => toast.success(`Reminder sent to ${r.name}`)}
                    aria-label={`Send reminder to ${r.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:shadow-md active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
