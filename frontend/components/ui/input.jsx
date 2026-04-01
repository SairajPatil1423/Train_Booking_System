import { cn } from "@/utils/cn";

export default function Input({
  label,
  error,
  hint,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={className}>
      {label ? <label className="field-label">{label}</label> : null}
      <input
        className={cn("field-input ui-focus-ring", inputClassName)}
        {...props}
      />
      {error ? <p className="field-error">{error}</p> : null}
      {!error && hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
