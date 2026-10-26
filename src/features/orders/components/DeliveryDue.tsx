import { CalendarDays, CheckCheck, Clock3 } from "lucide-react";
import type { Order } from "@/lib/workflow";
import { deliveryInput, deliveryLabel, isOverdue } from "@/lib/delivery";

export function DeliveryDue({
  order,
  compact = false,
}: {
  order: Pick<Order, "stage" | "due">;
  compact?: boolean;
}) {
  const state =
    order.stage === 5
      ? "delivered"
      : isOverdue(order)
        ? "overdue"
        : deliveryInput(order.due).slice(0, 10) === deliveryInput(new Date().toISOString()).slice(0, 10)
          ? "today"
          : "upcoming";
  const Icon =
    state === "delivered"
      ? CheckCheck
      : state === "overdue"
        ? Clock3
        : CalendarDays;
  const fullLabel = state === "delivered" ? "Delivered" : `${state === "overdue" ? "Overdue · " : ""}${deliveryLabel(order.due)} PHT`;
  const briefLabel = state === "delivered" ? "Delivered" : `${state === "overdue" ? "Overdue · " : ""}${new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(order.due))}`;
  return (
    <span className={`delivery-due due-${state} ${compact ? "compact" : ""}`} aria-label={fullLabel} title={fullLabel}>
      <Icon size={14} aria-hidden="true" />
      <time dateTime={order.due}>
        <span className="due-full">{fullLabel}</span>
        <span className="due-brief">{briefLabel}</span>
      </time>
    </span>
  );
}
