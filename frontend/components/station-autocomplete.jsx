"use client";

import { useDeferredValue, useMemo, useState } from "react";

export default function StationAutocomplete({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  onInputChange,
  onSelect,
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
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
        {label}
      </label>
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
        className="field-input"
      />

      {isOpen && filteredOptions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[1.35rem] border border-[var(--color-line)] bg-white shadow-[0_22px_46px_rgba(19,36,47,0.12)]">
          <ul className="py-2">
            {filteredOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-[var(--color-surface-soft)]"
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
