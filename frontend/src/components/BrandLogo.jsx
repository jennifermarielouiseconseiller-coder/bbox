// Original abstract brand mark (not a reproduction of any trademarked logo).
// Two interlocking rounded signal-drops forming a soft "connection" bloom.
export function BrandMark({ size = 56, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 10c8 0 14 6 14 15 0 11-8 17-19 20C9 31 8 20 14 14c2-2 4-4 6-4Z"
        fill="#1aa3dd"
      />
      <path
        d="M44 12c6 2 11 8 11 16 0 12-10 22-23 24 7-6 11-13 11-22 0-7-2-13 1-18Z"
        fill="#164194"
      />
      <path
        d="M38 20c6 1 10 6 10 13 0 9-7 15-16 16 4-5 6-10 6-16 0-5-1-9 0-13Z"
        fill="#e45c1e"
      />
    </svg>
  );
}

export function BrandLogo({ markSize = 52, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <BrandMark size={markSize} />
      <div className="flex flex-col items-center leading-none">
        <span
          className="text-[#1aa3dd] font-extrabold tracking-tight"
          style={{ fontSize: markSize * 0.42 }}
        >
          bouygues
        </span>
        <span
          className="text-[#8a98a6] font-semibold tracking-[0.35em]"
          style={{ fontSize: markSize * 0.13 }}
        >
          TELECOM
        </span>
      </div>
    </div>
  );
}
