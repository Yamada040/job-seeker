import { forwardRef } from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-100",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-1",

          // Variant styles
          {
            // Default
            "border-sky-100 bg-white text-slate-900 hover:border-sky-200 hover:bg-sky-50":
              variant === "default",

            // Primary
            "border-sky-500 bg-sky-500 text-white hover:border-sky-400 hover:bg-sky-400":
              variant === "primary",

            // Ghost
            "border-transparent bg-transparent text-sky-700 hover:bg-sky-50 hover:text-sky-500":
              variant === "ghost",

            // Destructive
            "border-rose-500 bg-rose-500 text-white hover:border-rose-400 hover:bg-rose-400":
              variant === "destructive",
          },

          // Size styles
          {
            "h-7 px-2 text-xs": size === "sm",
            "h-8 px-3 text-sm": size === "md",
            "h-10 px-4 text-base": size === "lg",
          },

          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
