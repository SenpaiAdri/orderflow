import { useEffect, useRef, useState } from "react";
import { LayoutGrid, ListFilter, ListOrdered, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { owners } from "@/data/team";
import type { OrderFilters } from "../order-filters";

export function OrdersToolbar({
  filters,
  onFilterChange,
  attentionCount,
  layout,
  onLayoutChange,
}: {
  filters: OrderFilters;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
  attentionCount: number;
  layout: "list" | "board";
  onLayoutChange: (layout: "list" | "board") => void;
}) {
  const { query, tab, ownerFilter, priorityFilter } = filters;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="order-controls">
      <div className="tabs" role="tablist" aria-label="Order views">
        {(
          [
            "All orders",
            "Needs attention",
            "Assigned to me",
            "Completed",
          ] as const
        ).map((name) => (
          <button
            role="tab"
            aria-selected={tab === name}
            key={name}
            onClick={() => {
              onFilterChange({ tab: name, stageFilter: null });
            }}
            className={tab === name ? "active" : ""}
          >
            {name}
            {name === "Needs attention" && (
              <span className="tab-count">{attentionCount}</span>
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
            onChange={(e) => onFilterChange({ query: e.target.value })}
          />
          {query ? (
            <button
              aria-label="Clear search"
              onClick={() => onFilterChange({ query: "" })}
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
                  onChange={(e) =>
                    onFilterChange({ ownerFilter: e.target.value })
                  }
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
                    onFilterChange({ priorityFilter: e.target.value })
                  }
                >
                  {["All priorities", "Urgent", "Normal"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFilterChange({
                    ownerFilter: "Everyone",
                    priorityFilter: "All priorities",
                  });
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
            onClick={() => onLayoutChange("list")}
          >
            <ListOrdered size={17} /> List
          </button>
          <button
            className={layout === "board" ? "active" : ""}
            aria-label="Board view"
            aria-pressed={layout === "board"}
            onClick={() => onLayoutChange("board")}
          >
            <LayoutGrid size={16} /> Board
          </button>
        </div>
      </div>
    </div>
  );
}
