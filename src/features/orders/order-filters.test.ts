import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultOrderFilters, filterOrders } from "./order-filters.ts";
import type { Order } from "../../lib/workflow.ts";

function order(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    customer: "Isabel Santos",
    company: "Studio North",
    email: "demo@example.com",
    address: "Makati City",
    stage: 0,
    priority: "normal",
    due: "2099-10-27T09:00:00.000Z",
    owner: "Alex Morgan",
    initials: "IS",
    color: "mint",
    items: [],
    attachments: [],
    activity: [],
    note: "",
    tracking: "",
    prepared: false,
    paymentMethod: "Bank transfer",
    ...overrides,
  };
}

test("order search combines with stage, owner, and priority filters", () => {
  const match = order("matching", { stage: 2, priority: "urgent" });
  const orders = [
    match,
    order("wrong-stage", { stage: 0, priority: "urgent" }),
    order("wrong-owner", { stage: 2, priority: "urgent", owner: "Mia Chen" }),
    order("wrong-priority", { stage: 2 }),
    order("wrong-customer", {
      stage: 2,
      priority: "urgent",
      customer: "Other",
      company: "Other",
    }),
  ];
  assert.deepEqual(
    filterOrders(orders, {
      ...defaultOrderFilters,
      query: "ISABEL",
      stageFilter: 2,
      ownerFilter: "Alex Morgan",
      priorityFilter: "Urgent",
    }),
    [match],
  );
  assert.deepEqual(
    filterOrders([match], { ...defaultOrderFilters, query: "studio" }),
    [match],
  );
  assert.deepEqual(
    filterOrders([match], { ...defaultOrderFilters, query: "MATCHING" }),
    [match],
  );
});

test("order views select attention, assigned, and completed orders independently", () => {
  const overdue = order("late", { due: "2000-01-01T09:00:00.000Z", owner: "Mia Chen" });
  const mine = order("mine");
  const done = order("done", { stage: 5, due: "2000-01-01T09:00:00.000Z", owner: "Sam Rivera" });
  const orders = [done, mine, overdue];
  assert.deepEqual(
    filterOrders(orders, { ...defaultOrderFilters, tab: "Needs attention" }),
    [overdue],
  );
  assert.deepEqual(
    filterOrders(orders, { ...defaultOrderFilters, tab: "Assigned to me" }),
    [mine],
  );
  assert.deepEqual(
    filterOrders(orders, { ...defaultOrderFilters, tab: "Completed" }),
    [done],
  );
});

test("overdue orders sort first without changing the source collection", () => {
  const normal = order("normal");
  const urgent = order("urgent", { priority: "urgent" });
  const blocked = order("blocked", { stage: 1 });
  const overdue = order("overdue", { due: "2000-01-01T09:00:00.000Z" });
  const orders = [normal, urgent, blocked, overdue];
  assert.deepEqual(
    filterOrders(orders, defaultOrderFilters).map((o) => o.id),
    ["overdue", "urgent", "blocked", "normal"],
  );
  assert.deepEqual(
    orders.map((o) => o.id),
    ["normal", "urgent", "blocked", "overdue"],
  );
  assert.deepEqual(
    filterOrders(orders, { ...defaultOrderFilters, query: "no match" }),
    [],
  );
  const olderOverdue = order("older", { due: "1999-01-01T09:00:00.000Z" });
  assert.deepEqual(filterOrders([overdue, olderOverdue], defaultOrderFilters).map((o) => o.id), ["older", "overdue"]);
});
