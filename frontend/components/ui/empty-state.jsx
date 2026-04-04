import Link from "next/link";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/utils/cn";

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  actions,
  icon,
  className = "",
}) {
  return (
    <Card
      tone="muted"
      className={cn("rounded-[1.75rem] border-dashed px-5 py-10 text-center", className)}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-strong)] text-[var(--color-panel-dark)] shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          {icon}
        </div>
      ) : null}
      <p className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-5 flex justify-center">{actions}</div> : null}
      {!actions && ctaLabel && ctaHref ? (
        <div className="mt-5 flex justify-center">
          <Button as={Link} href={ctaHref}>
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
