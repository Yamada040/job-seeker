import { clsx } from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export const Card = ({ className, variant = "default", padding = "md", hover = false, ref, ...props }: CardProps) => {
  return (
    <div
      ref={ref}
      className={clsx(
        // Base styles
        "rounded-sm bg-white border transition-all duration-100",

        // Variant styles
        {
          "border-(--border-light) shadow-(--shadow-subtle)": variant === "default",
          "border-(--border-light) shadow-(--shadow-medium)": variant === "elevated",
          "border-(--border-medium) shadow-none": variant === "outlined",
        },

        // Hover effect
        {
          "hover:shadow-(--shadow-medium) cursor-pointer": hover && variant === "default",
          "hover:shadow-(--shadow-strong) cursor-pointer": hover && variant === "elevated",
          "hover:border-(--border-medium) cursor-pointer": hover && variant === "outlined",
        },

        // Padding styles
        {
          "p-0": padding === "none",
          "p-3": padding === "sm",
          "p-4": padding === "md",
          "p-6": padding === "lg",
        },

        className,
      )}
      {...props}
    />
  );
};

export const CardHeader = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={clsx("flex flex-col space-y-1.5", className)} {...props} />
);

export const CardTitle = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) => (
  <h3 ref={ref} className={clsx("font-medium leading-none tracking-tight text-foreground", className)} {...props} />
);

export const CardDescription = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) => (
  <p ref={ref} className={clsx("text-sm text-(--foreground-secondary)", className)} {...props} />
);

export const CardContent = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={clsx("pt-0", className)} {...props} />
);

export const CardFooter = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={clsx("flex items-center pt-0", className)} {...props} />
);
