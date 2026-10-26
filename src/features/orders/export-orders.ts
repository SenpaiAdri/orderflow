import { STAGES, total, type Order } from "@/lib/workflow";
export function exportOrders(orders: Order[]) {
  const rows = [
    [
      "Order",
      "Customer",
      "Company",
      "Stage",
      "Owner",
      "Total (PHP)",
      "Priority",
    ],
    ...orders.map((o) => [
      o.id,
      o.customer,
      o.company,
      STAGES[o.stage],
      o.owner,
      String(total(o)),
      o.priority,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "orderflow-orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}
