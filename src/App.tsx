import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  Download,
  HelpCircle,
  History,
  LayoutGrid,
  ListFilter,
  ListOrdered,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { seedOrders } from "@/data/orders";
import {
  ACTIONS,
  attentionReason,
  STAGES,
  money,
  needsAttention,
  total,
  type Order,
} from "@/lib/workflow";
import { Avatar, Status, stageIcons, formatTime } from "@/components/order-ui";
import { Inventory } from "@/components/Inventory";
import { OrderDetail } from "@/components/OrderDetail";
import { CreateOrder } from "@/components/CreateOrder";
const STORE = "orderflow-demo-v1";
const owners = ["Alex Morgan", "Mia Chen", "Sam Rivera"];
function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem(STORE);
    if (saved) {
      const data: unknown = JSON.parse(saved);
      if (
        Array.isArray(data) &&
        data.every(
          (o) =>
            typeof o?.id === "string" &&
            Array.isArray(o.items) &&
            Array.isArray(o.activity) &&
            Array.isArray(o.attachments) &&
            Number.isInteger(o.stage) &&
            o.stage >= 0 &&
            o.stage <= 5,
        )
      )
        return data as Order[];
    }
  } catch {
    /* A fresh demo is safe when browser storage is unavailable. */
  }
  return seedOrders;
}
function App() {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [page, setPage] = useState("Orders");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All orders");
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("Everyone");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(orders));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [orders]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const attention = orders.filter(needsAttention);
  const selected = orders.find((o) => o.id === selectedId);
  const visible = orders
    .filter((o) => {
      const matchesTab =
        tab === "All orders" ||
        (tab === "Needs attention" && needsAttention(o)) ||
        (tab === "Assigned to me" && o.owner === "Alex Morgan") ||
        (tab === "Completed" && o.stage === 5);
      return (
        matchesTab &&
        (stageFilter === null || o.stage === stageFilter) &&
        (ownerFilter === "Everyone" || o.owner === ownerFilter) &&
        (priorityFilter === "All priorities" ||
          o.priority === priorityFilter.toLowerCase()) &&
        `${o.id} ${o.customer} ${o.company}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .sort((a, b) => {
      const score = (o: Order) =>
        (o.stage < 5 && o.due === "Overdue" ? 8 : 0) +
        (needsAttention(o) ? 4 : 0) +
        (o.stage < 5 && o.priority === "urgent" ? 2 : 0);
      return score(b) - score(a);
    });
  function updateOrder(next: Order) {
    setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  }
  function notify(text: string) {
    setToast(text);
  }
  function resetFilters() {
    setQuery("");
    setTab("All orders");
    setStageFilter(null);
    setOwnerFilter("Everyone");
    setPriorityFilter("All priorities");
  }
  function exportOrders() {
    const rows = [
      [
        "Order",
        "Customer",
        "Company",
        "Stage",
        "Owner",
        "Total (PHP)",
        "Priority",
      ],
      ...visible.map((o) => [
        o.id,
        o.customer,
        o.company,
        STAGES[o.stage],
        o.owner,
        String(total(o)),
        o.priority,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "orderflow-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(`${visible.length} orders exported`);
  }
  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("Orders");
            resetFilters();
          }}
        >
          <span className="brand-mark">
            <ArrowUpRight size={23} strokeWidth={3} />
            <span />
          </span>
          orderflow<span className="brand-period">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <ShoppingBag size={17} />
          </span>
          <span>
            <strong>Acme Operations</strong>
            <small>Team workspace</small>
          </span>
        </div>
        <nav aria-label="Main navigation">
          {[
            { name: "Orders", icon: ClipboardList, count: orders.length },
            { name: "Inventory", icon: Box },
            { name: "Activity", icon: History },
          ].map(({ name, icon: Icon, count }) => (
            <button
              key={name}
              aria-current={page === name ? "page" : undefined}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => {
                setPage(name);
                setMobileNav(false);
              }}
            >
              <Icon size={18} />
              <span>{name === "Inventory" ? "Stock checks" : name === "Activity" ? "Order history" : name}</span>
              {count !== undefined && (
                <span className="nav-count">{count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-item help-nav"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle size={17} />
            How to use Orderflow
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <span className="user-avatar">AM</span>
            <span>
              <strong>Alex Morgan</strong>
              <small>Operations manager</small>
            </span>
            <span className="online-dot" title="Active demo user" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={20} />
            </button>
            <strong>Acme Operations</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-tag">
              <span />
              Demo workspace
            </span>
            <span className="topbar-divider" />
            <button
              className="notification icon-button"
              aria-label={`${attention.length} orders need attention`}
              onClick={() => {
                setPage("Orders");
                setTab("Needs attention");
                setStageFilter(null);
              }}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="user-avatar top-avatar">AM</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <h1>
                {page === "Orders"
                  ? "Orders"
                  : page === "Inventory"
                    ? "Stock checks"
                    : "Order history"}
              </h1>
              <p>
                {page === "Orders"
                  ? "Find an order and see what to do next."
                  : page === "Inventory"
                    ? "Check quantities and fix shortages before packing."
                    : "See who updated each order and what changed."}
              </p>
            </div>
            {page === "Orders" && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                New order
              </Button>
            )}
          </div>
          {storageError && (
            <div className="storage-warning" role="alert">
              <CircleAlert size={16} />
              Browser storage is full or unavailable. Changes work for this
              session but may not survive a refresh.
            </div>
          )}
          {page === "Orders" ? (
            <>
              <section className="summary-grid" aria-label="Order overview">
                {[
                  { label: "All orders", count: orders.length, icon: ShoppingBag, view: "All orders", stage: null },
                  { label: "Needs attention", count: attention.length, icon: CircleAlert, view: "Needs attention", stage: null },
                  { label: "In delivery", count: orders.filter((o) => o.stage === 4).length, icon: Truck, view: "All orders", stage: 4 },
                  { label: "Completed", count: orders.filter((o) => o.stage === 5).length, icon: CheckCircle2, view: "Completed", stage: null },
                ].map(({ label, count, icon: Icon, view, stage }) => (
                  <button
                    key={label}
                    className="summary-card"
                    aria-pressed={tab === view && stageFilter === stage}
                    onClick={() => {
                      setTab(view);
                      setStageFilter(stage);
                    }}
                  >
                    <div className="summary-top"><span>{label}</span><Icon size={19} /></div>
                    <div className="metric-value">{count}<ArrowUpRight size={18} /></div>
                  </button>
                ))}
              </section>
              <details className="workflow-section">
                <summary>Filter by order stage <ChevronDown size={16} /></summary>
                <div className="pipeline">
                  {STAGES.map((stage, i) => {
                    const Icon = stageIcons[i];
                    const count = orders.filter((o) => o.stage === i).length;
                    return (
                      <button
                        key={stage}
                        className={`pipeline-stage ${stageFilter === i ? "selected" : ""}`}
                        onClick={() => {
                          setStageFilter(stageFilter === i ? null : i);
                          setTab("All orders");
                        }}
                        aria-pressed={stageFilter === i}
                      >
                        <div className="pipeline-stage-top">
                          <span className={`pipeline-icon pipeline-${i}`}>
                            <Icon size={17} />
                          </span>
                          <span className="stage-index">0{i + 1}</span>
                        </div>
                        <div className="pipeline-name">
                          {stage}
                          <ChevronRight size={13} />
                        </div>
                        <div className="pipeline-count">
                          {count}
                          <span>{count === 1 ? "order" : "orders"}</span>
                          <span
                            className="pipeline-bar"
                            style={{
                              width: `${Math.max(10, (count / orders.length) * 180)}%`,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </details>
              <section className="orders-section">
                <div className="section-title orders-title">
                  <h2>
                    Order list <span className="count-pill">{visible.length}</span>
                  </h2>
                  <div className="section-actions">
                    <span className="updated-label">
                      <span />
                      Saved on this device
                    </span>
                    <Button variant="outline" size="sm" onClick={exportOrders}>
                      <Download size={14} />
                      Download list
                    </Button>
                  </div>
                </div>
                <div className="order-controls">
                  <div className="tabs" role="tablist" aria-label="Order views">
                    {[
                      "All orders",
                      "Needs attention",
                      "Assigned to me",
                      "Completed",
                    ].map((name) => (
                      <button
                        role="tab"
                        aria-selected={tab === name}
                        key={name}
                        onClick={() => {
                          setTab(name);
                          setStageFilter(null);
                        }}
                        className={tab === name ? "active" : ""}
                      >
                        {name}
                        {name === "Needs attention" && (
                          <span className="tab-count">{attention.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="table-tools">
                    <div className="search-field">
                      <Search size={15} />
                      <input
                        ref={searchRef}
                        placeholder="Search by order or customer"
                        aria-label="Search orders"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {query ? (
                        <button
                          aria-label="Clear search"
                          onClick={() => setQuery("")}
                        >
                          <X size={13} />
                        </button>
                      ) : (
                        <kbd>⌘ K</kbd>
                      )}
                    </div>
                    <div className="filter-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          filtersOpen ||
                          ownerFilter !== "Everyone" ||
                          priorityFilter !== "All priorities"
                            ? "filter-active"
                            : ""
                        }
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        aria-expanded={filtersOpen}
                      >
                        <ListFilter size={15} />
                        Filters
                        {(ownerFilter !== "Everyone" ||
                          priorityFilter !== "All priorities") && (
                          <span className="filter-indicator" />
                        )}
                      </Button>
                      {filtersOpen && (
                        <div className="filter-popover">
                          <label>
                            Assigned to
                            <select
                              value={ownerFilter}
                              onChange={(e) => setOwnerFilter(e.target.value)}
                            >
                              {["Everyone", ...owners].map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Priority
                            <select
                              value={priorityFilter}
                              onChange={(e) =>
                                setPriorityFilter(e.target.value)
                              }
                            >
                              {["All priorities", "Urgent", "Normal"].map(
                                (o) => (
                                  <option key={o}>{o}</option>
                                ),
                              )}
                            </select>
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOwnerFilter("Everyone");
                              setPriorityFilter("All priorities");
                              setFiltersOpen(false);
                            }}
                          >
                            Reset filters
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="view-switch">
                      <button
                        className={layout === "list" ? "active" : ""}
                        aria-label="List view"
                        aria-pressed={layout === "list"}
                        onClick={() => setLayout("list")}
                      >
                        <ListOrdered size={17} /> List
                      </button>
                      <button
                        className={layout === "board" ? "active" : ""}
                        aria-label="Board view"
                        aria-pressed={layout === "board"}
                        onClick={() => setLayout("board")}
                      >
                        <LayoutGrid size={16} /> Board
                      </button>
                    </div>
                  </div>
                </div>
                {stageFilter !== null && (
                  <div className="active-filter">
                    Stage: {STAGES[stageFilter]}
                    <button
                      aria-label="Remove stage filter"
                      onClick={() => setStageFilter(null)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {visible.length === 0 ? (
                  <div className="empty-state">
                    <Search size={29} />
                    <h3>No orders found</h3>
                    <p>Try another search or clear your filters.</p>
                    <Button variant="outline" onClick={resetFilters}>
                      Clear all filters
                    </Button>
                  </div>
                ) : layout === "list" ? (
                  <div className="table-scroll">
                    <table aria-label="Orders">
                      <thead>
                        <tr>
                          <th>
                            Order
                          </th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>What to do next</th>
                          <th>Delivery due</th>
                          <th>Amount</th>
                          <th>
                            <span className="sr-only">Open order</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((o) => (
                          <tr key={o.id} onClick={() => setSelectedId(o.id)}>
                            <td>
                              <button
                                className="order-id"
                                onClick={() => setSelectedId(o.id)}
                              >
                                {o.id}
                              </button>
                              <div className={`priority ${o.priority}`}>
                                <span />
                                {o.priority === "urgent" ? "Urgent" : "Normal"}
                              </div>
                            </td>
                            <td>
                              <div className="customer-cell">
                                <Avatar order={o} />
                                <div>
                                  <strong>{o.customer}</strong>
                                  <small>{o.company}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Status stage={o.stage} />
                            </td>
                            <td data-label="What to do next">
                              <button
                                className={`next-action ${needsAttention(o) ? "needs-action" : ""}`}
                                onClick={() => setSelectedId(o.id)}
                              >
                                {attentionReason(o)?.includes("shortage")
                                  ? "Update stock"
                                  : attentionReason(o)?.includes("Missing")
                                    ? "Add payment receipt"
                                    : ACTIONS[o.stage]}
                                {o.stage !== 5 && <ArrowRight size={13} />}
                              </button>
                              {attentionReason(o) && (
                                <small className="action-sub">
                                  {attentionReason(o)}
                                </small>
                              )}
                            </td>
                            <td
                              data-label="Delivery due"
                              className={
                                o.due === "Overdue" && o.stage < 5
                                  ? "overdue"
                                  : ""
                              }
                            >
                              {o.due === "Overdue" && o.stage < 5 && (
                                <Clock3 size={12} />
                              )}{" "}
                              {o.stage === 5 ? "Delivered" : o.due}
                            </td>
                            <td className="amount" data-label="Amount">{money(total(o))}</td>
                            <td>
                              <ChevronRight size={15} className="row-chevron" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="board">
                    {STAGES.map((stage, i) => (
                      <div className="board-column" key={stage}>
                        <h3>
                          <span className={`board-dot stage-${i}`} />
                          {stage}
                          <span>
                            {visible.filter((o) => o.stage === i).length}
                          </span>
                        </h3>
                        {visible
                          .filter((o) => o.stage === i)
                          .map((o) => (
                            <button
                              className="board-card"
                              key={o.id}
                              onClick={() => setSelectedId(o.id)}
                            >
                              <div>
                                <strong>{o.id}</strong>
                                {o.priority === "urgent" && (
                                  <span className="urgent-text">Urgent</span>
                                )}
                              </div>
                              <div className="customer-cell">
                                <Avatar order={o} small />
                                <span>
                                  {o.customer}
                                  <small>{o.company}</small>
                                </span>
                              </div>
                              <p>{attentionReason(o) || ACTIONS[o.stage]}</p>
                              <footer>
                                <span>{money(total(o))}</span>
                                <ArrowRight size={13} />
                              </footer>
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
                <div className="table-footer">
                  <span>
                    Showing <strong>{visible.length}</strong> of {orders.length}{" "}
                    orders
                  </span>

                </div>
              </section>

            </>
          ) : page === "Inventory" ? (
            <Inventory orders={orders} onOpen={setSelectedId} />
          ) : (
            <section className="activity-page">
              <div className="section-title">
                <h2>Recent activity</h2>
                <span className="muted">All team members</span>
              </div>
              {orders
                .flatMap((o) => o.activity.map((a) => ({ ...a, order: o })))
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((a, i) => (
                  <button
                    className="activity-row"
                    key={`${a.order.id}-${i}`}
                    onClick={() => setSelectedId(a.order.id)}
                  >
                    <span className="activity-icon">
                      <History size={16} />
                    </span>
                    <div>
                      <strong>{a.text}</strong>
                      <span>
                        {a.order.id} · {a.order.customer}
                      </span>
                    </div>
                    <time>{formatTime(a.at)}</time>
                    <ChevronRight size={15} />
                  </button>
                ))}
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>
            Demo data. Changes are saved in this browser.
          </span>
          <button onClick={() => setHelpOpen(true)}>
            About this demo <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        {selected && (
          <OrderDetail order={selected} update={updateOrder} notify={notify} />
        )}
      </Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <CreateOrder
          onCreate={(order) => {
            setOrders((prev) => [order, ...prev]);
            setCreateOpen(false);
            resetFilters();
            setPage("Orders");
            setSelectedId(order.id);
            notify("Order created. Review the details to confirm it.");
          }}
          nextId={`ORD-${Math.max(1048, ...orders.map((o) => Number(o.id.split("-")[1]) || 0)) + 1}`}
        />
      </Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="help-dialog">
          <span className="help-dialog-icon">
            <Sparkles size={25} />
          </span>
          <DialogTitle>How to use Orderflow</DialogTitle>
          <DialogDescription>
            Follow each order from the first request to delivery.
          </DialogDescription>
          <ol>
            {[
              "Select Needs attention to find overdue orders or missing information.",
              "Open an order to see what to do next and who is responsible.",
              "Check the details and documents, then confirm the next step.",
              "Use Order history to see updates, and Stock checks to review shortages.",
            ].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="demo-explainer">
            <strong>This is an interactive prototype.</strong>
            <p>
              Data and uploaded files stay in this browser. Team names are
              simulated; actions do not send messages, charge payments, reserve
              real inventory, or book deliveries.
            </p>
          </div>
          <Button onClick={() => setHelpOpen(false)}>
            Got it <ArrowRight size={15} />
          </Button>
        </DialogContent>
      </Dialog>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
