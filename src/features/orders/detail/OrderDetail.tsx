import { useEffect, useState, type FormEvent } from "react";
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
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<number>(order.stage);
  useEffect(() => {
    setInspected(order.stage);
    setError("");
  }, [order.stage, order.id]);
  function logChange(patch: Partial<Order>, text: string) {
    update({
      ...order,
      ...patch,
      activity: [{ text, at: new Date().toISOString() }, ...order.activity],
    });
  }
  function attachDemo(type: Attachment["type"]) {
    logChange(
      {
        attachments: [
          ...order.attachments,
          {
            name:
              type === "receipt"
                ? "Demo payment receipt.txt"
                : "Demo delivery confirmation.txt",
            type,
            data: `data:text/plain;charset=utf-8,${encodeURIComponent(`ORDERFLOW DEMO EVIDENCE\nOrder: ${order.id}\nCustomer: ${order.customer}\nAmount: ${money(total(order))}\nType: ${type}\nThis document is sample evidence for prototype evaluation only.`)}`,
          },
        ],
      },
      `${type === "receipt" ? "Payment receipt" : "Delivery proof"} attached (demo)`,
    );
    notify("Sample evidence attached");
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
    <DialogContent className="order-dialog">
      <div className="detail-header">
        <div className="detail-eyebrow">
          {order.priority === "urgent" ? "Urgent order" : "Order details"}
        </div>
        <DialogTitle>
          {order.id}
          <OrderStatus stage={order.stage} />
        </DialogTitle>
        <DialogDescription>
          {order.company} <span>·</span> Created by Alex Morgan
        </DialogDescription>
      </div>
      <div className="detail-scroll">
        <div className="detail-customer">
          <OrderAvatar order={order} />
          <div>
            <strong>{order.customer}</strong>
            <span>{order.email}</span>
          </div>
          <strong>
            {money(total(order))}
            <small>{order.items.reduce((n, i) => n + i.qty, 0)} items</small>
          </strong>
        </div>

        <OrderProgress
          stage={order.stage}
          inspected={inspected}
          onInspect={setInspected}
        />
        <div className="detail-tabs">
          {[
            { value: "Overview", label: "Details" },
            { value: "Attachments", label: "Documents" },
            { value: "Activity", label: "History" },
          ].map(({ value, label }) => (
            <button
              key={value}
              className={detailTab === value ? "active" : ""}
              onClick={() => setDetailTab(value)}
            >
              {label}
              {value === "Attachments" && (
                <span>{order.attachments.length}</span>
              )}
              {value === "Activity" && <span>{order.activity.length}</span>}
            </button>
          ))}
        </div>
        {detailTab === "Overview" && (
          <OrderOverview
            order={order}
            inspected={inspected}
            logChange={logChange}
            update={update}
            attachDemo={attachDemo}
            onReviewReceipt={() => setDetailTab("Attachments")}
          >
            {noteForm}
          </OrderOverview>
        )}
        <OrderDocuments
          order={order}
          active={detailTab === "Attachments"}
          logChange={logChange}
          notify={notify}
          onError={setError}
        />
        {detailTab === "Activity" && (
          <OrderHistory activity={order.activity}>{noteForm}</OrderHistory>
        )}
        {error && (
          <div className="inline-error" role="alert">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
      </div>
      <OrderActions
        order={order}
        update={update}
        notify={notify}
        onError={setError}
      />
    </DialogContent>
  );
}
