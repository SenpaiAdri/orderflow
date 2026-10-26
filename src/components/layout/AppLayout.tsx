import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export type WorkspacePage = "Orders" | "Inventory" | "Activity";

export function AppLayout({
  page,
  orderCount,
  onNavigate,
  onHome,
  children,
}: {
  page: WorkspacePage;
  orderCount: number;
  onNavigate: (page: WorkspacePage) => void;
  onHome: () => void;
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
            <span className="user-avatar top-avatar">AM</span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
