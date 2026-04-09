import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/tipidpay-logo.png";

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Animate progress bar over ~2.5s
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 50);

    const fadeTimer = setTimeout(() => setFading(true), 2800);
    const navTimer = setTimeout(() => navigate("/welcome"), 3500);

    return () => {
      clearInterval(interval);
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
          width={110}
          height={110}
          className="mb-6 drop-shadow-lg"
        />
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-10">
          TIPIDPAY
        </h1>

        {/* Progress bar */}
        <div className="w-40 h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
