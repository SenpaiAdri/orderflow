import { useEffect, useRef, useState } from "react";
import { seedOrders } from "@/data/orders";
import { seedProducts } from "@/data/products";
import { migratePaymentMethod, type Order } from "@/lib/workflow";
import { migrateDeliveryDue } from "@/lib/delivery";
import { addProduct, adjustStock, migrateInventory, syncAvailability, updateWorkspaceOrder, validProduct, type Product, type Workspace } from "@/lib/inventory";
const STORE = "orderflow-demo-v1";
function loadWorkspace(): Workspace {
  try {
    const saved = localStorage.getItem(STORE);
    if (saved) {
      const parsed = JSON.parse(saved);
      const data: unknown = Array.isArray(parsed) ? parsed : parsed.orders;
      if (
        Array.isArray(data) &&
        data.every(
          (o) =>
            typeof o?.id === "string" &&
            Array.isArray(o.items) &&
            Array.isArray(o.activity) &&
            Array.isArray(o.attachments) &&
            Number.isInteger(o.stage) &&
            o.stage >= 0 &&
            o.stage <= 5,
        )
      ) {
        const orders = (data as Order[]).map((order) => ({
          ...order,
          paymentMethod: migratePaymentMethod(order),
          due: migrateDeliveryDue(order.due, Date.parse(order.activity.at(-1)?.at ?? "") || Date.now()),
        }));
        const products: Product[] = Array.isArray(parsed) ? migrateInventory(orders, seedProducts) : parsed.products;
        if (!Array.isArray(products) || !products.length || !products.every(validProduct) || new Set(products.map((product) => product.sku)).size !== products.length)
          throw new Error("Invalid inventory");
        return syncAvailability({ orders, products });
      }
    }
  } catch {
    /* A fresh demo is safe when browser storage is unavailable. */
  }
  return syncAvailability({ orders: seedOrders, products: migrateInventory(seedOrders, seedProducts) });
}

export function useOrders() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const current = useRef(workspace);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(workspace));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [workspace]);

  // Async evidence uploads must use the latest inventory snapshot.
  function save(next: Workspace) {
    current.current = next;
    setWorkspace(next);
  }
  function updateOrder(next: Order) {
    save(updateWorkspaceOrder(current.current, next));
  }
  function createOrder(order: Order) {
    save(syncAvailability({ ...current.current, orders: [order, ...current.current.orders] }));
  }
  return {
    ...workspace, storageError, updateOrder, createOrder,
    addProduct: (product: Product) => save(addProduct(current.current, product)),
    adjustStock: (sku: string, stock: number, reason: string) => save(adjustStock(current.current, sku, stock, reason)),
  };
}
