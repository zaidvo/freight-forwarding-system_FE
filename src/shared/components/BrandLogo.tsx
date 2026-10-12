type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <div
        aria-label="B2B Global Supplies"
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-sky-500 text-[10px] font-extrabold tracking-[-0.04em] text-white shadow-[0_6px_16px_rgba(14,165,233,0.28)] ${className}`}
      >
        B2B
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <object
        data="/b2b-logo.pdf#toolbar=0&navpanes=0&scrollbar=0"
        type="application/pdf"
        aria-label="B2B Global Supplies logo"
        className="h-full w-full"
      >
        <span className="text-center text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
          B2B Global Supplies
        </span>
      </object>
    </div>
  );
}
