import { useEffect } from "react";
import { showNotification } from "@/lib/notify";
import type { ThawStep } from "@/lib/thaw";

export interface ThawRow {
  id: string;
  dish: string;
  alerted: boolean;
  steps: ThawStep[];
}

/** While the app is open, sends one system alert when a planned dish's take-out time arrives. */
export function useThawAlerts(rows: ThawRow[], now: Date, markAlerted: (id: string) => void): void {
  useEffect(() => {
    for (const row of rows) {
      const due = row.steps.filter((s) => s.outAt.getTime() <= now.getTime());
      if (row.alerted || due.length === 0) continue;
      markAlerted(row.id);
      void showNotification(`Time to take out food for ${row.dish}`, due.map((s) => s.item.name).join(", "));
    }
  }, [rows, now, markAlerted]);
}
