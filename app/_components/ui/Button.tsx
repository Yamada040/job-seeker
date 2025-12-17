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
          "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-100",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
          
          // Variant styles
          {
            // Default
            "bg-white border border-(--border-light) text-foreground hover:bg-(--background-secondary) hover:border-(--border-medium)": 
              variant === "default",
            
            // Primary
            "bg-(--accent-blue) border border-(--accent-blue) text-white hover:bg-(--accent-blue-hover) hover:border-(--accent-blue-hover)": 
              variant === "primary",
            
            // Ghost
            "border-transparent bg-transparent text-(--foreground-secondary) hover:bg-(--background-secondary) hover:text-foreground": 
              variant === "ghost",
            
            // Destructive
            "bg-red-500 border border-red-500 text-white hover:bg-red-600 hover:border-red-600": 
              variant === "destructive",
          },
          
          // Size styles
          {
            "h-7 px-2 text-xs": size === "sm",
            "h-8 px-3 text-sm": size === "md",
            "h-10 px-4 text-base": size === "lg",
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
