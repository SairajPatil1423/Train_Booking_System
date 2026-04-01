import { cn } from "@/utils/cn";

const variantClasses = {
  neutral: "status-badge status-badge-neutral",
  primary: "status-badge status-badge-primary",
  success: "status-badge status-badge-success",
  danger: "status-badge status-badge-danger",
  warning: "status-badge status-badge-warning",
};

export default function Badge({
  variant = "neutral",
  className = "",
  children,
}) {
  return (
    <span className={cn(variantClasses[variant] || variantClasses.neutral, className)}>
      {children}
    </span>
  );
}
