import { Box, CheckCheck } from "lucide-react";
import { StockOrderCard } from "./StockOrderCard";
import type { Order } from "@/lib/workflow";
export function StockPage({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
}) {
  const affected = orders.filter((o) => o.stage === 2);
  return (
    <>
      <div className="inventory-explainer">
        <Box size={21} />
        <div>
          <strong>Check stock before packing.</strong>
          <p>
            Open an order to update available quantities. Add stock to cover any
            shortage before continuing.
          </p>
        </div>
      </div>
      <section className="inventory-grid">
        {affected.map((order) => (
          <StockOrderCard key={order.id} order={order} onOpen={onOpen} />
        ))}
      </section>
      {!affected.length && (
        <div className="empty-state">
          <CheckCheck size={28} />
          <h3>No stock checks waiting</h3>
          <p>Orders appear here when they need a stock check.</p>
        </div>
      )}
    </>
  );
}
