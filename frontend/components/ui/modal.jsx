"use client";

import Button from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function Modal({
  open = false,
  title = "",
  description = "",
  children,
  onClose,
  footer,
  className = "",
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
      <div className={cn("ui-modal-panel p-6 sm:p-7", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-xl font-semibold text-[var(--color-ink)]">{title}</h2> : null}
            {description ? <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{description}</p> : null}
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="min-w-10 px-3">
              Close
            </Button>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
