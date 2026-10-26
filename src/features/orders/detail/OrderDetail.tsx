import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, total, type Order } from "@/lib/workflow";
import { OrderAvatar } from "../components/OrderAvatar";
import { OrderStatus } from "../components/OrderStatus";
import { OrderProgress } from "./OrderProgress";
import { OrderOverview } from "./OrderOverview";
import { OrderDocuments } from "./OrderDocuments";
import { OrderHistory } from "./OrderHistory";
import { OrderNoteForm } from "./OrderNoteForm";
import { OrderActions } from "./OrderActions";
import { IntakeEditor } from "./IntakeEditor";
import { useEvidenceUpload } from "./useEvidenceUpload";
import type { Product } from "@/lib/inventory";

export function OrderDetail({
  order,
  update,
  notify,
  products,
}: {
  order: Order;
  update: (order: Order) => void;
  notify: (message: string) => void;
  products: Product[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<number>(order.stage);
  const [editing, setEditing] = useState(false);
  const [guided, setGuided] = useState(false);
  const uploadFocusPending = useRef(false);
  const { fileRef, chooseFile, upload, uploading } = useEvidenceUpload({
    order, update, notify, onError: setError, onUploaded: () => {
      uploadFocusPending.current = true;
      setInspected(order.stage);
      setGuided(false);
    },
  });
  useEffect(() => {
    if (!uploading && uploadFocusPending.current) {
      uploadFocusPending.current = false;
      focusTask();
    }
  }, [uploading, order.attachments.length]);
  useEffect(() => {
    setInspected(order.stage);
    setEditing(false);
    setError("");
    setGuided(false);
    const frame = requestAnimationFrame(() => {
      const scroll = contentRef.current?.querySelector(".detail-scroll");
      if (scroll) scroll.scrollTop = 0;
      contentRef.current?.querySelector<HTMLButtonElement>(".detail-pipeline .current")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [order.stage, order.id]);
  function focusTask() {
    requestAnimationFrame(() => {
      const payment = !order.paymentMethod && contentRef.current?.querySelector<HTMLSelectElement>("select[name=payment-method]");
      const reference = !order.tracking.trim() && contentRef.current?.querySelector<HTMLInputElement>("input[name='delivery-reference']");
      const action = contentRef.current?.querySelector<HTMLButtonElement>(".detail-footer button:last-child");
      (payment || reference || action)?.focus();
    });
  }
  function resolveRequirement() {
    setInspected(order.stage);
    setGuided(true);
    setError("");
    if (order.stage === 0) { setEditing(true); return; }
    if ((order.stage === 1 && order.paymentMethod) || (order.stage === 4 && order.tracking.trim())) {
      contentRef.current?.querySelector<HTMLButtonElement>("[data-evidence-upload]")?.focus();
      chooseFile();
      return;
    }
    requestAnimationFrame(() => {
      const selector = order.stage === 1 ? "select[name=payment-method]" : order.stage === 2 ? ".stock-resolution input" : order.stage === 3 ? ".check-row input" : "input[name='delivery-reference']";
      const target = contentRef.current?.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
      target?.focus();
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
  function logChange(patch: Partial<Order>, text: string) {
    try { update({
      ...order,
      ...patch,
      activity: [{ text, at: new Date().toISOString() }, ...order.activity],
    }); } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save changes.");
      return;
    }
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
          onInspect={(stage) => { setInspected(stage); setGuided(false); setError(""); }}
        />}
        {editing && <IntakeEditor order={order} products={products} onCancel={() => {
          setEditing(false);
          requestAnimationFrame(() => contentRef.current?.querySelector<HTMLButtonElement>(".detail-footer button:first-child")?.focus());
        }} onSave={(next) => {
          update(next); setEditing(false); notify("Order details saved"); focusTask();
        }} />}
        {!editing && (
          <OrderOverview
            order={order}
            inspected={inspected}
            logChange={logChange}
            update={update}
            onUpload={chooseFile}
            uploading={uploading}
            guided={guided}
            error={error}
          />
        )}
        {!editing && <>
          <details className="more-details">
            <summary>Documents <span>{order.attachments.length || ""} <ChevronDown size={15} /></span></summary>
            <OrderDocuments attachments={order.attachments} />
          </details>
          <details className="more-details">
            <summary>History <ChevronDown size={15} /></summary>
            <OrderHistory activity={order.activity}>{noteForm}</OrderHistory>
          </details>
        </>}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" hidden
          aria-label={order.stage === 4 ? "Upload delivery proof" : "Upload payment receipt"}
          onChange={(event) => void upload(event.target.files?.[0])} />
        {error && order.stage !== 1 && order.stage !== 4 && (
          <div className="inline-error" role="alert">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
      </div>
      {!editing && <OrderActions
        order={order}
        update={update}
        notify={notify}
        onError={setError}
        onEdit={() => setEditing(true)}
        onResolve={resolveRequirement}
        uploading={uploading}
        viewingCurrent={inspected === order.stage}
        onReturn={() => { setInspected(order.stage); setGuided(false); focusTask(); }}
      />}
    </DialogContent>
  );
}
