"use client";

import { useState, useEffect } from "react";
import ViewToggle from "./ViewToggle";
import RubricaCard from "./RubricaCard";
import RubricaListItem from "./RubricaListItem";

type ViewMode = "card" | "list";

interface RubricheViewProps {
  items: any[];
  compact?: boolean;
  showToggle?: boolean;
}

export default function RubricheView({ items, compact = false, showToggle = true }: RubricheViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Carica la preferenza salvata al mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("newsroom-view-mode") as ViewMode | null;
      if (savedView === "card" || savedView === "list") {
        setViewMode(savedView);
      }
    }
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showToggle && (
        <div className="flex items-center justify-end">
          <ViewToggle
            onViewChange={setViewMode}
            defaultView={viewMode}
          />
        </div>
      )}

      {viewMode === "card" ? (
        <div className={compact ? "flex flex-col space-y-3" : "grid gap-4 md:grid-cols-2"}>
          {items.map((item, i) => (
            <RubricaCard key={i} item={item} index={i} compact={compact} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item, i) => (
            <RubricaListItem key={i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
