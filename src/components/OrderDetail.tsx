import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleAlert,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  MapPin,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, Status, formatTime } from "./order-ui";
import {
  ACTIONS,
  STAGES,
  advanceOrder,
  readiness,
  money,
  total,
  type Order,
  type Attachment,
} from "@/lib/workflow";
const owners = ["Alex Morgan", "Mia Chen", "Sam Rivera"];
export function OrderDetail({
  order,
  update,
  notify,
}: {
  order: Order;
  update: (order: Order) => void;
  notify: (text: string) => void;
}) {
  const [detailTab, setDetailTab] = useState("Overview");
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<number>(order.stage);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<Attachment["type"]>("receipt");
  useEffect(() => {
    setInspected(order.stage);
    setConfirm(false);
    setError("");
  }, [order.stage, order.id]);
  const check = readiness(order);
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
  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose a file smaller than 2 MB.");
      return;
    }
    if (
      !["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(
        file.type,
      )
    ) {
      setError("Use a PDF, PNG, JPG, or text file.");
      return;
    }
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("File could not be read."));
        r.readAsDataURL(file);
      });
      logChange(
        {
          attachments: [
            ...order.attachments,
            { name: file.name, type: uploadType, data },
          ],
        },
        `${file.name} attached by Alex Morgan`,
      );
      notify("Attachment added");
    } catch {
      setError("Unable to read that file. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function download(a: Attachment) {
    const data =
      a.data ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(`ORDERFLOW SAMPLE ATTACHMENT\n${a.name}\nOrder: ${order.id}\nCustomer: ${order.customer}\nAmount: ${money(total(order))}\nThis is a placeholder for seeded demo evidence.`)}`;
    const link = document.createElement("a");
    link.href = data;
    link.download = a.data ? a.name : `${a.name}.sample.txt`;
    link.click();
  }
  function next() {
    try {
      update(advanceOrder(order));
      setConfirm(false);
      notify(`${order.id} moved to ${STAGES[order.stage + 1]}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to advance order");
    }
  }
  function addNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    logChange({}, `Alex Morgan: ${note.trim()}`);
    setNote("");
    notify("Note added to activity");
  }
  const current = inspected === order.stage;
  return (
    <DialogContent className="order-dialog">
      <div className="detail-header">
        <div className="detail-eyebrow">
          {order.priority === "urgent" ? "Urgent order" : "Order details"}
        </div>
        <DialogTitle>
          {order.id}
          <Status stage={order.stage} />
        </DialogTitle>
        <DialogDescription>
          {order.company} <span>·</span> Created by Alex Morgan
        </DialogDescription>
      </div>
      <div className="detail-scroll">
        <div className="detail-customer">
          <Avatar order={order} />
          <div>
            <strong>{order.customer}</strong>
            <span>{order.email}</span>
          </div>
          <strong>
            {money(total(order))}
            <small>{order.items.reduce((n, i) => n + i.qty, 0)} items</small>
          </strong>
        </div>
        <div className="detail-pipeline" aria-label="Order progress">
          {STAGES.map((s, i) => (
            <button
              key={s}
              disabled={i > order.stage}
              className={`${i < order.stage ? "done" : ""} ${i === inspected ? "viewing" : ""} ${i === order.stage ? "current" : ""}`}
              onClick={() => setInspected(i)}
              aria-label={`${s}${i < order.stage ? " complete" : i === order.stage ? " current" : " upcoming"}`}
            >
              <span>{i < order.stage ? <Check size={13} /> : i + 1}</span>
              <small>{s}</small>
            </button>
          ))}
        </div>
        <div className="detail-tabs">
          {["Overview", "Attachments", "Activity"].map((t) => (
            <button
              className={detailTab === t ? "active" : ""}
              key={t}
              onClick={() => setDetailTab(t)}
            >
              {t === "Overview" ? "Details" : t === "Attachments" ? "Documents" : "History"}
              {t === "Attachments" && <span>{order.attachments.length}</span>}
              {t === "Activity" && <span>{order.activity.length}</span>}
            </button>
          ))}
        </div>
        {detailTab === "Overview" ? (
          <>
            {current && order.stage < 5 ? (
              <div
                className={`next-step-card ${!check.ready ? "blocked" : ""}`}
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
              <section className="detail-section">
                <h3>
                  <CreditCard size={16} />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailTab("Attachments")}
                    >
                      Review receipt <ArrowUpRight size={13} />
                    </Button>
                  )}
                </div>
                <p className="field-hint">
                  Review the uploaded evidence before approving. Demo files are
                  labeled as samples.
                </p>
              </section>
            )}
            <section className="detail-section">
              <h3>
                <Package size={16} />
                {current && order.stage === 2
                  ? "Check stock"
                  : "Order items"}
                <span>{order.items.length} {order.items.length === 1 ? "product" : "products"}</span>
              </h3>
              <div className="item-list">
                {order.items.map((item, i) => (
                  <div className="order-item" key={item.sku}>
                    <span className="product-icon">
                      {i % 2 === 0 ? (
                        <ShoppingBag size={20} />
                      ) : (
                        <Package size={20} />
                      )}
                    </span>
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <small>
                        {item.sku} · {money(item.price)} each
                      </small>
                      {current && order.stage === 2 && (
                        <span
                          className={
                            item.stock < item.qty ? "stock-short" : "stock-good"
                          }
                        >
                          {item.stock} available · {item.qty} needed
                        </span>
                      )}
                    </div>
                    <span className="item-qty">×{item.qty}</span>
                    <strong>{money(item.qty * item.price)}</strong>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <span>Order total</span>
                <strong>{money(total(order))}</strong>
              </div>
              {current &&
                order.stage === 2 &&
                order.items.some((i) => i.stock < i.qty) && (
                  <div className="stock-resolution">
                    <h4>Update available stock</h4>
                    <p>
                      Enter the quantity counted in the warehouse. Demo quantities apply to this order only.
                    </p>
                    {order.items
                      .filter((i) => i.stock < i.qty)
                      .map((item) => (
                        <label key={item.sku}>
                          {item.name}
                          <input
                            aria-label={`Available stock for ${item.name}`}
                            type="number"
                            min="0"
                            max="99999"
                            defaultValue={item.stock}
                            onBlur={(e) => {
                              const value = Number(e.target.value);
                              if (
                                Number.isInteger(value) &&
                                value >= 0 &&
                                value <= 99999 &&
                                value !== item.stock
                              )
                                logChange(
                                  {
                                    items: order.items.map((i) =>
                                      i.sku === item.sku
                                        ? { ...i, stock: value }
                                        : i,
                                    ),
                                    issue:
                                      value >= item.qty
                                        ? undefined
                                        : order.issue,
                                  },
                                  `Stock for ${item.sku} updated to ${value}`,
                                );
                            }}
                          />
                        </label>
                      ))}
                    <p className="field-hint">
                      Enter the counted stock and move focus to save.
                    </p>
                  </div>
                )}
            </section>
            {current && order.stage === 3 && (
              <section className="detail-section">
                <h3>
                  <PackageCheck size={16} />
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
                    <small>
                      Confirm quantities, quality, and protective packaging.
                    </small>
                  </span>
                </label>
              </section>
            )}
            <section className="detail-section">
              <h3>
                <Truck size={16} />
                Delivery details
              </h3>
              <div className="address-row">
                <MapPin size={17} />
                <div>
                  <strong>{order.customer}</strong>
                  <p>{order.address}</p>
                  <span
                    className={
                      order.due === "Overdue" && order.stage < 5
                        ? "overdue"
                        : ""
                    }
                  >
                    Delivery due: {order.stage === 5 ? "Delivered" : order.due}
                  </span>
                </div>
              </div>
              {current && order.stage === 4 && (
                <>
                  <label className="field-label">
                    Delivery reference
                    <input
                      value={order.tracking}
                      onChange={(e) =>
                        update({ ...order, tracking: e.target.value })
                      }
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
              <p>
                Owner: {order.owner} · Source: Manual intake · Currency: PHP
              </p>
              <form onSubmit={addNote}>
                <label className="field-label">
                  Leave a note
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add context for the next person..."
                    maxLength={1000}
                  />
                </label>
                <Button variant="outline" size="sm" disabled={!note.trim()}>
                  Add note
                </Button>
              </form>
            </details>
          </>
        ) : detailTab === "Attachments" ? (
          <section className="detail-section attachment-section">
            <h3>
              Order attachments <span>{order.attachments.length} files</span>
            </h3>
            <p className="muted">
              Keep payment evidence and delivery documents with the order.
            </p>
            {order.attachments.map((a, i) => (
              <div className="attachment" key={`${a.name}-${i}`}>
                <span className="file-icon">
                  <FileText size={19} />
                </span>
                <div>
                  <strong>{a.name}</strong>
                  <small>
                    {a.type === "receipt"
                      ? "Payment evidence"
                      : a.type === "delivery"
                        ? "Proof of delivery"
                        : "Supporting document"}{" "}
                    ·{" "}
                    {!a.data
                      ? "Sample placeholder"
                      : a.name.startsWith("Demo")
                        ? "Demo file"
                        : "Uploaded file"}
                  </small>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Download ${a.name}`}
                  onClick={() => download(a)}
                >
                  <Download size={16} />
                </Button>
              </div>
            ))}
            {!order.attachments.length && (
              <div className="empty-attachments">
                <FileText size={28} />
                <p>No files attached yet.</p>
              </div>
            )}
            <div className="upload-box">
              <Upload size={22} />
              <strong>Add a document</strong>
              <p>PDF, JPG, PNG, or text · Up to 2 MB per file</p>
              <select
                aria-label="Attachment type"
                value={uploadType}
                onChange={(e) =>
                  setUploadType(e.target.value as Attachment["type"])
                }
              >
                <option value="receipt">Payment receipt</option>
                <option value="delivery">Proof of delivery</option>
                <option value="other">Other document</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <LoaderCircle size={14} className="spin" />
                ) : (
                  <Upload size={14} />
                )}
                Choose file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                hidden
                onChange={(e) => void upload(e.target.files?.[0])}
              />
            </div>
          </section>
        ) : (
          <section className="detail-section">
            <h3>Order history</h3>
            <p className="muted">
              A shared history of this order, newest first.
            </p>
            <div className="timeline">
              {order.activity.map((a, i) => (
                <div className="timeline-entry" key={`${a.at}-${i}`}>
                  <span className="timeline-dot">
                    {i === 0 ? <Check size={12} /> : <Circle size={9} />}
                  </span>
                  <div>
                    <strong>{a.text}</strong>
                    <time>{formatTime(a.at)}</time>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={addNote}>
              <label className="field-label">
                Add a note
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What should the next person know?"
                  maxLength={1000}
                />
              </label>
              <Button variant="outline" size="sm" disabled={!note.trim()}>
                Add note
              </Button>
            </form>
          </section>
        )}
        {error && (
          <div className="inline-error" role="alert">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
      </div>
      <div className="detail-footer">
        {order.stage === 5 ? (
          <>
            <span className="complete-footer">
              <CheckCircle2 size={17} />
              All six stages completed
            </span>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob(
                  [
                    `${order.id} — Order summary\n${order.customer} · ${order.company}\nTotal: ${money(total(order))}\nStatus: Completed\n\n${order.activity.map((a) => `${formatTime(a.at)} — ${a.text}`).join("\n")}`,
                  ],
                  { type: "text/plain" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${order.id}-summary.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} />
              Download summary
            </Button>
          </>
        ) : confirm ? (
          <div className="confirm-action">
            <p>
              <ShieldCheck size={17} />
              Have you checked the details and documents?
            </p>
            <div>
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Go back
              </Button>
              <Button onClick={next}>
                Confirm next step <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="footer-step">
              <span>Step {order.stage + 1} of 6</span>
              {STAGES[order.stage]}
            </span>
            <Button
              disabled={!check.ready}
              onClick={() => setConfirm(true)}
              title={check.reason || ACTIONS[order.stage]}
            >
              {ACTIONS[order.stage]}
              <ArrowRight size={15} />
            </Button>
            {!check.ready && <p className="blocked-hint">{check.reason}</p>}
          </>
        )}
      </div>
    </DialogContent>
  );
}
