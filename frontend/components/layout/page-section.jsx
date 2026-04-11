import { cn } from "@/utils/cn";

export default function PageSection({ className = "", children }) {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] border border-[var(--color-line)] bg-black/40 p-6 sm:p-8 backdrop-blur-2xl shadow-inner",
        className,
      )}
    >
      {children}
    </div>
  );
}
