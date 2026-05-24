import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  vacationStore,
  useTrips,
  newId,
  CATEGORY_META,
  buildSplits,
  computeBalances,
  computeSettlements,
  totalSpent,
  type Trip,
  type ExpenseCategory,
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
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function VacationDashboard() {
  const navigate = useNavigate();
  const trips = useTrips();
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const openTrip = trips.find((t) => t.id === openTripId);

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

        {trips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                <Plane className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold">No trips yet</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Create a vacation, invite friends, and let TIPIDPAY handle the splitting.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" /> Plan your first trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trips.map((t) => {
              const spent = totalSpent(t);
              const pct = t.budget > 0 ? Math.min(100, Math.round((spent / t.budget) * 100)) : 0;
              const over = t.budget > 0 && spent > t.budget;
              return (
                <button
                  key={t.id}
                  onClick={() => setOpenTripId(t.id)}
                  className="block w-full rounded-2xl bg-card p-4 text-left shadow-card transition-all hover:shadow-soft active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
                      {t.coverEmoji || "🏖️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-bold text-foreground">{t.name}</h3>
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
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={setOpenTripId} />
    </div>
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

  const spent = totalSpent(trip);
  const remaining = Math.max(0, trip.budget - spent);
  const over = trip.budget > 0 && spent > trip.budget;
  const pct = trip.budget > 0 ? Math.min(100, Math.round((spent / trip.budget) * 100)) : 0;
  const perPerson = trip.members.length > 0 ? spent / trip.members.length : 0;

  const balances = useMemo(() => computeBalances(trip), [trip]);
  const settlements = useMemo(() => computeSettlements(trip), [trip]);

  // Day-based daily limit
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
    trip.expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([k, v], i) => ({
      name: CATEGORY_META[k as ExpenseCategory].label,
      value: Math.round(v),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [trip.expenses]);

  const memberContribData = useMemo(
    () =>
      balances.map((b) => ({
        name: trip.members.find((m) => m.id === b.memberId)?.name || "?",
        paid: b.paid,
      })),
    [balances, trip.members]
  );

  const exportCSV = () => {
    const rows = [
      ["Date", "Title", "Category", "Amount", "Paid By", "Split Mode", "Note"],
      ...trip.expenses.map((e) => [
        new Date(e.date).toISOString().slice(0, 10),
        e.title,
        CATEGORY_META[e.category].label,
        e.amount.toFixed(2),
        trip.members.find((m) => m.id === e.paidById)?.name || "?",
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
    toast({ title: "Exported ✅", description: "CSV downloaded." });
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
          <div className="grid grid-cols-3 gap-2 text-primary-foreground">
            <div className="rounded-xl bg-white/15 p-2">
              <p className="text-[10px] opacity-80">Spent</p>
              <p className="text-sm font-bold">{formatPeso(spent)}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2">
              <p className="text-[10px] opacity-80">{over ? "Over" : "Left"}</p>
              <p className={`text-sm font-bold ${over ? "text-warning" : ""}`}>
                {formatPeso(over ? spent - trip.budget : remaining)}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-2">
              <p className="text-[10px] opacity-80">/ Person</p>
              <p className="text-sm font-bold">{formatPeso(perPerson)}</p>
            </div>
          </div>
          {trip.budget > 0 && (
            <div className="mt-3">
              <Progress value={pct} className="[&>div]:bg-white" />
              <p className="mt-1 text-[10px] text-primary-foreground/80">
                {pct}% of {formatPeso(trip.budget)} budget
                {dailyLimit > 0 && ` · ${formatPeso(dailyLimit)}/day`}
              </p>
            </div>
          )}
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

        <div className="mb-4 flex gap-2">
          <Button className="flex-1 gap-1" onClick={() => setExpenseOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
          <Button variant="outline" onClick={() => setInviteOpen(true)} className="gap-1">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
          <Button variant="outline" size="icon" onClick={exportCSV}>
            <Download className="h-4 w-4" />
          </Button>
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
            {trip.expenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No expenses yet. Tap <strong>Add Expense</strong> to start.
                </CardContent>
              </Card>
            ) : (
              trip.expenses.map((e) => {
                const meta = CATEGORY_META[e.category];
                const payer = trip.members.find((m) => m.id === e.paidById)?.name || "?";
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-xl">
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {meta.label} · paid by {payer} · {new Date(e.date).toLocaleDateString()}
                      </p>
                      {e.note && (
                        <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">
                          {e.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatPeso(e.amount)}</p>
                      <button
                        onClick={() => vacationStore.removeExpense(trip.id, e.id)}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        <Trash2 className="inline h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
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
                {trip.expenses.length === 0 ? (
                  <p className="text-muted-foreground">Add expenses to enable predictions.</p>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per expense</span>
                      <span className="font-semibold">
                        {formatPeso(spent / trip.expenses.length)}
                      </span>
                    </div>
                    {days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projected total</span>
                        <span className="font-semibold">
                          {formatPeso((spent / Math.max(1, trip.expenses.length)) * days * 3)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per person</span>
                      <span className="font-semibold">{formatPeso(perPerson)}</span>
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
    </div>
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
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [paidById, setPaidById] = useState(trip.members[0]?.id || "");
  const [mode, setMode] = useState<SplitMode>("equal");
  const [note, setNote] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(trip.members.map((m) => m.id));
  const [percents, setPercents] = useState<Record<string, number>>({});
  const [customs, setCustoms] = useState<Record<string, number>>({});

  const amtNum = Number(amount) || 0;

  const submit = () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (amtNum <= 0) {
      toast({ title: "Amount must be > 0", variant: "destructive" });
      return;
    }
    if (mode === "percentage") {
      const total = Object.values(percents).reduce((s, v) => s + (v || 0), 0);
      if (Math.abs(total - 100) > 0.5) {
        toast({ title: "Percentages must total 100%", variant: "destructive" });
        return;
      }
    }
    if (mode === "custom") {
      const total = Object.values(customs).reduce((s, v) => s + (v || 0), 0);
      if (Math.abs(total - amtNum) > 0.5) {
        toast({
          title: `Custom amounts must total ${formatPeso(amtNum)}`,
          variant: "destructive",
        });
        return;
      }
    }
    const splits = buildSplits(
      amtNum,
      mode,
      trip.members.map((m) => m.id),
      { selectedIds, percents, customs }
    );
    if (splits.length === 0) {
      toast({ title: "Select at least one participant", variant: "destructive" });
      return;
    }
    vacationStore.addExpense(trip.id, {
      id: newId(),
      title: title.trim(),
      category,
      amount: amtNum,
      paidById,
      date: Date.now(),
      mode,
      splits,
      note: note.trim() || undefined,
      receiptName: receiptName || undefined,
    });
    toast({ title: "Expense added ✅" });
    setTitle("");
    setAmount("");
    setNote("");
    setReceiptName("");
    setPercents({});
    setCustoms({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner at..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Amount (₱) *</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.icon} {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Paid by</Label>
            <Select value={paidById} onValueChange={setPaidById}>
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
            <Label>Split mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as SplitMode)}>
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

          {mode === "selected" && (
            <div className="rounded-xl bg-muted/40 p-2">
              <p className="mb-2 text-xs font-medium">Participants</p>
              {trip.members.map((m) => (
                <label key={m.id} className="flex items-center gap-2 py-1 text-sm">
                  <Checkbox
                    checked={selectedIds.includes(m.id)}
                    onCheckedChange={(c) => {
                      setSelectedIds((prev) =>
                        c ? [...prev, m.id] : prev.filter((x) => x !== m.id)
                      );
                    }}
                  />
                  {m.name}
                </label>
              ))}
            </div>
          )}
          {mode === "percentage" && (
            <div className="space-y-1 rounded-xl bg-muted/40 p-2">
              {trip.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{m.name}</span>
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="0"
                    value={percents[m.id] ?? ""}
                    onChange={(e) =>
                      setPercents({ ...percents, [m.id]: Number(e.target.value) || 0 })
                    }
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">
                Total: {Object.values(percents).reduce((s, v) => s + (v || 0), 0)}%
              </p>
            </div>
          )}
          {mode === "custom" && (
            <div className="space-y-1 rounded-xl bg-muted/40 p-2">
              {trip.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="0"
                    value={customs[m.id] ?? ""}
                    onChange={(e) =>
                      setCustoms({ ...customs, [m.id]: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">
                Total: {formatPeso(Object.values(customs).reduce((s, v) => s + (v || 0), 0))} /{" "}
                {formatPeso(amtNum)}
              </p>
            </div>
          )}

          <div>
            <Label>Receipt (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptName(e.target.files?.[0]?.name || "")}
            />
            {receiptName && (
              <p className="mt-1 text-[10px] text-muted-foreground">📎 {receiptName}</p>
            )}
          </div>
          <div>
            <Label>Note</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional comment..."
            />
          </div>
        </div>
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
