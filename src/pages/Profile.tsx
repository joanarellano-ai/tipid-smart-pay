import { useState } from "react";
import { badges } from "@/lib/data";
import { useUser, userStore, capitalize } from "@/lib/userStore";
import { useAccount, accountStore } from "@/lib/accountStore";
import { ChevronRight, Moon, Sun, Bell, Shield, HelpCircle, LogOut, Edit3, Users, Home as HomeIcon, History, ClipboardList, Crown, Building2 } from "lucide-react";
import { usePremium } from "@/lib/premiumStore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const user = useUser();
  const account = useAccount();
  const displayName = user.fullName || "Your Name";
  const [dark, setDark] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftFirst, setDraftFirst] = useState(user.firstName);
  const [draftMI, setDraftMI] = useState(user.middleInitial);
  const [draftLast, setDraftLast] = useState(user.lastName);
  const [draftEmail, setDraftEmail] = useState(user.email || "user@tipidpay.ph");
  const [modeOpen, setModeOpen] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
    toast.success(dark ? "Light mode enabled" : "Dark mode enabled");
  };

  const saveProfile = () => {
    if (!draftFirst.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!draftLast.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(draftEmail)) {
      toast.error("Enter a valid email");
      return;
    }
    userStore.set({
      firstName: capitalize(draftFirst),
      middleInitial: draftMI.trim().charAt(0).toUpperCase(),
      lastName: capitalize(draftLast),
      email: draftEmail.trim(),
    });
    toast.success("Profile updated");
    setEditOpen(false);
  };

  const switchMode = (newMode: "solo" | "group") => {
    accountStore.setMode(newMode);
    toast.success(newMode === "solo" ? "Switched to Solo Mode" : "Switched to Group Mode");
    setModeOpen(false);
    if (newMode === "group") navigate("/bills");
    else navigate("/dashboard");
  };

  const isSolo = account.mode === "solo";

  const { isAdmin, isPremium } = usePremium();

  const menuItems = [
    { icon: Edit3, label: "Edit Profile", action: () => setEditOpen(true) },
    { icon: Crown, label: isPremium ? "Manage Premium" : "TipidPay Premium", action: () => navigate("/premium"), highlight: true },
    ...(isAdmin ? [{ icon: Building2, label: "Admin Dashboard", action: () => navigate("/admin"), highlight: true }] : []),
    { icon: isSolo ? Users : HomeIcon, label: `Switch to ${isSolo ? "Group" : "Solo"} Mode`, action: () => setModeOpen(true) },
    { icon: History, label: "Bill History", action: () => navigate("/bill-history") },
    { icon: ClipboardList, label: "Update Bill Survey", action: () => navigate("/bill-survey") },
    { icon: Bell, label: "Reminders", action: () => navigate("/reminders") },
    { icon: Shield, label: "Security", action: () => toast.info("Security settings coming soon") },
    { icon: HelpCircle, label: "Help & Support", action: () => toast.info("Reach us at help@tipidpay.ph") },
    { icon: LogOut, label: "Log Out", action: () => { toast.success("Logged out"); navigate("/"); }, destructive: true },
  ];

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Profile</h1>

        {/* User Card */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-xl font-bold text-primary-foreground">
            {displayName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email || "user@tipidpay.ph"}</p>
            <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {isSolo ? "🏠 Solo Mode" : `👥 ${account.groupName}`}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} aria-label="Edit profile">
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="mb-3 font-semibold text-foreground">Achievements</h3>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 transition-all",
                  b.earned ? "bg-accent" : "bg-muted opacity-50"
                )}
              >
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dark Mode */}
        <div className="mb-5 rounded-2xl bg-card shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <button onClick={toggleDark} className="flex w-full items-center gap-3 p-4">
            {dark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            <span className="flex-1 text-left text-sm font-medium text-foreground">Dark Mode</span>
            <div className={cn("h-6 w-11 rounded-full p-0.5 transition-colors", dark ? "bg-primary" : "bg-muted")}>
              <div className={cn("h-5 w-5 rounded-full bg-card shadow-sm transition-transform", dark && "translate-x-5")} />
            </div>
          </button>
        </div>

        {/* Menu */}
        <div className="rounded-2xl bg-card shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {menuItems.map((item, i) => {
            const highlight = (item as { highlight?: boolean }).highlight;
            const destructive = (item as { destructive?: boolean }).destructive;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={cn(
                  "flex w-full items-center gap-3 p-4 transition-colors hover:bg-accent",
                  i < menuItems.length - 1 && "border-b border-border",
                  destructive && "text-destructive",
                  highlight && "text-[hsl(var(--gold))]"
                )}
              >
                <item.icon className={cn("h-5 w-5", highlight && "text-[hsl(var(--gold))]")} />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {highlight && (
                  <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[9px] font-bold uppercase text-[hsl(var(--gold))]">
                    PRO
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your name and email</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-[1fr_64px] gap-2">
              <div>
                <Label className="text-xs">First Name</Label>
                <Input value={draftFirst} onChange={(e) => setDraftFirst(e.target.value)} maxLength={50} placeholder="Joan" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">M.I.</Label>
                <Input
                  value={draftMI}
                  onChange={(e) => setDraftMI(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 1))}
                  maxLength={1}
                  placeholder="C"
                  className="rounded-xl text-center uppercase"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input value={draftLast} onChange={(e) => setDraftLast(e.target.value)} maxLength={50} placeholder="Arellano" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} maxLength={120} className="rounded-xl" />
            </div>
            <Button className="w-full rounded-xl" onClick={saveProfile}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Switch Mode Dialog */}
      <Dialog open={modeOpen} onOpenChange={setModeOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Switch Account Mode</DialogTitle>
            <DialogDescription>
              {isSolo
                ? "Switch to Group Mode to share bills with roommates. Your personal data will be kept."
                : "Switch to Solo Mode to manage only your own bills. Your shared bills will remain accessible if you switch back."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Button className="w-full rounded-xl" onClick={() => switchMode(isSolo ? "group" : "solo")}>
              Confirm switch to {isSolo ? "Group" : "Solo"} Mode
            </Button>
            <Button variant="ghost" className="w-full rounded-xl" onClick={() => setModeOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
