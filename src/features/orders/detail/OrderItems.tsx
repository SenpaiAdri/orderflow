import { Button } from "@/components/ui/button";
import { StageIcon } from "../components/OrderStatus";
import { Package, ShoppingBag } from "lucide-react";
import { money, total, type Order } from "@/lib/workflow";

export function OrderItems({
  order,
  checkStock,
  logChange,
  showStock = checkStock,
}: {
  order: Order;
  checkStock: boolean;
  logChange: (patch: Partial<Order>, text: string) => void;
  showStock?: boolean;
}) {
  return (
    <section className="detail-section">
      <h3>
        {checkStock ? <StageIcon stage={2} size={16} /> : <Package size={16} />}
        {checkStock ? "Check stock" : "Order items"}
        <span>
          {order.items.length}{" "}
          {order.items.length === 1 ? "product" : "products"}
        </span>
      </h3>
      <div className="item-list">
        {order.items.map((item, i) => (
          <div className="order-item" key={item.sku}>
            <span className="product-icon">
              {i % 2 === 0 ? <ShoppingBag size={20} /> : <Package size={20} />}
            </span>
            <div className="item-info">
              <strong>{item.name}</strong>
              <small>
                {item.sku} · {money(item.price)} each
              </small>
              {showStock && (
                <span
                  className={
                    item.stock < item.qty ? "stock-short" : "stock-good"
                  }
                >
                  {item.stock} available · {item.qty} needed
                </span>
              )}
            </div>
            <span className="item-qty">×{item.qty}</span>
            <strong>{money(item.qty * item.price)}</strong>
          </div>
        ))}
      </div>
      <div className="order-total">
        <span>Order total</span>
        <strong>{money(total(order))}</strong>
      </div>
      {checkStock && order.items.some((i) => i.stock < i.qty) && (
        <form className="stock-resolution" onSubmit={(event) => {
          event.preventDefault();
          const quantities = new FormData(event.currentTarget);
          const items = order.items.map((item) => ({
            ...item,
            stock: quantities.has(item.sku) ? Number(quantities.get(item.sku)) : item.stock,
          }));
          if (items.some((item) => !Number.isInteger(item.stock) || item.stock < 0 || item.stock > 99999)) return;
          logChange({ items, issue: items.every((item) => item.stock >= item.qty) ? undefined : order.issue }, "Available stock updated");
        }}>
          <h4>Update available stock</h4>
          <p>Demo availability for this order only.</p>
          {order.items
            .filter((i) => i.stock < i.qty)
            .map((item) => (
              <label key={item.sku}>
                {item.name}
                <input
                  aria-label={`Available stock for ${item.name}`}
                  name={item.sku}
                  required
                  step="1"
                  type="number"
                  min="0"
                  max="99999"
                  defaultValue={item.stock}
                />
              </label>
            ))}
          <Button type="submit" size="sm">Save stock quantities</Button>
        </form>
      )}
    </section>
  );
}
