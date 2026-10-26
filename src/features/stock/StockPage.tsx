import { useRef, useState } from "react";
import { CheckCheck, Package, Plus, Search, X } from "lucide-react";
import { StockOrderCard } from "./StockOrderCard";
import { ProductEditor } from "./ProductEditor";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Order } from "@/lib/workflow";
import type { Product } from "@/lib/inventory";
export function StockPage({
  orders,
  products,
  onOpen,
  onAdd,
  onAdjust,
  notify,
}: {
  orders: Order[];
  products: Product[];
  onOpen: (id: string) => void;
  onAdd: (product: Product) => void;
  onAdjust: (sku: string, stock: number, reason: string) => void;
  notify: (message: string) => void;
}) {
  const affected = orders.filter((o) => o.stage === 2);
  const [view, setView] = useState<"checks" | "all">("checks");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rows = products.map((product) => {
    const waiting = affected.filter((order) => order.items.some((item) => item.sku === product.sku));
    const needed = waiting.reduce((sum, order) => sum + order.items.filter((item) => item.sku === product.sku).reduce((sum, item) => sum + item.qty, 0), 0);
    return { product, waiting, needed };
  });
  const visible = rows.filter(({ product, needed }) =>
    `${product.name} ${product.sku}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (filter === "all" || (filter === "short" ? needed > product.stock : product.stock === 0)),
  );
  const shortageCount = rows.filter(({ product, needed }) => needed > product.stock).length;
  return (
    <>
      <div className="inventory-navigation">
        <div className="tabs inventory-tabs" role="group" aria-label="Inventory view">
          <button className={view === "checks" ? "active" : ""} aria-pressed={view === "checks"} onClick={() => setView("checks")}>
            Stock checks <span className="tab-count">{affected.length}</span>
          </button>
          <button className={view === "all" ? "active" : ""} aria-pressed={view === "all"} onClick={() => setView("all")}>
            All stock <span className="tab-count">{products.length}</span>
          </button>
        </div>
        <Button onClick={(event) => { triggerRef.current = event.currentTarget; setEditor("new"); }}><Plus size={16} />Add product</Button>
      </div>
      {view === "checks" ? <>
        <p className="inventory-context">Review availability, resolve shortages, then reserve stock for each order.</p>
        <section className="inventory-grid" aria-label="Orders waiting for stock checks">
        {affected.map((order) => (
          <StockOrderCard key={order.id} order={order} onOpen={onOpen} />
        ))}
        </section>
        {!affected.length && (
        <div className="empty-state">
          <CheckCheck size={28} />
          <h3>No stock checks waiting</h3>
          <p>Orders appear here when they need a stock check.</p>
          <Button variant="outline" onClick={() => setView("all")}>View all stock</Button>
        </div>
        )}
      </> : <section className="stock-catalogue" aria-label="All stock">
        <div className="stock-catalogue-tools">
          <label className="search-field">
            <Search size={16} aria-hidden="true" />
            <input ref={searchRef} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" aria-label="Search products or SKU" />
            {search && <button aria-label="Clear product search" onClick={() => setSearch("")}><X size={15} /></button>}
          </label>
          <select aria-label="Filter stock" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All stock</option>
            <option value="short">Short for stock checks ({shortageCount})</option>
            <option value="out">Out of stock ({products.filter((product) => product.stock === 0).length})</option>
          </select>
        </div>
        <p className="stock-catalogue-hint">Availability excludes reserved units. Demand includes orders at Stock check.</p>
        <div className="stock-table-scroll">
          <table className="stock-table">
            <caption className="sr-only">Product availability and demand from waiting stock checks</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Available to reserve</th><th scope="col">Needed at stock check</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{visible.map(({ product, waiting, needed }) => <tr key={product.sku}>
              <td><strong>{product.name}</strong><small>{product.sku}</small></td>
              <td className="stock-number" data-label="Available to reserve">{product.stock}</td>
              <td data-label="Needed at stock check">{waiting.length ? <details className="stock-demand"><summary>{needed} units · {waiting.length} {waiting.length === 1 ? "order" : "orders"}</summary>
                {waiting.map((order) => <button key={order.id} onClick={() => onOpen(order.id)}>{order.id} · {order.items.find((item) => item.sku === product.sku)?.qty} units</button>)}
              </details> : <span className="text-secondary">No orders waiting</span>}</td>
              <td><span className={needed > product.stock || !product.stock ? "stock-short" : "stock-good"}>
                {needed > product.stock ? `Short by ${needed - product.stock}` : !product.stock ? "Out of stock" : "Available"}
              </span></td>
              <td><Button variant="outline" size="sm" aria-label={`Adjust stock for ${product.name}`} onClick={(event) => { triggerRef.current = event.currentTarget; setEditor(product); }}>Adjust stock</Button></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!visible.length && <div className="empty-state"><Package size={28} /><h3>No products match</h3><p>Try another product name or clear your filters.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</Button>
        </div>}
      </section>}
      <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) setEditor(null); }}>
        {editor !== null && <ProductEditor product={editor === "new" ? null : editor} onClose={() => setEditor(null)} onReturnFocus={() => (triggerRef.current?.isConnected ? triggerRef.current : searchRef.current)?.focus()}
          onAdd={(product) => { onAdd(product); setView("all"); setSearch(""); setFilter("all"); notify("Product added to inventory and order intake"); }}
          onAdjust={(sku, stock, reason) => { onAdjust(sku, stock, reason); notify("Stock quantity saved. Waiting stock checks updated."); }} />}
      </Dialog>
    </>
  );
}
