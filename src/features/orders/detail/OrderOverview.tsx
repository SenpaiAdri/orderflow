import { CheckCircle2, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { owners } from "@/data/team";
import { STAGES, stageApproval, type Order, type Attachment } from "@/lib/workflow";
import { formatTime } from "@/lib/format";
import { OrderItems } from "./OrderItems";
import { PaymentDetails, PackingConfirmation, DeliveryDetails } from "./OrderStageDetails";

export function OrderOverview({ order, inspected, logChange, update, onDocuments, onEdit }: {
  order: Order;
  inspected: number;
  logChange: (patch: Partial<Order>, text: string) => void;
  update: (order: Order) => void;
  onDocuments: (type: Attachment["type"]) => void;
  onEdit: () => void;
}) {
  const current = inspected === order.stage;
  const approval = stageApproval(order, inspected);
  const items = <OrderItems order={order} checkStock={current && order.stage === 2} showStock={inspected === 2} logChange={logChange} />;
  const delivery = <DeliveryDetails order={order} editing={current && order.stage === 4} update={update} onDocuments={onDocuments} />;
  return (
    <>
      {(!current || order.stage === 5) && (
        <div className="completed-banner">
          <CheckCircle2 size={21} />
          <div>
            <strong>{order.stage === 5 && current ? "Order complete" : `${STAGES[inspected]} completed`}</strong>

            {!current && <p>{approval ? `${approval.text} · ${formatTime(approval.at)}` : "Approval details were not recorded in this older demo record."}</p>}
          </div>
        </div>
      )}

      {current && order.stage === 0 && <section className="detail-section">
        <h3>Review intake details</h3>
        <Button variant="outline" size="sm" onClick={onEdit}>Edit order details</Button>
      </section>}
      {inspected === 1 && <PaymentDetails order={order} editing={current && order.stage === 1} onDocuments={onDocuments} />}
      {(inspected === 0 || inspected === 2 || inspected === 3) && items}
      {inspected === 3 && <PackingConfirmation order={order} editing={current} logChange={logChange} />}
      {(inspected === 0 || inspected === 4) && delivery}
      {order.note && <div className="customer-note"><FileText size={16} /><div><strong>Customer note</strong><p>{order.note}</p></div></div>}

      <details className="more-details">
        <summary>Order information <ChevronDown size={15} /></summary>
        {order.email && <p className="mb-4 text-secondary">{order.email}</p>}
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
        {inspected === 5 && <PaymentDetails order={order} editing={false} onDocuments={onDocuments} />}
        {(inspected === 1 || inspected === 2 || inspected === 3 || inspected === 5) && delivery}
      </details>
    </>
  );
}
