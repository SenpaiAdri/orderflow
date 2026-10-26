import { ArrowRight, ChevronRight } from "lucide-react";
import {
  ACTIONS,
  attentionReason,
  money,
  needsAttention,
  total,
  type Order,
} from "@/lib/workflow";
import { OrderAvatar } from "./OrderAvatar";
import { DeliveryDue } from "./DeliveryDue";
import { OrderStatus } from "./OrderStatus";

export function OrdersTable({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="table-scroll">
      <table aria-label="Orders">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>What to do next</th>
            <th>Delivery due</th>
            <th>Amount</th>
            <th>
              <span className="sr-only">Open order</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} data-stage={o.stage} onClick={() => onOpen(o.id)}>
              <td>
                <button className="order-id" onClick={() => onOpen(o.id)}>
                  {o.id}
                </button>
                <div className={`priority ${o.priority}`}>
                  <span />
                  {o.priority === "urgent" ? "Urgent" : "Normal"}
                </div>
              </td>
              <td>
                <div className="customer-cell">
                  <OrderAvatar order={o} />
                  <div>
                    <strong>{o.customer}</strong>
                    <small>{o.company}</small>
                  </div>
                </div>
              </td>
              <td>
                <OrderStatus stage={o.stage} />
              </td>
              <td data-label="What to do next">
                <button
                  className={`next-action ${needsAttention(o) ? "needs-action" : ""}`}
                  onClick={() => onOpen(o.id)}
                >
                  {attentionReason(o)?.includes("shortage")
                    ? "Update stock"
                    : attentionReason(o)?.includes("Missing")
                      ? "Add payment receipt"
                      : ACTIONS[o.stage]}
                  {o.stage !== 5 && <ArrowRight size={13} />}
                </button>
                {attentionReason(o) && (
                  <small className="action-sub">{attentionReason(o)}</small>
                )}
              </td>
              <td data-label="Delivery due">
                <DeliveryDue order={o} />
              </td>
              <td className="amount" data-label="Amount">
                {money(total(o))}
              </td>
              <td>
                <ChevronRight size={15} className="row-chevron" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
