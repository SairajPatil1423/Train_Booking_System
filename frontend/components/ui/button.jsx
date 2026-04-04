import { cn } from "@/utils/cn";

const variantClasses = {
  primary: "primary-button text-white",
  secondary: "secondary-button",
  ghost: "ghost-button",
  danger: "danger-button text-white",
  quiet: "button-quiet border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted-strong)]",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
  xl: "px-7 py-4 text-base sm:px-8 sm:py-[1.125rem] sm:text-lg",
};

export default function Button({
  as: Component = "button",
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled = false,
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={cn(
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        "ui-focus-ring justify-center font-semibold disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
