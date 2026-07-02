interface BrandLogoProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

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
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Increased container size from h-8 w-8 to h-16 w-16 for better visibility */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md ring-1 ring-white/15 ${iconClassName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          className="h-10 w-10" /* Scaled icon shape from h-4 w-4 to h-10 w-10 */
          fill="none"
        >
          {/* Elegant geometric R & D path layout */}
          <path
            d="M16 46V18h12c5 0 9 3 9 7.5S33 33 28 33h-12"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 33l11 13"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M38 18v28c8 0 13-5 13-14s-5-14-13-14z"
            stroke="#38bdf8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!compact && (
        <div className={textClassName}>
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/60">
            {subtitle}
          </p>
          <h1 className="text-xl font-bold leading-tight text-white">
            {title}
          </h1>
        </div>
      )}
    </div>
  );
}
