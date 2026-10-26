import { useState, type ReactNode } from "react";
import { ArrowUpRight, Bell, Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export type WorkspacePage = "Orders" | "Inventory" | "Activity";

export function AppLayout({
  page,
  orderCount,
  attentionCount,
  onNavigate,
  onHome,
  onAttention,
  onHelp,
  children,
}: {
  page: WorkspacePage;
  orderCount: number;
  attentionCount: number;
  onNavigate: (page: WorkspacePage) => void;
  onHome: () => void;
  onAttention: () => void;
  onHelp: () => void;
  children: ReactNode;
}) {
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <div className="app-shell flex min-h-screen">
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <Sidebar
        page={page}
        mobileOpen={mobileNav}
        orderCount={orderCount}
        onHelp={onHelp}
        onHome={() => {
          onHome();
          setMobileNav(false);
        }}
        onNavigate={(next) => {
          onNavigate(next);
          setMobileNav(false);
        }}
      />
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
              aria-label={`${attentionCount} orders need attention`}
              onClick={onAttention}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="user-avatar top-avatar">AM</span>
          </div>
        </header>
        <main>{children}</main>
        <footer className="app-footer">
          <span>Demo data. Changes are saved in this browser.</span>
          <button onClick={onHelp}>
            About this demo <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
    </div>
  );
}
