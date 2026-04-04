import Loader from "@/components/ui/loader";
import Skeleton from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export default function LoadingState({
  label = "Loading...",
  compact = false,
  showSkeleton = true,
  className = "",
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <Loader label={label} compact={compact} />
      {showSkeleton ? (
        <div className="grid gap-3">
          <Skeleton className="h-20 w-full" rounded="rounded-[1.5rem]" />
          {!compact ? (
            <>
              <Skeleton className="h-28 w-full" rounded="rounded-[1.5rem]" />
              <Skeleton className="h-24 w-full" rounded="rounded-[1.5rem]" />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
