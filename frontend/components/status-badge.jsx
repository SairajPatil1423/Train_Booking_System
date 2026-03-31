import { formatBookingStatus } from "@/utils/formatters";

const badgeClasses = {
  confirmed: "bg-[#eaf6f1] text-[#1f7a57]",
  pending: "bg-[#edf5fd] text-[var(--color-panel-dark)]",
  cancelled: "bg-[#fef0ef] text-[var(--color-danger)]",
  partially_cancelled: "bg-[#fff6ed] text-[#b7681c]",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        badgeClasses[status] || "bg-[#f4f7fb] text-[var(--color-muted-strong)]"
      }`}
    >
      {formatBookingStatus(status)}
    </span>
  );
}
