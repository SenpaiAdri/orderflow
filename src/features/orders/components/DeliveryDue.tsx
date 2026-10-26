import { CalendarDays, CheckCheck, Clock3 } from "lucide-react";
import type { Order } from "@/lib/workflow";
import { deliveryInput, deliveryLabel, isOverdue } from "@/lib/delivery";

export function DeliveryDue({
  order,
}: {
  order: Pick<Order, "stage" | "due">;
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
  return (
    <span className={`delivery-due due-${state}`}>
      <Icon size={14} aria-hidden="true" />
      {state === "delivered" ? "Delivered" : `${state === "overdue" ? "Overdue · " : ""}${deliveryLabel(order.due)} PHT`}
    </span>
  );
}
