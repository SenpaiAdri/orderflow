import { CalendarDays, CheckCheck, Clock3 } from "lucide-react";
import type { Order } from "@/lib/workflow";

export function DeliveryDue({
  order,
}: {
  order: Pick<Order, "stage" | "due">;
}) {
  const state =
    order.stage === 5
      ? "delivered"
      : order.due === "Overdue"
        ? "overdue"
        : order.due.startsWith("Today")
          ? "today"
          : "upcoming";
  const Icon =
    state === "delivered"
      ? CheckCheck
      : state === "overdue"
        ? Clock3
        : CalendarDays;
  return (
    <span className={`delivery-due due-${state}`}>
      <Icon size={14} aria-hidden="true" />
      {state === "delivered" ? "Delivered" : order.due}
    </span>
  );
}
