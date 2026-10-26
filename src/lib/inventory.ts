import { advanceOrder, type Item, type Order } from "./workflow.ts";

export interface Product extends Omit<Item, "qty"> {
  lastAdjustment?: { from: number; to: number; reason: string; at: string };
}
export interface Workspace {
  orders: Order[];
  products: Product[];
}

export function validProduct(product: Product): boolean {
  return typeof product?.name === "string" && !!product.name.trim() && product.name.length <= 120 &&
    typeof product.sku === "string" && /^[A-Z0-9][A-Z0-9._-]{0,39}$/.test(product.sku) &&
    Number.isFinite(product.price) && product.price >= 0 && product.price <= 999999 &&
    Number.isSafeInteger(product.stock) && product.stock >= 0 && product.stock <= 99999;
}

// Legacy availability differed by order. Keep the lowest unreserved count so
// migration never clears an existing shortage by assuming extra stock.
export function migrateInventory(orders: Order[], defaults: Product[]): Product[] {
  const products = new Map(defaults.map((product) => [product.sku, { ...product }]));
  for (const order of orders) for (const item of order.items) {
    if (!products.has(item.sku)) {
      products.set(item.sku, { name: item.name, sku: item.sku, price: item.price, stock: item.stock });
    }
  }
  return [...products.values()].map((product) => {
    const counts = orders.filter((order) => order.stage <= 2)
      .flatMap((order) => order.items.filter((item) => item.sku === product.sku).map((item) => item.stock));
    return { ...product, stock: counts.length ? Math.min(...counts) : product.stock };
  });
}

export function syncAvailability({ orders, products }: Workspace): Workspace {
  const counts = new Map(products.map((product) => [product.sku, product.stock]));
  return { products, orders: orders.map((order) => order.stage > 2 ? order : {
    ...order,
    items: order.items.map((item) => ({ ...item, stock: counts.get(item.sku) ?? 0 })),
  }) };
}

export function addProduct(workspace: Workspace, draft: Product): Workspace {
  const product = { ...draft, name: draft.name.trim(), sku: draft.sku.trim().toUpperCase() };
  if (!validProduct(product)) throw new Error("Enter a name, valid SKU, price, and whole stock quantity within the allowed limits.");
  if (workspace.products.some((item) => item.sku.toUpperCase() === product.sku))
    throw new Error("This SKU already exists. Adjust its stock instead.");
  return syncAvailability({ ...workspace, products: [...workspace.products, product] });
}

export function adjustStock(workspace: Workspace, sku: string, stock: number, reason: string): Workspace {
  const product = workspace.products.find((item) => item.sku === sku);
  if (!product) throw new Error("Product not found. Reopen Inventory and try again.");
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 99999)
    throw new Error("Enter a whole stock quantity from 0 to 99,999.");
  if (!reason.trim() || reason.trim().length > 240) throw new Error("Add a reason of up to 240 characters for this adjustment.");
  if (stock === product.stock) return workspace;
  const at = new Date().toISOString();
  return syncAvailability({
    products: workspace.products.map((item) => item.sku === sku ? {
      ...item, stock, lastAdjustment: { from: item.stock, to: stock, reason: reason.trim(), at },
    } : item),
    orders: workspace.orders.map((order) => order.stage <= 2 && order.items.some((item) => item.sku === sku) ? {
      ...order,
      activity: [{ text: `${sku} available stock: ${product.stock} → ${stock}. ${reason.trim()} · Alex Morgan`, at }, ...order.activity],
    } : order),
  });
}

export function updateWorkspaceOrder(workspace: Workspace, next: Order): Workspace {
  const current = workspace.orders.find((order) => order.id === next.id);
  if (!current) throw new Error("Order not found.");
  let updated = workspace;
  if (next.stage !== current.stage) {
    if (next.stage !== current.stage + 1) throw new Error("Orders must follow the six-stage sequence.");
    // Recheck the current shared availability at the moment of approval.
    next = advanceOrder(syncAvailability(workspace).orders.find((order) => order.id === next.id)!);
    if (current.stage === 2) {
      const quantities = new Map(current.items.map((item) => [item.sku, item.qty]));
      updated = { ...workspace, products: workspace.products.map((product) => ({
        ...product, stock: product.stock - (quantities.get(product.sku) ?? 0),
      })) };
    }
  } else if (current.stage === 2) {
    for (const item of next.items) {
      if (item.stock !== current.items.find((old) => old.sku === item.sku)?.stock) {
        updated = adjustStock(updated, item.sku, item.stock, `Stock check for ${current.id}`);
      }
    }
    const activity = updated.orders.find((order) => order.id === next.id)!.activity;
    next = { ...next, activity: [...activity.slice(0, activity.length - current.activity.length), ...next.activity] };
  }
  return syncAvailability({ ...updated, orders: updated.orders.map((order) => order.id === next.id ? next : order) });
}
