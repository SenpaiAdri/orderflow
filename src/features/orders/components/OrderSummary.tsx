import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { needsAttention, type Order } from "@/lib/workflow";
import type { OrderFilters } from "../order-filters";

export function OrderSummary({
  orders,
  filters,
  onFilterChange,
}: {
  orders: Order[];
  filters: OrderFilters;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
}) {
  const { tab, stageFilter } = filters;
  const attention = orders.filter(needsAttention);
  return (
    <section className="summary-grid" aria-label="Order overview">
      {[
        {
          label: "All orders",
          count: orders.length,
          icon: ShoppingBag,
          tone: "orders",
          view: "All orders" as const,
          stage: null,
        },
        {
          label: "Needs attention",
          count: attention.length,
          icon: CircleAlert,
          tone: "attention",
          view: "Needs attention" as const,
          stage: null,
        },
        {
          label: "In delivery",
          count: orders.filter((o) => o.stage === 4).length,
          icon: Truck,
          tone: "delivery",
          view: "All orders" as const,
          stage: 4,
        },
        {
          label: "Completed",
          count: orders.filter((o) => o.stage === 5).length,
          icon: CheckCircle2,
          tone: "completed",
          view: "Completed" as const,
          stage: null,
        },
      ].map(({ label, count, icon: Icon, tone, view, stage }) => (
        <button
          key={label}
          className="summary-card"
          data-tone={tone}
          aria-pressed={tab === view && stageFilter === stage}
          onClick={() => {
            onFilterChange({ tab: view, stageFilter: stage });
          }}
        >
          <div className="summary-top">
            <span>{label}</span>
            <Icon size={19} className={`overview-${tone}`} />
          </div>
          <div className="metric-value">
            {count}
            <ArrowUpRight size={18} />
          </div>
        </button>
      ))}
    </section>
  );
}
