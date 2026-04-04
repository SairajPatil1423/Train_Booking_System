"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

export default function StationAutocomplete({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  onInputChange,
  onSelect,
  helperText,
  className = "",
  labelClassName = "",
  inputClassName = "",
  helperClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const deferredValue = useDeferredValue(value);

  const filteredOptions = useMemo(() => {
    const query = deferredValue.trim().toLowerCase();

    if (!query) {
      return options.slice(0, 6);
    }

    return options
      .filter((option) => {
        const haystack = `${option.label} ${option.city}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [deferredValue, options]);

  function handleSelect(option) {
    onSelect(option);
    setIsOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <label className={cn("field-label", labelClassName)}>{label}</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onInputChange(event.target.value);
          setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false);
          }, 120);
        }}
        className={cn("field-input ui-focus-ring", inputClassName)}
      />
      {helperText ? <p className={cn("field-hint", helperClassName)}>{helperText}</p> : null}

      {isOpen && filteredOptions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[1.35rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] shadow-[var(--shadow-card)] backdrop-blur-xl">
          <ul className="py-2">
            {filteredOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full flex-col px-4 py-3 text-left transition",
                    "hover:bg-[var(--color-accent-soft)]",
                  )}
                >
                  <span className="text-sm font-semibold text-[var(--color-ink)]">
                    {option.label}
                  </span>
                  <span className="mt-1 text-xs text-[var(--color-muted)]">
                    {option.city}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
