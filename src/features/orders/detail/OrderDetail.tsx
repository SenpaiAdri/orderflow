import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, total, type Order, type Attachment } from "@/lib/workflow";
import { OrderAvatar } from "../components/OrderAvatar";
import { OrderStatus } from "../components/OrderStatus";
import { OrderProgress } from "./OrderProgress";
import { OrderOverview } from "./OrderOverview";
import { OrderDocuments } from "./OrderDocuments";
import { OrderHistory } from "./OrderHistory";
import { OrderNoteForm } from "./OrderNoteForm";
import { OrderActions } from "./OrderActions";
import { IntakeEditor } from "./IntakeEditor";

export function OrderDetail({
  order,
  update,
  notify,
}: {
  order: Order;
  update: (order: Order) => void;
  notify: (message: string) => void;
}) {
  const [detailTab, setDetailTab] = useState("Overview");
  const contentRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<number>(order.stage);
  const [editing, setEditing] = useState(false);
  const [returnToStage, setReturnToStage] = useState<Attachment["type"] | null>(null);
  const [uploadType, setUploadType] = useState<Attachment["type"]>(order.stage >= 4 ? "delivery" : "receipt");
  useEffect(() => {
    setInspected(order.stage);
    setDetailTab("Overview");
    setEditing(false);
    setError("");
    setReturnToStage(null);
    const frame = requestAnimationFrame(() => {
      const scroll = contentRef.current?.querySelector(".detail-scroll");
      if (scroll) scroll.scrollTop = 0;
      contentRef.current?.querySelector<HTMLButtonElement>(".detail-pipeline .current")?.focus();
    });
    setUploadType(order.stage >= 4 ? "delivery" : "receipt");
    return () => cancelAnimationFrame(frame);
  }, [order.stage, order.id]);
  function openDocuments(type: Attachment["type"]) {
    setUploadType(type);
    setReturnToStage(type);
    setDetailTab("Attachments");
    requestAnimationFrame(() => {
      const evidence = contentRef.current?.querySelector<HTMLButtonElement>(`.attachment[data-document-type="${type}"] button:not([disabled])`);
      const upload = contentRef.current?.querySelector<HTMLButtonElement>(".upload-box button");
      (evidence ?? upload)?.focus();
    });
  }
  function focusTask() {
    requestAnimationFrame(() => {
      const action = contentRef.current?.querySelector<HTMLButtonElement>(".detail-footer button:last-child");
      const reference = contentRef.current?.querySelector<HTMLInputElement>("input[name='delivery-reference']");
      const selected = contentRef.current?.querySelector<HTMLButtonElement>(".detail-pipeline .viewing");
      (action ?? reference ?? selected)?.focus();
    });
  }
  function logChange(patch: Partial<Order>, text: string) {
    update({
      ...order,
      ...patch,
      activity: [{ text, at: new Date().toISOString() }, ...order.activity],
    });
    if (patch.items && order.stage === 2) {
      notify("Stock quantities saved");
      if (patch.items.every((item) => item.stock >= item.qty)) focusTask();
    }
  }
  function addNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    logChange({}, `Alex Morgan: ${note.trim()}`);
    setNote("");
    notify("Note added to activity");
  }

  const noteForm = (
    <OrderNoteForm note={note} onChange={setNote} onSubmit={addNote} />
  );
  return (
    <DialogContent ref={contentRef} className="order-dialog" onOpenAutoFocus={(event) => {
      event.preventDefault();
      contentRef.current?.querySelector<HTMLButtonElement>(".detail-pipeline .current")?.focus();
    }}>
      <div className="detail-header">
        {order.priority === "urgent" && <div className="detail-eyebrow">Urgent order</div>}
        <DialogTitle>
          {order.id}
          <OrderStatus stage={order.stage} />
        </DialogTitle>
        <DialogDescription>
          {order.company}
        </DialogDescription>
      </div>
      <div className="detail-scroll">
        <div className="detail-customer">
          <OrderAvatar order={order} />
          <div>
            <strong>{order.customer}</strong>
            <span>Assigned to {order.owner}</span>
          </div>
          <strong>
            {money(total(order))}
            <small>{order.items.reduce((n, i) => n + i.qty, 0)} items</small>
          </strong>
        </div>

        {!editing && <OrderProgress
          stage={order.stage}
          inspected={inspected}
          onInspect={(stage) => { setInspected(stage); setDetailTab("Overview"); setReturnToStage(null); setError(""); }}
        />}
        {!editing && <div className="detail-tabs" role="group" aria-label="Order sections">
          {[
            { value: "Overview", label: "Details" },
            { value: "Attachments", label: "Documents" },
            { value: "Activity", label: "History" },
          ].map(({ value, label }) => (
            <button
              key={value}
              className={detailTab === value ? "active" : ""}
              aria-pressed={detailTab === value}
              onClick={() => { setDetailTab(value); setReturnToStage(null); setError(""); }}
            >
              {label}
            </button>
          ))}
        </div>}
        {editing && <IntakeEditor order={order} onCancel={() => {
          setEditing(false);
          requestAnimationFrame(() => contentRef.current?.querySelector<HTMLButtonElement>(".detail-footer button:first-child")?.focus());
        }} onSave={(next) => {
          update(next); setEditing(false); notify("Order details saved"); focusTask();
        }} />}
        {!editing && detailTab === "Overview" && (
          <OrderOverview
            order={order}
            inspected={inspected}
            logChange={logChange}
            update={update}
            onDocuments={openDocuments}
          />
        )}
        <OrderDocuments
          order={order}
          active={!editing && detailTab === "Attachments"}
          uploadType={uploadType}
          onUploadTypeChange={setUploadType}
          contextType={returnToStage}
          onUploaded={(type) => {
            if (type === returnToStage) {
              setDetailTab("Overview");
              setReturnToStage(null);
              focusTask();
            }
          }}
          logChange={logChange}
          notify={notify}
          onError={setError}
        />
        {!editing && detailTab === "Activity" && (
          <OrderHistory activity={order.activity}>{noteForm}</OrderHistory>
        )}
        {error && (
          <div className="inline-error" role="alert">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
      </div>
      {!editing && detailTab === "Overview" && inspected === order.stage && <OrderActions
        order={order}
        update={update}
        notify={notify}
        onError={setError}
        onEdit={() => setEditing(true)}
      />}
    </DialogContent>
  );
}
