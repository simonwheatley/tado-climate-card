// Human-readable label for an active overlay's termination.
// Shared by `tado-overlay-strip` (full card) and `tado-climate-card`
// (compact variant) so the wording stays consistent.

import type { TerminationType } from "./types.js";

export function remainingLabel(type: TerminationType, timestamp?: string): string {
  switch (type) {
    case "TIMER": {
      if (!timestamp) return "Timed override";
      const ms = new Date(timestamp).getTime() - Date.now();
      if (ms <= 0) return "Expiring";
      const mins = Math.round(ms / 60000);
      if (mins < 60) return `${mins}m remaining`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m remaining` : `${h}h remaining`;
    }
    case "NEXT_TIME_BLOCK": return "Until next time block";
    case "MANUAL":          return "Until you resume schedule";
    case "TADO_MODE":       return "Zone default";
    default:                return "";
  }
}
