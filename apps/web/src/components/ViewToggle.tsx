"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState, useEffect } from "react";

type ViewMode = "card" | "list";

interface ViewToggleProps {
  onViewChange?: (view: ViewMode) => void;
  defaultView?: ViewMode;
  storageKey?: string;
}

export default function ViewToggle({
  onViewChange,
  defaultView = "card",
  storageKey = "newsroom-view-mode",
}: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>(defaultView);

  // Carica la preferenza salvata al mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem(storageKey) as ViewMode | null;
      if (savedView === "card" || savedView === "list") {
        setView(savedView);
        onViewChange?.(savedView);
      }
    }
  }, [storageKey, onViewChange]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newView);
    }
    onViewChange?.(newView);
  };

  return (
    <div className="view-toggle-container flex items-center gap-1 p-1 rounded-lg border">
      <button
        onClick={() => handleViewChange("card")}
        className={`view-toggle-button p-2 rounded-md transition-colors ${
          view === "card" ? "view-toggle-button-active" : "view-toggle-button-inactive"
        }`}
        aria-label="Vista card"
        title="Vista card"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleViewChange("list")}
        className={`view-toggle-button p-2 rounded-md transition-colors ${
          view === "list" ? "view-toggle-button-active" : "view-toggle-button-inactive"
        }`}
        aria-label="Vista lista"
        title="Vista lista"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
