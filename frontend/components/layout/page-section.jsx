import Card from "@/components/ui/card";
import { cn } from "@/utils/cn";

export default function PageSection({ className = "", children }) {
  return (
    <Card tone="panel" className={cn("rounded-[2rem] p-6 sm:p-8", className)}>
      {children}
    </Card>
  );
}
