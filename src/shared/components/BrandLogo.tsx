type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <div
        aria-label="B2B Global Supplies"
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-[#202b78] text-[10px] font-extrabold tracking-[-0.08em] text-white shadow-[0_6px_16px_rgba(32,43,120,0.28)] ${className}`}
      >
        <span>
          B<span className="text-[#f5c928]">2</span>B
        </span>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 220 150"
      role="img"
      aria-label="B2B Global Supplies logo"
      className={`block ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>B2B Global Supplies</title>
      <text
        x="110"
        y="18"
        textAnchor="middle"
        fill="#202b78"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="1.1"
      >
        B2B GLOBAL SUPPLIES
      </text>

      <g fill="none" stroke="#202b78" strokeWidth="2.2" strokeLinecap="round">
        <path d="M25 55 Q110 7 195 55" />
        <path d="M25 55 Q110 34 195 55" />
        <path d="M110 19 Q73 31 52 55" />
        <path d="M110 19 Q147 31 168 55" />
        <path d="M25 55 Q110 77 195 55" />
      </g>

      <path
        d="M76 74 C91 61 111 62 124 74 C134 84 146 84 157 75"
        fill="none"
        stroke="#f5c928"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <text
        x="110"
        y="126"
        textAnchor="middle"
        fill="#202b78"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="61"
        fontWeight="900"
        letterSpacing="-7"
      >
        B2B
      </text>
    </svg>
  );
}
