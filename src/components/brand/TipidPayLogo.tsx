import { cn } from "@/lib/utils";

/**
 * TipidPay brand mark — modern fintech identity.
 * Mark concept: a peso glyph rising inside a rounded shield/wallet,
 * with an upward growth notch — savings + payments + trust.
 *
 * All strokes/fills use currentColor or semantic gradients so the mark
 * adapts cleanly to light & dark surfaces.
 */

type Variant = "full" | "horizontal" | "icon" | "wordmark";

interface Props {
  variant?: Variant;
  className?: string;
  /** pixel size of the icon */
  size?: number;
  /** light text (use on dark/primary surfaces) */
  invert?: boolean;
}

export function TipidPayLogo({
  variant = "full",
  className,
  size = 40,
  invert = false,
}: Props) {
  const textColor = invert ? "text-white" : "text-foreground";

  const Mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="tpp-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
        <linearGradient id="tpp-glow" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Shield / wallet body */}
      <path
        d="M24 3.5c5.2 1.8 10.5 2.8 16 3 0 12.2-2.6 23.6-16 38C10.6 30.1 8 18.7 8 6.5c5.5-.2 10.8-1.2 16-3z"
        fill="url(#tpp-grad)"
      />
      <path
        d="M24 3.5c5.2 1.8 10.5 2.8 16 3 0 12.2-2.6 23.6-16 38C10.6 30.1 8 18.7 8 6.5c5.5-.2 10.8-1.2 16-3z"
        fill="url(#tpp-glow)"
      />

      {/* Peso glyph */}
      <g fill="white">
        {/* vertical stem */}
        <rect x="19.4" y="13" width="2.6" height="20" rx="1" />
        {/* upper bowl */}
        <path d="M22 13h5.2a5 5 0 010 10H22v-2.6h5a2.4 2.4 0 000-4.8h-5V13z" />
        {/* two horizontal bars */}
        <rect x="16" y="20" width="13" height="2.2" rx="1.1" />
        <rect x="16" y="24" width="13" height="2.2" rx="1.1" />
      </g>

      {/* Growth notch */}
      <path
        d="M30 34l3-3 3 3"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );

  const Wordmark = (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight leading-none",
        textColor
      )}
      style={{ fontSize: size * 0.55 }}
    >
      tipid<span className="text-primary">pay</span>
    </span>
  );

  if (variant === "icon") return <span className={className}>{Mark}</span>;
  if (variant === "wordmark") return <span className={className}>{Wordmark}</span>;

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {Mark}
        {Wordmark}
      </div>
    );
  }

  // horizontal
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Mark}
      {Wordmark}
    </div>
  );
}

export default TipidPayLogo;
