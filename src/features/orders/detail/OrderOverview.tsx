import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileText,
} from "lucide-react";
import { owners } from "@/data/team";
import {
  ACTIONS,
  STAGES,
  readiness,
  type Order,
  type Attachment,
} from "@/lib/workflow";
import { OrderItems } from "./OrderItems";
import {
  PaymentDetails,
  PackingConfirmation,
  DeliveryDetails,
} from "./OrderStageDetails";

export function OrderOverview({
  order,
  inspected,
  logChange,
  update,
  attachDemo,
  onReviewReceipt,
  children,
}: {
  order: Order;
  inspected: number;
  logChange: (patch: Partial<Order>, text: string) => void;
  update: (order: Order) => void;
  attachDemo: (type: Attachment["type"]) => void;
  onReviewReceipt: () => void;
  children: ReactNode;
}) {
  const current = inspected === order.stage;
  const check = readiness(order);
  return (
    <>
      {current && order.stage < 5 ? (
        <div
          className={`next-step-card ${!check.ready ? "blocked" : ""}`}
          data-stage={order.stage}
        >
          <div className="next-step-icon">
            {!check.ready ? (
              <CircleAlert size={20} />
            ) : (
              <ArrowRight size={20} />
            )}
          </div>
          <div>
            <small>Step {order.stage + 1} of 6</small>
            <h3>{ACTIONS[order.stage]}</h3>
            <p>
              {!check.ready
                ? check.reason
                : [
                    "Review the customer, items, and delivery address before accepting the order.",
                    "Match the receipt to the order total before approving payment.",
                    "Check available quantities and reserve the items for this order.",
                    "Pick, check, and pack the items before handing off for delivery.",
                    "Confirm the delivery reference and customer receipt.",
                  ][order.stage]}
            </p>
          </div>
        </div>
      ) : (
        <div className="completed-banner">
          <CheckCircle2 size={21} />
          <div>
            <strong>
              {order.stage === 5 && current
                ? "Order complete"
                : `${STAGES[inspected]} completed`}
            </strong>
            <p>
              {order.stage === 5 && current
                ? "Payment, stock, preparation, and delivery have been confirmed."
                : "This stage has been approved. Select the current step to continue."}
            </p>
          </div>
        </div>
      )}
      <div className="detail-meta">
        <label>
          Assigned to
          <select
            value={order.owner}
            onChange={(e) =>
              logChange(
                { owner: e.target.value },
                `Order assigned to ${e.target.value}`,
              )
            }
          >
            {owners.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={order.priority}
            onChange={(e) =>
              logChange(
                { priority: e.target.value as Order["priority"] },
                `Priority changed to ${e.target.value}`,
              )
            }
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>
      {current && order.stage === 1 && (
        <PaymentDetails
          order={order}
          attachDemo={attachDemo}
          onReviewReceipt={onReviewReceipt}
        />
      )}
      <OrderItems
        order={order}
        checkStock={current && order.stage === 2}
        logChange={logChange}
      />
      {current && order.stage === 3 && (
        <PackingConfirmation order={order} logChange={logChange} />
      )}
      <DeliveryDetails
        order={order}
        editing={current && order.stage === 4}
        update={update}
        attachDemo={attachDemo}
      />
      {order.note && (
        <div className="customer-note">
          <FileText size={16} />
          <div>
            <strong>Customer note</strong>
            <p>{order.note}</p>
          </div>
        </div>
      )}
      <details className="more-details">
        <summary>
          Notes and order details <ChevronDown size={15} />
        </summary>
        <p>Owner: {order.owner} · Source: Manual intake · Currency: PHP</p>
        {children}
      </details>
    </>
  );
}
