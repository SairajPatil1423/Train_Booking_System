import { cn } from "@/utils/cn";

const variantClasses = {
  primary: "primary-button text-white",
  secondary: "secondary-button",
  ghost: "ghost-button",
  danger: "danger-button text-white",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
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
        "ui-focus-ring justify-center disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
