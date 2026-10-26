import { useState, type FormEvent } from "react";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, type Order } from "@/lib/workflow";
export function CreateOrder({
  onCreate,
  nextId,
}: {
  onCreate: (o: Order) => void;
  nextId: string;
}) {
  const [customer, setCustomer] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(6);
  const [product, setProduct] = useState("mug");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [due, setDue] = useState("Tomorrow");
  const [note, setNote] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      !customer.trim() ||
      !address.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 999
    )
      return;
    const item =
      product === "mug"
        ? {
            name: "Everyday ceramic mug",
            sku: "CER-001",
            price: 480,
            stock: 42,
          }
        : {
            name: "Linen table runner",
            sku: "LIN-024",
            price: 1250,
            stock: 18,
          };
    onCreate({
      id: nextId,
      customer: customer.trim(),
      company: company.trim() || "Individual customer",
      email: email.trim(),
      address: address.trim(),
      items: [{ ...item, qty: quantity }],
      stage: 0,
      priority,
      due,
      owner: "Alex Morgan",
      initials: customer
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      color: "mint",
      attachments: [],
      note: note.trim(),
      tracking: "",
      prepared: false,
      activity: [
        { text: "Order created by Alex Morgan", at: new Date().toISOString() },
      ],
    });
  }
  return (
    <DialogContent className="create-dialog">
      <div className="create-heading">
        <span className="create-icon">
          <ClipboardList size={23} />
        </span>
        <DialogTitle>New order</DialogTitle>
        <DialogDescription>
          Enter the customer, items, and delivery details. Fields marked * are required.
        </DialogDescription>
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field-label">
            Customer name <span>*</span>
            <input
              required
              maxLength={80}
              autoComplete="name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Isabel Santos"
            />
          </label>
          <label className="field-label">
            Company (optional)
            <input
              maxLength={80}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company or business name"
            />
          </label>
        </div>
        <label className="field-label">
          Email address (optional)
          <input
            type="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
          />
        </label>
        <label className="field-label">
          Delivery address <span>*</span>
          <input
            required
            maxLength={250}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, city, province"
          />
        </label>
        <div className="form-grid product-fields">
          <label className="field-label">
            Product
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value="mug">Everyday ceramic mug · ₱480</option>
              <option value="linen">Linen table runner · ₱1,250</option>
            </select>
          </label>
          <label className="field-label">
            Quantity
            <input
              required
              type="number"
              min="1"
              max="999"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="form-grid">
          <label className="field-label">
            Delivery due
            <select value={due} onChange={(e) => setDue(e.target.value)}>
              <option>Tomorrow</option>
              <option>Today, 5:00 PM</option>
              <option>In 3 days</option>
            </select>
          </label>
          <label className="field-label">
            Priority
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "normal" | "urgent")
              }
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        <details className="more-details">
          <summary>
            Add customer notes <Plus size={14} />
          </summary>
          <textarea
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Special requests or receiving instructions"
            aria-label="Customer notes"
          />
        </details>
        <div className="create-total">
          <span>Order total</span>
          <strong>{money(quantity * (product === "mug" ? 480 : 1250))}</strong>
        </div>
        <Button className="full-width" type="submit">
          Create order <ArrowRight size={16} />
        </Button>
        <p className="form-caption">Assigned to you. Review the details after creating the order.</p>
      </form>
    </DialogContent>
  );
}
