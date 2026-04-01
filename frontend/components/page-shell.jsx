export default function PageShell({ children, className = "" }) {
  return (
    <main className={`page-shell ${className}`.trim()}>
      <div className="relative z-10 flex w-full flex-col gap-6">{children}</div>
    </main>
  );
}
