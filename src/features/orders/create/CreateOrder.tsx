import { useState, type FormEvent } from "react";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, type Order } from "@/lib/workflow";
import { CustomerFields, type CustomerDetails } from "./CustomerFields";
import { OrderItemFields, products } from "./OrderItemFields";
import { deliveryInput, deliveryISO, migrateDeliveryDue } from "@/lib/delivery";
export function CreateOrder({
  onCreate,
  nextId,
}: {
  onCreate: (o: Order) => void;
  nextId: string;
}) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    customer: "",
    company: "",
    email: "",
    address: "",
  });
  const { customer, company, email, address } = customerDetails;
  const [item, setItem] = useState({ ...products[0], qty: 6 });
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [due, setDue] = useState(() => migrateDeliveryDue("Tomorrow"));
  const [note, setNote] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      !customer.trim() ||
      !address.trim() ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > 999 || !due
    )
      return;
    onCreate({
      id: nextId,
      customer: customer.trim(),
      company: company.trim() || "Individual customer",
      email: email.trim(),
      address: address.trim(),
      items: [item],
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
          Enter the customer, items, and delivery details. Fields marked * are
          required.
        </DialogDescription>
      </div>
      <form onSubmit={submit}>
        <CustomerFields value={customerDetails} onChange={setCustomerDetails} />
        <OrderItemFields item={item} onChange={setItem} />
        <div className="form-grid">
          <label className="field-label">
            Delivery due (Philippine time)
            <input required type="datetime-local" value={deliveryInput(due)}
              onChange={(e) => setDue(e.target.value ? deliveryISO(e.target.value) : "")} />
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
          <strong>{money(item.qty * item.price)}</strong>
        </div>
        <Button className="w-full" type="submit">
          Create order <ArrowRight size={16} />
        </Button>
        <p className="form-caption">
          Assigned to you. Review the details after creating the order.
        </p>
      </form>
    </DialogContent>
  );
}
