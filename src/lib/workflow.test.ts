import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceOrder,
  readiness,
  total,
  needsAttention,
  attentionReason,
  type Order,
} from "./workflow.ts";
function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "ORD-TEST",
    customer: "Test customer",
    company: "Test company",
    email: "test@example.com",
    address: "Makati City",
    stage: 0,
    priority: "normal",
    due: "Tomorrow",
    owner: "Alex Morgan",
    initials: "TC",
    color: "mint",
    items: [{ name: "Mug", sku: "MUG", price: 480, qty: 6, stock: 10 }],
    attachments: [],
    activity: [],
    note: "",
    tracking: "",
    prepared: false,
    ...overrides,
  };
}
test("intake requires customer and delivery address", () => {
  assert.throws(
    () => advanceOrder(order({ address: "" })),
    /customer and delivery/,
  );
  assert.throws(
    () => advanceOrder(order({ customer: "  " })),
    /customer and delivery/,
  );
});
test("payment cannot advance without proof", () => {
  assert.equal(readiness(order({ stage: 1 })).ready, false);
  assert.throws(() => advanceOrder(order({ stage: 1 })), /proof of payment/);
  assert.equal(
    advanceOrder(
      order({
        stage: 1,
        attachments: [{ name: "receipt.pdf", type: "receipt" }],
      }),
    ).stage,
    2,
  );
});
test("stock shortage blocks reservation until replenished", () => {
  const short = order({
    stage: 2,
    items: [{ name: "Mug", sku: "MUG", qty: 12, stock: 10, price: 480 }],
  });
  assert.throws(() => advanceOrder(short), /stock shortage/);
  assert.equal(
    advanceOrder({
      ...short,
      items: short.items.map((i) => ({ ...i, stock: 12 })),
    }).stage,
    3,
  );
});
test("preparation requires packing confirmation", () => {
  assert.throws(
    () => advanceOrder(order({ stage: 3 })),
    /picked, checked, and packed/,
  );
  assert.equal(advanceOrder(order({ stage: 3, prepared: true })).stage, 4);
});
test("completion requires both tracking and delivery proof", () => {
  assert.throws(
    () => advanceOrder(order({ stage: 4, tracking: "LAL-1" })),
    /delivery reference and proof/,
  );
  assert.throws(
    () =>
      advanceOrder(
        order({
          stage: 4,
          attachments: [{ name: "proof.jpg", type: "delivery" }],
        }),
      ),
    /delivery reference and proof/,
  );
});
test("a complete order passes through all six stages with an audit entry for each handoff", () => {
  let o = order();
  o = advanceOrder(o);
  o = { ...o, attachments: [{ name: "receipt.pdf", type: "receipt" }] };
  o = advanceOrder(o);
  o = advanceOrder(o);
  o = { ...o, prepared: true };
  o = advanceOrder(o);
  o = {
    ...o,
    tracking: "LAL-1",
    attachments: [...o.attachments, { name: "proof.jpg", type: "delivery" }],
  };
  o = advanceOrder(o);
  assert.equal(o.stage, 5);
  assert.equal(o.activity.length, 5);
  assert.throws(() => advanceOrder(o), /complete/);
  assert.equal(total(o), 2880);
});
test("urgent, blocked, and overdue orders need attention; completed orders do not", () => {
  assert.equal(needsAttention(order()), false);
  assert.equal(needsAttention(order({ priority: "urgent" })), true);
  assert.equal(needsAttention(order({ issue: "Missing receipt" })), true);
  assert.equal(needsAttention(order({ due: "Overdue" })), true);
  assert.equal(
    needsAttention(order({ stage: 5, priority: "urgent", due: "Overdue" })),
    false,
  );
});

test("missing receipts and stock shortages are detected without manually flagging the order", () => {
  assert.equal(needsAttention(order({ stage: 1 })), true);
  assert.equal(
    needsAttention(
      order({
        stage: 2,
        items: [{ name: "Mug", sku: "MUG", qty: 12, stock: 10, price: 480 }],
      }),
    ),
    true,
  );
});

test("resolved evidence and stock blockers do not leave stale attention labels", () => {
  assert.equal(
    attentionReason(
      order({
        stage: 1,
        issue: "Missing payment receipt",
        attachments: [{ name: "receipt.pdf", type: "receipt" }],
      }),
    ),
    undefined,
  );
  assert.equal(
    attentionReason(order({ stage: 2, issue: "Stock shortage · 2 items" })),
    undefined,
  );
});
