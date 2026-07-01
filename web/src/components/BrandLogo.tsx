interface BrandLogoProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

export default function BrandLogo({
  title = "College R&D",
  subtitle = "Research & Publications",
  compact = false,
  className = "",
  textClassName = "",
  iconClassName = "",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm ring-1 ring-white/15 ${iconClassName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          className="h-4 w-4"
          fill="none"
        >
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="16"
            fill="currentColor"
          />
          <path
            d="M22 20h10c7 0 12 4 12 11 0 7-5 11-12 11H22z"
            fill="#0f172a"
          />
          <path
            d="M24 22v20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M31 22h7c3 0 5 2 5 5 0 3-2 5-5 5h-7z" fill="white" />
        </svg>
      </div>
      {!compact && (
        <div className={textClassName}>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
            {subtitle}
          </p>
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
        </div>
      )}
    </div>
  );
}
