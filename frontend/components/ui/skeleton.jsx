import { cn } from "@/utils/cn";

export default function Skeleton({
  className = "",
  rounded = "rounded-2xl",
}) {
  return <div className={cn("ui-skeleton", rounded, className)} aria-hidden="true" />;
}
