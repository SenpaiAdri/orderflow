import { needsAttention, type Order } from "../../lib/workflow.ts";

export interface OrderFilters {
  query: string;
  tab: "All orders" | "Needs attention" | "Assigned to me" | "Completed";
  stageFilter: number | null;
  ownerFilter: string;
  priorityFilter: string;
}
export const defaultOrderFilters: OrderFilters = {
  query: "",
  tab: "All orders",
  stageFilter: null,
  ownerFilter: "Everyone",
  priorityFilter: "All priorities",
};

export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  const { query, tab, stageFilter, ownerFilter, priorityFilter } = filters;
  return orders
    .filter((o) => {
      const matchesTab =
        tab === "All orders" ||
        (tab === "Needs attention" && needsAttention(o)) ||
        (tab === "Assigned to me" && o.owner === "Alex Morgan") ||
        (tab === "Completed" && o.stage === 5);
      return (
        matchesTab &&
        (stageFilter === null || o.stage === stageFilter) &&
        (ownerFilter === "Everyone" || o.owner === ownerFilter) &&
        (priorityFilter === "All priorities" ||
          o.priority === priorityFilter.toLowerCase()) &&
        `${o.id} ${o.customer} ${o.company}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .sort((a, b) => {
      const score = (o: Order) =>
        (o.stage < 5 && o.due === "Overdue" ? 8 : 0) +
        (needsAttention(o) ? 4 : 0) +
        (o.stage < 5 && o.priority === "urgent" ? 2 : 0);
      return score(b) - score(a);
    });
}
