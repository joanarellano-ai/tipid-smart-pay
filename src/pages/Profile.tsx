import { useState } from "react";
import { currentUser, badges } from "@/lib/data";
import { useUser } from "@/lib/userStore";
import { ChevronRight, Moon, Sun, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const user = useUser();
  const displayName = user.fullName || currentUser.name;
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Shield, label: "Security", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
    { icon: LogOut, label: "Log Out", action: () => navigate("/"), destructive: true },
  ];

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold text-foreground animate-fade-in">Profile</h1>

        {/* User Card */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-xl font-bold text-primary-foreground">
            {currentUser.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.groupName}</p>
          </div>
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
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={cn(
                "flex w-full items-center gap-3 p-4 transition-colors hover:bg-accent",
                i < menuItems.length - 1 && "border-b border-border",
                item.destructive && "text-destructive"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
