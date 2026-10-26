import { useEffect, useState } from "react";
import { CircleAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AppLayout, type WorkspacePage } from "@/components/layout/AppLayout";
import { Toast } from "@/components/feedback/Toast";
import { HelpDialog } from "@/components/help/HelpDialog";
import { OrdersPage } from "@/features/orders/OrdersPage";
import { CreateOrder } from "@/features/orders/create/CreateOrder";
import { OrderDetail } from "@/features/orders/detail/OrderDetail";
import { StockPage } from "@/features/stock/StockPage";
import { ActivityPage } from "@/features/activity/ActivityPage";
import { useOrders } from "@/features/orders/useOrders";
import {
  defaultOrderFilters,
  type OrderFilters,
} from "@/features/orders/order-filters";
import { needsAttention, type Order } from "@/lib/workflow";

function App() {
  const { orders, storageError, updateOrder, createOrder } = useOrders();
  const [page, setPage] = useState<WorkspacePage>("Orders");
  const [orderLayout, setOrderLayout] = useState<"list" | "board">("list");
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const selected = orders.find((order) => order.id === selectedId);
  function changeFilters(patch: Partial<OrderFilters>) {
    setFilters((previous) => ({ ...previous, ...patch }));
  }
  function resetFilters() {
    setFilters(defaultOrderFilters);
  }
  function handleCreate(order: Order) {
    createOrder(order);
    setCreateOpen(false);
    resetFilters();
    setPage("Orders");
    setSelectedId(order.id);
    setToast("Order created. Review the details to confirm it.");
  }
  return (
    <>
      <AppLayout
        page={page}
        orderCount={orders.length}
        attentionCount={orders.filter(needsAttention).length}
        onNavigate={setPage}
        onHome={() => {
          setPage("Orders");
          resetFilters();
        }}
        onHelp={() => setHelpOpen(true)}
        onAttention={() => {
          setPage("Orders");
          changeFilters({ tab: "Needs attention", stageFilter: null });
        }}
      >
        <div className="page-heading">
          <div>
            <h1>
              {page === "Orders"
                ? "Orders"
                : page === "Inventory"
                  ? "Stock checks"
                  : "Order history"}
            </h1>
            <p>
              {page === "Orders"
                ? "Find an order and see what to do next."
                : page === "Inventory"
                  ? "Check quantities and fix shortages before packing."
                  : "See who updated each order and what changed."}
            </p>
          </div>
          {page === "Orders" && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              New order
            </Button>
          )}
        </div>
        {storageError && (
          <div className="storage-warning" role="alert">
            <CircleAlert size={16} />
            Browser storage is full or unavailable. Changes work for this
            session but may not survive a refresh.
          </div>
        )}
        {page === "Orders" ? (
          <OrdersPage
            orders={orders}
            filters={filters}
            layout={orderLayout}
            onLayoutChange={setOrderLayout}
            onFilterChange={changeFilters}
            onResetFilters={resetFilters}
            onOpen={setSelectedId}
            notify={setToast}
          />
        ) : page === "Inventory" ? (
          <StockPage orders={orders} onOpen={setSelectedId} />
        ) : (
          <ActivityPage orders={orders} onOpen={setSelectedId} />
        )}
      </AppLayout>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        {selected && (
          <OrderDetail
            order={selected}
            update={updateOrder}
            notify={setToast}
          />
        )}
      </Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <CreateOrder
          onCreate={handleCreate}
          nextId={`ORD-${Math.max(1048, ...orders.map((order) => Number(order.id.split("-")[1]) || 0)) + 1}`}
        />
      </Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <HelpDialog onClose={() => setHelpOpen(false)} />
      </Dialog>
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </>
  );
}
export default App;
