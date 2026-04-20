type IconProps = {
  size?: number;
  stroke?: number;
  className?: string;
};

export function IconCircle({ size = 48, stroke = 1.25, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      className={className}
      aria-hidden
    >
      <circle cx="24" cy="24" r="19" />
    </svg>
  );
}

export function IconCross({ size = 48, stroke = 1.25, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      <line x1="10" y1="10" x2="38" y2="38" />
      <line x1="38" y1="10" x2="10" y2="38" />
    </svg>
  );
}

export function IconArrow({
  size = 16,
  stroke = 1,
  className,
  direction = "right",
}: IconProps & { direction?: "left" | "right" }) {
  const rotate = direction === "left" ? 180 : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <polyline points="14,5 21,12 14,19" />
    </svg>
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <svg
      width="80"
      height="12"
      viewBox="0 0 80 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      className={className}
      aria-hidden
    >
      <line x1="0" y1="6" x2="30" y2="6" />
      <circle cx="40" cy="6" r="2.5" />
      <line x1="50" y1="6" x2="80" y2="6" />
    </svg>
  );
}
