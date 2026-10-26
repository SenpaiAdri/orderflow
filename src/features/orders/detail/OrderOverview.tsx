import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, CircleAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { owners } from "@/data/team";
import { nextAction, STAGES, readiness, stageApproval, type Order, type Attachment } from "@/lib/workflow";
import { formatTime } from "@/lib/format";
import { OrderItems } from "./OrderItems";
import { PaymentDetails, PackingConfirmation, DeliveryDetails } from "./OrderStageDetails";

export function OrderOverview({ order, inspected, logChange, update, attachDemo, onDocuments, onEdit, children }: {
  order: Order;
  inspected: number;
  logChange: (patch: Partial<Order>, text: string) => void;
  update: (order: Order) => void;
  attachDemo: (type: Attachment["type"]) => void;
  onDocuments: (type: Attachment["type"]) => void;
  onEdit: () => void;
  children: ReactNode;
}) {
  const current = inspected === order.stage;
  const check = readiness(order);
  const approval = stageApproval(order, inspected);
  const items = <OrderItems order={order} checkStock={current && order.stage === 2} showStock={inspected === 2} logChange={logChange} />;
  const delivery = <DeliveryDetails order={order} editing={current && order.stage === 4} update={update} attachDemo={attachDemo} onDocuments={onDocuments} />;
  return (
    <>
      {current && order.stage < 5 ? (
        <div className={`next-step-card ${!check.ready ? "blocked" : ""}`} data-stage={order.stage}>
          <div className="next-step-icon">{!check.ready ? <CircleAlert size={20} /> : <ArrowRight size={20} />}</div>
          <div>
            <small>Step {order.stage + 1} of 6</small>
            <h3>{nextAction(order)}</h3>
            <p>{!check.ready ? check.reason : [
              "Review the customer, items, and delivery address before accepting the order.",
              "Match the receipt to the order total before approving payment.",
              "Check available quantities and reserve the items for this order.",
              "Packing is confirmed. Hand the order over for delivery.",
              "Confirm the delivery reference and customer receipt.",
            ][order.stage]}</p>
          </div>
        </div>
      ) : (
        <div className="completed-banner">
          <CheckCircle2 size={21} />
          <div>
            <strong>{order.stage === 5 && current ? "Order complete" : `${STAGES[inspected]} completed`}</strong>
            <p>{order.stage === 5 && current ? "Payment, stock, preparation, and delivery have been confirmed." : order.stage === 5 ? "Read-only stage summary. Select Completed to return to the order summary." : "Read-only stage summary. Select the current step to continue."}</p>
            {!current && <p>{approval ? `${approval.text} · ${formatTime(approval.at)}` : "Approval details were not recorded in this older demo record."}</p>}
          </div>
        </div>
      )}

      {current && order.stage === 0 && <section className="detail-section">
        <h3>Review intake details</h3>
        <p>{order.customer} · {order.company}</p>
        <p className="field-hint">{order.email || "No email provided"}</p>
        <Button variant="outline" size="sm" onClick={onEdit}>Edit order details</Button>
      </section>}
      {(inspected === 1 || order.stage === 5 && current) && <PaymentDetails order={order} editing={current && order.stage === 1} attachDemo={attachDemo} onDocuments={onDocuments} />}
      {(inspected === 0 || inspected === 2 || inspected === 3) && items}
      {inspected === 3 && <PackingConfirmation order={order} editing={current} logChange={logChange} />}
      {(inspected === 0 || inspected === 4 || order.stage === 5 && current) && delivery}
      {order.note && <div className="customer-note"><FileText size={16} /><div><strong>Customer note</strong><p>{order.note}</p></div></div>}

      <details className="more-details">
        <summary>Supporting order information <ChevronDown size={15} /></summary>
        <div className="detail-meta">
          <label>Assigned to
            <select value={order.owner} onChange={(e) => logChange({ owner: e.target.value }, `Order assigned to ${e.target.value}`)}>
              {owners.map((owner) => <option key={owner}>{owner}</option>)}
            </select>
          </label>
          <label>Priority
            <select value={order.priority} onChange={(e) => logChange({ priority: e.target.value as Order["priority"] }, `Priority changed to ${e.target.value}`)}>
              <option value="normal">Normal</option><option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        {(inspected === 1 || inspected === 4 || inspected === 5) && items}
        {(inspected === 1 || inspected === 2 || inspected === 3) && delivery}
        <p className="field-hint">Source: Manual intake · Currency: PHP</p>
      </details>
      <details className="more-details"><summary>Add a note <ChevronDown size={15} /></summary>{children}</details>
    </>
  );
}
