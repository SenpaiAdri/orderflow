import {
  ArrowUpRight,
  Box,
  ClipboardList,
  History,
  ShoppingBag,
} from "lucide-react";
import type { WorkspacePage } from "./AppLayout";

export function Sidebar({
  page,
  orderCount,
  onHome,
  onNavigate,
}: {
  page: WorkspacePage;
  orderCount: number;
  onHome: () => void;
  onNavigate: (page: WorkspacePage) => void;
}) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onHome();
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
          { name: "Orders" as const, icon: ClipboardList, count: orderCount },
          { name: "Inventory" as const, icon: Box },
          { name: "Activity" as const, icon: History },
        ].map(({ name, icon: Icon, count }) => (
          <button
            key={name}
            aria-current={page === name ? "page" : undefined}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => {
              onNavigate(name);
            }}
          >
            <Icon size={18} />
            <span>
              {name === "Inventory"
                ? "Stock checks"
                : name === "Activity"
                  ? "Order history"
                  : name}
            </span>
            {count !== undefined && <span className="nav-count">{count}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile">
          <span className="user-avatar">AM</span>
          <span>
            <strong>Alex Morgan</strong>
            <small>Operations manager</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
