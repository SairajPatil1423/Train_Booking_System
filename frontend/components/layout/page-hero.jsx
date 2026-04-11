import { cn } from "@/utils/cn";
import AuroraBg from "@/components/animations/aurora-bg";
import StarField from "@/components/animations/star-field";

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  meta,
  className = "",
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-[var(--color-line)] bg-black/40 shadow-[0_0_80px_rgba(124,58,237,0.08)]",
        className,
      )}
    >
      <div className="absolute inset-0 z-0">
        <AuroraBg />
        <StarField />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.05]">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {meta.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface-strong)_92%,transparent)] px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="w-full lg:max-w-sm">{aside}</div> : null}
      </div>
    </section>
  );
}
