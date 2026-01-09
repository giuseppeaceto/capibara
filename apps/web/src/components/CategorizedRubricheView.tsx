"use client";

import { useState, useEffect } from "react";
import ViewToggle from "./ViewToggle";
import RubricaCard from "./RubricaCard";
import RubricaListItem from "./RubricaListItem";

type ViewMode = "card" | "list";

interface CategorizedRubricheViewProps {
  categorizedLinks: {
    today: any[];
    yesterday: any[];
    twoDaysAgo: any[];
    threeDaysAgo: any[];
    older: any[];
  };
}

export default function CategorizedRubricheView({ categorizedLinks }: CategorizedRubricheViewProps) {
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

  const hasContent = categorizedLinks.today.length > 0 ||
    categorizedLinks.yesterday.length > 0 ||
    categorizedLinks.twoDaysAgo.length > 0 ||
    categorizedLinks.threeDaysAgo.length > 0 ||
    categorizedLinks.older.length > 0;

  if (!hasContent) {
    return null;
  }

  const renderCategory = (items: any[], title: string, colorClass: string, bgColor: string, keyPrefix: string) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-4" key={keyPrefix}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-5 ${bgColor} rounded-full`} />
          <h3 className={`text-lg font-semibold ${colorClass}`}>{title}</h3>
        </div>
        {viewMode === "card" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item: any, i: number) => (
              <RubricaCard key={`${keyPrefix}-${i}`} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((item: any, i: number) => (
              <RubricaListItem key={`${keyPrefix}-${i}`} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <ViewToggle
          onViewChange={setViewMode}
          defaultView={viewMode}
        />
      </div>

      {renderCategory(categorizedLinks.today, "Oggi", "text-green-700 dark:text-green-400", "bg-green-500", "today")}
      {renderCategory(categorizedLinks.yesterday, "Ieri", "text-blue-700 dark:text-blue-400", "bg-blue-500", "yesterday")}
      {renderCategory(categorizedLinks.twoDaysAgo, "2 giorni fa", "text-purple-700 dark:text-purple-400", "bg-purple-500", "twoDaysAgo")}
      {renderCategory(categorizedLinks.threeDaysAgo, "3 giorni fa", "text-orange-700 dark:text-orange-400", "bg-orange-500", "threeDaysAgo")}
      {renderCategory(categorizedLinks.older, "Contenuti precedenti", "text-zinc-700 dark:text-zinc-400", "bg-zinc-500", "older")}
    </div>
  );
}
