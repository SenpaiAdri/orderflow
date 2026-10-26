import { ChevronRight, History } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { Order } from "@/lib/workflow";

export function ActivityPage({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="activity-page">
      <div className="section-title">
        <h2>Recent activity</h2>
      </div>
      {orders
        .flatMap((o) => o.activity.map((a) => ({ ...a, order: o })))
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((a, i) => (
          <button
            className="activity-row"
            key={`${a.order.id}-${i}`}
            onClick={() => onOpen(a.order.id)}
          >
            <span className="activity-icon">
              <History size={16} />
            </span>
            <div>
              <strong>{a.text}</strong>
              <span>
                {a.order.id} · {a.order.customer}
              </span>
            </div>
            <time>{formatTime(a.at)}</time>
            <ChevronRight size={15} />
          </button>
        ))}
    </section>
  );
}
