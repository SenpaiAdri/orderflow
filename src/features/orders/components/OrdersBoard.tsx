import { ArrowRight } from "lucide-react";
import {
  nextAction,
  STAGES,
  attentionReason,
  money,
  total,
  type Order,
} from "@/lib/workflow";
import { OrderAvatar } from "./OrderAvatar";
import { StageIcon } from "./OrderStatus";

export function OrdersBoard({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="board">
      {STAGES.map((stage, i) => (
        <div className="board-column" data-stage={i} key={stage}>
          <h3>
            <StageIcon stage={i} size={15} />
            {stage}
            <span>{orders.filter((o) => o.stage === i).length}</span>
          </h3>
          {orders
            .filter((o) => o.stage === i)
            .map((o) => (
              <button
                className="board-card"
                key={o.id}
                onClick={() => onOpen(o.id)}
              >
                <div>
                  <strong>{o.id}</strong>
                  {o.priority === "urgent" && (
                    <span className="urgent-text">Urgent</span>
                  )}
                </div>
                <div className="customer-cell">
                  <OrderAvatar order={o} small />
                  <span>
                    {o.customer}
                    <small>{o.company}</small>
                  </span>
                </div>
                <p>{nextAction(o)}</p>
                {attentionReason(o) && <small>{attentionReason(o)}</small>}
                <footer>
                  <span>{money(total(o))}</span>
                  <ArrowRight size={13} />
                </footer>
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
