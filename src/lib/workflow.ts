import { isOverdue } from "./delivery.ts";

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
export const PAYMENT_METHODS = ["Bank transfer", "GCash", "Maya", "Cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
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
  completedStage?: Stage;
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
  paymentMethod: PaymentMethod | "";
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
  if (order.stage === 0 && (!order.items.length || order.items.some((item) =>
    !item.name.trim() || !item.sku.trim() || !Number.isInteger(item.qty) ||
    item.qty < 1 || item.qty > 999 || !Number.isFinite(item.price) || item.price < 0,
  )))
    return { ready: false, reason: "Add valid products and quantities before confirming." };
  if (order.stage === 0 && !Number.isFinite(Date.parse(order.due)))
    return { ready: false, reason: "Choose a delivery deadline before confirming." };
  if (order.stage === 0 && new Set(order.items.map((item) => item.sku)).size !== order.items.length)
    return { ready: false, reason: "Each product should appear once. Remove the duplicate and update its quantity." };
  if (order.stage === 1 && !PAYMENT_METHODS.some((method) => method === order.paymentMethod))
    return { ready: false, reason: "Select a payment method before approving payment." };
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
  if (order.stage === 4 && !order.tracking.trim())
    return {
      ready: false,
      reason: "Add a delivery reference before confirming delivery.",
    };
  if (order.stage === 4 && !order.attachments.some((a) => a.type === "delivery"))
    return { ready: false, reason: "Attach proof of delivery before completing this order." };
  return { ready: true, reason: "" };
}
export function migratePaymentMethod(order: { stage: Stage; paymentMethod?: unknown }): PaymentMethod | "" {
  if (order.paymentMethod === undefined) return order.stage > 0 ? "Bank transfer" : "";
  return PAYMENT_METHODS.find((method) => method === order.paymentMethod) ?? "";
}

export function selectPaymentMethod(order: Order, method: string): Order {
  if (order.stage !== 1) throw new Error("Payment method can only be changed during Payment.");
  const paymentMethod = PAYMENT_METHODS.find((value) => value === method);
  if (!paymentMethod) throw new Error("Choose a payment method from the list.");
  if (order.paymentMethod === paymentMethod) return order;
  return {
    ...order,
    paymentMethod,
    activity: [{ text: `Payment method set to ${paymentMethod} by Alex Morgan`, at: new Date().toISOString() }, ...order.activity],
  };
}

export function stageEvidenceType(stage: Stage): Attachment["type"] | null {
  return stage === 1 ? "receipt" : stage === 4 ? "delivery" : null;
}

export function attachStageEvidence(order: Order, attachment: Attachment): Order {
  const type = stageEvidenceType(order.stage);
  if (!type || attachment.type !== type)
    throw new Error("This document is not accepted at the current stage.");
  if (!attachment.name.trim() || !attachment.data)
    throw new Error("Choose a file to attach.");
  return {
    ...order,
    attachments: [...order.attachments, attachment],
    activity: [{ text: `${attachment.name} attached by Alex Morgan`, at: new Date().toISOString() }, ...order.activity],
  };
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
        completedStage: order.stage,
      },
      ...order.activity,
    ],
  };
}
export function nextAction(order: Order): string {
  if (order.stage === 0 && !readiness(order).ready) return "Edit order details";
  if (order.stage === 1 && !PAYMENT_METHODS.some((method) => method === order.paymentMethod)) return "Select payment method";
  if (order.stage === 1 && !readiness(order).ready) return "Add payment receipt";
  if (order.stage === 2 && !readiness(order).ready) return "Update stock";
  if (order.stage === 3 && !order.prepared) return "Confirm packing";
  if (order.stage === 4) {
    if (!order.tracking.trim()) return "Add delivery reference";
    if (!order.attachments.some((a) => a.type === "delivery")) return "Attach delivery proof";
  }
  return ACTIONS[order.stage];
}

export type IntakeDetails = Pick<Order, "customer" | "company" | "email" | "address" | "items" | "due" | "note">;

export function editIntake(order: Order, details: IntakeDetails): Order {
  if (order.stage !== 0) throw new Error("Order details can only be edited before confirmation.");
  const next = {
    ...order,
    customer: details.customer.trim(),
    company: details.company.trim() || "Individual customer",
    email: details.email.trim(),
    address: details.address.trim(),
    items: details.items,
    due: details.due,
    note: details.note.trim(),
  };
  const check = readiness(next);
  if (!check.ready) throw new Error(check.reason);
  return {
    ...next,
    initials: next.customer.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
    activity: [{ text: "Order details corrected by Alex Morgan before confirmation", at: new Date().toISOString() }, ...order.activity],
  };
}

export function stageApproval(order: Order, stage: number): Activity | undefined {
  return order.activity.find((entry) => entry.completedStage === stage ||
    entry.text.startsWith(`${ACTIONS[stage]} · approved by `));
}
export function total(order: Order) {
  return order.items.reduce((sum, i) => sum + i.qty * i.price, 0);
}
export const money = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
export function attentionReason(order: Order): string | undefined {
  if (order.stage === 5) return undefined;
  if (order.stage === 1 && !PAYMENT_METHODS.some((method) => method === order.paymentMethod))
    return "Payment method needed";
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
      isOverdue(order),
    )
  );
}
