import { formatBookingStatus } from "@/utils/formatters";
import Badge from "@/components/ui/badge";

const badgeVariants = {
  booked: "success",
  confirmed: "success",
  pending: "primary",
  cancelled: "danger",
  partially_cancelled: "warning",
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant={badgeVariants[status] || "neutral"} className="px-4 py-2 text-xs">
      {formatBookingStatus(status)}
    </Badge>
  );
}
