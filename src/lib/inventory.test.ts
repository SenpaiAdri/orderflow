import { test } from "node:test";
import assert from "node:assert/strict";
import { addProduct, adjustStock, migrateInventory, syncAvailability, updateWorkspaceOrder, type Product, type Workspace } from "./inventory.ts";
import { advanceOrder, attentionReason, readiness, type Order } from "./workflow.ts";

const mug: Product = { name: "Mug", sku: "MUG-001", price: 480, stock: 10 };
function order(id: string, stage: Order["stage"] = 2, qty = 6): Order {
  return {
    id, stage, items: [{ ...mug, qty }], customer: "Test customer", company: "Test company",
    email: "", address: "Makati", priority: "normal", due: "2099-10-27T09:00:00Z",
    owner: "Alex Morgan", initials: "TC", color: "mint", attachments: [], note: "", tracking: "",
    prepared: false, paymentMethod: "Bank transfer", activity: [{ text: "Order created", at: "2026-10-27T00:00:00Z" }],
  };
}
function workspace(): Workspace {
  return { products: [{ ...mug }], orders: [order("A"), order("B"), order("C", 3), order("D", 5)] };
}

test("catalogue includes unrelated products and imports legacy SKUs without clearing shortages", () => {
  const orders = [order("A", 2, 12), order("B"), order("C", 5)];
  orders[0].items[0].stock = 3;
  orders[2].items[0].stock = 0;
  orders[1].items.push({ name: "Legacy", sku: "OLD-1", price: 100, qty: 1, stock: 7 });
  const products = migrateInventory(orders, [mug, { name: "Tray", sku: "TRAY", price: 890, stock: 0 }]);
  assert.equal(products.find((product) => product.sku === mug.sku)?.stock, 3);
  assert.equal(products.find((product) => product.sku === "OLD-1")?.stock, 7);
  assert.equal(products.find((product) => product.sku === "TRAY")?.stock, 0);
  const synced = syncAvailability({ orders, products });
  assert.equal(synced.orders[1].items[0].stock, 3);
  assert.equal(synced.orders[2].items[0].stock, 0);
});

test("stock adjustments update every unreserved order and retain historical snapshots", () => {
  const initial = workspace();
  initial.orders.push(order("Intake", 0), order("Payment", 1));
  const next = adjustStock(initial, mug.sku, 4, "Stock count correction");
  assert.equal(next.products[0].stock, 4);
  assert.equal(next.products[0].lastAdjustment?.reason, "Stock count correction");
  for (const entry of next.orders.filter((order) => order.stage <= 2)) {
    assert.equal(entry.items[0].stock, 4);
    assert.match(entry.activity[0].text, /Stock count correction/);
  }
  for (const entry of next.orders.filter((order) => order.stage > 2)) {
    assert.equal(entry.items[0].stock, 10);
    assert.equal(entry.activity.length, 1);
  }
  assert.equal(initial.products[0].stock, 10);
  assert.match(attentionReason(next.orders[0])!, /Stock shortage/);
  const replenished = adjustStock(next, mug.sku, 20, "Supplier delivery");
  assert.equal(attentionReason(replenished.orders[0]), undefined);
  assert.equal(readiness(replenished.orders[0]).ready, true);
  assert.equal(adjustStock(replenished, mug.sku, 20, "Same count"), replenished);
});

test("adding products validates identifiers, quantities, and prices", () => {
  const initial = workspace();
  const next = addProduct(initial, { name: " Tray ", sku: " tray-1 ", price: 890, stock: 0 });
  assert.equal(next.products[1].name, "Tray");
  assert.equal(next.products[1].sku, "TRAY-1");
  assert.equal(next.products[1].stock, 0);
  assert.throws(() => addProduct(next, { ...mug, sku: "mug-001" }), /already exists/);
  for (const patch of [{ name: " " }, { sku: "BAD SKU" }, { stock: -1 }, { stock: 0.5 }, { stock: 100000 }, { price: Infinity }, { price: -1 }]) {
    assert.throws(() => addProduct(initial, { ...mug, sku: "NEW", ...patch }), /valid SKU/);
  }
});

test("invalid stock adjustments do not alter workspace data", () => {
  const initial = workspace();
  for (const stock of [-1, 0.5, NaN, Infinity, 100000]) {
    assert.throws(() => adjustStock(initial, mug.sku, stock, "Correction"), /whole stock quantity/);
  }
  assert.throws(() => adjustStock(initial, mug.sku, 5, " "), /reason/);
  assert.throws(() => adjustStock(initial, "UNKNOWN", 5, "Correction"), /not found/);
  assert.equal(initial.products[0].stock, 10);
});

test("reserving stock updates competing orders once and keeps approval snapshots", () => {
  const initial = workspace();
  const staleApproval = advanceOrder(initial.orders[1]);
  const reserved = updateWorkspaceOrder(initial, advanceOrder(initial.orders[0]));
  assert.equal(reserved.products[0].stock, 4);
  assert.equal(reserved.orders[0].stage, 3);
  assert.equal(reserved.orders[0].items[0].stock, 10);
  assert.equal(reserved.orders[1].items[0].stock, 4);
  assert.equal(readiness(reserved.orders[1]).ready, false);
  assert.throws(() => updateWorkspaceOrder(reserved, staleApproval), /shortage/);
  const noteUpdate = updateWorkspaceOrder(reserved, { ...reserved.orders[0], note: "Packing" });
  assert.equal(noteUpdate.products[0].stock, 4);
  const replenished = adjustStock(noteUpdate, mug.sku, 12, "Received stock");
  const second = updateWorkspaceOrder(replenished, advanceOrder(replenished.orders[1]));
  assert.equal(second.products[0].stock, 6);
  assert.equal(second.orders[1].stage, 3);
  assert.equal(second.orders[0].items[0].stock, 10);
});

test("order stock corrections share inventory and preserve notes and approvals", () => {
  const initial = workspace();
  const current = initial.orders[0];
  const corrected = updateWorkspaceOrder(initial, {
    ...current, items: [{ ...current.items[0], stock: 20 }],
    activity: [{ text: "Available stock updated", at: new Date().toISOString() }, ...current.activity],
  });
  assert.equal(corrected.products[0].stock, 20);
  assert.equal(corrected.orders[1].items[0].stock, 20);
  assert.match(corrected.orders[0].activity[0].text, /Stock check for A/);
  assert.equal(corrected.orders[0].activity[1].text, "Available stock updated");
  const noted = updateWorkspaceOrder(corrected, {
    ...corrected.orders[0], activity: [{ text: "Alex Morgan: note", at: new Date().toISOString() }, ...corrected.orders[0].activity],
  });
  assert.equal(noted.orders[0].activity[0].text, "Alex Morgan: note");
  assert.equal(noted.products[0].stock, 20);
});

test("multi-product reservations are all-or-nothing and later handoffs do not deduct again", () => {
  const initial = workspace();
  const tray = { name: "Tray", sku: "TRAY", price: 890, stock: 1 };
  initial.products.push(tray);
  initial.orders[0].items.push({ ...tray, qty: 2 });
  assert.throws(() => updateWorkspaceOrder(initial, { ...initial.orders[0], stage: 3 }), /shortage/);
  assert.deepEqual(initial.products.map((product) => product.stock), [10, 1]);
  const replenished = adjustStock(initial, "TRAY", 2, "Received tray");
  const reserved = updateWorkspaceOrder(replenished, advanceOrder(replenished.orders[0]));
  assert.deepEqual(reserved.products.map((product) => product.stock), [4, 0]);
  const packed = updateWorkspaceOrder(reserved, { ...reserved.orders[0], prepared: true });
  const delivery = updateWorkspaceOrder(packed, advanceOrder(packed.orders[0]));
  assert.equal(delivery.orders[0].stage, 4);
  assert.deepEqual(delivery.products.map((product) => product.stock), [4, 0]);
  assert.equal(delivery.orders[0].items[1].stock, 2);
});

test("unavailable products, duplicate lines, and invalid quantities cannot be reserved", () => {
  const initial = workspace();
  initial.orders[0].items[0].sku = "UNKNOWN";
  assert.throws(() => updateWorkspaceOrder(initial, { ...initial.orders[0], stage: 3 }), /shortage/);
  const duplicate = order("Duplicate");
  duplicate.items.push({ ...duplicate.items[0] });
  assert.equal(readiness(duplicate).ready, false);
  for (const qty of [0, -1, NaN, 1.5]) {
    const invalid = order("Invalid", 2, qty);
    assert.equal(readiness(invalid).ready, false);
  }
  assert.throws(() => updateWorkspaceOrder(workspace(), { ...order("A"), stage: 4 }), /six-stage/);
});
