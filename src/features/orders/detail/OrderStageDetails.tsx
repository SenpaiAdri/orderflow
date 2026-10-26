import { ArrowUpRight, FileCheck2, MapPin } from "lucide-react";
import { DeliveryDue } from "../components/DeliveryDue";
import { StageIcon } from "../components/OrderStatus";
import { Button } from "@/components/ui/button";
import { money, total, type Order, type Attachment } from "@/lib/workflow";

export function PaymentDetails({
  order,
  attachDemo,
  onReviewReceipt,
}: {
  order: Order;
  attachDemo: (type: Attachment["type"]) => void;
  onReviewReceipt: () => void;
}) {
  return (
    <section className="detail-section">
      <h3>
        <StageIcon stage={1} size={16} />
        Check payment
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
        {!order.attachments.some((a) => a.type === "receipt") ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => attachDemo("receipt")}
          >
            Use demo receipt
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onReviewReceipt()}>
            Review receipt <ArrowUpRight size={13} />
          </Button>
        )}
      </div>
      <p className="field-hint">
        Review the uploaded evidence before approving. Demo files are labeled as
        samples.
      </p>
    </section>
  );
}

export function PackingConfirmation({
  order,
  logChange,
}: {
  order: Order;
  logChange: (patch: Partial<Order>, text: string) => void;
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
}: {
  order: Order;
  editing: boolean;
  update: (order: Order) => void;
  attachDemo: (type: Attachment["type"]) => void;
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
      {editing && (
        <>
          <label className="field-label">
            Delivery reference
            <input
              value={order.tracking}
              onChange={(e) => update({ ...order, tracking: e.target.value })}
              placeholder="e.g. LAL-8401"
            />
          </label>
          <div className="evidence-row">
            <span>
              <FileCheck2 size={18} />
              {order.attachments.some((a) => a.type === "delivery")
                ? "Proof of delivery attached"
                : "Proof of delivery needed"}
            </span>
            {!order.attachments.some((a) => a.type === "delivery") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => attachDemo("delivery")}
              >
                Use demo proof
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
