import { useState } from "react";
import { useWallet, walletStore, PaymentMethod } from "@/lib/walletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Star, CreditCard, ChevronLeft, CheckCircle2, Smartphone, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: React.ReactNode; gradient: string; label: string }> = {
  gcash: {
    icon: <span className="text-2xl font-bold text-primary-foreground">G</span>,
    gradient: "bg-[linear-gradient(135deg,hsl(160,84%,39%),hsl(160,70%,30%))]",
    label: "GCash",
  },
  maya: {
    icon: <span className="text-2xl font-bold text-primary-foreground">M</span>,
    gradient: "bg-[linear-gradient(135deg,hsl(270,60%,50%),hsl(280,70%,40%))]",
    label: "Maya",
  },
  card: {
    icon: <CreditCard className="h-6 w-6 text-primary-foreground" />,
    gradient: "bg-[linear-gradient(135deg,hsl(224,73%,40%),hsl(224,73%,25%))]",
    label: "Card",
  },
};

const brandLabels: Record<string, string> = { visa: "Visa", mastercard: "Mastercard" };

export default function PaymentMethods() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<PaymentMethod["type"]>("gcash");
  const [newDetails, setNewDetails] = useState("");
  const [newBrand, setNewBrand] = useState<"visa" | "mastercard">("visa");

  const handleAdd = () => {
    if (!newDetails || newDetails.length < 4) {
      toast.error("Please enter at least 4 digits");
      return;
    }
    const last4 = newDetails.slice(-4);
    const label = newType === "gcash" ? "GCash" : newType === "maya" ? "Maya" : brandLabels[newBrand];
    walletStore.addPaymentMethod({
      type: newType,
      label,
      details: `****${last4}`,
      cardBrand: newType === "card" ? newBrand : undefined,
      isDefault: false,
    });
    toast.success(`${label} ending in ${last4} added`);
    setNewDetails("");
    setAddOpen(false);
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Payment Methods</h1>
        </div>

        {/* Methods list */}
        <div className="mb-6 space-y-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {wallet.paymentMethods.length === 0 && (
            <div className="rounded-2xl bg-card p-10 text-center shadow-card">
              <Wallet className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No payment methods yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add GCash, Maya, or a card to get started</p>
            </div>
          )}
          {wallet.paymentMethods.map((pm, i) => {
            const cfg = typeConfig[pm.type];
            return (
              <div
                key={pm.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-200 animate-fade-in",
                  pm.isDefault && "ring-2 ring-primary shadow-soft"
                )}
                style={{ animationDelay: `${0.05 + i * 0.04}s` }}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", cfg.gradient)}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{pm.label}</p>
                      {pm.cardBrand && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {brandLabels[pm.cardBrand]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono tracking-wider mt-0.5">{pm.details}</p>
                    {pm.isDefault && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-semibold text-primary">Default method</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {!pm.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          walletStore.setDefaultPaymentMethod(pm.id);
                          toast.success(`${pm.label} set as default`);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        walletStore.removePaymentMethod(pm.id);
                        toast.success(`${pm.label} removed`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Button */}
        <Button className="w-full rounded-2xl" size="lg" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>

        {/* Add Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Choose a type and enter your details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Type selection cards */}
              <div className="grid grid-cols-3 gap-2">
                {(["gcash", "maya", "card"] as const).map((type) => {
                  const cfg = typeConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200",
                        newType === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", cfg.gradient)}>
                        {cfg.icon}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {newType === "card" && (
                <div className="space-y-2">
                  <Label>Card Brand</Label>
                  <Select value={newBrand} onValueChange={(v) => setNewBrand(v as "visa" | "mastercard")}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{newType === "card" ? "Card Number" : "Phone Number"}</Label>
                <Input
                  className="rounded-xl font-mono"
                  placeholder={newType === "card" ? "4242 4242 4242 4242" : "0917 123 4567"}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value.replace(/\D/g, ""))}
                  maxLength={newType === "card" ? 16 : 11}
                />
              </div>

              <Button className="w-full rounded-xl" size="lg" onClick={handleAdd}>
                Add Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
