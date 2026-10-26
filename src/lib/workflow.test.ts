import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceOrder,
  attachStageEvidence,
  stageEvidenceType,
  readiness,
  total,
  needsAttention,
  attentionReason,
  nextAction,
  editIntake,
  stageApproval,
  type Order,
} from "./workflow.ts";
import { deliveryInput, deliveryISO, migrateDeliveryDue, isOverdue } from "./delivery.ts";
function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "ORD-TEST",
    customer: "Test customer",
    company: "Test company",
    email: "test@example.com",
    address: "Makati City",
    stage: 0,
    priority: "normal",
    due: "2099-10-27T09:00:00.000Z",
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
    /proof of delivery/,
  );
  assert.throws(
    () =>
      advanceOrder(
        order({
          stage: 4,
          attachments: [{ name: "proof.jpg", type: "delivery" }],
        }),
      ),
    /delivery reference/,
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
  assert.equal(needsAttention(order({ due: "2000-01-01T09:00:00.000Z" })), true);
  assert.equal(
    needsAttention(order({ stage: 5, priority: "urgent", due: "2000-01-01T09:00:00.000Z" })),
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

test("next actions name the missing prerequisite before the handoff", () => {
  assert.equal(nextAction(order({ customer: "" })), "Edit order details");
  assert.equal(nextAction(order({ stage: 1 })), "Add payment receipt");
  assert.equal(nextAction(order({ stage: 2, items: [{ name: "Mug", sku: "MUG", qty: 12, stock: 10, price: 480 }] })), "Update stock");
  assert.equal(nextAction(order({ stage: 3 })), "Confirm packing");
  assert.equal(nextAction(order({ stage: 3, prepared: true })), "Mark ready for delivery");
  assert.equal(nextAction(order({ stage: 4 })), "Add delivery reference");
  assert.equal(nextAction(order({ stage: 4, tracking: "LAL-1" })), "Attach delivery proof");
  assert.equal(nextAction(order({ stage: 4, tracking: "LAL-1", attachments: [{ name: "proof.txt", type: "delivery" }] })), "Complete order");
  assert.equal(nextAction(order({ stage: 5 })), "View summary");
});

test("intake corrections validate data, update the total, and preserve history", () => {
  const original = order({ activity: [{ text: "Order created", at: "2026-10-26T01:00:00.000Z" }] });
  const details = { ...original, customer: "  Jane Reyes  ", address: "Quezon City", items: original.items.map((item) => ({ ...item, qty: 12 })) };
  const edited = editIntake(original, details);
  assert.equal(edited.customer, "Jane Reyes");
  assert.equal(edited.initials, "JR");
  assert.equal(edited.address, "Quezon City");
  assert.equal(total(edited), 5760);
  assert.equal(edited.stage, 0);
  assert.equal(edited.activity.length, 2);
  assert.equal(editIntake(original, { ...details, stage: 5 } as Order).stage, 0);
  assert.match(edited.activity[0].text, /corrected/);
  assert.equal(original.items[0].qty, 6);
  assert.throws(() => editIntake(original, { ...details, items: [] }), /products and quantities/);
  assert.throws(() => editIntake(original, { ...details, due: "" }), /deadline/);
  assert.throws(() => editIntake(original, { ...details, items: [...details.items, ...details.items] }), /appear once/);
  assert.throws(() => editIntake({ ...original, stage: 1 }, details), /before confirmation/);
});

test("invalid items cannot be confirmed at intake", () => {
  for (const qty of [0, -1, 1.5, 1000, NaN]) {
    assert.throws(() => advanceOrder(order({ items: [{ name: "Mug", sku: "MUG", qty, stock: 10, price: 480 }] })), /products and quantities/);
  }
});

test("stage inspection finds the original approval and supports older activity records", () => {
  const accepted = advanceOrder(order());
  const paid = advanceOrder({ ...accepted, attachments: [{ name: "receipt.txt", type: "receipt" }] });
  assert.equal(stageApproval(paid, 0)?.completedStage, 0);
  assert.equal(stageApproval(paid, 1)?.completedStage, 1);
  assert.equal(stageApproval(paid, 2), undefined);
  assert.equal(stageApproval(order({ activity: [{ text: "Approve payment · approved by Alex Morgan", at: "2026-10-26T01:00:00Z" }] }), 1)?.at, "2026-10-26T01:00:00Z");
});

test("deadlines use Philippine time, survive migration, and become overdue with time", () => {
  const anchor = Date.parse("2026-10-26T18:00:00Z"); // October 27 in Manila.
  const due = migrateDeliveryDue("Tomorrow", anchor);
  assert.equal(due, "2026-10-28T09:00:00.000Z");
  assert.equal(deliveryInput(due), "2026-10-28T17:00");
  assert.equal(deliveryISO("2026-10-28T17:00"), due);
  assert.equal(migrateDeliveryDue(due, anchor + 86400000), due);
  assert.equal(migrateDeliveryDue("Today, 12:30 AM", anchor), "2026-10-26T16:30:00.000Z");
  assert.equal(migrateDeliveryDue("Today, 2:00 PM", anchor), "2026-10-27T06:00:00.000Z");
  const pending = order({ due });
  assert.equal(isOverdue(pending, Date.parse(due) - 1), false);
  assert.equal(isOverdue(pending, Date.parse(due) + 1), true);
  assert.equal(isOverdue({ ...pending, stage: 5 }, Date.parse(due) + 1), false);
});


test("evidence uploads accept only the document needed at the current stage", () => {
  const receipt = { name: "receipt.txt", type: "receipt" as const, data: "data:text/plain;base64,cWE=" };
  const proof = { ...receipt, name: "proof.txt", type: "delivery" as const };
  for (const stage of [0, 1, 2, 3, 4, 5] as const) {
    assert.equal(stageEvidenceType(stage), stage === 1 ? "receipt" : stage === 4 ? "delivery" : null);
    for (const attachment of [receipt, proof, { ...receipt, type: "other" as const }]) {
      const original = order({ stage });
      if ((stage === 1 && attachment.type === "receipt") || (stage === 4 && attachment.type === "delivery")) {
        const next = attachStageEvidence(original, attachment);
        assert.equal(next.attachments.at(-1)?.type, attachment.type);
        assert.equal(next.activity.length, 1);
        assert.equal(next.stage, stage);
        assert.equal(original.attachments.length, 0);
      } else {
        assert.throws(() => attachStageEvidence(original, attachment), /current stage/);
      }
    }
  }
  assert.throws(() => attachStageEvidence(order({ stage: 1 }), { ...receipt, data: undefined }), /Choose a file/);
});
