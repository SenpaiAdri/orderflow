import { money, type Item } from "@/lib/workflow";

import type { Product } from "@/lib/inventory";

export function OrderItemFields({ item, products, onChange }: { item: Item; products: Product[]; onChange: (item: Item) => void }) {
  return (
    <div className="form-grid product-fields">
      <label className="field-label">
        Product
        <select value={item.sku} onChange={(e) => {
          const product = products.find((product) => product.sku === e.target.value);
          if (product) onChange({ ...product, qty: item.qty });
        }}>
          {!products.some((product) => product.sku === item.sku) && <option value={item.sku}>{item.name}</option>}
          {products.map((product) => <option key={product.sku} value={product.sku}>{product.name} · {money(product.price)}</option>)}
        </select>
      </label>
      <label className="field-label">
        Quantity
        <input required type="number" min="1" max="999" step="1" value={item.qty}
          onChange={(e) => onChange({ ...item, qty: Number(e.target.value) })} />
      </label>
    </div>
  );
}
