import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CustomerFields } from "../create/CustomerFields";
import { OrderItemFields } from "../create/OrderItemFields";
import { deliveryInput, deliveryISO } from "@/lib/delivery";
import { editIntake, money, total, type Order } from "@/lib/workflow";

export function IntakeEditor({ order, onSave, onCancel }: {
  order: Order; onSave: (order: Order) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState(order);
  const [error, setError] = useState("");
  function save(event: FormEvent) {
    event.preventDefault();
    try { onSave(editIntake(order, draft)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to save details."); }
  }
  return (
    <form className="intake-editor" onSubmit={save}>
      <h3>Edit order details</h3>
      <CustomerFields autoFocus value={draft} onChange={(fields) => setDraft({ ...draft, ...fields })} />
      {draft.items.map((item, index) => <div key={index}>
        <OrderItemFields item={item}
          onChange={(item) => setDraft({ ...draft, items: draft.items.map((old, i) => i === index ? item : old) })} />
        {draft.items.length > 1 && <Button type="button" variant="ghost" size="sm"
          onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== index) })}>Remove {item.name}</Button>}
      </div>)}
      <label className="field-label">Delivery due (Philippine time)
        <input required type="datetime-local" value={deliveryInput(draft.due)}
          onChange={(e) => setDraft({ ...draft, due: e.target.value ? deliveryISO(e.target.value) : "" })} />
      </label>
      <label className="field-label">Customer notes
        <textarea maxLength={1000} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
      </label>
      <div className="create-total"><span>Order total</span><strong>{money(total(draft))}</strong></div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <div className="editor-actions">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel editing</Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
