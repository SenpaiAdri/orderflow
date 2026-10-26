import { Box, ArrowRight, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "./order-ui";
import type { Order } from "@/lib/workflow";
export function Inventory({
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
            Open an order to update available quantities. Add stock to cover any shortage before continuing.
          </p>
        </div>
      </div>
      <section className="inventory-grid">
        {affected.map((o) => (
          <article className="inventory-card" key={o.id}>
            <div className="section-title">
              <h2>{o.id}</h2>
              <Status stage={o.stage} />
            </div>
            <p>
              {o.company} · {o.customer}
            </p>
            {o.items.map((item) => (
              <div className="inventory-item" key={item.sku}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.sku}</small>
                </span>
                <span
                  className={
                    item.stock < item.qty ? "stock-short" : "stock-good"
                  }
                >
                  {item.stock} available / {item.qty} needed
                </span>
              </div>
            ))}
            <Button variant="outline" onClick={() => onOpen(o.id)}>
              Check stock <ArrowRight size={14} />
            </Button>
          </article>
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
