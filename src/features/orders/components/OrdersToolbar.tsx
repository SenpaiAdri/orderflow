import { useEffect, useRef, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/workflow";
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
  const filterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filtersOpen) return;
    function dismiss(event: PointerEvent) {
      if (!filterRef.current?.contains(event.target as Node)) setFiltersOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFiltersOpen(false);
        filterRef.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [filtersOpen]);
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
        <div className="filter-wrap" ref={filterRef}>
          <Button
            variant="outline"
            size="sm"
            className={
              filtersOpen ||
              ownerFilter !== "Everyone" ||
              priorityFilter !== "All priorities" || filters.stageFilter !== null
                ? "filter-active"
                : ""
            }
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            aria-controls="order-filters"
          >
            <ListFilter size={15} />
            Filters
            {(ownerFilter !== "Everyone" ||
              priorityFilter !== "All priorities" || filters.stageFilter !== null) && (
              <span className="filter-indicator" />
            )}
          </Button>
          {filtersOpen && (
            <div className="filter-popover" id="order-filters" role="group" aria-label="Order filters">
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
              <label>
                Order stage
                <select value={filters.stageFilter ?? "all"} onChange={(e) => onFilterChange({ stageFilter: e.target.value === "all" ? null : Number(e.target.value) })}>
                  <option value="all">All stages</option>
                  {STAGES.map((stage, index) => <option key={stage} value={index}>{stage}</option>)}
                </select>
              </label>
              <label>
                View
                <select value={layout} onChange={(e) => onLayoutChange(e.target.value as "list" | "board")}>
                  <option value="list">List</option><option value="board">Board</option>
                </select>
              </label>
              <Button size="sm" onClick={() => setFiltersOpen(false)}>Done</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFilterChange({
                    ownerFilter: "Everyone",
                    priorityFilter: "All priorities",
                    stageFilter: null,
                  });
                  setFiltersOpen(false);
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
