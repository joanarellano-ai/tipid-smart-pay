import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, TrendingUp, TrendingDown, Sparkles, RotateCcw } from "lucide-react";
import { billHistoryStore, useBillHistory, getUtilityMeta, type Utility, type PredictionResult } from "@/lib/billHistoryStore";
import { formatPeso } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BillHistory() {
  const navigate = useNavigate();
  const entries = useBillHistory();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const [draftUsage, setDraftUsage] = useState("");

  useEffect(() => {
    setPredictions(billHistoryStore.predictAll());
  }, [entries]);

  const utilities: Utility[] = ["electricity", "water", "internet"];

  const startEdit = (id: string, amount: number, usage: number) => {
    setEditingId(id);
    setDraftAmount(String(amount));
    setDraftUsage(String(usage));
  };

  const saveEdit = (id: string) => {
    const amount = Number(draftAmount);
    const usage = Number(draftUsage);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    billHistoryStore.updateEntry(id, { amount, usage });
    toast.success("Bill updated");
    setEditingId(null);
  };

  const reseed = () => {
    billHistoryStore.resetSeed();
    toast.success("History reset to sample data");
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center gap-3 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Bill History & Prediction</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={reseed} aria-label="Reset sample data">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Predictions */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Next Month Prediction</h2>
          </div>
          {predictions.map((p, i) => {
            const meta = getUtilityMeta(p.utility);
            const isUp = p.trendPercent > 0;
            const dueLabel = new Date(p.nextDueDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
            return (
              <div
                key={p.utility}
                className="rounded-2xl gradient-card p-5 shadow-card animate-fade-in"
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="font-semibold text-foreground">{meta.label}</span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {p.confidence}% confidence
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{formatPeso(p.predictedAmount)}</p>
                {p.utility !== "internet" && (
                  <p className="text-xs text-muted-foreground">
                    Est. usage: {p.predictedUsage} {p.unit}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className={cn("flex items-center gap-1 text-xs font-medium", isUp ? "text-destructive" : p.trendPercent < 0 ? "text-primary" : "text-muted-foreground")}>
                    {isUp ? <TrendingUp className="h-3 w-3" /> : p.trendPercent < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {p.trendPercent > 0 ? "+" : ""}{p.trendPercent}% vs 3-month avg
                  </div>
                  <span className="text-xs text-muted-foreground">Due {dueLabel}</span>
                </div>
                {p.significantChange && (
                  <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                    ⚠️ Significant change detected — review your usage
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* History per utility */}
        {utilities.map((u) => {
          const rows = billHistoryStore.getByUtility(u);
          const meta = getUtilityMeta(u);
          return (
            <div key={u} className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <span className="text-xl">{meta.icon}</span> {meta.label} — Last 3 Months
              </h3>
              <div className="space-y-2">
                {rows.map((e) => (
                  <div key={e.id} className="rounded-xl bg-muted/40 p-3">
                    {editingId === e.id ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">{e.monthLabel}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {u !== "internet" && (
                            <div>
                              <Label className="text-[10px]">Usage ({e.unit})</Label>
                              <Input
                                type="number"
                                value={draftUsage}
                                onChange={(ev) => setDraftUsage(ev.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                          <div className={u === "internet" ? "col-span-2" : ""}>
                            <Label className="text-[10px]">Amount (₱)</Label>
                            <Input
                              type="number"
                              value={draftAmount}
                              onChange={(ev) => setDraftAmount(ev.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 flex-1" onClick={() => saveEdit(e.id)}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(e.id, e.amount, e.usage)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.monthLabel}</p>
                          {u !== "internet" && (
                            <p className="text-xs text-muted-foreground">{e.usage} {e.unit}</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-foreground">{formatPeso(e.amount)}</p>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Tap any month to edit values</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
