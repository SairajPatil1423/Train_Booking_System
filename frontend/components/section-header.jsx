export default function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--color-line)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-3 section-title">{title}</h1>
        {description ? (
          <p className="mt-3 text-base leading-8 text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
