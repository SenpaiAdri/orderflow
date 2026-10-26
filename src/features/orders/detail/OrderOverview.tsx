import { CheckCircle2, ChevronDown, FileText } from "lucide-react";
import { owners } from "@/data/team";
import { STAGES, stageApproval, selectPaymentMethod, type Order } from "@/lib/workflow";
import { formatTime } from "@/lib/format";
import { OrderItems } from "./OrderItems";
import { PaymentDetails, PackingConfirmation, DeliveryDetails } from "./OrderStageDetails";

export function OrderOverview({ order, inspected, logChange, update, onUpload, uploading, guided, error }: {
  order: Order;
  inspected: number;
  logChange: (patch: Partial<Order>, text: string) => void;
  update: (order: Order) => void;
  onUpload: () => void;
  uploading: boolean;
  guided: boolean;
  error: string;
}) {
  const current = inspected === order.stage;
  const approval = stageApproval(order, inspected === 5 ? 4 : inspected);
  const approvalText = approval
    ? current && order.stage === 5
      ? `Completed ${formatTime(approval.at)}`
      : `${approval.text} · ${formatTime(approval.at)}`
    : "Approval record unavailable.";
  const items = <OrderItems order={order} checkStock={current && order.stage === 2} showStock={inspected === 2} showPrices={inspected !== 2 && inspected !== 3} logChange={logChange} />;
  const note = order.note && <div className="customer-note"><FileText size={16} /><div><strong>Customer note</strong><p>{order.note}</p></div></div>;
  const showNote = inspected === 0 || inspected === 3 || inspected === 4;
  const delivery = <DeliveryDetails order={order} editing={current && order.stage === 4} update={update} onUpload={onUpload} uploading={uploading} guided={guided} error={current ? error : ""} />;
  return (
    <>
      {(!current || order.stage === 5) && (
        <div className="completed-banner">
          <CheckCircle2 size={21} />
          <div>
            <strong>{order.stage === 5 && current ? "Order complete" : `${STAGES[inspected]} completed`}</strong>

            <p>{approvalText}</p>
          </div>
        </div>
      )}

      {inspected === 1 && <PaymentDetails onMethodChange={(method) => update(selectPaymentMethod(order, method))} order={order} editing={current && order.stage === 1} onUpload={onUpload} uploading={uploading} guided={guided} error={current ? error : ""} />}
      {(inspected === 0 || inspected === 2 || inspected === 3) && items}
      {inspected === 3 && <PackingConfirmation order={order} editing={current} logChange={logChange} />}
      {(inspected === 0 || inspected === 4 || inspected === 5) && delivery}
      {showNote && note}

      <details className="more-details">
        <summary>Order information <ChevronDown size={15} /></summary>
        {!showNote && note}
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
        {(inspected === 1 || inspected === 2 || inspected === 3) && delivery}
      </details>
    </>
  );
}
