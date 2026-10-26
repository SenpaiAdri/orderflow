import { useEffect, useState } from "react";
import { seedOrders } from "@/data/orders";
import { migratePaymentMethod, type Order } from "@/lib/workflow";
import { migrateDeliveryDue } from "@/lib/delivery";
const STORE = "orderflow-demo-v1";
function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem(STORE);
    if (saved) {
      const data: unknown = JSON.parse(saved);
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
      )
        return (data as Order[]).map((order) => ({
          ...order,
          paymentMethod: migratePaymentMethod(order),
          due: migrateDeliveryDue(order.due, Date.parse(order.activity.at(-1)?.at ?? "") || Date.now()),
        }));
    }
  } catch {
    /* A fresh demo is safe when browser storage is unavailable. */
  }
  return seedOrders;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(orders));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [orders]);

  function updateOrder(next: Order) {
    setOrders((previous) =>
      previous.map((order) => (order.id === next.id ? next : order)),
    );
  }
  function createOrder(order: Order) {
    setOrders((previous) => [order, ...previous]);
  }
  return { orders, storageError, updateOrder, createOrder };
}
