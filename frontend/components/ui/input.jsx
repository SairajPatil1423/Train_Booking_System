import { cn } from "@/utils/cn";

export default function Input({
  label,
  error,
  hint,
  id,
  className = "",
  inputClassName = "",
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label ? <label htmlFor={inputId} className="field-label">{label}</label> : null}
      <input
        id={inputId}
        className={cn("field-input ui-focus-ring", inputClassName)}
        {...props}
      />
      {error ? <p className="field-error">{error}</p> : null}
      {!error && hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
