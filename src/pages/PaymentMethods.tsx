import { useState } from "react";
import { useWallet, walletStore, PaymentMethod } from "@/lib/walletStore";
import { formatPeso } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Star, CreditCard, Smartphone, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const typeIcons: Record<string, React.ReactNode> = {
  gcash: <span className="text-xl">🟢</span>,
  maya: <span className="text-xl">🟣</span>,
  card: <CreditCard className="h-5 w-5 text-secondary" />,
};

const brandLogos: Record<string, string> = {
  visa: "💳 Visa",
  mastercard: "💳 MC",
};

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
    const label = newType === "gcash" ? "GCash" : newType === "maya" ? "Maya" : `${newBrand === "visa" ? "Visa" : "Mastercard"}`;
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

  const handleRemove = (pm: PaymentMethod) => {
    walletStore.removePaymentMethod(pm.id);
    toast.success(`${pm.label} removed`);
  };

  const handleSetDefault = (pm: PaymentMethod) => {
    walletStore.setDefaultPaymentMethod(pm.id);
    toast.success(`${pm.label} set as default`);
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
            <div className="rounded-2xl bg-card p-8 text-center shadow-card">
              <Smartphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No payment methods yet</p>
            </div>
          )}
          {wallet.paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition-all duration-200",
                pm.isDefault && "ring-2 ring-primary/40"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                {typeIcons[pm.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{pm.label}</p>
                  {pm.cardBrand && (
                    <span className="text-xs text-muted-foreground">{brandLogos[pm.cardBrand]}</span>
                  )}
                  {pm.isDefault && (
                    <Badge className="h-5 text-[10px]">Default</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{pm.details}</p>
              </div>
              <div className="flex gap-1">
                {!pm.isDefault && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSetDefault(pm)}>
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(pm)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as PaymentMethod["type"])}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">🟢 GCash</SelectItem>
                    <SelectItem value="maya">🟣 Maya</SelectItem>
                    <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="rounded-xl"
                  placeholder={newType === "card" ? "4242 4242 4242 4242" : "0917 123 4567"}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value.replace(/\D/g, ""))}
                  maxLength={newType === "card" ? 16 : 11}
                />
              </div>

              <Button className="w-full rounded-xl" onClick={handleAdd}>
                Add Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
