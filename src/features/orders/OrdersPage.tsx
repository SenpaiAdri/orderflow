import { Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { needsAttention, STAGES, type Order } from "@/lib/workflow";
import { filterOrders, type OrderFilters } from "./order-filters";
import { exportOrders } from "./export-orders";
import { OrdersToolbar } from "./components/OrdersToolbar";
import { OrdersTable } from "./components/OrdersTable";
import { OrdersBoard } from "./components/OrdersBoard";

export function OrdersPage({
  orders,
  filters,
  layout,
  onLayoutChange,
  onFilterChange,
  onResetFilters,
  onOpen,
  notify,
}: {
  orders: Order[];
  filters: OrderFilters;
  layout: "list" | "board";
  onLayoutChange: (layout: "list" | "board") => void;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
  onResetFilters: () => void;
  onOpen: (id: string) => void;
  notify: (message: string) => void;
}) {
  const visible = filterOrders(orders, filters);
  return (
    <>
      <section className="orders-section">
        <div className="section-title orders-title">
          <h2>
            Order list <span className="count-pill">{visible.length}</span>
          </h2>
          <div className="section-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportOrders(visible);
                notify(`${visible.length} orders exported`);
              }}
            >
              <Download size={14} />
              Download list
            </Button>
          </div>
        </div>
        <OrdersToolbar
          filters={filters}
          onFilterChange={onFilterChange}
          attentionCount={orders.filter(needsAttention).length}
          layout={layout}
          onLayoutChange={onLayoutChange}
        />
        {filters.stageFilter !== null && (
          <div className="active-filter">
            Stage: {STAGES[filters.stageFilter]}
            <button
              aria-label="Remove stage filter"
              onClick={() => onFilterChange({ stageFilter: null })}
            >
              <X size={12} />
            </button>
          </div>
        )}
        {visible.length === 0 ? (
          <div className="empty-state">
            <Search size={29} />
            <h3>No orders found</h3>
            <p>Try another search or clear your filters.</p>
            <Button variant="outline" onClick={onResetFilters}>
              Clear all filters
            </Button>
          </div>
        ) : layout === "list" ? (
          <OrdersTable orders={visible} onOpen={onOpen} />
        ) : (
          <OrdersBoard orders={visible} onOpen={onOpen} />
        )}
        <div className="table-footer">
          <span>
            Showing <strong>{visible.length}</strong> of {orders.length} orders
          </span>
        </div>
      </section>
    </>
  );
}
