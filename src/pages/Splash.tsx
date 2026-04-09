import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/tipidpay-logo.png";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/welcome"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-hero">
      <div className="flex flex-col items-center animate-scale-in">
        <img
          src={logo}
          alt="TIPIDPAY logo"
          width={100}
          height={100}
          className="mb-5 drop-shadow-lg"
        />
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">
          TIPIDPAY
        </h1>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}
