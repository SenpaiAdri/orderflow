import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createOrderSummary } from "./order-summary.ts";
import type { Order } from "../../../lib/workflow.ts";

const fonts = {
  normal: readFileSync(new URL("../../../assets/fonts/NotoSans-Regular.ttf", import.meta.url)).toString("base64"),
  bold: readFileSync(new URL("../../../assets/fonts/NotoSans-Bold.ttf", import.meta.url)).toString("base64"),
};
const order: Order = {
  id: "ORD-PDF-TEST", customer: "José María Reyes", company: "Café & Co.", email: "jose@example.com",
  address: "18 Sample Street, Makati", stage: 5, priority: "normal", due: "2026-10-27T09:00:00Z",
  owner: "Alex Morgan", initials: "JR", color: "mint", paymentMethod: "GCash", prepared: true,
  tracking: "QA-DELIVERY-1", note: "Leave with reception.",
  items: [{ name: "Ceramic mug", sku: "MUG-001", qty: 6, stock: 10, price: 480.25 }],
  attachments: [{ name: "receipt.pdf", type: "receipt" }, { name: "proof.jpg", type: "delivery" }],
  activity: [{ text: "Complete order · approved by Alex Morgan", at: "2026-10-27T08:00:00Z", completedStage: 4 }],
};

test("order summary produces a real PDF without changing the order", () => {
  const original = structuredClone(order);
  const doc = createOrderSummary(order, fonts);
  const pdf = Buffer.from(doc.output("arraybuffer"));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.match(pdf.subarray(-100).toString(), /%%EOF/);
  assert.ok(doc.getNumberOfPages() >= 1);
  assert.deepEqual(order, original);
});

test("full summaries paginate long items, notes, filenames, and history", () => {
  const long = {
    ...order,
    items: Array.from({ length: 40 }, (_, index) => ({ ...order.items[0], name: `Long product ${index}: ${"Ceramic collection ".repeat(12)}` })),
    note: "Customer delivery instructions. ".repeat(200),
    attachments: [{ name: `${"receiving-evidence-".repeat(30)}.pdf`, type: "delivery" as const }],
    activity: Array.from({ length: 60 }, (_, index) => ({ text: `Recorded activity ${index}: ${"Checked and confirmed. ".repeat(8)}`, at: "2026-10-27T08:00:00Z" })),
  };
  const doc = createOrderSummary(long, fonts);
  assert.ok(doc.getNumberOfPages() > 5);
  assert.ok(doc.output("arraybuffer").byteLength > 1000);
});
