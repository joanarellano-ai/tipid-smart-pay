import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Plus,
  Users,
  Wallet,
  TrendingUp,
  Trash2,
  ArrowLeft,
  Download,
  ArrowRight,
  AlertTriangle,
  PieChart as PieIcon,
  Receipt,
  UserPlus,
  Sparkles,
  Search,
  Filter,
  Pencil,
  RotateCcw,
  History,
  Printer,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDollarSign,
  MoreVertical,
  Eye,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import {
  vacationStore,
  useTrips,
  newId,
  CATEGORY_META,
  PRIMARY_CATEGORIES,
  buildSplits,
  computeBalances,
  computeSettlements,
  totalSpent,
  outstandingBalance,
  pendingPaymentsCount,
  expensePaid,
  expenseRemaining,
  expenseStatus,
  type Trip,
  type TripExpense,
  type ExpenseCategory,
  type ExpenseStatus,
  type SplitMode,
} from "@/lib/vacationStore";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const COVERS = ["🏖️", "🗻", "🏝️", "🏙️", "🌅", "🎢", "🚌", "✈️"];
const CHART_COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(224, 73%, 33%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 70%, 55%)",
  "hsl(0, 75%, 60%)",
  "hsl(195, 80%, 45%)",
  "hsl(140, 60%, 45%)",
  "hsl(25, 90%, 55%)",
  "hsl(330, 75%, 55%)",
  "hsl(210, 20%, 50%)",
];

const STATUS_META: Record<
  ExpenseStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: { label: "Paid", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  partial: { label: "Partial", className: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: Clock },
  unpaid: { label: "Unpaid", className: "bg-muted text-muted-foreground border-border", icon: CircleDollarSign },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertCircle },
};

export default function VacationDashboard() {
  const navigate = useNavigate();
  const trips = useTrips();
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState<Trip | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const openTrip = trips.find((t) => t.id === openTripId);
  const activeTrips = trips.filter((t) => !t.archivedAt);
  const archivedTrips = trips.filter((t) => !!t.archivedAt);
  const listToShow = showArchived ? archivedTrips : activeTrips;

  if (openTrip) {
    return <TripDetail trip={openTrip} onBack={() => setOpenTripId(null)} />;
  }

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-1 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold">
              <Plane className="h-6 w-6 text-primary" />
              Trips
            </h1>
            <p className="text-xs text-muted-foreground">
              Smart vacation & group expense management
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        </div>

        {archivedTrips.length > 0 && (
          <div className="mb-3 flex gap-2">
            <Button
              size="sm"
              variant={!showArchived ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShowArchived(false)}
            >
              Active ({activeTrips.length})
            </Button>
            <Button
              size="sm"
              variant={showArchived ? "default" : "outline"}
              className="flex-1 gap-1"
              onClick={() => setShowArchived(true)}
            >
              <Archive className="h-3 w-3" /> Archived ({archivedTrips.length})
            </Button>
          </div>
        )}

        {listToShow.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                <Plane className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold">
                {showArchived ? "No archived trips" : "No trips yet"}
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                {showArchived
                  ? "Archived trips are kept for 30 days, then permanently removed."
                  : "Create a vacation, invite friends, and let TIPIDPAY handle the splitting."}
              </p>
              {!showArchived && (
                <Button onClick={() => setCreateOpen(true)} className="gap-1">
                  <Plus className="h-4 w-4" /> Plan your first trip
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listToShow.map((t) => {
              const spent = totalSpent(t);
              const pct = t.budget > 0 ? Math.min(100, Math.round((spent / t.budget) * 100)) : 0;
              const over = t.budget > 0 && spent > t.budget;
              const pending = pendingPaymentsCount(t);
              const isArchived = !!t.archivedAt;
              const daysLeft = t.archivedAt
                ? Math.max(0, 30 - Math.floor((Date.now() - t.archivedAt) / 86400000))
                : 0;
              return (
                <div
                  key={t.id}
                  className="relative rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-soft"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenTripId(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setOpenTripId(t.id);
                    }}
                    className="flex cursor-pointer items-start gap-3 pr-8 text-left"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
                      {t.coverEmoji || "🏖️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-bold text-foreground">
                          {t.name}
                          {isArchived && (
                            <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                              · archived
                            </span>
                          )}
                        </h3>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {t.members.length} <Users className="ml-0.5 h-3 w-3" />
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        📍 {t.destination || "—"}
                        {t.startDate && ` · ${t.startDate}`}
                      </p>
                      {t.budget > 0 ? (
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-[11px]">
                            <span className="text-muted-foreground">
                              {formatPeso(spent)} / {formatPeso(t.budget)}
                            </span>
                            <span className={over ? "font-bold text-destructive" : "text-muted-foreground"}>
                              {pct}%
                            </span>
                          </div>
                          <Progress value={pct} className={over ? "[&>div]:bg-destructive" : ""} />
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatPeso(spent)} spent
                        </p>
                      )}
                      {isArchived ? (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Auto-deletes in {daysLeft}d
                        </p>
                      ) : (
                        pending > 0 && (
                          <p className="mt-1 text-[10px] font-medium text-amber-600">
                            {pending} pending payment{pending > 1 ? "s" : ""}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Trip actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setOpenTripId(t.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingTrip(t)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Trip
                        </DropdownMenuItem>
                        {isArchived ? (
                          <DropdownMenuItem
                            onClick={() => {
                              vacationStore.unarchiveTrip(t.id);
                              toast({ title: "Trip restored ✅" });
                            }}
                          >
                            <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              vacationStore.archiveTrip(t.id);
                              toast({
                                title: "Trip archived",
                                description: "Kept for 30 days before permanent deletion.",
                              });
                            }}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive Trip
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setConfirmDeleteTrip(t)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Trip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={setOpenTripId} />
      <EditTripDialog
        trip={editingTrip}
        open={!!editingTrip}
        onOpenChange={(o) => !o && setEditingTrip(null)}
      />
      <DeleteTripDialog
        trip={confirmDeleteTrip}
        open={!!confirmDeleteTrip}
        onOpenChange={(o) => !o && setConfirmDeleteTrip(null)}
      />
    </div>
  );
}

/* ---------------- Edit Trip Dialog ---------------- */

function EditTripDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [cover, setCover] = useState("🏖️");

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setDestination(trip.destination || "");
      setStartDate(trip.startDate || "");
      setEndDate(trip.endDate || "");
      setDescription(trip.description || "");
      setBudget(String(trip.budget || ""));
      setCover(trip.coverEmoji || "🏖️");
    }
  }, [trip]);

  if (!trip) return null;

  const save = () => {
    if (!name.trim()) {
      toast({ title: "Trip name required", variant: "destructive" });
      return;
    }
    vacationStore.update(trip.id, {
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      description: description.trim(),
      coverEmoji: cover,
      budget: Number(budget) || 0,
    });
    toast({ title: "Trip updated ✅" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Cover</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {COVERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCover(c)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition ${
                    cover === c ? "bg-primary/20 ring-2 ring-primary" : "bg-accent hover:bg-accent/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Trip name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Total budget (₱)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Delete Trip Dialog ---------------- */

function DeleteTripDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!trip) return null;
  const admin = trip.members.find((m) => m.isAdmin);
  const expenseCount = trip.expenses.filter((e) => !e.deletedAt).length;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{trip.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this trip? All trip details, expenses,
            participants, payments, and records associated with this trip will be permanently
            removed. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl bg-muted/40 p-3 text-xs">
          <p>
            <strong>{expenseCount}</strong> expense{expenseCount === 1 ? "" : "s"} ·{" "}
            <strong>{trip.members.length}</strong> participant
            {trip.members.length === 1 ? "" : "s"}
          </p>
          {admin && (
            <p className="mt-1 text-muted-foreground">
              Admin: {admin.name} (only the trip admin can delete)
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              vacationStore.remove(trip.id);
              toast({ title: "Trip deleted", description: `${trip.name} has been removed.` });
              onOpenChange(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------- Create Trip Dialog ---------------- */

function CreateTripDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [cover, setCover] = useState("🏖️");
  const [memberNames, setMemberNames] = useState("You");

  const reset = () => {
    setName("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setBudget("");
    setCover("🏖️");
    setMemberNames("You");
  };

  const submit = () => {
    if (!name.trim()) {
      toast({ title: "Trip name required", variant: "destructive" });
      return;
    }
    const members = memberNames
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n, i) => ({ id: newId(), name: n, isAdmin: i === 0 }));
    if (members.length < 1) {
      toast({ title: "Add at least one member", variant: "destructive" });
      return;
    }
    const id = newId();
    vacationStore.add({
      id,
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      description: description.trim(),
      coverEmoji: cover,
      budget: Number(budget) || 0,
      members,
      expenses: [],
      createdAt: Date.now(),
    });
    toast({ title: "Trip created! 🎉", description: `${name} is ready.` });
    reset();
    onOpenChange(false);
    onCreated(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a trip</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Cover</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {COVERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCover(c)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition ${
                    cover === c ? "bg-primary/20 ring-2 ring-primary" : "bg-accent hover:bg-accent/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Trip name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Boracay 2026" />
          </div>
          <div>
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Boracay, Philippines"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Total budget (₱)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="20000"
            />
          </div>
          <div>
            <Label>Members (comma-separated, first is admin)</Label>
            <Input
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              placeholder="You, Mia, Jake, Sam"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              You can also share invites later via QR or link.
            </p>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Long weekend with the squad"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gap-1">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Trip Detail ---------------- */

function TripDetail({ trip, onBack }: { trip: Trip; onBack: () => void }) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<TripExpense | null>(null);
  const [paying, setPaying] = useState<TripExpense | null>(null);
  const [viewing, setViewing] = useState<TripExpense | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TripExpense | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);

  // Filtering / search / sort
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<"all" | ExpenseCategory>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ExpenseStatus>("all");
  const [sort, setSort] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "updated">(
    "date_desc"
  );

  const liveExpenses = trip.expenses.filter((e) => !e.deletedAt);
  const trashedExpenses = trip.expenses.filter((e) => !!e.deletedAt);

  const spent = totalSpent(trip);
  const remaining = Math.max(0, trip.budget - spent);
  const over = trip.budget > 0 && spent > trip.budget;
  const pct = trip.budget > 0 ? Math.min(100, Math.round((spent / trip.budget) * 100)) : 0;
  const perPerson = trip.members.length > 0 ? spent / trip.members.length : 0;
  const outstanding = outstandingBalance(trip);
  const pending = pendingPaymentsCount(trip);

  const balances = useMemo(() => computeBalances(trip), [trip]);
  const settlements = useMemo(() => computeSettlements(trip), [trip]);

  const days = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 0;
    const s = new Date(trip.startDate).getTime();
    const e = new Date(trip.endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 0;
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  }, [trip.startDate, trip.endDate]);
  const dailyLimit = days > 0 && trip.budget > 0 ? trip.budget / days : 0;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    liveExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([k, v], i) => ({
      name: CATEGORY_META[k as ExpenseCategory]?.label || k,
      value: Math.round(v),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [liveExpenses]);

  const memberContribData = useMemo(
    () =>
      balances.map((b) => ({
        name: trip.members.find((m) => m.id === b.memberId)?.name || "?",
        paid: b.paid,
      })),
    [balances, trip.members]
  );

  const visibleExpenses = useMemo(() => {
    const s = search.trim().toLowerCase();
    let list = liveExpenses.filter((e) => {
      if (filterCat !== "all" && e.category !== filterCat) return false;
      if (filterStatus !== "all" && expenseStatus(e) !== filterStatus) return false;
      if (s) {
        const payerName = trip.members.find((m) => m.id === e.paidById)?.name?.toLowerCase() || "";
        const hay = `${e.title} ${e.note || ""} ${payerName} ${CATEGORY_META[e.category]?.label || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return a.date - b.date;
        case "amount_desc":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        case "updated": {
          const au = a.audit[a.audit.length - 1]?.at || a.date;
          const bu = b.audit[b.audit.length - 1]?.at || b.date;
          return bu - au;
        }
        case "date_desc":
        default:
          return b.date - a.date;
      }
    });
    return list;
  }, [liveExpenses, search, filterCat, filterStatus, sort, trip.members]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Title", "Category", "Amount", "Paid By", "Status", "Paid", "Remaining", "Split Mode", "Note"],
      ...liveExpenses.map((e) => [
        new Date(e.date).toISOString().slice(0, 10),
        e.title,
        CATEGORY_META[e.category]?.label || e.category,
        e.amount.toFixed(2),
        trip.members.find((m) => m.id === e.paidById)?.name || "?",
        STATUS_META[expenseStatus(e)].label,
        expensePaid(e).toFixed(2),
        expenseRemaining(e).toFixed(2),
        e.mode,
        (e.note || "").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, "_")}_expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported ✅", description: "CSV / Excel-compatible file downloaded." });
  };

  const exportPDF = () => {
    const win = window.open("", "_blank", "width=820,height=900");
    if (!win) return;
    const memberName = (id: string) => trip.members.find((m) => m.id === id)?.name || "—";
    const settlementRows = settlements
      .map(
        (s) =>
          `<tr><td>${memberName(s.fromId)}</td><td>→</td><td>${memberName(s.toId)}</td><td style="text-align:right">${formatPeso(s.amount)}</td></tr>`
      )
      .join("");
    const expenseRows = liveExpenses
      .map(
        (e) => `<tr>
          <td>${new Date(e.date).toLocaleDateString()}</td>
          <td>${e.title}</td>
          <td>${CATEGORY_META[e.category]?.label || ""}</td>
          <td>${memberName(e.paidById)}</td>
          <td>${STATUS_META[expenseStatus(e)].label}</td>
          <td style="text-align:right">${formatPeso(e.amount)}</td>
          <td style="text-align:right">${formatPeso(expensePaid(e))}</td>
          <td style="text-align:right">${formatPeso(expenseRemaining(e))}</td>
        </tr>`
      )
      .join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${trip.name} — Settlement Summary</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#111;padding:32px;max-width:780px;margin:auto}
        h1{margin:0 0 4px 0}h2{margin-top:28px;font-size:16px;border-bottom:1px solid #eee;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
        td,th{padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:left}
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
        .stat{background:#f7f7f9;padding:10px;border-radius:8px}
        .stat .l{font-size:11px;color:#666}.stat .v{font-weight:700;font-size:14px}
        .muted{color:#666;font-size:12px}
      </style></head><body>
      <h1>${trip.name}</h1>
      <div class="muted">${trip.destination || ""} · ${trip.startDate || ""}${trip.endDate ? " → " + trip.endDate : ""}</div>
      <div class="stats">
        <div class="stat"><div class="l">Total Budget</div><div class="v">${formatPeso(trip.budget)}</div></div>
        <div class="stat"><div class="l">Total Spent</div><div class="v">${formatPeso(spent)}</div></div>
        <div class="stat"><div class="l">Remaining</div><div class="v">${formatPeso(remaining)}</div></div>
        <div class="stat"><div class="l">Outstanding</div><div class="v">${formatPeso(outstanding)}</div></div>
        <div class="stat"><div class="l">Participants</div><div class="v">${trip.members.length}</div></div>
        <div class="stat"><div class="l">Pending payments</div><div class="v">${pending}</div></div>
      </div>
      <h2>Expenses</h2>
      <table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Paid by</th><th>Status</th><th style="text-align:right">Amount</th><th style="text-align:right">Paid</th><th style="text-align:right">Remaining</th></tr></thead><tbody>${expenseRows || '<tr><td colspan="8" class="muted">No expenses</td></tr>'}</tbody></table>
      <h2>Who Pays Whom</h2>
      <table><tbody>${settlementRows || '<tr><td class="muted">Everyone is even 🎉</td></tr>'}</tbody></table>
      <p class="muted" style="margin-top:24px">Generated by TipidPay · ${new Date().toLocaleString()}</p>
      <script>window.onload=()=>window.print();</script>
      </body></html>`);
    win.document.close();
  };

  const remind = () => {
    if (pending === 0) {
      toast({ title: "Nothing to remind ✨", description: "All expenses are fully paid." });
      return;
    }
    toast({
      title: `Reminders sent to ${pending} pending payer${pending > 1 ? "s" : ""} 🔔`,
      description: "Group members will be notified.",
    });
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All trips
        </button>

        {/* Hero */}
        <div className="mb-4 rounded-2xl gradient-primary p-5 shadow-lg">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                {trip.coverEmoji}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-primary-foreground">{trip.name}</h2>
                <p className="text-xs text-primary-foreground/80">📍 {trip.destination || "—"}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
              {trip.members.length} <Users className="ml-1 h-3 w-3" />
            </Badge>
          </div>
          {trip.budget > 0 && (
            <div className="mt-1">
              <Progress value={pct} className="[&>div]:bg-white" />
              <p className="mt-1 text-[10px] text-primary-foreground/80">
                {pct}% of {formatPeso(trip.budget)} budget
                {dailyLimit > 0 && ` · ${formatPeso(dailyLimit)}/day`}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard cards */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <StatCard label="Budget" value={formatPeso(trip.budget)} />
          <StatCard label="Spent" value={formatPeso(spent)} tone={over ? "danger" : "default"} />
          <StatCard label="Remaining" value={formatPeso(remaining)} tone={over ? "danger" : "good"} />
          <StatCard label="Outstanding" value={formatPeso(outstanding)} tone={outstanding > 0 ? "warning" : "good"} />
          <StatCard label="Participants" value={String(trip.members.length)} />
          <StatCard
            label="Pending"
            value={String(pending)}
            tone={pending > 0 ? "warning" : "good"}
          />
        </div>

        {over && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              You're over budget by {formatPeso(spent - trip.budget)}. Consider trimming categories like{" "}
              {categoryData[0]?.name || "extras"}.
            </span>
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <Button className="flex-1 gap-1" onClick={() => setExpenseOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
          <Button variant="outline" onClick={() => setInviteOpen(true)} className="gap-1">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
          <Button variant="outline" size="icon" onClick={remind} title="Send reminders">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={exportCSV}>
            <Download className="h-3 w-3" /> Excel/CSV
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={exportPDF}>
            <Printer className="h-3 w-3" /> PDF
          </Button>
          {trashedExpenses.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setTrashOpen(true)}>
              <Trash2 className="h-3 w-3" /> Trash ({trashedExpenses.length})
            </Button>
          )}
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses">
              <Receipt className="mr-1 h-3 w-3" />
              <span className="text-xs">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="balances">
              <Wallet className="mr-1 h-3 w-3" />
              <span className="text-xs">Balances</span>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieIcon className="mr-1 h-3 w-3" />
              <span className="text-xs">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="mr-1 h-3 w-3" />
              <span className="text-xs">People</span>
            </TabsTrigger>
          </TabsList>

          {/* Expenses */}
          <TabsContent value="expenses" className="mt-3 space-y-2">
            {/* Search + filters */}
            <div className="rounded-2xl bg-card p-2 shadow-card space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search expenses, notes, payers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select value={filterCat} onValueChange={(v) => setFilterCat(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <Filter className="mr-1 h-3 w-3" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {PRIMARY_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_META[c].icon} {CATEGORY_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Newest first</SelectItem>
                    <SelectItem value="date_asc">Oldest first</SelectItem>
                    <SelectItem value="amount_desc">Amount ↓</SelectItem>
                    <SelectItem value="amount_asc">Amount ↑</SelectItem>
                    <SelectItem value="updated">Recently updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {visibleExpenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {liveExpenses.length === 0 ? (
                    <>No expenses yet. Tap <strong>Add Expense</strong> to start.</>
                  ) : (
                    "No expenses match your filters."
                  )}
                </CardContent>
              </Card>
            ) : (
              visibleExpenses.map((e) => (
                <ExpenseRow
                  key={e.id}
                  trip={trip}
                  expense={e}
                  onView={() => setViewing(e)}
                  onEdit={() => setEditing(e)}
                  onPay={() => setPaying(e)}
                  onDelete={() => setConfirmDelete(e)}
                />
              ))
            )}
          </TabsContent>

          {/* Balances */}
          <TabsContent value="balances" className="mt-3 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Member balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {balances.map((b) => {
                  const m = trip.members.find((x) => x.id === b.memberId)!;
                  const owedMoney = b.net > 0.01;
                  const owesMoney = b.net < -0.01;
                  return (
                    <div
                      key={b.memberId}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {m.name} {m.isAdmin && <span className="text-[10px] text-primary">★</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Paid {formatPeso(b.paid)} · Share {formatPeso(b.share)}
                        </p>
                      </div>
                      <div
                        className={`text-right text-sm font-bold ${
                          owedMoney ? "text-primary" : owesMoney ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {owedMoney && `+${formatPeso(b.net)}`}
                        {owesMoney && `-${formatPeso(Math.abs(b.net))}`}
                        {!owedMoney && !owesMoney && "Settled"}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" /> Settle up suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {settlements.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Everyone is even. 🎉</p>
                ) : (
                  settlements.map((s, i) => {
                    const from = trip.members.find((m) => m.id === s.fromId)?.name;
                    const to = trip.members.find((m) => m.id === s.toId)?.name;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-sm"
                      >
                        <span className="font-medium">
                          {from} <ArrowRight className="inline h-3 w-3" /> {to}
                        </span>
                        <span className="font-bold text-primary">{formatPeso(s.amount)}</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-3 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Spending by category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {categoryData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Pie>
                      <RTooltip formatter={(v: number) => formatPeso(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="ml-auto font-semibold">{formatPeso(c.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contribution per member</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={memberContribData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <RTooltip formatter={(v: number) => formatPeso(v)} />
                    <Bar dataKey="paid" fill="hsl(160, 84%, 39%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" /> Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                {liveExpenses.length === 0 ? (
                  <p className="text-muted-foreground">Add expenses to enable predictions.</p>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per expense</span>
                      <span className="font-semibold">
                        {formatPeso(spent / liveExpenses.length)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per person</span>
                      <span className="font-semibold">{formatPeso(perPerson)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-semibold">{formatPeso(outstanding)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members */}
          <TabsContent value="members" className="mt-3 space-y-2">
            <MemberManager trip={trip} />
          </TabsContent>
        </Tabs>
      </div>

      <AddExpenseDialog trip={trip} open={expenseOpen} onOpenChange={setExpenseOpen} />
      <InviteDialog trip={trip} open={inviteOpen} onOpenChange={setInviteOpen} />
      {editing && (
        <EditExpenseDialog
          trip={trip}
          expense={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}
      {paying && (
        <PaymentDialog
          trip={trip}
          expense={paying}
          open={!!paying}
          onOpenChange={(o) => !o && setPaying(null)}
        />
      )}
      {viewing && (
        <ExpenseDetailDialog
          trip={trip}
          expense={viewing}
          open={!!viewing}
          onOpenChange={(o) => !o && setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
          onPay={() => {
            setPaying(viewing);
            setViewing(null);
          }}
        />
      )}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move expense to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete && expensePaid(confirmDelete) > 0 && (
                <span className="mb-2 block rounded-md bg-amber-500/10 p-2 text-amber-700">
                  ⚠ This expense has {formatPeso(expensePaid(confirmDelete))} in recorded payments.
                  Deleting will exclude it from balances.
                </span>
              )}
              You can restore it from <strong>Trash</strong> within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  vacationStore.softDeleteExpense(trip.id, confirmDelete.id);
                  toast({ title: "Moved to trash", description: "Restore within 30 days." });
                }
                setConfirmDelete(null);
              }}
            >
              Move to trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TrashDialog
        trip={trip}
        open={trashOpen}
        onOpenChange={setTrashOpen}
        items={trashedExpenses}
      />
    </div>
  );
}

/* ---------------- Stat card ---------------- */

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "warning" | "danger";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warning"
      ? "text-amber-600"
      : tone === "danger"
      ? "text-destructive"
      : "text-foreground";
  return (
    <div className="rounded-xl bg-card p-2.5 shadow-card">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

/* ---------------- Expense row ---------------- */

function ExpenseRow({
  trip,
  expense,
  onView,
  onEdit,
  onPay,
  onDelete,
}: {
  trip: Trip;
  expense: TripExpense;
  onView: () => void;
  onEdit: () => void;
  onPay: () => void;
  onDelete: () => void;
}) {
  const meta = CATEGORY_META[expense.category] || CATEGORY_META.others;
  const payer = trip.members.find((m) => m.id === expense.paidById)?.name || "?";
  const paid = expensePaid(expense);
  const remaining = expenseRemaining(expense);
  const status = expenseStatus(expense);
  const StatusIcon = STATUS_META[status].icon;
  const pct = expense.amount > 0 ? Math.min(100, (paid / expense.amount) * 100) : 0;

  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <button onClick={onView} className="flex w-full items-start gap-3 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-xl">
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold">{expense.title}</p>
            <span className="shrink-0 text-sm font-bold">{formatPeso(expense.amount)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_META[status].className}`}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {STATUS_META[status].label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {meta.label} · {payer}
            </span>
          </div>
          {status !== "unpaid" && status !== "paid" && (
            <div className="mt-1.5">
              <Progress value={pct} className="h-1" />
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatPeso(paid)} paid · {formatPeso(remaining)} left
              </p>
            </div>
          )}
        </div>
      </button>
      <div className="mt-2 flex gap-1">
        {status !== "paid" && (
          <Button size="sm" variant="default" className="h-7 flex-1 gap-1 text-xs" onClick={onPay}>
            <CircleDollarSign className="h-3 w-3" /> Settle Up
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={onEdit}>
          <Pencil className="h-3 w-3" /> Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Trash dialog ---------------- */

function TrashDialog({
  trip,
  open,
  onOpenChange,
  items,
}: {
  trip: Trip;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: TripExpense[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Trash
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Items are permanently deleted 30 days after removal.
          </p>
        </DialogHeader>
        <div className="space-y-2">
          {items.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Trash is empty.</p>
          )}
          {items.map((e) => {
            const daysLeft = e.deletedAt
              ? Math.max(0, 30 - Math.floor((Date.now() - e.deletedAt) / 86400000))
              : 0;
            return (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatPeso(e.amount)} · auto-deletes in {daysLeft}d
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    vacationStore.restoreExpense(trip.id, e.id);
                    toast({ title: "Restored ✅" });
                  }}
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-destructive"
                  onClick={() => {
                    if (confirm("Permanently delete this expense?")) {
                      vacationStore.removeExpense(trip.id, e.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Expense detail dialog (payment history, audit, receipt) ---------------- */

function ExpenseDetailDialog({
  trip,
  expense,
  open,
  onOpenChange,
  onEdit,
  onPay,
}: {
  trip: Trip;
  expense: TripExpense;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: () => void;
  onPay: () => void;
}) {
  const meta = CATEGORY_META[expense.category] || CATEGORY_META.others;
  const status = expenseStatus(expense);
  const paid = expensePaid(expense);
  const remaining = expenseRemaining(expense);
  const pct = expense.amount > 0 ? Math.min(100, Math.round((paid / expense.amount) * 100)) : 0;
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  const progressColor =
    status === "paid"
      ? "[&>div]:bg-emerald-500"
      : status === "unpaid"
      ? "[&>div]:bg-destructive"
      : "[&>div]:bg-amber-500";

  const startEdit = (pid: string, amount: number, note?: string) => {
    setEditingPayment(pid);
    setEditAmount(String(amount));
    setEditNote(note || "");
  };

  const saveEdit = (pid: string) => {
    const n = Number(editAmount);
    if (!n || n <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    // Re-compute cap excluding this payment
    const otherPaid = expense.payments
      .filter((x) => x.id !== pid)
      .reduce((s, x) => s + x.amount, 0);
    if (n + otherPaid > expense.amount + 0.01) {
      toast({
        title: "Amount exceeds expense total",
        description: `Max for this payment: ${formatPeso(expense.amount - otherPaid)}`,
        variant: "destructive",
      });
      return;
    }
    vacationStore.editPayment(trip.id, expense.id, pid, {
      amount: Math.round(n * 100) / 100,
      note: editNote.trim() || undefined,
    });
    setEditingPayment(null);
    toast({ title: "Payment updated ✅" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            {expense.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/40 p-2">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-sm font-bold">{formatPeso(expense.amount)}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-2">
              <p className="text-[10px] text-emerald-700">Paid</p>
              <p className="text-sm font-bold text-emerald-700">{formatPeso(paid)}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-2">
              <p className="text-[10px] text-amber-700">Remaining</p>
              <p className="text-sm font-bold text-amber-700">{formatPeso(remaining)}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <Badge className={STATUS_META[status].className} variant="outline">
                {STATUS_META[status].label}
              </Badge>
              <span className="font-semibold">{pct}% paid</span>
            </div>
            <Progress value={pct} className={`h-2 ${progressColor}`} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {meta.label} · {new Date(expense.date).toLocaleDateString()}
            </span>
          </div>
          {expense.note && (
            <p className="rounded-md bg-muted/40 p-2 text-xs italic">{expense.note}</p>
          )}
          {expense.receiptName && (
            <div className="rounded-md border bg-muted/30 p-2 text-xs">
              📎 {expense.receiptName}
              {expense.receiptData && (
                <a
                  href={expense.receiptData}
                  download={expense.receiptName}
                  className="ml-2 text-primary underline"
                >
                  Download
                </a>
              )}
            </div>
          )}

          <div>
            <h4 className="mb-1 text-xs font-semibold">Participants</h4>
            <div className="space-y-1">
              {expense.splits.map((s) => {
                const m = trip.members.find((x) => x.id === s.memberId);
                return (
                  <div key={s.memberId} className="flex items-center justify-between text-xs">
                    <span>{m?.name || "?"}</span>
                    <span className="font-medium">{formatPeso(s.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span>Payment history</span>
              {status !== "paid" && (
                <Button size="sm" className="h-6 gap-1 text-[10px]" onClick={onPay}>
                  <Plus className="h-3 w-3" /> Add payment
                </Button>
              )}
            </h4>
            {expense.payments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-1">
                {expense.payments.map((p) => {
                  const m = p.byMemberId
                    ? trip.members.find((x) => x.id === p.byMemberId)
                    : null;
                  const isEditing = editingPayment === p.id;
                  return (
                    <div
                      key={p.id}
                      className="rounded-md bg-emerald-500/5 p-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">₱</span>
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="h-7 text-xs"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                            />
                          </div>
                          <Input
                            className="h-7 text-xs"
                            placeholder="Note (optional)"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-6 flex-1 text-[10px]"
                              onClick={() => saveEdit(p.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 flex-1 text-[10px]"
                              onClick={() => setEditingPayment(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{formatPeso(p.amount)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(p.date).toLocaleString()}
                              {m && ` · by ${m.name}`}
                              {p.note && ` · ${p.note}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded p-1 hover:bg-muted"
                              onClick={() => startEdit(p.id, p.amount, p.note)}
                              aria-label="Edit payment"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              className="rounded p-1 text-destructive hover:bg-muted"
                              onClick={() => {
                                if (confirm("Delete this payment record?")) {
                                  vacationStore.removePayment(trip.id, expense.id, p.id);
                                }
                              }}
                              aria-label="Delete payment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold">
              <History className="h-3 w-3" /> Audit trail
            </h4>
            <div className="space-y-1 text-[11px]">
              {expense.audit.slice().reverse().map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1 mt-1.5 h-1 rounded-full bg-muted-foreground" />
                  <span>
                    <strong className="text-foreground">{a.by}</strong> · {a.action}
                    {a.details && ` (${a.details})`}
                    <span className="ml-1 text-[10px]">
                      {new Date(a.at).toLocaleString()}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onEdit} className="gap-1">
            <Pencil className="h-3 w-3" /> Edit
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Payment dialog ---------------- */

function PaymentDialog({
  trip,
  expense,
  open,
  onOpenChange,
}: {
  trip: Trip;
  expense: TripExpense;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const remaining = expenseRemaining(expense);
  const [amount, setAmount] = useState(remaining.toString());
  const [byMemberId, setByMemberId] = useState(expense.paidById);
  const [note, setNote] = useState("");

  const submit = () => {
    const n = Number(amount);
    if (!n || n <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (n > remaining + 0.01) {
      toast({
        title: "Amount exceeds remaining balance",
        description: `Remaining is ${formatPeso(remaining)}`,
        variant: "destructive",
      });
      return;
    }
    vacationStore.addPayment(trip.id, expense.id, {
      amount: Math.round(n * 100) / 100,
      date: Date.now(),
      byMemberId,
      note: note.trim() || undefined,
    });
    const newRemaining = remaining - n;
    toast({
      title: newRemaining <= 0.01 ? "Fully settled 🎉" : "Payment recorded ✅",
      description:
        newRemaining <= 0.01
          ? "This expense is now fully paid."
          : `Remaining balance: ${formatPeso(newRemaining)}. Group notified.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {expense.title} · Remaining {formatPeso(remaining)}
          </p>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Amount (₱)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="mt-1 flex gap-1">
              <button
                type="button"
                className="rounded-md bg-muted px-2 py-0.5 text-[10px]"
                onClick={() => setAmount((remaining / 2).toFixed(2))}
              >
                Half
              </button>
              <button
                type="button"
                className="rounded-md bg-muted px-2 py-0.5 text-[10px]"
                onClick={() => setAmount(remaining.toFixed(2))}
              >
                Full ({formatPeso(remaining)})
              </button>
            </div>
          </div>
          <div>
            <Label>Paid by</Label>
            <Select value={byMemberId} onValueChange={setByMemberId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trip.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="GCash, cash, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Member Manager ---------------- */

function MemberManager({ trip }: { trip: Trip }) {
  const [name, setName] = useState("");
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Group members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trip.members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{m.name}</p>
                {m.isAdmin && (
                  <p className="text-[10px] text-primary">Trip admin ★</p>
                )}
              </div>
            </div>
            {!m.isAdmin && (
              <button
                onClick={() => vacationStore.removeMember(trip.id, m.id)}
                className="text-destructive hover:opacity-70"
                title="Remove (only if no expenses involve them)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Add member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              if (!name.trim()) return;
              vacationStore.addMember(trip.id, name.trim());
              setName("");
            }}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Expense form (shared between Add and Edit) ---------------- */

interface ExpenseFormState {
  title: string;
  amount: string;
  category: ExpenseCategory;
  paidById: string;
  mode: SplitMode;
  note: string;
  receiptName: string;
  receiptData: string;
  dueDate: string;
  selectedIds: string[];
  percents: Record<string, number>;
  customs: Record<string, number>;
}

function ExpenseFormFields({
  trip,
  state,
  setState,
}: {
  trip: Trip;
  state: ExpenseFormState;
  setState: React.Dispatch<React.SetStateAction<ExpenseFormState>>;
}) {
  const amtNum = Number(state.amount) || 0;
  const update = (patch: Partial<ExpenseFormState>) => setState((s) => ({ ...s, ...patch }));
  return (
    <div className="space-y-3">
      <div>
        <Label>Title *</Label>
        <Input
          value={state.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Dinner at..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Amount (₱) *</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={state.amount}
            onChange={(e) => update({ amount: e.target.value })}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={state.category}
            onValueChange={(v) => update({ category: v as ExpenseCategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIMARY_CATEGORIES.map((k) => (
                <SelectItem key={k} value={k}>
                  {CATEGORY_META[k].icon} {CATEGORY_META[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Paid by</Label>
          <Select value={state.paidById} onValueChange={(v) => update({ paidById: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trip.members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Due date</Label>
          <Input
            type="date"
            value={state.dueDate}
            onChange={(e) => update({ dueDate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Split mode</Label>
        <Select value={state.mode} onValueChange={(v) => update({ mode: v as SplitMode })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal">Equal — split among all</SelectItem>
            <SelectItem value="selected">Selected participants only</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="custom">Custom amounts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state.mode === "selected" && (
        <div className="rounded-xl bg-muted/40 p-2">
          <p className="mb-2 text-xs font-medium">Participants</p>
          {trip.members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 py-1 text-sm">
              <Checkbox
                checked={state.selectedIds.includes(m.id)}
                onCheckedChange={(c) => {
                  update({
                    selectedIds: c
                      ? [...state.selectedIds, m.id]
                      : state.selectedIds.filter((x) => x !== m.id),
                  });
                }}
              />
              {m.name}
            </label>
          ))}
        </div>
      )}
      {state.mode === "percentage" && (
        <div className="space-y-1 rounded-xl bg-muted/40 p-2">
          {trip.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{m.name}</span>
              <Input
                type="number"
                className="w-20"
                placeholder="0"
                value={state.percents[m.id] ?? ""}
                onChange={(e) =>
                  update({
                    percents: { ...state.percents, [m.id]: Number(e.target.value) || 0 },
                  })
                }
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">
            Total: {Object.values(state.percents).reduce((s, v) => s + (v || 0), 0)}%
          </p>
        </div>
      )}
      {state.mode === "custom" && (
        <div className="space-y-1 rounded-xl bg-muted/40 p-2">
          {trip.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{m.name}</span>
              <span className="text-xs text-muted-foreground">₱</span>
              <Input
                type="number"
                className="w-24"
                placeholder="0"
                value={state.customs[m.id] ?? ""}
                onChange={(e) =>
                  update({
                    customs: { ...state.customs, [m.id]: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">
            Total: {formatPeso(Object.values(state.customs).reduce((s, v) => s + (v || 0), 0))} /{" "}
            {formatPeso(amtNum)}
          </p>
        </div>
      )}
      <div>
        <Label>Receipt</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              update({
                receiptName: f.name,
                receiptData: typeof reader.result === "string" ? reader.result : "",
              });
            };
            reader.readAsDataURL(f);
          }}
        />
        {state.receiptName && (
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>📎 {state.receiptName}</span>
            <button
              type="button"
              className="text-destructive"
              onClick={() => update({ receiptName: "", receiptData: "" })}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div>
        <Label>Note / description</Label>
        <Textarea
          rows={2}
          value={state.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="Optional comment..."
        />
      </div>
    </div>
  );
}

function validateExpense(amtNum: number, state: ExpenseFormState) {
  if (!state.title.trim()) return "Title required";
  if (amtNum <= 0) return "Amount must be > 0";
  if (state.mode === "percentage") {
    const total = Object.values(state.percents).reduce((s, v) => s + (v || 0), 0);
    if (Math.abs(total - 100) > 0.5) return "Percentages must total 100%";
  }
  if (state.mode === "custom") {
    const total = Object.values(state.customs).reduce((s, v) => s + (v || 0), 0);
    if (Math.abs(total - amtNum) > 0.5) return `Custom amounts must total ${formatPeso(amtNum)}`;
  }
  return null;
}

/* ---------------- Add Expense Dialog ---------------- */

function AddExpenseDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [state, setState] = useState<ExpenseFormState>({
    title: "",
    amount: "",
    category: "food",
    paidById: trip.members[0]?.id || "",
    mode: "equal",
    note: "",
    receiptName: "",
    receiptData: "",
    dueDate: "",
    selectedIds: trip.members.map((m) => m.id),
    percents: {},
    customs: {},
  });

  const submit = () => {
    const amtNum = Number(state.amount) || 0;
    const err = validateExpense(amtNum, state);
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }
    const splits = buildSplits(
      amtNum,
      state.mode,
      trip.members.map((m) => m.id),
      { selectedIds: state.selectedIds, percents: state.percents, customs: state.customs }
    );
    if (splits.length === 0) {
      toast({ title: "Select at least one participant", variant: "destructive" });
      return;
    }
    vacationStore.addExpense(trip.id, {
      id: newId(),
      title: state.title.trim(),
      category: state.category,
      amount: amtNum,
      paidById: state.paidById,
      date: Date.now(),
      dueDate: state.dueDate ? new Date(state.dueDate).getTime() : undefined,
      mode: state.mode,
      splits,
      note: state.note.trim() || undefined,
      receiptName: state.receiptName || undefined,
      receiptData: state.receiptData || undefined,
      payments: [],
      audit: [],
    });
    toast({ title: "Expense added ✅" });
    setState({
      title: "",
      amount: "",
      category: "food",
      paidById: trip.members[0]?.id || "",
      mode: "equal",
      note: "",
      receiptName: "",
      receiptData: "",
      dueDate: "",
      selectedIds: trip.members.map((m) => m.id),
      percents: {},
      customs: {},
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <ExpenseFormFields trip={trip} state={state} setState={setState} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Add expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Edit Expense Dialog ---------------- */

function EditExpenseDialog({
  trip,
  expense,
  open,
  onOpenChange,
}: {
  trip: Trip;
  expense: TripExpense;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const initialSelected =
    expense.mode === "selected"
      ? expense.splits.map((s) => s.memberId)
      : trip.members.map((m) => m.id);
  const initialPercents: Record<string, number> = {};
  const initialCustoms: Record<string, number> = {};
  expense.splits.forEach((s) => {
    if (s.percent != null) initialPercents[s.memberId] = s.percent;
    if (s.custom != null) initialCustoms[s.memberId] = s.custom;
  });
  const cat = (PRIMARY_CATEGORIES as readonly string[]).includes(expense.category)
    ? expense.category
    : ("others" as ExpenseCategory);

  const [state, setState] = useState<ExpenseFormState>({
    title: expense.title,
    amount: String(expense.amount),
    category: cat,
    paidById: expense.paidById,
    mode: expense.mode,
    note: expense.note || "",
    receiptName: expense.receiptName || "",
    receiptData: expense.receiptData || "",
    dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
    selectedIds: initialSelected,
    percents: initialPercents,
    customs: initialCustoms,
  });

  const submit = () => {
    const amtNum = Number(state.amount) || 0;
    const err = validateExpense(amtNum, state);
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }
    const splits = buildSplits(
      amtNum,
      state.mode,
      trip.members.map((m) => m.id),
      { selectedIds: state.selectedIds, percents: state.percents, customs: state.customs }
    );
    vacationStore.editExpense(trip.id, expense.id, {
      title: state.title.trim(),
      category: state.category,
      amount: amtNum,
      paidById: state.paidById,
      dueDate: state.dueDate ? new Date(state.dueDate).getTime() : undefined,
      mode: state.mode,
      splits,
      note: state.note.trim() || undefined,
      receiptName: state.receiptName || undefined,
      receiptData: state.receiptData || undefined,
    });
    toast({ title: "Expense updated ✅" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        <ExpenseFormFields trip={trip} state={state} setState={setState} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Invite Dialog ---------------- */

function InviteDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const link = `${window.location.origin}/splits?join=${trip.id}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    link
  )}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to "{trip.name}"</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <img src={qr} alt="Invite QR" className="rounded-xl border" />
          <Input value={link} readOnly />
          <Button
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast({ title: "Link copied! 🔗" });
            }}
          >
            Copy invite link
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Share via email, message, or scan the QR.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
