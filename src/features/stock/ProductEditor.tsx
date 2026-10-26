import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/inventory";
import { formatTime } from "@/lib/format";

export function ProductEditor({ product, onAdd, onAdjust, onClose, onReturnFocus }: {
  product: Product | null;
  onAdd: (product: Product) => void;
  onAdjust: (sku: string, stock: number, reason: string) => void;
  onClose: () => void;
  onReturnFocus: () => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      if (product) onAdjust(product.sku, Number(data.get("stock")), String(data.get("reason")));
      else onAdd({
        name: String(data.get("name")), sku: String(data.get("sku")),
        price: Number(data.get("price")), stock: Number(data.get("stock")),
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save this product.");
    }
  }
  return (
    <DialogContent className="stock-editor" onCloseAutoFocus={(event) => { event.preventDefault(); onReturnFocus(); }}>
      <DialogTitle>{product ? "Adjust stock" : "Add product"}</DialogTitle>
      <DialogDescription>
        {product ? `${product.name} · ${product.sku}` : "Add a product to inventory and order intake."}
      </DialogDescription>
      <form onSubmit={submit}>
        {!product && <>
          <label className="field-label">Product name
            <input name="name" required maxLength={120} />
          </label>
          <div className="form-grid">
            <label className="field-label">SKU
              <input name="sku" required maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9._\-]*" aria-describedby="sku-hint" />
            </label>
            <label className="field-label">Unit price (PHP)
              <input name="price" type="number" required min="0" max="999999" step="0.01" />
            </label>
          </div>
          <p id="sku-hint" className="field-hint">Use a unique SKU with letters, numbers, dots, hyphens, or underscores.</p>
        </>}
        {product && <p className="stock-current">Currently available to reserve <strong>{product.stock}</strong></p>}
        <label className="field-label">{product ? "New available quantity" : "Opening available quantity"}
          <input name="stock" type="number" required min="0" max="99999" step="1" defaultValue={product?.stock ?? 0} aria-describedby="stock-hint" />
        </label>
        <p id="stock-hint" className="field-hint">{product ? "Set the total available after this change, excluding items already reserved. Stock checks update immediately." : "Enter units available to reserve, excluding any already committed to orders."}</p>
        {product && <label className="field-label">Reason for adjustment
          <textarea name="reason" required maxLength={240} placeholder="e.g. Received 20 units from supplier" />
        </label>}
        {product?.lastAdjustment && <details className="stock-last-change">
          <summary>Last stock adjustment</summary>
          <p>{product.lastAdjustment.from} → {product.lastAdjustment.to} available · {formatTime(product.lastAdjustment.at)}</p>
          <p>{product.lastAdjustment.reason}</p>
        </details>}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="editor-actions">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{product ? "Save stock quantity" : "Add product"}</Button>
        </div>
      </form>
    </DialogContent>
  );
}
