import { ArrowUpRight, FileCheck2, MapPin } from "lucide-react";
import { DeliveryDue } from "../components/DeliveryDue";
import { StageIcon } from "../components/OrderStatus";
import { Button } from "@/components/ui/button";
import { money, total, type Order, type Attachment } from "@/lib/workflow";

export function PaymentDetails({
  order,
  attachDemo,
  onDocuments,
  editing,
}: {
  order: Order;
  attachDemo: (type: Attachment["type"]) => void;
  onDocuments: (type: Attachment["type"]) => void;
  editing: boolean;
}) {
  return (
    <section className="detail-section">
      <h3>
        <StageIcon stage={1} size={16} />
        {editing ? "Check payment" : "Payment summary"}
      </h3>
      <div className="payment-summary">
        <span>
          Expected payment<strong>{money(total(order))}</strong>
        </span>
        <span>
          Method<strong>Bank transfer</strong>
        </span>
      </div>
      <div className="evidence-row">
        <span>
          <FileCheck2 size={18} />
          {order.attachments.some((a) => a.type === "receipt")
            ? "Payment receipt attached"
            : "No payment receipt yet"}
        </span>
        {editing && !order.attachments.some((a) => a.type === "receipt") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => attachDemo("receipt")}
          >
            Use demo receipt
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onDocuments("receipt")}>
          {order.attachments.some((a) => a.type === "receipt") ? "Review receipt" : "Attach payment receipt"} <ArrowUpRight size={13} />
        </Button>
      </div>
      <p className="field-hint">
        {editing ? "Review the uploaded evidence before approving. " : "Evidence is retained with the order. "}Demo files are labeled as samples.
      </p>
    </section>
  );
}

export function PackingConfirmation({
  order,
  logChange,
  editing = true,
}: {
  order: Order;
  logChange: (patch: Partial<Order>, text: string) => void;
  editing?: boolean;
}) {
  return (
    <section className="detail-section">
      <h3>
        <StageIcon stage={3} size={16} />
        Confirm packing
      </h3>
      <label className="check-row">
        <input
          type="checkbox"
          checked={order.prepared}
          disabled={!editing}
          onChange={(e) =>
            logChange(
              { prepared: e.target.checked },
              e.target.checked
                ? "Items picked, quality checked, and packed"
                : "Preparation confirmation removed",
            )
          }
        />
        <span>
          <strong>All items picked, checked, and packed</strong>
          <small>Confirm quantities, quality, and protective packaging.</small>
        </span>
      </label>
    </section>
  );
}

export function DeliveryDetails({
  order,
  editing,
  update,
  attachDemo,
  onDocuments,
}: {
  order: Order;
  editing: boolean;
  update: (order: Order) => void;
  attachDemo: (type: Attachment["type"]) => void;
  onDocuments: (type: Attachment["type"]) => void;
}) {
  return (
    <section className="detail-section">
      <h3>
        <StageIcon stage={4} size={16} />
        Delivery details
      </h3>
      <div className="address-row">
        <MapPin size={17} />
        <div>
          <strong>{order.customer}</strong>
          <p>{order.address}</p>
          <DeliveryDue order={order} />
        </div>
      </div>
      {editing ? (
        <>
          <label className="field-label">
            Delivery reference
            <input
              value={order.tracking}
              onChange={(e) => update({ ...order, tracking: e.target.value })}
              placeholder="e.g. LAL-8401"
            />
          </label>
        </>
      ) : order.stage >= 4 && (
        <p className="field-hint">Delivery reference: <strong>{order.tracking || "Not recorded"}</strong></p>
      )}
      {order.stage >= 4 && <div className="evidence-row">
            <span>
              <FileCheck2 size={18} />
              {order.attachments.some((a) => a.type === "delivery")
                ? "Proof of delivery attached"
                : "Proof of delivery needed"}
            </span>
            {editing && !order.attachments.some((a) => a.type === "delivery") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => attachDemo("delivery")}
              >
                Use demo proof
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onDocuments("delivery")}>
              {order.attachments.some((a) => a.type === "delivery") ? "Review delivery proof" : "Attach delivery proof"}
            </Button>
          </div>}
    </section>
  );
}
