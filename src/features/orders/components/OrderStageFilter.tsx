import { ChevronDown, ChevronRight } from "lucide-react";
import { STAGES, type Order } from "@/lib/workflow";
import type { OrderFilters } from "../order-filters";
import { StageIcon } from "./OrderStatus";

export function OrderStageFilter({
  orders,
  stageFilter,
  onFilterChange,
}: {
  orders: Order[];
  stageFilter: number | null;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
}) {
  return (
    <details className="workflow-section">
      <summary>
        Filter by order stage <ChevronDown size={16} />
      </summary>
      <div className="pipeline">
        {STAGES.map((stage, i) => {
          const count = orders.filter((o) => o.stage === i).length;
          return (
            <button
              key={stage}
              data-stage={i}
              className={`pipeline-stage ${stageFilter === i ? "selected" : ""}`}
              onClick={() => {
                onFilterChange({
                  stageFilter: stageFilter === i ? null : i,
                  tab: "All orders",
                });
              }}
              aria-pressed={stageFilter === i}
            >
              <div className="pipeline-stage-top">
                <span className={`pipeline-icon pipeline-${i}`}>
                  <StageIcon stage={i} size={17} />
                </span>
                <span className="stage-index">0{i + 1}</span>
              </div>
              <div className="pipeline-name">
                {stage}
                <ChevronRight size={13} />
              </div>
              <div className="pipeline-count">
                {count}
                <span>{count === 1 ? "order" : "orders"}</span>
                <span
                  className="pipeline-bar"
                  style={{
                    width: `${Math.max(10, (count / orders.length) * 180)}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </details>
  );
}
