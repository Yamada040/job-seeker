import { clsx } from "clsx";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <span
        className={clsx(
          "relative inline-flex items-center justify-center rounded-full bg-white/80 text-lg font-bold text-white ring-1 ring-white/60",
          iconClassName
        )}
      >
        <span className="absolute inset-0 bg-[url('/shield.png')] bg-contain bg-center bg-no-repeat brightness-200" />
        <span className="relative drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
          就
        </span>
      </span>
      <span className={clsx("text-sm font-semibold text-slate-100", textClassName)}>
        就活Copilot
      </span>
    </div>
  );
}
