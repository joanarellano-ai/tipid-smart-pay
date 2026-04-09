import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function PinDialog({ open, onOpenChange, onConfirm, title = "Enter PIN", description = "Enter your 4-digit PIN to confirm" }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setVerifying(true);
      // Simulated PIN verification (accepts any 4-digit PIN)
      setTimeout(() => {
        setVerifying(false);
        setPin("");
        onConfirm();
        onOpenChange(false);
      }, 800);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) { setPin(""); setError(false); }
    onOpenChange(v);
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader className="items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-all duration-200",
                i < pin.length ? "border-primary bg-primary scale-110" : "border-muted-foreground/30",
                error && "border-destructive bg-destructive"
              )}
            />
          ))}
        </div>

        {verifying && (
          <p className="text-center text-sm text-muted-foreground animate-pulse-soft">Verifying...</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-2">
          {digits.map((d, i) => (
            <Button
              key={i}
              variant="ghost"
              disabled={d === "" || verifying}
              className={cn(
                "h-14 rounded-xl text-lg font-semibold",
                d === "" && "invisible"
              )}
              onClick={() => d === "⌫" ? handleDelete() : handleDigit(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
