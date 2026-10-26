import { StageIcon } from "../components/OrderStatus";
import { Package, ShoppingBag } from "lucide-react";
import { money, total, type Order } from "@/lib/workflow";

export function OrderItems({
  order,
  checkStock,
  logChange,
}: {
  order: Order;
  checkStock: boolean;
  logChange: (patch: Partial<Order>, text: string) => void;
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
              {checkStock && (
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
        <div className="stock-resolution">
          <h4>Update available stock</h4>
          <p>
            Enter the quantity counted in the warehouse. Demo quantities apply
            to this order only.
          </p>
          {order.items
            .filter((i) => i.stock < i.qty)
            .map((item) => (
              <label key={item.sku}>
                {item.name}
                <input
                  aria-label={`Available stock for ${item.name}`}
                  type="number"
                  min="0"
                  max="99999"
                  defaultValue={item.stock}
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (
                      Number.isInteger(value) &&
                      value >= 0 &&
                      value <= 99999 &&
                      value !== item.stock
                    )
                      logChange(
                        {
                          items: order.items.map((i) =>
                            i.sku === item.sku ? { ...i, stock: value } : i,
                          ),
                          issue: value >= item.qty ? undefined : order.issue,
                        },
                        `Stock for ${item.sku} updated to ${value}`,
                      );
                  }}
                />
              </label>
            ))}
          <p className="field-hint">
            Enter the counted stock and move focus to save.
          </p>
        </div>
      )}
    </section>
  );
}
