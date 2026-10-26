import {
  ClipboardList,
  CreditCard,
  Box,
  PackageCheck,
  Truck,
  CheckCheck,
} from "lucide-react";
import type { Order, Stage } from "@/lib/workflow";
export const stageIcons = [
  ClipboardList,
  CreditCard,
  Box,
  PackageCheck,
  Truck,
  CheckCheck,
];
export function Status({ stage }: { stage: Stage }) {
  const Icon = stageIcons[stage];
  return (
    <span className={`status stage-${stage}`}>
      <Icon size={12} />
      {
        [
          "New order",
          "Check payment",
          "Checking stock",
          "Packing",
          "Out for delivery",
          "Completed",
        ][stage]
      }
    </span>
  );
}
export function Avatar({
  order,
  small = false,
}: {
  order: Order;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${order.color} ${small ? "small" : ""}`}>
      {order.initials}
    </span>
  );
}
export function formatTime(at: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(at));
}
