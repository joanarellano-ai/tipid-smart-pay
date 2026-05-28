import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Plane, Home as HomeIcon, Users, Utensils, ShoppingBag, Tag, Check, Clock, Trash2, ArrowLeft, Send, UserPlus, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPeso } from "@/lib/data";
import {
  splitStore,
  useSplits,
  computeOwed,
  computeRemaining,
  newId,
  type SplitBill,
  type SplitCategory,
  type SplitMethod,
  type SplitParticipant,
  type SplitItem,
} from "@/lib/splitStore";
import { usePremium, FREE_SPLIT_MEMBER_LIMIT, hasFeature } from "@/lib/premiumStore";
import { Crown } from "lucide-react";

const CATEGORY_META: Record<SplitCategory, { icon: any; label: string; tone: string }> = {
  vacation: { icon: Plane, label: "Vacation / Trip", tone: "bg-info/10 text-info" },
  family: { icon: Users, label: "Family", tone: "bg-primary/10 text-primary" },
  household: { icon: HomeIcon, label: "Household", tone: "bg-secondary/10 text-secondary" },
  dining: { icon: Utensils, label: "Dining", tone: "bg-warning/10 text-warning" },
  groceries: { icon: ShoppingBag, label: "Groceries", tone: "bg-accent text-accent-foreground" },
  other: { icon: Tag, label: "Other", tone: "bg-muted text-muted-foreground" },
};

export default function SplitBills() {
  const navigate = useNavigate();
  const splits = useSplits();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = splits.find((s) => s.id === activeId) || null;

  if (active) {
    return <SplitDetail bill={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-foreground">Split Bills</h1>
            <p className="text-sm text-muted-foreground">For trips, family & shared expenses</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>

        {splits.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-card animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Plane className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-foreground">No splits yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first split for a vacation, family dinner, or any shared expense.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="w-full">
              <Plus className="mr-1 h-4 w-4" /> Create a split
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {splits.map((s) => {
              const meta = CATEGORY_META[s.category];
              const Icon = meta.icon;
              const owed = computeOwed(s);
              const paidCount = s.participants.filter((p) => p.paid).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card transition-all hover:shadow-md active:scale-[0.99]"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", meta.tone)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} · {s.participants.length} people · {paidCount}/{s.participants.length} paid
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPeso(s.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.method === "equal"
                        ? "Equal"
                        : s.method === "shares"
                        ? "By shares"
                        : s.method === "exact"
                        ? "Exact"
                        : "By items"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <CreateSplitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setCreateOpen(false);
          setActiveId(id);
        }}
      />
    </div>
  );
}

/* ─────────── Create dialog ─────────── */

function CreateSplitDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const [category, setCategory] = useState<SplitCategory>("vacation");
  const [total, setTotal] = useState("");
  const [namesText, setNamesText] = useState("Me, ");
  const [method, setMethod] = useState<SplitMethod>("equal");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setTitle("");
    setCategory("vacation");
    setTotal("");
    setNamesText("Me, ");
    setMethod("equal");
    setNotes("");
  };

  const { plan } = usePremium();
  const unlimited = hasFeature(plan, "unlimitedSplitMembers");

  const submit = () => {
    if (!title.trim()) return toast.error("Add a title");
    const totalNum = parseFloat(total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) return toast.error("Enter a valid total amount");
    const names = namesText.split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) return toast.error("Add at least 2 participants (comma-separated)");
    if (!unlimited && names.length > FREE_SPLIT_MEMBER_LIMIT) {
      return toast.error("Free plan limit reached", {
        description: `Free plan supports up to ${FREE_SPLIT_MEMBER_LIMIT} members. Upgrade to Premium for unlimited.`,
        action: { label: "Upgrade", onClick: () => navigate("/premium") },
      });
    }


    const participants: SplitParticipant[] = names.map((n, i) => ({
      id: newId(),
      name: n,
      shares: 1,
      exact: 0,
      paid: i === 0, // payer marked as paid
    }));

    const bill: SplitBill = {
      id: newId(),
      title: title.trim(),
      category,
      totalAmount: totalNum,
      payerId: participants[0].id,
      method,
      participants,
      items: [],
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };
    splitStore.add(bill);
    toast.success("Split created");
    reset();
    onCreated(bill.id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>New Split</DialogTitle>
          <DialogDescription>Vacation, family trip, dinner — anything shared.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div>
            <Label>Title</Label>
            <Input
              placeholder="Boracay Trip 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as SplitCategory)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_META) as SplitCategory[]).map((k) => (
                  <SelectItem key={k} value={k}>{CATEGORY_META[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Total amount (₱)</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label>Participants (comma-separated)</Label>
            <Input
              placeholder="Me, Mia, Jake, Sam"
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              className="rounded-xl"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">First person is the payer.</p>
          </div>
          <div>
            <Label>Split method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as SplitMethod)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal — same amount each</SelectItem>
                <SelectItem value="shares">By shares — weighted (e.g. couple = 2)</SelectItem>
                <SelectItem value="exact">Exact — set each person's amount</SelectItem>
                <SelectItem value="items">By items — assign costs to people</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl" maxLength={200} />
          </div>
          <Button className="w-full rounded-xl" onClick={submit}>Create split</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Detail view ─────────── */

function SplitDetail({ bill, onBack }: { bill: SplitBill; onBack: () => void }) {
  const navigate = useNavigate();
  const { plan } = usePremium();
  const unlimited = hasFeature(plan, "unlimitedSplitMembers");
  const owed = useMemo(() => computeOwed(bill), [bill]);
  const remaining = useMemo(() => computeRemaining(bill), [bill]);
  const meta = CATEGORY_META[bill.category];
  const Icon = meta.icon;
  const sumOwed = Object.values(owed).reduce((s, v) => s + v, 0);
  const diff = bill.totalAmount - sumOwed;
  const accurate = Math.abs(diff) < 0.01;

  const [itemLabel, setItemLabel] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemSharedBy, setItemSharedBy] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [partialFor, setPartialFor] = useState<SplitParticipant | null>(null);
  const [partialAmt, setPartialAmt] = useState("");

  const updateParticipant = (pid: string, patch: Partial<SplitParticipant>) => {
    splitStore.update(bill.id, {
      participants: bill.participants.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
    });
  };

  const addItem = () => {
    const amt = parseFloat(itemAmount);
    if (!itemLabel.trim()) return toast.error("Item label required");
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Valid amount required");
    if (itemSharedBy.length === 0) return toast.error("Pick at least one participant");
    const item: SplitItem = { id: newId(), label: itemLabel.trim(), amount: amt, sharedBy: itemSharedBy };
    splitStore.update(bill.id, { items: [...bill.items, item] });
    setItemLabel(""); setItemAmount(""); setItemSharedBy([]);
    toast.success("Item added");
  };

  const removeItem = (id: string) => {
    splitStore.update(bill.id, { items: bill.items.filter((i) => i.id !== id) });
  };

  const addParticipant = () => {
    const name = newName.trim();
    if (!name) return toast.error("Enter a name");
    if (bill.participants.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Name already in this split");
    splitStore.addParticipant(bill.id, name);
    setNewName("");
    toast.success(`${name} added`);
  };

  const removeParticipant = (pid: string, name: string) => {
    splitStore.removeParticipant(bill.id, pid);
    toast.success(`${name} removed`);
  };

  const submitPartial = () => {
    if (!partialFor) return;
    const amt = parseFloat(partialAmt);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Enter a valid amount");
    const owedNow = owed[partialFor.id] || 0;
    splitStore.recordPartialPayment(bill.id, partialFor.id, amt, owedNow);
    toast.success(`Recorded ${formatPeso(amt)} from ${partialFor.name}`);
    setPartialFor(null);
    setPartialAmt("");
  };

  const deleteSplit = () => {
    splitStore.remove(bill.id);
    toast.success("Split deleted");
    onBack();
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", meta.tone)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-foreground">{bill.title}</h1>
              <p className="text-xs text-muted-foreground">{meta.label}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={deleteSplit} aria-label="Delete split">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{formatPeso(bill.totalAmount)}</span>
          </div>
          {bill.notes && <p className="mt-2 text-xs text-muted-foreground">{bill.notes}</p>}
        </div>

        {/* Method switcher */}
        <div className="mb-4 animate-fade-in">
          <Label className="mb-1 block">Split method</Label>
          <Tabs
            value={bill.method}
            onValueChange={(v) => splitStore.update(bill.id, { method: v as SplitMethod })}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="equal">Equal</TabsTrigger>
              <TabsTrigger value="shares">Shares</TabsTrigger>
              <TabsTrigger value="exact">Exact</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Participants list with method-specific inputs */}
        <div className="mb-4 space-y-2 animate-fade-in">
          {bill.participants.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-3 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.name}{p.id === bill.payerId && <span className="ml-1 text-[10px] text-primary">(payer)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owes {formatPeso(owed[p.id] || 0)}
                    {(p.paidAmount ?? 0) > 0 && !p.paid && (
                      <span className="ml-1 text-success">· paid {formatPeso(p.paidAmount || 0)}, left {formatPeso(remaining[p.id] || 0)}</span>
                    )}
                  </p>
                </div>
                {p.paid ? (
                  <button
                    onClick={() => splitStore.togglePaid(bill.id, p.id)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                  >
                    <Check className="h-3 w-3" /> Paid
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    {p.id !== bill.payerId && (
                      <button
                        onClick={() => removeParticipant(p.id, p.name)}
                        aria-label={`Remove ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => { setPartialFor(p); setPartialAmt(""); }}
                      aria-label={`Record partial from ${p.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toast.success(`Reminder sent to ${p.name}`)}
                      aria-label={`Remind ${p.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => splitStore.togglePaid(bill.id, p.id)}
                      className="flex items-center gap-1 rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
                    >
                      <Check className="h-3 w-3" /> Paid
                    </button>
                  </div>
                )}
              </div>

              {bill.method === "shares" && (
                <div className="mt-2 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Shares</Label>
                  <Input
                    type="number"
                    min={0}
                    value={p.shares ?? 0}
                    onChange={(e) => updateParticipant(p.id, { shares: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="h-8 w-20 rounded-lg"
                  />
                </div>
              )}
              {bill.method === "exact" && (
                <div className="mt-2 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Amount (₱)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={p.exact ?? 0}
                    onChange={(e) => updateParticipant(p.id, { exact: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="h-8 w-28 rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add participant inline */}
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-3">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Add a person…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addParticipant(); }}
              className="h-8 flex-1 rounded-lg"
              maxLength={40}
            />
            <Button size="sm" className="h-8 rounded-lg" onClick={addParticipant}>Add</Button>
          </div>
        </div>

        {/* Items section */}
        {bill.method === "items" && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-card animate-fade-in">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Items</h3>
            {bill.items.length === 0 && (
              <p className="mb-2 text-xs text-muted-foreground">Add items and assign who shares each.</p>
            )}
            <div className="space-y-2">
              {bill.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 rounded-xl bg-muted/40 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{it.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPeso(it.amount)} · shared by {it.sharedBy.length}
                    </p>
                  </div>
                  <button onClick={() => removeItem(it.id)} aria-label="Remove item">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <Input
                placeholder="Item (e.g. Hotel night 1)"
                value={itemLabel}
                onChange={(e) => setItemLabel(e.target.value)}
                className="h-9 rounded-lg"
              />
              <Input
                type="number"
                placeholder="Amount (₱)"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                className="h-9 rounded-lg"
              />
              <div className="space-y-1 rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Shared by:</p>
                {bill.participants.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={itemSharedBy.includes(p.id)}
                      onCheckedChange={(c) =>
                        setItemSharedBy((prev) =>
                          c ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              <Button size="sm" className="w-full rounded-lg" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> Add item
              </Button>
            </div>
          </div>
        )}

        {/* Accuracy summary */}
        <div className={cn(
          "rounded-2xl p-4 shadow-card animate-fade-in",
          accurate ? "bg-accent" : "bg-destructive/10"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Sum of shares
            </span>
            <span className="text-sm font-bold text-foreground">{formatPeso(sumOwed)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">vs total</span>
            <span className={accurate ? "text-success" : "text-destructive"}>
              {accurate ? "✓ Balanced" : `Off by ${formatPeso(diff)}`}
            </span>
          </div>
          {!accurate && bill.method === "exact" && (
            <p className="mt-2 text-[10px] text-destructive">
              Adjust exact amounts so they sum to {formatPeso(bill.totalAmount)}.
            </p>
          )}
        </div>
      </div>

      {/* Partial payment dialog */}
      <Dialog open={!!partialFor} onOpenChange={(v) => { if (!v) { setPartialFor(null); setPartialAmt(""); } }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record partial payment</DialogTitle>
            <DialogDescription>
              {partialFor && `${partialFor.name} owes ${formatPeso(owed[partialFor.id] || 0)}. Remaining: ${formatPeso(remaining[partialFor.id] || 0)}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Amount paid (₱)</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={partialAmt}
                onChange={(e) => setPartialAmt(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
            <Button className="w-full rounded-xl" onClick={submitPartial}>Record payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
