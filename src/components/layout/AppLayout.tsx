import { useEffect, useState, type ReactNode } from "react";
import * as NavigationDialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export type WorkspacePage = "Orders" | "Inventory" | "Activity";

export function AppLayout({ page, orderCount, onNavigate, onHome, children }: {
  page: WorkspacePage;
  orderCount: number;
  onNavigate: (page: WorkspacePage) => void;
  onHome: () => void;
  children: ReactNode;
}) {
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 701px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileNav(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const sidebar = <Sidebar page={page} orderCount={orderCount}
    onHome={() => { onHome(); setMobileNav(false); }}
    onNavigate={(next) => { onNavigate(next); setMobileNav(false); }} />;
  return (
    <NavigationDialog.Root open={mobileNav} onOpenChange={setMobileNav}>
      <div className="app-shell flex min-h-screen">
        <div className="desktop-sidebar">{sidebar}</div>
        <NavigationDialog.Portal>
          <NavigationDialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
          <NavigationDialog.Content className="mobile-navigation fixed inset-y-0 left-0 z-[51] w-[min(280px,calc(100%-48px))] bg-surface outline-none" aria-describedby={undefined}>
            <NavigationDialog.Title className="sr-only">Navigation</NavigationDialog.Title>
            {sidebar}
            <NavigationDialog.Close className="icon-button absolute top-3 right-3 rounded-md hover:bg-soft" aria-label="Close navigation"><X size={20} /></NavigationDialog.Close>
          </NavigationDialog.Content>
        </NavigationDialog.Portal>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <NavigationDialog.Trigger asChild>
                <button className="mobile-menu icon-button" aria-label="Open navigation"><Menu size={20} /></button>
              </NavigationDialog.Trigger>
              <strong>Acme Operations</strong>
            </div>
            <span className="user-avatar top-avatar">AM</span>
          </header>
          <main>{children}</main>
        </div>
      </div>
    </NavigationDialog.Root>
  );
}
