import { ChevronDown, CircleAlert, FileCheck2, LoaderCircle, MapPin, Upload } from "lucide-react";
import { DeliveryDue } from "../components/DeliveryDue";
import { StageIcon } from "../components/OrderStatus";
import { Button } from "@/components/ui/button";
import { OrderDocuments } from "./OrderDocuments";
import { money, total, type Order, type Attachment } from "@/lib/workflow";

function StageEvidence({ order, type, editing, onUpload, uploading, guided, error }: {
  order: Order;
  type: Attachment["type"];
  editing: boolean;
  onUpload: () => void;
  uploading: boolean;
  guided: boolean;
  error: string;
}) {
  const files = order.attachments.filter((file) => file.type === type);
  const label = type === "receipt" ? "Payment receipt" : "Delivery proof";
  const action = type === "receipt" ? "Attach payment receipt" : "Attach delivery proof";
  return (
    <div className="stage-evidence">
      {error && <p className="inline-error" role="alert"><CircleAlert size={15} />{error}</p>}
      {files.length > 0 ? (
        <details className="evidence-details" key={files.length} open={editing || undefined}>
          <summary><span><FileCheck2 size={17} />{label} attached</span><ChevronDown size={15} /></summary>
          <OrderDocuments attachments={files} />
          {editing && <Button variant="outline" size="sm" disabled={uploading} data-evidence-upload onClick={onUpload}>
            {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : type === "receipt" ? "Attach another receipt" : "Attach another delivery proof"}
          </Button>}
        </details>
      ) : editing ? (
        <div className="evidence-row">
          <span>{label} <span className="required-label">Required</span></span>
          <Button size="sm" disabled={uploading} data-evidence-upload onClick={onUpload}
            aria-describedby={guided && (type === "receipt" || order.tracking.trim()) ? "stage-requirement" : undefined}>
            {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : action}
          </Button>
        </div>
      ) : <p className="py-3 text-secondary">{label} not recorded.</p>}
    </div>
  );
}

export function PaymentDetails({ order, onUpload, editing, uploading, guided, error }: {
  order: Order;
  onUpload: () => void;
  editing: boolean;
  uploading: boolean;
  guided: boolean;
  error: string;
}) {
  return (
    <section className="detail-section">
      <h3><StageIcon stage={1} size={16} />{editing ? "Check payment" : "Payment summary"}</h3>
      <div className="payment-summary">
        <span>Expected payment<strong>{money(total(order))}</strong></span>
        <span>Method<strong>Bank transfer</strong></span>
      </div>
      <StageEvidence order={order} type="receipt" editing={editing} onUpload={onUpload} uploading={uploading} guided={guided} error={error} />
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
          required={editing}
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
          {editing && <span className="required-label block mt-1">Required</span>}
        </span>
      </label>
    </section>
  );
}

export function DeliveryDetails({
  order,
  editing,
  update,
  onUpload,
  uploading,
  guided,
  error,
}: {
  order: Order;
  editing: boolean;
  update: (order: Order) => void;
  onUpload: () => void;
  uploading: boolean;
  guided: boolean;
  error: string;
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
            <span className="flex items-center justify-between">Delivery reference <span className="required-label">Required</span></span>
            <input
              name="delivery-reference"
              required
              aria-invalid={guided && !order.tracking.trim() || undefined}
              aria-describedby={guided && !order.tracking.trim() ? "stage-requirement" : undefined}
              value={order.tracking}
              onChange={(e) => update({ ...order, tracking: e.target.value })}
              placeholder="e.g. LAL-8401"
            />
          </label>
        </>
      ) : order.stage >= 4 && (
        <p className="field-hint">Delivery reference: <strong>{order.tracking || "Not recorded"}</strong></p>
      )}
      {order.stage >= 4 && <StageEvidence order={order} type="delivery" editing={editing} onUpload={onUpload} uploading={uploading} guided={guided} error={error} />}
    </section>
  );
}
