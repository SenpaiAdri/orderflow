export const STAGES = [
  "New order",
  "Payment",
  "Stock check",
  "Packing",
  "Delivery",
  "Completed",
] as const;
export const ACTIONS = [
  "Confirm order",
  "Approve payment",
  "Reserve stock",
  "Mark ready for delivery",
  "Complete order",
  "View summary",
] as const;
export type Stage = 0 | 1 | 2 | 3 | 4 | 5;
export type Priority = "normal" | "urgent";
export interface Item {
  name: string;
  sku: string;
  qty: number;
  price: number;
  stock: number;
}
export interface Attachment {
  name: string;
  type: "receipt" | "delivery" | "other";
  data?: string;
}
export interface Activity {
  text: string;
  at: string;
}
export interface Order {
  id: string;
  customer: string;
  company: string;
  email: string;
  address: string;
  stage: Stage;
  priority: Priority;
  issue?: string;
  due: string;
  owner: string;
  initials: string;
  color: string;
  items: Item[];
  attachments: Attachment[];
  note: string;
  activity: Activity[];
  tracking: string;
  prepared: boolean;
}
export interface Readiness {
  ready: boolean;
  reason: string;
}
export function readiness(order: Order): Readiness {
  if (order.stage === 5)
    return { ready: false, reason: "This order is complete." };
  if (order.stage === 0 && (!order.customer.trim() || !order.address.trim()))
    return {
      ready: false,
      reason: "Add customer and delivery details before confirming.",
    };
  if (order.stage === 1 && !order.attachments.some((a) => a.type === "receipt"))
    return {
      ready: false,
      reason: "Attach proof of payment before verifying.",
    };
  if (order.stage === 2 && order.items.some((i) => i.stock < i.qty))
    return {
      ready: false,
      reason: "Resolve the stock shortage before reserving items.",
    };
  if (order.stage === 3 && !order.prepared)
    return {
      ready: false,
      reason: "Confirm that all items have been picked, checked, and packed.",
    };
  if (
    order.stage === 4 &&
    (!order.tracking.trim() ||
      !order.attachments.some((a) => a.type === "delivery"))
  )
    return {
      ready: false,
      reason:
        "Add a delivery reference and proof of delivery to complete this order.",
    };
  return { ready: true, reason: "" };
}
export function advanceOrder(order: Order): Order {
  const check = readiness(order);
  if (!check.ready) throw new Error(check.reason);
  return {
    ...order,
    stage: (order.stage + 1) as Stage,
    issue: undefined,
    activity: [
      {
        text: `${ACTIONS[order.stage]} · approved by Alex Morgan`,
        at: new Date().toISOString(),
      },
      ...order.activity,
    ],
  };
}
export function total(order: Order) {
  return order.items.reduce((sum, i) => sum + i.qty * i.price, 0);
}
export const money = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
export function attentionReason(order: Order): string | undefined {
  if (order.stage === 5) return undefined;
  if (order.stage === 1 && !order.attachments.some((a) => a.type === "receipt"))
    return "Missing payment receipt";
  if (order.stage === 2 && order.items.some((i) => i.stock < i.qty))
    return "Stock shortage · replenishment needed";
  // These blockers are derived from evidence and quantities, so stale seeded
  // flags must disappear as soon as the underlying blocker is resolved.
  if (
    order.issue?.startsWith("Missing payment receipt") &&
    order.attachments.some((a) => a.type === "receipt")
  )
    return undefined;
  if (
    order.issue?.startsWith("Stock shortage") &&
    order.items.every((i) => i.stock >= i.qty)
  )
    return undefined;
  return order.issue;
}
export function needsAttention(order: Order) {
  return (
    order.stage < 5 &&
    Boolean(
      attentionReason(order) ||
      order.priority === "urgent" ||
      order.due === "Overdue",
    )
  );
}
