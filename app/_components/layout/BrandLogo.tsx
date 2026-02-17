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
          "relative inline-flex items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-orange-100 text-lg font-bold text-amber-900 ring-1 ring-amber-300 shadow-sm",
          iconClassName
        )}
      >
        <span className="absolute inset-0 bg-[url('/shield.png')] bg-contain bg-center bg-no-repeat brightness-110" />
        <span className="relative">
          就
        </span>
      </span>
      <span
        className={clsx(
          "brand-logo-text theme-readable text-sm font-semibold tracking-[0.01em]",
          textClassName
        )}
      >
        就活Copilot
      </span>
    </div>
  );
}
