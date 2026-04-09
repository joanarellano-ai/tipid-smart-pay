import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/tipidpay-logo.png";

export default function Splash() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const navTimer = setTimeout(() => navigate("/welcome"), 2700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gradient-hero transition-opacity duration-700 ease-in-out"
      style={{ opacity: fading ? 0 : 1 }}
    >
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
