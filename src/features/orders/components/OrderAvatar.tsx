import type { Order } from "@/lib/workflow";
export function OrderAvatar({
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
