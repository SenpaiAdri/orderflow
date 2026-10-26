import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/features/orders/components/OrderStatus";
import type { Order } from "@/lib/workflow";

export function StockOrderCard({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: (id: string) => void;
}) {
  return (
    <article className="inventory-card">
      <div className="section-title">
        <h2>{order.id}</h2>
        <OrderStatus stage={order.stage} />
      </div>
      <p>
        {order.company} · {order.customer}
      </p>
      {order.items.map((item) => (
        <div className="inventory-item" key={item.sku}>
          <span>
            <strong>{item.name}</strong>
            <small>{item.sku}</small>
          </span>
          <span
            className={item.stock < item.qty ? "stock-short" : "stock-good"}
          >
            {item.stock} available / {item.qty} needed
          </span>
        </div>
      ))}
      <Button onClick={() => onOpen(order.id)}>
        Check stock <ArrowRight size={14} />
      </Button>
    </article>
  );
}
